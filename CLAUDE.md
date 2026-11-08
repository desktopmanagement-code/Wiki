# Regeln für dieses Second Brain (Schema)

Dieses Repository ist das **persönliche Second Brain / Unternehmensgedächtnis** eines
IT-Beratungs- und Lizenzhandelsunternehmens (RPA mit UiPath, OmnIA von Insight Technology,
VoiceBots von Aristech). Es folgt dem *LLM-Wiki*-Muster (Andrej Karpathy): Der Agent baut aus
Quellen schrittweise ein verlinktes Markdown-Wiki auf und hält es aktuell. Der Mensch liefert
Quellen und stellt Fragen; der Agent erledigt Zusammenfassen, Verknüpfen, Ablegen und Pflegen.

Alle Inhalte auf **Deutsch**. Der Nutzer ist kein Git-/GitHub-Experte: Technik still erledigen,
in einfachen Worten berichten.

## 1. Zweck – welche Fragen das Wiki beantworten muss

Jede Seite dient letztlich diesen Fragen:

- Welche Lizenzen / Zertifikate laufen wann aus – bei welchem Kunden? (Wiedervorlage!)
- Was hat Kunde X gekauft und installiert? Wo weicht die Installation vom Standard ab?
- Welche Wünsche, Nachfragen, Chancen und Automatisierungsideen gibt es bei Kunde X –
  womit kann ich auf ihn zugehen?
- Wer sind die Ansprechpartner, und was hat sich im Team des Kunden geändert?
- Welche Termine stehen an? Welche Zusagen habe ich gemacht, die noch offen sind?
- Welche Lizenzen haben wir gekauft, aber noch nicht weiterverkauft / zugeordnet (Bestand)?
- Was haben wir mit Kunde X in den letzten N Monaten besprochen?

Unternehmenskontext: siehe [wiki/unternehmen/profil.md](wiki/unternehmen/profil.md).

## 2. Struktur

```
CLAUDE.md          Diese Regeln (Schema). Gemeinsam mit dem Nutzer weiterentwickeln.
README.md          Kurzanleitung für Menschen.
index.md           Inhaltsverzeichnis: jede Wiki-Seite mit Link + Einzeiler. Immer aktuell halten.
log.md             Chronologisches Protokoll (nur anhängen, nie umschreiben).
raw/               Originalquellen, UNVERÄNDERLICH. Nie bearbeiten, nie löschen.
  assets/          Bilder/Anhänge zu Quellen.
wiki/              Aufbereitetes Wissen – gehört dem Agenten.
  wiedervorlagen.md  Cockpit: Fristen, Termine, offene Zusagen, Chancen (alle Kunden).
  unternehmen/     Eigenes Unternehmen (Profil, Arbeitsweise).
  kunden/          Eine Seite je Kunde (Organisation).
  personen/        Eine Seite je Person (Kunden-Ansprechpartner, Lieferanten-Kontakte).
  produkte/        Eine Seite je Produkt/Hersteller (UiPath, OmnIA, VoiceBots …).
  lizenzen/        Lizenz-Übersicht und Lizenzbewegungen (Bestandsrechnung).
  konzepte/        Regeln, Begriffe, Vorgehensweisen.
  projekte/        Interne Vorhaben (z. B. der KI-Wissensagent).
  quellen/         Je Quelle eine Zusammenfassungsseite (verweist auf raw/).
  analysen/        Gespeicherte gute Antworten auf Fragen (Vergleiche, Auswertungen).
tools/             Kleine Hilfsskripte (z. B. Linkprüfung).
app/               Voice-App (Node.js + OpenAI): Wissen einsprechen, Fragen stellen. Siehe Abschnitt 12.
```

Ordner erst anlegen, wenn es echten Inhalt dafür gibt. **Keine leeren oder erfundenen Seiten.**

## 3. Dateinamen

- Kleinbuchstaben, Bindestriche, Umlaute ausschreiben: `kreis-neustadt-aisch.md`,
  `melany-ropiak.md`, `omnia.md`.
- Quellen: `JJJJ-MM-TT-kurzbeschreibung.md` (in `raw/` und `wiki/quellen/` gleicher Name).

## 4. Seitenaufbau

Jede Wiki-Seite beginnt mit YAML-Frontmatter (für Obsidian/Dataview):

