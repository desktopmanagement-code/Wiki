---
typ: konzept
titel: Vorgangsarten – Fakt, Plan, Szenario; Bestandsregeln
stand: 2026-11-08
quellen: [2026-11-08-chatgpt-ki-wissensagent]
---

# Vorgangsarten

Wie Aussagen eingeordnet werden, damit Bestände, Fristen und Chancen stimmen.
Herkunft: Erkenntnisse aus dem eigenen KI-Agenten-Projekt.
[Q](../quellen/2026-11-08-chatgpt-ki-wissensagent.md)

## Art der Aussage

| Beispiel | Art | Im Wiki |
|---|---|---|
| „Wir haben fünf Lizenzen gekauft.“ | Fakt | festhalten |
| „Wir werden fünf Lizenzen kaufen.“ | Plan | mit Status *geplant* festhalten |
| „Was wäre, wenn wir fünf Lizenzen kaufen?“ | Szenario | berechnen, **nichts speichern** |
| „Wie viele bleiben uns dann?“ | Folgefrage | vorheriges Szenario + gespeichertes Wissen kombinieren |
| „Müssen wir nicht eine im NEA nutzen?“ | Rückfrage | beantworten, keine neue Tatsache |

## Geschäftsvorgänge auseinanderhalten

- Eine **Bestellung** ist noch keine **Lieferung**.
- Eine **Eingangsrechnung** ist nicht zwangsläufig ein **Wareneingang**.
- Eine **Ausgangsrechnung** kann eine Lizenz betreffen, die direkt vom Lieferanten an den Kunden
  geht (berührt dann unseren Bestand nicht).
- Eine **Lizenzverlängerung** ist kein zusätzlicher Lizenzbestand.
- **Reservierung** („Kunde X bekommt 2“) und spätere **Lieferung** derselben 2 Lizenzen nur
  einmal abziehen.

## Rechnen

Mengen, Bestände und Fristen werden aus der Bewegungstabelle in der
[Lizenzübersicht](../lizenzen/uebersicht.md) Schritt für Schritt nachgerechnet. Jede Antwort
nennt die verwendeten Zeilen (mit Quelle), die Annahmen und was evtl. fehlt
(z. B. „Anfangsbestand unbekannt“).
