// Voice Second Brain – Web-Oberfläche für das Wiki.
import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';
import http from 'node:http';
import https from 'node:https';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Marked } from 'marked';
import { generate as zertifikatErzeugen } from 'selfsigned';
import * as wiki from './lib/wiki.js';
import * as ki from './lib/ki.js';
import * as git from './lib/git.js';

const APP_DIR = path.dirname(fileURLToPath(import.meta.url));
const WIKI_DIR = path.resolve(APP_DIR, process.env.WIKI_DIR || '..');
const PORT = Number(process.env.PORT || 3000);

const app = express();
app.use(express.json({ limit: '2mb' }));
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

// --- Optionaler Passwortschutz (empfohlen, sobald andere Geräte im WLAN zugreifen) ---
const PASSWORT = process.env.APP_PASSWORT || '';
app.use((req, res, next) => {
  if (!PASSWORT) return next();
  const [typ, wert] = (req.headers.authorization || '').split(' ');
  if (typ === 'Basic' && wert) {
    const pw = Buffer.from(wert, 'base64').toString('utf8').split(':').slice(1).join(':');
    const a = Buffer.from(pw);
    const b = Buffer.from(PASSWORT);
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) return next();
  }
  res.set('WWW-Authenticate', 'Basic realm="Second Brain", charset="UTF-8"').status(401).send('Passwort erforderlich');
});

app.use(express.static(path.join(APP_DIR, 'public')));

// --- Markdown → HTML, Links zeigen auf /seite?pfad=… ---
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function renderMarkdown(text, basisPfad = 'index.md') {
  const m = new Marked({
    gfm: true,
    renderer: {
      html(token) { return esc(token.text); },
      link(token) {
        const inhalt = this.parser.parseInline(token.tokens);
        const href = token.href || '';
        if (/^[a-z]+:/i.test(href)) return `<a href="${esc(href)}" target="_blank" rel="noopener">${inhalt}</a>`;
        if (href.startsWith('#')) return `<a href="${esc(href)}">${inhalt}</a>`;
        const ziel = path.posix.normalize(path.posix.join(path.posix.dirname(basisPfad), href.split('#')[0]));
        return `<a href="/seite?pfad=${encodeURIComponent(ziel)}">${inhalt}</a>`;
      },
    },
  });
  // YAML-Frontmatter als Kasten anzeigen statt als Fließtext
  const fm = text.match(/^---\n([\s\S]*?)\n---\n?/);
  const rumpf = fm ? text.slice(fm[0].length) : text;
  return (fm ? `<pre class="frontmatter">${esc(fm[1])}</pre>` : '') + m.parse(rumpf);
}

app.get('/seite', async (req, res) => {
  const rel = wiki.normalisiere(WIKI_DIR, String(req.query.pfad || 'index.md'));
  if (!rel || !rel.endsWith('.md') || rel.startsWith('app/') || rel.startsWith('.git')) return res.status(400).send('Ungültiger Pfad');
  let text;
  try { text = await wiki.liesDatei(WIKI_DIR, rel); } catch { return res.status(404).send(seitenLayout(rel, '<p>Seite nicht gefunden.</p>')); }
  res.send(seitenLayout(rel, renderMarkdown(text, rel)));
});

function seitenLayout(titel, inhalt) {
  return `<!doctype html><html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(titel)}</title>
<link rel="stylesheet" href="/style.css"></head><body class="seite">
<nav><a href="/">← Zurück zur App</a> · <a href="/seite?pfad=index.md">Index</a> · <a href="/seite?pfad=wiki/wiedervorlagen.md">Wiedervorlagen</a></nav>
<p class="pfad">${esc(titel)}</p><article class="markdown">${inhalt}</article></body></html>`;
}

// --- API ---
const fehler = (res, e, code = 500) => {
  console.error(e);
  res.status(code).json({ fehler: e.message || String(e) });
};

app.get('/api/status', async (_req, res) => {
  res.json({ ok: true, schluessel: Boolean(process.env.OPENAI_API_KEY), wiki: WIKI_DIR });
});

