---
typ: projekt
titel: Eigener KI-Wissensagent (Node.js + Neo4j)
stand: 2026-11-08
quellen: [2026-11-08-chatgpt-ki-wissensagent]
---

# Projekt: KI-Wissensagent

Mit ChatGPT entwickelte eigene Anwendung: Webformular → KI (OpenAI) → Neo4j-Wissensgraph.
Ursprünglich als „KI-CRM-Agent“ begonnen, dann zum universellen Wissensspeicher umgebaut.
[Q](../quellen/2026-11-08-chatgpt-ki-wissensagent.md)

## Stand

| Version | Änderung |
|---|---|
| 0.2.3 | Speichern: KI extrahiert Fakten nach Neo4j; Fragen: nur 12 ähnlichste Notizen |
| 0.3 | Fragen prüfen alle Notizen (Prototypgrenze 300), Kombination über mehrere Gespräche |
| 0.4 | Zwei Eingabefelder („Information festhalten“ / „Frage & Analyse“), Unternehmens-Systemprompt `company-prompt.txt` |

- Projektordner lokal: `C:\buffer\CRMKI\ki-crm-agent`; Start mit `npm start`.
- v0.4 nur syntaktisch geprüft; Funktionstest mit OpenAI + Neo4j stand aus.
- Bekannte Grenze: Berechnungen macht das KI-Modell, noch keine deterministische Komponente.
  [Q](../quellen/2026-11-08-chatgpt-ki-wissensagent.md)

## Verhältnis zu diesem Wiki

Dieses Markdown-Wiki verfolgt dasselbe Ziel (Wissen sammeln, verknüpfen, Schlüsse ziehen),
aber ohne eigene Anwendung: Der Agent pflegt lesbare, verlinkte Seiten mit Quellenbelegen.
Wissen aus Neo4j kann als Quelle hier aufgenommen werden (z. B. Export der Notizen). *(Einordnung
des Agenten)*

## Offene Fragen

- Liegen Bestellungen und Rechnungen in Microsoft 365 oder in einem Buchhaltungssystem?
- Soll der Neo4j-Bestand (Notizen) exportiert und hier aufgenommen werden?
