// Zugriff auf die Wiki-Dateien: lesen, Kontext für die KI bauen, Änderungen prüfen und schreiben.
import fs from 'node:fs/promises';
import path from 'node:path';

const MAX_KONTEXT_ZEICHEN = Number(process.env.MAX_KONTEXT_ZEICHEN || 150000);

export function heute() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function slug(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'notiz';
}

/** Pfad relativ zum Wiki-Ordner normalisieren (immer mit "/"), oder null wenn er hinausführt. */
export function normalisiere(wikiDir, rel) {
  if (typeof rel !== 'string' || !rel.trim()) return null;
  const abs = path.resolve(wikiDir, rel.trim());
  const r = path.relative(wikiDir, abs);
  if (!r || r.startsWith('..') || path.isAbsolute(r)) return null;
  return r.split(path.sep).join('/');
}

/** Darf die KI diese Datei schreiben? Nur Markdown unter wiki/ sowie index.md. */
export function schreibErlaubt(rel) {
  if (!rel || !rel.endsWith('.md')) return false;
  if (rel === 'index.md') return true;
  return /^wiki\/[a-z0-9\-/]+\.md$/.test(rel) && !rel.includes('//');
}

async function existiert(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function mdDateien(dir, basis = dir) {
  const out = [];
  let eintraege = [];
  try { eintraege = await fs.readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of eintraege) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await mdDateien(abs, basis)));
    else if (e.name.endsWith('.md')) out.push(path.relative(basis, abs).split(path.sep).join('/'));
  }
  return out.sort();
}

export async function liesDatei(wikiDir, rel) {
  return fs.readFile(path.join(wikiDir, rel), 'utf8');
}

/** Alle Wiki-Seiten (wiki/**) plus index.md – ohne raw/. */
export async function alleSeiten(wikiDir) {
  const wiki = (await mdDateien(path.join(wikiDir, 'wiki'))).map((p) => 'wiki/' + p);
  return ['index.md', ...wiki];
}

/**
 * Kontext für die KI: Regeln + Seiten. Ist das Wiki klein genug, kommen alle Seiten mit.
 * Sonst nur index.md + wiedervorlagen.md + die von der KI gewünschten Seiten (auswahl).
 */
export async function baueKontext(wikiDir, auswahl = null) {
  const regeln = await liesDatei(wikiDir, 'CLAUDE.md');
  const seiten = await alleSeiten(wikiDir);
  const inhalte = {};
  let summe = 0;
  for (const s of seiten) {
    inhalte[s] = await liesDatei(wikiDir, s);
    summe += inhalte[s].length;
  }
  let gelesen;
  let vollstaendig;
  if (summe <= MAX_KONTEXT_ZEICHEN) {
    gelesen = seiten;
    vollstaendig = true;
  } else {
    const pflicht = ['index.md', 'wiki/wiedervorlagen.md'];
    const gewuenscht = (auswahl || []).filter((s) => seiten.includes(s));
    gelesen = [...new Set([...pflicht.filter((s) => seiten.includes(s)), ...gewuenscht])];
    vollstaendig = false;
  }
  const text = gelesen.map((s) => `===== DATEI: ${s} =====\n${inhalte[s]}`).join('\n\n');
  return { regeln, seiten, gelesen, vollstaendig, text, index: inhalte['index.md'] || '' };
}

/** Freien Dateinamen für eine neue Quelle finden (raw/ und wiki/quellen/ gleich benannt). */
export async function freierQuellenname(wikiDir, wunsch) {
  const basis = `${heute()}-${slug(wunsch).replace(/^\d{4}-\d{2}-\d{2}-?/, '') || 'notiz'}`;
  let name = basis;
  for (let i = 2; await existiert(path.join(wikiDir, 'raw', name + '.md')); i++) name = `${basis}-${i}`;
  return name;
}

const LINK = /\[[^\]]*\]\(([^)\s]+)\)/g;