app.post('/api/sprache-zu-text', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return fehler(res, new Error('Keine Aufnahme erhalten'), 400);
    const endung = (req.file.mimetype || '').includes('mp4') ? 'mp4' : (req.file.mimetype || '').includes('ogg') ? 'ogg' : 'webm';
    res.json({ text: await ki.sprachZuText(req.file.buffer, `aufnahme.${endung}`) });
  } catch (e) { fehler(res, e); }
});

app.post('/api/vorlesen', async (req, res) => {
  try {
    const mp3 = await ki.textZuSprache(req.body?.text || '');
    res.set('Content-Type', 'audio/mpeg').send(mp3);
  } catch (e) { fehler(res, e); }
});

// Offene Vorschläge (warten auf JA/NEIN). Nur im Speicher, verfallen nach 1 Stunde.
const vorschlaege = new Map();
const VERFALL_MS = 60 * 60 * 1000;
setInterval(() => {
  const jetzt = Date.now();
  for (const [id, v] of vorschlaege) if (jetzt - v.zeit > VERFALL_MS) vorschlaege.delete(id);
}, 5 * 60 * 1000).unref();

async function dateiStand(rel) {
  try { return await wiki.liesDatei(WIKI_DIR, rel); } catch { return null; }
}

app.post('/api/notiz/vorschlag', async (req, res) => {
  try {
    const text = String(req.body?.text || '').trim();
    if (!text) return fehler(res, new Error('Bitte zuerst etwas eingeben oder einsprechen.'), 400);
    const abgleich = await git.aktualisieren(WIKI_DIR);
    const ersteWorte = text.split(/\s+/).slice(0, 6).join(' ');
    const quellenname = await wiki.freierQuellenname(WIKI_DIR, `notiz ${ersteWorte}`);
    const v = await ki.notizVorschlag(WIKI_DIR, text, quellenname);
    const { sauber, fehler: probleme } = await wiki.pruefeAenderungen(WIKI_DIR, v.dateien, v.gelesen);
    const defekt = await wiki.pruefeLinks(WIKI_DIR, sauber, [`raw/${quellenname}.md`]);
    const vorher = {};
    for (const d of sauber) vorher[d.pfad] = await dateiStand(d.pfad);
    const id = crypto.randomUUID();
    vorschlaege.set(id, { zeit: Date.now(), text, quellenname, dateien: sauber, log: v.log, vorher });
    res.json({
      id,
      frage: v.frage,
      dateien: sauber.map((d) => ({ pfad: d.pfad, neu: d.neu })),
      hinweise: [...(abgleich.ok ? [] : [abgleich.hinweis]), ...probleme, ...defekt.map((l) => `Link ohne Ziel: ${l}`)],
    });
  } catch (e) { fehler(res, e); }
});

app.post('/api/notiz/bestaetigen', async (req, res) => {
  try {
    const { id, ok } = req.body || {};
    const v = vorschlaege.get(id);
    if (!v) return fehler(res, new Error('Vorschlag nicht gefunden oder abgelaufen. Bitte erneut senden.'), 404);
    vorschlaege.delete(id);
    if (!ok) return res.json({ gespeichert: false, meldung: 'Verworfen – es wurde nichts gespeichert.' });

    for (const d of v.dateien) {
      if ((await dateiStand(d.pfad)) !== v.vorher[d.pfad]) {
        return fehler(res, new Error(`Die Seite ${d.pfad} wurde inzwischen geändert. Bitte die Notiz erneut senden.`), 409);
      }
    }
    const raw = await wiki.schreibeRohquelle(WIKI_DIR, v.quellenname, v.text, 'Notiz');
    for (const d of v.dateien) await wiki.schreibeDatei(WIKI_DIR, d.pfad, d.inhalt);
    await wiki.logAnhaengen(WIKI_DIR, 'aufnahme', `Notiz (Voice-App): ${v.text.slice(0, 70)}`, [
      `Rohquelle: \`${raw}\``,
      `Geänderte Seiten: ${v.dateien.map((d) => d.pfad).join(', ') || 'keine'}`,
      ...v.log,
    ]);
    const g = await git.speichern(WIKI_DIR, [raw, 'log.md', ...v.dateien.map((d) => d.pfad)], `Aufnahme: ${v.quellenname} (Voice-App)`);
    res.json({
      gespeichert: true,
      meldung: g.push ? 'Gespeichert und zu GitHub hochgeladen.' : 'Gespeichert.',
      hinweis: g.hinweis || null,
      dateien: [raw, ...v.dateien.map((d) => d.pfad)],
    });
  } catch (e) { fehler(res, e); }
});

