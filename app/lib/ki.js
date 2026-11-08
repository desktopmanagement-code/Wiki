// OpenAI-Anbindung: Spracherkennung, Vorlesen, Notiz-Aufnahme und Fragen.
import OpenAI, { toFile } from 'openai';
import { baueKontext, heute } from './wiki.js';

let client;
function ki() {
  if (!client) client = new OpenAI(); // liest OPENAI_API_KEY (und optional OPENAI_BASE_URL)
  return client;
}

const MODELL_TEXT = () => process.env.OPENAI_MODEL || 'gpt-5.5';
const MODELL_STT = () => process.env.OPENAI_STT_MODEL || 'gpt-4o-transcribe';
const MODELL_TTS = () => process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts';
const STIMME = () => process.env.OPENAI_TTS_VOICE || 'alloy';

export async function sprachZuText(buffer, dateiname) {
  const datei = await toFile(buffer, dateiname || 'aufnahme.webm');
  const r = await ki().audio.transcriptions.create({ file: datei, model: MODELL_STT(), language: 'de' });
  return (r.text || '').trim();
}

export async function textZuSprache(text) {
  const r = await ki().audio.speech.create({
    model: MODELL_TTS(),
    voice: STIMME(),
    input: String(text).slice(0, 4000),
    response_format: 'mp3',
  });
  return Buffer.from(await r.arrayBuffer());
}

async function jsonAntwort(system, user) {
  const r = await ki().chat.completions.create({
    model: MODELL_TEXT(),
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });
  const roh = r.choices?.[0]?.message?.content || '{}';
  try {
    return JSON.parse(roh);
  } catch {
    throw new Error('Die KI hat keine gültige Antwort geliefert. Bitte noch einmal versuchen.');
  }
}

const GRUNDREGELN = (regeln) => `Du bist der Pfleger und Auskunftgeber eines persönlichen Second Brain (Markdown-Wiki).
Heute ist ${heute()}. Antworte immer auf Deutsch.
Die verbindlichen Regeln des Wikis (Schema) folgen. Halte dich genau daran – mit diesen Ausnahmen,
weil die App das erledigt: Die Rohquelle in raw/ legt die App an, den Eintrag in log.md hängt die App an,
Linkprüfung und Git (Commit/Push) macht die App. Abschnitt 8 Schritt 2 (Abgleich mit dem Nutzer)
erfolgt über die Bestätigung JA/NEIN in der Oberfläche.

===== REGELN (CLAUDE.md) =====
${regeln}`;

/** Bei großem Wiki: KI wählt anhand des Index aus, welche Seiten sie lesen muss. */
async function waehleSeiten(regeln, index, seiten, aufgabe) {
  const r = await jsonAntwort(
    GRUNDREGELN(regeln),
    `Das Wiki ist zu groß, um alles zu lesen. Wähle die Seiten aus, die du für folgende Aufgabe lesen
oder ändern musst (höchstens 25). Antworte als JSON: {"dateien": ["wiki/...md", ...]}

AUFGABE: ${aufgabe}

===== index.md =====
${index}

===== ALLE SEITEN =====
${seiten.join('\n')}`
  );
  return Array.isArray(r.dateien) ? r.dateien : [];
}

async function kontextFuer(wikiDir, aufgabe) {
  let k = await baueKontext(wikiDir);
  if (!k.vollstaendig) k = await baueKontext(wikiDir, await waehleSeiten(k.regeln, k.index, k.seiten, aufgabe));
  return k;
}

/**
 * Neue Information: KI schlägt die Wiki-Änderungen vor (noch nichts wird geschrieben).
 * Ergebnis: { frage, dateien[], log[], quellenname, gelesen[] }
 */