/** Prüft relative Links in den (geplanten) Dateien. Gibt Liste defekter Links zurück. */
export async function pruefeLinks(wikiDir, dateien, zusaetzlichVorhanden = []) {
  const geplant = new Set([...dateien.map((d) => d.pfad), ...zusaetzlichVorhanden]);
  const defekt = [];
  for (const d of dateien) {
    const text = d.inhalt.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '');
    for (const m of text.matchAll(LINK)) {
      const ziel = m[1];
      if (/^[a-z]+:/i.test(ziel) || ziel.startsWith('#')) continue;
      const rel = normalisiere(wikiDir, path.join(path.dirname(d.pfad), ziel.split('#')[0]));
      if (!rel) { defekt.push(`${d.pfad} → ${ziel}`); continue; }
      if (geplant.has(rel)) continue;
      if (!(await existiert(path.join(wikiDir, rel)))) defekt.push(`${d.pfad} → ${ziel}`);
    }
  }
  return defekt;
}

/**
 * Prüft die von der KI vorgeschlagenen Dateiänderungen.
 * Regeln: nur erlaubte Pfade; bestehende Dateien nur, wenn die KI sie gelesen hat.
 */
export async function pruefeAenderungen(wikiDir, dateien, gelesen) {
  const fehler = [];
  const sauber = [];
  for (const d of Array.isArray(dateien) ? dateien : []) {
    const rel = normalisiere(wikiDir, d?.pfad);
    if (!rel || !schreibErlaubt(rel)) { fehler.push(`Pfad nicht erlaubt: ${d?.pfad}`); continue; }
    if (typeof d.inhalt !== 'string' || !d.inhalt.trim()) { fehler.push(`Leerer Inhalt: ${rel}`); continue; }
    if (sauber.some((s) => s.pfad === rel)) { fehler.push(`Doppelt angegeben, nur erste Fassung verwendet: ${rel}`); continue; }
    const da = await existiert(path.join(wikiDir, rel));
    if (da && !gelesen.includes(rel)) { fehler.push(`Bestehende Datei nicht gelesen, Änderung abgelehnt: ${rel}`); continue; }
    if (da) {
      const alt = await liesDatei(wikiDir, rel);
      if (d.inhalt.length < alt.length * 0.7) {
        fehler.push(`Achtung: ${rel} wird deutlich kürzer (${alt.length} → ${d.inhalt.length} Zeichen). Bei Zweifel NEIN wählen.`);
      }
    }
    sauber.push({ pfad: rel, inhalt: d.inhalt.endsWith('\n') ? d.inhalt : d.inhalt + '\n', neu: !da });
  }
  return { sauber, fehler };
}

export async function schreibeDatei(wikiDir, rel, inhalt) {
  const abs = path.join(wikiDir, rel);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, inhalt, 'utf8');
}

/** Rohquelle anlegen – nie überschreiben. */
export async function schreibeRohquelle(wikiDir, name, text, art) {
  const rel = `raw/${name}.md`;
  const abs = path.join(wikiDir, rel);
  if (await existiert(abs)) throw new Error(`Rohquelle existiert bereits: ${rel}`);
  const kopf = `---\nquelle: ${art} über die Voice-App (wörtlich)\naufgenommen: ${heute()}\n---\n\n`;
  await schreibeDatei(wikiDir, rel, kopf + text.trim() + '\n');
  return rel;
}

/** Eintrag an log.md anhängen (nur anhängen, nie umschreiben). */
export async function logAnhaengen(wikiDir, aktion, titel, zeilen = []) {
  const abs = path.join(wikiDir, 'log.md');
  const sauberTitel = String(titel).replace(/\s+/g, ' ').trim().slice(0, 120);
  const rumpf = zeilen.filter(Boolean).map((z) => `- ${String(z).replace(/\n+/g, ' ').trim()}`).join('\n');
  await fs.appendFile(abs, `\n## [${heute()}] ${aktion} | ${sauberTitel}\n\n${rumpf}\n`, 'utf8');
}
