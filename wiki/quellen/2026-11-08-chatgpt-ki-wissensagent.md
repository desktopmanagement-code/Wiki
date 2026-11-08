---
typ: quelle
titel: ChatGPT-Verlauf „KI-Wissensagent“ (v0.3/v0.4)
stand: 2026-11-08
rohdatei: ../../raw/2026-11-08-chatgpt-ki-wissensagent.md
belegqualitaet: gemischt (Konzept direkt; Kundenfakten indirekt)
---

# Quelle: ChatGPT-Verlauf „KI-Wissensagent“

Vom Nutzer eingefügter Auszug eines ChatGPT-Gesprächs über den Umbau eines eigenen KI-CRM-Agenten
(Node.js + Neo4j + OpenAI) zu einem universellen KI-Wissensspeicher.
Originaltext: [raw/2026-11-08-chatgpt-ki-wissensagent.md](../../raw/2026-11-08-chatgpt-ki-wissensagent.md)
· Online-Original: https://chatgpt.com/share/6af0670e-f9ac-83ed-9e39-4fd8f17b1d6a

## Belegqualität

- **Unternehmenskontext und Konzept**: *direkt* – stammt vom Nutzer selbst (Systemprompt-Entwurf)
  bzw. aus dem Gesprächsverlauf.
- **Kundenfakten zu NEA**: *indirekt* – Wiedergabe durch den eigenen KI-Agenten aus einer
  Neo4j-Notiz (ID `9ccb8741-0baf-41a3-8f40-9515e5a7ed44`). Originalnotiz liegt hier noch nicht vor.
- **UiPath-Mengen (20 bestellt, Enzkreis 2, Hamburg 5, Firma XY 5)**: nur **Beispiele** zur
  Erklärung – **kein** Kundenwissen, nicht ins Wiki übernommen.
- **„5 OmnIA-Lizenzen kaufen“**: hypothetische Frage (**Szenario**), kein Kauf.

## Extrahierte Fakten

| Inhalt | Art | Ziel im Wiki |
|---|---|---|
| Bei NEA ist eine OmnIA-Lizenz installiert, Ablauf 30.11.2026 | Fakt (indirekt) | [Kunde NEA](../kunden/kreis-neustadt-aisch.md), [Lizenzen](../lizenzen/uebersicht.md) |
| Neue Lizenz muss in der Woche vor Ablauf installiert werden | Fakt (indirekt) | [Wiedervorlagen](../wiedervorlagen.md) |
| Termin zur Installation über Melany Ropiak vereinbaren, Kontaktdaten | Fakt (indirekt) | [Melany Ropiak](../personen/melany-ropiak.md) |
| Konkreter Installationstermin noch nicht bekannt (Stand 07.11.2026) | Fakt (indirekt) | [Wiedervorlagen](../wiedervorlagen.md) |
| Eigenes Unternehmen: IT-Lizenzen + Dienstleistungen, keine Eigenentwicklung, Kunden v. a. Behörden/Landkreise | Fakt (direkt) | [Unternehmensprofil](../unternehmen/profil.md) |
| Regeln: Fakt / Plan / Szenario; Bestellung ≠ Lieferung usw. | Konzept | [Vorgangsarten](../konzepte/vorgangsarten.md) |
| Stand des eigenen Agenten v0.3 / v0.4 | Projekt | [KI-Wissensagent](../projekte/ki-wissensagent.md) |

## Kernaussagen (Zusammenfassung)

1. Ziel ist ein **Unternehmensgedächtnis**, nicht nur ein CRM: Informationen werden in beliebiger
   Form eingegeben; die KI verknüpft sie über die Zeit und leitet daraus Antworten ab
   (z. B. Restbestand an Lizenzen).
2. Originalaussagen werden immer vollständig gespeichert; erkannte Fakten sind eine zusätzliche,
   neu berechenbare Schicht.
3. Die KI muss **Fakten, Pläne, Bestellungen, Lieferungen und hypothetische Szenarien**
   unterscheiden; Mengen- und Fristberechnungen sollten nachvollziehbar/deterministisch sein.
4. Eingabe getrennt nach „Information festhalten“ und „Frage & Analyse“ (v0.4).
5. Gewünschte Beispielfragen: besuchte Kunden im Quartal, offene Zusagen, gekaufte aber nicht
   weiterverkaufte Lizenzen, Lizenzabläufe im Dezember, Gesprächshistorie mit einem Kunden.
6. Offene Frage aus dem Verlauf: Liegen Rechnungen/Bestellungen in Microsoft 365 oder in einem
   separaten Buchhaltungssystem?
