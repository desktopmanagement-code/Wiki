# Log

Chronologisches Protokoll (nur anhängen). Format: `## [JJJJ-MM-TT] aktion | Titel`.
Letzte Einträge: `grep "^## \[" log.md | tail -5`

## [2026-11-08] schema | Second Brain eingerichtet

- Struktur angelegt: `raw/`, `wiki/`, `index.md`, `log.md`, `CLAUDE.md` (Regeln), `tools/linkcheck.py`.
- Konzept: LLM-Wiki nach Andrej Karpathy, übertragen auf Consulting/Lizenzhandel (UiPath, OmnIA, VoiceBots).

## [2026-11-08] aufnahme | ChatGPT-Verlauf „KI-Wissensagent“

- Rohquelle: `raw/2026-11-08-chatgpt-ki-wissensagent.md` (Diagramm-CSS entfernt, sonst unverändert).
- Neu: Quellenseite, Kunde NEA, Person Melany Ropiak, Produkt OmnIA, Lizenzübersicht,
  Wiedervorlagen, Unternehmensprofil, Vorgangsarten, Projekt KI-Wissensagent.
- Bewusst **nicht** übernommen: UiPath-Beispielmengen (20/2/5) und „5 OmnIA kaufen“ (Szenario).
- Lücke: NEA-Fakten nur indirekt belegt (Neo4j-Notiz `9ccb8741-…`), Original fehlt.

## [2026-11-08] frage | Was steht bei NEA an und bis wann muss ich handeln?

- Antwort aus Kundenseite NEA + Wiedervorlagen: Termin mit Melany Ropiak sofort vereinbaren,
  Installation KW 48 (23.–27.11.2026), Ablauf 30.11.2026. Nicht als Analyse abgelegt (steht im Cockpit).

## [2026-11-08] aufnahme | Notiz: Anruf Herr Schulz, Kreis Pinneberg

- Rohquelle: `raw/2026-11-08-notiz-anruf-schulz-pinneberg.md` (wörtlich).
- Neu: Kunde Kreis Pinneberg, Person Herr Schulz, Produkt VoiceBots (Aristech), Quellenseite.
- Wiedervorlagen: Aufgabe „Angebot erstellen“ (ohne Frist) + Chance ergänzt.
- Auffällig: E-Mail „abc@bca,de“ (Komma), vermutlich abc@bca.de – zur Bestätigung markiert.

## [2026-11-08] schema | Produktnamen als Arbeitsnamen

- Abschnitt 11 in CLAUDE.md: Produktnamen vorläufig, Testdaten-Hinweis.

## [2026-11-08] schema | Voice-App (app/) hinzugefügt

- Web-App mit Spracheingabe (OpenAI), getrennten Bereichen „Wissen festhalten“ und „Frage stellen“,
  Bestätigung „Ist das richtig: …“ per JA/NEIN in der Oberfläche, Vorlesen der Antworten.
- Nutzt CLAUDE.md als Systemprompt; schreibt nur `index.md` und `wiki/**`, Rohquelle und Log macht die App.
- CLAUDE.md um Abschnitt 12 ergänzt; README verweist auf die App; Linkprüfung ignoriert node_modules.
