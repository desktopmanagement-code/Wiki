# Voice Second Brain – Anleitung

Web-App zum **Einsprechen von Wissen** und **Stellen von Fragen** an dein Second Brain.
Die KI (OpenAI) pflegt dabei dieselben Wiki-Seiten, die du auch in Obsidian oder auf GitHub siehst.

## So funktioniert es

| Bereich | Ablauf |
|---|---|
| **Wissen festhalten** | 🎙 Sprechen → Stopp → die KI zeigt „**Ist das richtig: …**“ → du klickst **JA** oder **NEIN**. Erst bei JA wird gespeichert (Original in `raw/`, Seiten in `wiki/`, Eintrag in `log.md`) und zu GitHub hochgeladen. Bei NEIN wird nichts gespeichert. Du kannst den Text korrigieren und neu auswerten. |
| **Frage stellen** | 🎙 Sprechen → Stopp → Antwort mit Links auf die Wiki-Seiten, wird vorgelesen (abschaltbar). Folgefragen wie „Und bis wann?“ beziehen sich auf die vorherige Frage. |

Statt zu sprechen kannst du auch tippen. Rote Hinweise im Bestätigungsfeld (z. B. „Seite wird
deutlich kürzer“) bedeuten: genau hinsehen, bei Zweifel **NEIN**.

## Einmalige Einrichtung (Windows)

Voraussetzungen: [Node.js](https://nodejs.org) (LTS) und [Git](https://git-scm.com) sind installiert.

1. Repository auf den PC holen (Eingabeaufforderung / PowerShell):
   ```bash
   cd C:\buffer
   ```
   ```bash
   git clone https://github.com/desktopmanagement-code/wiki.git
   ```
   Beim ersten Hochladen fragt Git nach deiner GitHub-Anmeldung, danach merkt es sich das.
2. In den App-Ordner wechseln und Pakete installieren:
   ```bash
   cd C:\buffer\wiki\app
   ```
   ```bash
   npm install
   ```
3. Die Datei `.env.example` kopieren und die Kopie `.env` nennen. Darin deinen
   OpenAI-Schlüssel bei `OPENAI_API_KEY=` eintragen (denselben wie im KI-Wissensagenten).

## Starten

```bash
npm start
```

Dann im Browser öffnen: **http://localhost:3000**. Beenden mit Strg+C.

## Am Handy im WLAN nutzen

Browser erlauben das Mikrofon nur über `https://`. Deshalb in `.env`:

```
HTTPS=true
APP_PASSWORT=ein-eigenes-passwort
```

Nach `npm start` zeigt das Fenster die Adresse fürs Handy an, z. B. `https://192.168.1.23:3000`.
Beim ersten Öffnen warnt der Browser vor dem Zertifikat („nicht sicher“) – das ist bei dieser
selbst erstellten Verbindung normal: „Erweitert“ → „Trotzdem fortfahren“. Danach fragt die App nach
dem Passwort (Benutzername beliebig). Windows fragt evtl. einmal, ob Node.js im Netzwerk erlaubt
werden soll → für **private Netzwerke** erlauben.

## Einstellungen (`.env`)

| Einstellung | Bedeutung |
|---|---|
| `OPENAI_MODEL` | KI-Modell für Auswertung und Antworten |
| `OPENAI_STT_MODEL` | Modell für die Spracherkennung |
| `OPENAI_TTS_MODEL`, `OPENAI_TTS_VOICE` | Modell und Stimme zum Vorlesen |
| `GIT_AUTO_PUSH` | `true` = nach jeder Notiz zu GitHub hochladen |
| `MAX_KONTEXT_ZEICHEN` | Bis zu dieser Größe liest die KI das ganze Wiki; darüber wählt sie Seiten über den Index aus |

## Sicherheitsregeln der App

- Die KI darf nur `index.md` und Seiten unter `wiki/` schreiben – nie `raw/`, `CLAUDE.md` oder Dateien außerhalb.
- Bestehende Seiten ändert sie nur, wenn sie sie vorher gelesen hat.
- Hat sich eine Seite zwischen Vorschlag und JA geändert, wird nichts gespeichert (bitte neu senden).
- Die Rohquelle wird von der App wörtlich gespeichert, nicht von der KI.

Kosten: Jede Notiz und jede Frage ist ein OpenAI-Aufruf mit dem ganzen Wiki als Kontext; Sprache
und Vorlesen kommen hinzu. Die Kosten wachsen mit der Größe des Wikis und hängen vom Modell ab –
am besten im OpenAI-Dashboard ein Ausgabenlimit setzen und die ersten Tage beobachten.