export async function notizVorschlag(wikiDir, text, quellenname) {
  const k = await kontextFuer(wikiDir, `Neue Information aufnehmen: ${text}`);
  const r = await jsonAntwort(
    GRUNDREGELN(k.regeln),
    `Der Nutzer hat eine neue Information eingegeben (evtl. per Spracherkennung – offensichtliche
Erkennungsfehler bei Namen vorsichtig deuten und als offene Frage vermerken).
Die App speichert sie wörtlich als raw/${quellenname}.md.

Deine Aufgabe: Arbeite die Information nach Abschnitt 8 „Aufnehmen“ ins Wiki ein:
- Lege die Quellenseite wiki/quellen/${quellenname}.md an (Belegqualität: direkt, eigene Notiz;
  verlinke die Rohquelle als ../../raw/${quellenname}.md).
- Ergänze/erstelle betroffene Kunden-, Personen-, Produkt-, Lizenzseiten, die Wiedervorlagen und index.md.
- Unterscheide Fakt / Plan / Wunsch / Szenario (Abschnitt 6). Ist die Eingabe ein reines Szenario
  oder eine Frage, ändere nichts (dateien: []) und erkläre das in "frage".
- Gib für jede geänderte oder neue Datei den VOLLSTÄNDIGEN neuen Inhalt zurück. Ändere bestehende
  Seiten behutsam: alles Bestehende bleibt erhalten, außer es wird durch die neue Info überholt
  (dann als überholt markieren). Erfinde nichts.
- Nur relative Links. Erlaubte Pfade: index.md und wiki/**.md (Dateinamen nach Abschnitt 3).

Antworte als JSON:
{
  "frage": "Ist das richtig: <ein bis drei kurze Sätze, was du verstanden hast und eintragen wirst>",
  "dateien": [{"pfad": "wiki/...md", "inhalt": "..."}],
  "log": ["Stichpunkt für log.md", "..."]
}

===== NEUE INFORMATION =====
${text}

===== AKTUELLER WIKI-INHALT${k.vollstaendig ? ' (vollständig)' : ' (Auswahl)'} =====
${k.text}`
  );
  return {
    frage: String(r.frage || 'Ist das richtig?'),
    dateien: r.dateien || [],
    log: Array.isArray(r.log) ? r.log : [],
    gelesen: k.gelesen,
  };
}

/**
 * Frage beantworten. verlauf = bisherige Fragen/Antworten dieser Sitzung (für Folgefragen).
 * Ergebnis: { antwort (Markdown), vorlesen (Klartext), quellen[] }
 */
export async function frageBeantworten(wikiDir, frage, verlauf = []) {
  const k = await kontextFuer(wikiDir, `Frage beantworten: ${frage}`);
  const bisher = verlauf
    .slice(-6)
    .map((v) => `FRAGE: ${v.frage}\nANTWORT: ${v.antwort}`)
    .join('\n\n');
  const r = await jsonAntwort(
    GRUNDREGELN(k.regeln),
    `Beantworte die Frage des Nutzers nach Abschnitt 8 „Fragen“ – nur auf Basis des Wikis.
- Belege Aussagen mit Links auf die Wiki-Seiten. Verwende in der Antwort Links RELATIV ZUM
  WIKI-HAUPTORDNER, z. B. [Kreis Pinneberg](wiki/kunden/kreis-pinneberg.md).
- Rechnungen (Mengen, Bestände, Fristen) Schritt für Schritt zeigen, Annahmen und Lücken nennen.
- Hypothetische Fragen („Was wäre, wenn …“) nur durchrechnen – nichts gilt als gespeichert.
- Weißt du etwas nicht, sag das klar und nenne, welche Information fehlt.
- Folgefragen beziehen sich auf den bisherigen Verlauf.

Antworte als JSON:
{
  "antwort": "Antwort in Markdown mit Quellenlinks",
  "vorlesen": "Dieselbe Antwort als kurzer, natürlich gesprochener Text ohne Links, Tabellen und Markdown",
  "quellen": ["wiki/...md"]
}

${bisher ? `===== BISHERIGER VERLAUF =====\n${bisher}\n\n` : ''}===== FRAGE =====
${frage}

===== WIKI-INHALT${k.vollstaendig ? ' (vollständig)' : ' (Auswahl)'} =====
${k.text}`
  );
  return {
    antwort: String(r.antwort || 'Ich konnte keine Antwort erzeugen.'),
    vorlesen: String(r.vorlesen || r.antwort || ''),
    quellen: Array.isArray(r.quellen) ? r.quellen : [],
  };
}