app.post('/api/frage', async (req, res) => {
  try {
    const frage = String(req.body?.frage || '').trim();
    if (!frage) return fehler(res, new Error('Bitte zuerst eine Frage eingeben oder einsprechen.'), 400);
    const verlauf = Array.isArray(req.body?.verlauf) ? req.body.verlauf : [];
    const a = await ki.frageBeantworten(WIKI_DIR, frage, verlauf);
    res.json({ antwort: a.antwort, antwortHtml: renderMarkdown(a.antwort, 'index.md'), vorlesen: a.vorlesen, quellen: a.quellen });
    // Protokoll im Hintergrund (Antwort wird dadurch nicht verzögert)
    (async () => {
      await wiki.logAnhaengen(WIKI_DIR, 'frage', `${frage} (Voice-App)`, [`Quellen: ${a.quellen.join(', ') || 'keine'}`]);
      const g = await git.speichern(WIKI_DIR, ['log.md'], `Frage protokolliert (Voice-App)`);
      if (g.hinweis) console.warn(g.hinweis);
    })().catch((e) => console.warn('Log/Git:', e.message));
  } catch (e) { fehler(res, e); }
});

// --- Start (HTTP oder HTTPS) ---
function lanAdressen() {
  return Object.values(os.networkInterfaces()).flat().filter((i) => i && i.family === 'IPv4' && !i.internal).map((i) => i.address);
}

async function httpsOptionen() {
  const dir = path.join(APP_DIR, 'zertifikat');
  const keyP = path.join(dir, 'schluessel.pem');
  const certP = path.join(dir, 'zertifikat.pem');
  try {
    return { key: await fs.readFile(keyP), cert: await fs.readFile(certP) };
  } catch {
    const san = [{ type: 2, value: 'localhost' }, { type: 7, ip: '127.0.0.1' }, ...lanAdressen().map((ip) => ({ type: 7, ip }))];
    const pems = await zertifikatErzeugen([{ name: 'commonName', value: 'second-brain.local' }], {
      keySize: 2048,
      algorithm: 'sha256',
      notAfterDate: new Date(Date.now() + 5 * 365 * 24 * 3600 * 1000),
      extensions: [{ name: 'subjectAltName', altNames: san }],
    });
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(keyP, pems.private);
    await fs.writeFile(certP, pems.cert);
    console.log('Neues Zertifikat erzeugt (gilt für diesen PC und seine WLAN-Adressen).');
    return { key: pems.private, cert: pems.cert };
  }
}

const mitHttps = (process.env.HTTPS || 'false').toLowerCase() === 'true';
const server = mitHttps ? https.createServer(await httpsOptionen(), app) : http.createServer(app);
server.listen(PORT, () => {
  const p = mitHttps ? 'https' : 'http';
  console.log(`\nVoice Second Brain läuft. Wiki-Ordner: ${WIKI_DIR}`);
  console.log(`  Auf diesem PC:   ${p}://localhost:${PORT}`);
  for (const ip of lanAdressen()) console.log(`  Im WLAN (Handy): ${p}://${ip}:${PORT}${mitHttps ? '' : '   (Mikrofon am Handy nur mit HTTPS=true)'}`);
  if (!process.env.OPENAI_API_KEY) console.warn('\nACHTUNG: OPENAI_API_KEY fehlt in app/.env – Sprache und KI funktionieren noch nicht.');
  if (!PASSWORT && lanAdressen().length) console.warn('Tipp: APP_PASSWORT in app/.env setzen, damit niemand anderes im WLAN zugreifen kann.');
});