```yaml
---
typ: kunde | person | produkt | lizenzen | konzept | projekt | quelle | analyse | cockpit
titel: Kreis Neustadt a.d.Aisch
aliase: [NEA, Landratsamt NEA]
stand: 2026-11-08          # Datum der letzten inhaltlichen Änderung
quellen: [2026-11-08-chatgpt-ki-wissensagent]
---
```

Danach: `# Titel`, ein Satz Kurzbeschreibung, dann die Abschnitte des Seitentyps.

**Kundenseite** (Abschnitte nur, wenn Inhalt vorhanden):
Stammdaten · Ansprechpartner · Gekaufte Produkte & Installationen · Abweichungen vom Standard ·
Lizenzen & Fristen · Wünsche, Nachfragen & Ideen · Chancen · Teamänderungen · Verlauf (Kontakte,
neueste oben) · Offene Fragen / Wissenslücken.

**Personenseite**: Organisation & Rolle · Kontaktdaten · Zuständig für · Verlauf (inkl.
Rollen-/Teamwechsel mit Datum) · Offene Fragen.

**Produktseite**: Kurzbeschreibung · Hersteller · Lizenzmodell · Kunden mit diesem Produkt ·
Standard-Installation · bekannte Abweichungen · Offene Fragen.

## 5. Quellenangaben (Pflicht)

- **Jede Tatsachenaussage** im Wiki bekommt einen Beleg als relativen Link auf die
  Quellen-Seite, z. B.: `… läuft am 30.11.2026 aus. [Q](../quellen/2026-11-08-chatgpt-ki-wissensagent.md)`
- Die Quellen-Seite verweist auf die Datei in `raw/` und nennt die **Belegqualität**:
  - *direkt* – Originaldokument liegt vor (E-Mail, Rechnung, Gesprächsnotiz).
  - *indirekt* – nur Wiedergabe durch Dritte/andere KI (z. B. ChatGPT-Antwort mit Neo4j-ID).
  Indirekte Belege bei Gelegenheit durch Originale ersetzen.
- Ableitungen/Schlussfolgerungen des Agenten als solche kennzeichnen: `*(abgeleitet)*`.
- Nichts erfinden. Was unbekannt ist, kommt unter „Offene Fragen / Wissenslücken“.

## 6. Vorgangsarten unterscheiden (entscheidend!)

Siehe [wiki/konzepte/vorgangsarten.md](wiki/konzepte/vorgangsarten.md). Kurz:

| Aussage des Nutzers | Behandlung |
|---|---|
| „Wir haben … gekauft / geliefert / installiert“ | **Fakt** – im Wiki festhalten |
| „Wir werden … kaufen / Kunde will …“ | **Plan** bzw. **Wunsch/Chance** – mit Status festhalten |
| „Was wäre, wenn …?“ / „Wenn wir … kaufen, wie viele …?“ | **Szenario** – nur berechnen, **nichts speichern** |
| Rückfrage („Müssen wir nicht …?“) | Frage beantworten, keine neue Tatsache |
| Beispiele in Konzepttexten | **Kein** Kundenwissen – nie als Fakt übernehmen |

Weitere Regeln: Bestellung ≠ Lieferung. Eingangsrechnung ≠ Wareneingang. Lizenzverlängerung ≠
zusätzlicher Bestand. Reservierung und spätere Lieferung derselben Lizenzen nicht doppelt zählen.

**Mengen und Bestände** werden nie „aus dem Gedächtnis“ geschätzt, sondern aus der
Bewegungstabelle in [wiki/lizenzen/uebersicht.md](wiki/lizenzen/uebersicht.md) Zeile für Zeile
nachgerechnet; die Rechnung wird in der Antwort gezeigt, Annahmen werden genannt.

## 7. Verlinkung

- Nur **relative Markdown-Links** (`[Text](../kunden/kreis-neustadt-aisch.md)`), damit es in
  GitHub, Obsidian und jedem Editor funktioniert.
- Bei der ersten Erwähnung eines Kunden, einer Person oder eines Produkts auf einer Seite verlinken.
- Verbindungen immer beidseitig: Person ↔ Kunde, Kunde ↔ Produkt, Lizenz ↔ Kunde.
- Fristen und Termine zusätzlich ins Cockpit [wiki/wiedervorlagen.md](wiki/wiedervorlagen.md).

## 8. Arbeitsabläufe

### Aufnehmen („Notiz: …“, eingefügter Text, Datei)
1. Quelle **unverändert** nach `raw/JJJJ-MM-TT-name.md` (bzw. Datei nach `raw/`). Bei
   eingefügtem Chat-Text, Notizen, E-Mails: Text 1:1 speichern.
2. Kurz mit dem Nutzer die wichtigsten Punkte abgleichen (was ist Fakt, Plan, Beispiel?).
3. `wiki/quellen/<name>.md` schreiben: Zusammenfassung, extrahierte Fakten, Belegqualität.
4. Betroffene Kunden-, Personen-, Produkt-, Lizenzseiten anlegen bzw. ergänzen.
   Bei Widerspruch zu älteren Angaben: neue Angabe eintragen, alte durchstreichen oder als
   „überholt (Datum, Quelle)“ markieren – nicht stillschweigend löschen.
5. Fristen/Termine/Chancen ins Cockpit `wiki/wiedervorlagen.md`.
6. `index.md` aktualisieren, Eintrag in `log.md` anhängen.
7. Links prüfen: `python3 tools/linkcheck.py`.
8. Commit + Push (siehe 9).

### Fragen („Frage: …“)
1. Zuerst `index.md` und `wiki/wiedervorlagen.md` lesen, dann relevante Seiten, bei Bedarf `raw/`.
2. Antwort mit Quellenlinks; Rechnungen offen zeigen; Annahmen und Lücken nennen.
3. Heutiges Datum berücksichtigen (Fristen relativ zu heute bewerten).
4. Gute, wiederverwendbare Antworten als `wiki/analysen/JJJJ-MM-TT-thema.md` ablegen
   (nachfragen, wenn unklar), im Index eintragen, im Log vermerken.

### Pflege / Lint („Prüfe das Wiki“)
Widersprüche, veraltete Aussagen, abgelaufene Fristen im Cockpit, verwaiste Seiten (ohne
eingehende Links), erwähnte Kunden/Personen ohne eigene Seite, fehlende Gegenlinks, indirekte
Belege, die durch Originale ersetzt werden sollten. Ergebnis berichten, Korrekturen nach
Rückfrage umsetzen, im Log vermerken.

## 9. Git

- Arbeit direkt auf dem Branch `Main` (einziger Branch). Nach jeder abgeschlossenen Aufnahme
  oder Pflege committen und pushen (`git push -u origin Main`). Commit-Nachrichten auf Deutsch,
  z. B. `Aufnahme: 2026-11-08 ChatGPT-Verlauf KI-Wissensagent`.
- Das Repo enthält personenbezogene Kundendaten → muss auf GitHub **privat** bleiben.

## 10. Log-Format

Jeder Eintrag beginnt mit `## [JJJJ-MM-TT] aktion | Titel`, aktion ∈ {aufnahme, frage, pflege,
schema}. Letzte Einträge: `grep "^## \[" log.md | tail -5`.

## 11. Schreibweisen

UiPath (RPA) · OmnIA (Insight Technology) · VoiceBots (Aristech) · Kreis Neustadt a.d.Aisch
(Kürzel NEA) · Kreis Pinneberg · Enzkreis. Produktnamen sind laut Nutzer vorläufige
Arbeitsnamen; „Aristech-Lizenzen“ werden der Produktseite VoiceBots zugeordnet. Die Daten sind
derzeit teils Testdaten.

## 12. Voice-App (`app/`)

- Die Voice-App ist der normale Eingabeweg des Nutzers. Sie nutzt **diese Datei als Systemprompt**
  für das OpenAI-Modell – Regeln hier wirken also auch dort. Änderungen an dieser Datei knapp und
  eindeutig halten.
- Ablauf in der App: Spracheingabe → Vorschlag „Ist das richtig: …“ → Nutzer klickt JA/NEIN in der
  Oberfläche (keine Bestätigung per Sprache). Erst bei JA schreibt die App: Rohquelle
  `raw/JJJJ-MM-TT-notiz-….md` (wörtlich), Wiki-Seiten, Log-Eintrag, Commit + Push.
- Log-Einträge der App enden mit „(Voice-App)“. Bei der Pflege (Lint) Seiten, die über die App
  entstanden sind, besonders auf Vollständigkeit und Gegenlinks prüfen.
- Bedienung und Einrichtung: [app/README.md](app/README.md).
