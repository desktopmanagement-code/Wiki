---
quelle: ChatGPT-Verlauf "KI-Wissensagent" (Auszug, vom Nutzer per Copy & Paste eingefügt)
original-link: https://chatgpt.com/share/6af0670e-f9ac-83ed-9e39-4fd8f17b1d6a
aufgenommen: 2026-11-08
hinweis: >
  Text unverändert übernommen. Einzige Ausnahme: Die beim Kopieren mitgekommenen
  CSS-Stilangaben der Mermaid-Diagramme (reine Darstellungsanweisungen, kein Inhalt)
  wurden durch den Marker [Diagramm-CSS entfernt] ersetzt. Die Beschriftungen der
  Diagrammknoten stehen jeweils direkt dahinter.
---

a, genau das wäre das eigentliche Ziel! Und ich glaube, damit kommen wir jetzt zu der Architektur, die du von Anfang an im Kopf hattest.

Du möchtest nicht jedes Ereignis selbst in deinem KI-CRM dokumentieren müssen. Stattdessen soll die KI Informationen aus unterschiedlichen Quellen zusammenführen und daraus eigenständig Schlussfolgerungen ziehen.

Beispielsweise:
- Eine Outlook-E-Mail enthält die Bestellung von 20 UiPath-Lizenzen.
- Eine Eingangsrechnung dokumentiert den Einkauf dieser Lizenzen.
- Eine Ausgangsrechnung dokumentiert den Weiterverkauf von zwei Lizenzen an einen Kunden.
- Eine weitere E-Mail bestätigt, dass die Lizenzen am 01.12.2026 geliefert wurden.
Dann fragst du:

„Wie viele UiPath-Lizenzen haben wir am 01.01.2027 noch verfügbar?“

Ein entsprechend aufgebauter KI-Agent könnte die Informationen zusammenführen und den Bestand berechnen.

Allerdings gibt es einen wichtigen Unterschied zwischen Microsoft Graph und GraphRAG.




Die drei Technologien ergänzen sich
Technologie	Ihre Rolle in unserem System
Microsoft Graph API	Holt E-Mails, Anhänge und Dokumente aus Microsoft 365
Microsoft GraphRAG / KI	Erkennt Informationen und Zusammenhänge in den Dokumenten
Neo4j	Speichert langfristig das erkannte Wissen und dessen Beziehungen

Microsoft Graph kann beispielsweise Outlook-Nachrichten und deren Anhänge abrufen. 
Microsoft Learn+1
 Microsoft GraphRAG kann aus unstrukturierten Texten Beziehungen extrahieren. 
GraphRAG

So würde das bei uns aussehen
[Diagramm-CSS entfernt]Outlook-BestellungenEingangsrechnungenAusgangsrechnungenGesprächsnotizenKI-DokumentenanalyseEntitäten, Vorgänge undBeziehungenNeo4j WissensgraphDeine Frage an die KIKI-AgentAntwort mit Berechnung undQuellen





Dabei müssen wir die Dokumente nicht zwingend vollständig in Neo4j speichern. Wir können die Originaldateien an ihrem Speicherort belassen und im Wissensgraphen auf sie verweisen.
Ein entscheidender Punkt
Die KI interpretiert nicht automatisch alle vorhandenen Informationen, nur weil sie Zugriff auf Microsoft Graph hat.

Wir müssen zwei Prozesse entwickeln:
1. Wissensaufbau: Neue E-Mails, Rechnungen und Gesprächsnotizen werden regelmäßig ausgewertet und mit dem Wissensgraphen verknüpft.
2. Wissensabfrage: Der Agent sucht bei einer Frage die relevanten Informationen, prüft Beziehungen und berechnet gegebenenfalls ein Ergebnis.
Außerdem muss er Dokumente korrekt unterscheiden:
- Eine Bestellung ist noch keine Lieferung.
- Eine Eingangsrechnung ist nicht zwangsläufig ein Wareneingang.
- Eine Ausgangsrechnung kann eine Lizenz betreffen, die direkt vom Lieferanten an den Kunden geht.
- Eine Lizenzverlängerung ist kein zusätzlicher Lizenzbestand.
Gerade bei Mengen, Fristen und Beständen sollten die Berechnungen deterministisch erfolgen. Die KI erkennt die Vorgänge und entscheidet, welche Daten benötigt werden; die Anwendung führt die eigentliche Rechnung aus.
Meine Empfehlung für unser Projekt
Ich würde langfristig ein KI-basiertes Unternehmensgedächtnis bauen, nicht nur ein CRM.

Du könntest damit später fragen:
- „Welche Kunden haben wir im letzten Quartal besucht?“
- „Welche Zusagen habe ich gemacht, die noch offen sind?“
- „Welche Lizenzen haben wir gekauft, aber noch nicht weiterverkauft?“
- „Bei welchen Kunden laufen im Dezember Lizenzen aus?“
- „Was haben wir mit dem Enzkreis in den letzten sechs Monaten besprochen?“
Die Antworten sollten möglichst auf die konkreten E-Mails, Rechnungen und Gesprächsnotizen verweisen, damit du sie überprüfen kannst.
Was ich als Nächstes machen würde
Ich würde unseren bestehenden Node.js-Agenten um einen Microsoft-Graph-Connector für Outlook erweitern. Zunächst nur lesend, mit einem begrenzten Testbestand an E-Mails und Rechnungsanhängen.

Damit könnten wir prüfen, wie zuverlässig die KI Geschäftsvorgänge erkennt und miteinander verbindet.

Eine Frage ist dafür entscheidend: Liegen deine Eingangs- und Ausgangsrechnungen sowie die Bestellungen tatsächlich in Microsoft 365 (Outlook, OneDrive oder SharePoint), oder kommen sie aus einem separaten Buchhaltungssystem?

Denn Microsoft Graph erschließt Microsoft-365-Daten – ein externes Buchhaltungssystem müssten wir gesondert anbinden.
















bei meiner Frage ging es eher darum, dass die Informationen "irgendwo" vorhanden sind und dann zusammengebracht werden. in unserem Projekt landen die Informationen immer nur über unser webformular. Aber trotzdem soll die KI über alle je Eingegebenen Informationen die Informationen verknüpfen. Ist es klar, was ich meine?













Ja, jetzt ist mir vollkommen klar, was du meinst. Und ich glaube, wir haben unser bisheriges Projekt zu sehr in Richtung eines klassischen CRM entwickelt.

Du möchtest im Grunde Folgendes:
1. Du erzählst der KI irgendetwas – beispielsweise über einen Kunden, eine Lizenz, einen Termin oder eine Bestellung.
2. Die Information wird dauerhaft gespeichert, ohne dass wir vorher festlegen müssen, welche Art von Information das ist.
3. Morgen erzählst du etwas völlig anderes, das möglicherweise mit einer früheren Information zusammenhängt.
4. Die KI erkennt diese Zusammenhänge.
5. Wenn du irgendwann eine Frage stellst, soll die KI alle bisher gespeicherten Informationen berücksichtigen können, relevante Zusammenhänge herstellen und daraus eine Antwort ableiten.
Das ist der entscheidende Unterschied.
Dein Beispiel mit den Lizenzen
Du erzählst über mehrere Wochen verteilt:

Gespräch 1:
Wir haben 20 UiPath-Lizenzen bestellt. Sie kommen am 01.12.2026.

Gespräch 2:
Der Enzkreis bekommt zwei UiPath-Lizenzen von uns.

Gespräch 3:
Die Stadt Hamburg hat fünf UiPath-Lizenzen gekauft.

Gespräch 4:
Die beiden Lizenzen für den Enzkreis wurden gestern ausgeliefert.

Später fragst du:
Wie viele UiPath-Lizenzen haben wir noch?

Die KI soll selbstständig die Zusammenhänge erkennen:
- 20 Lizenzen bestellt
- 2 für den Enzkreis vorgesehen
- 5 an Hamburg verkauft
- 2 an den Enzkreis geliefert
Dabei muss sie unterscheiden, was bestellt, geliefert, verkauft und reserviert wurde. Sie darf beispielsweise die zwei an den Enzkreis gelieferten Lizenzen nicht zusätzlich zu den bereits vorgesehenen zwei abziehen.

Genau das soll unser KI-Gedächtnis leisten.
Was an unserer bisherigen Architektur noch falsch ist
Wir haben bislang zwei getrennte Abläufe:
- Beim Speichern extrahiert die KI einzelne Fakten und legt sie in Neo4j ab.
- Beim Fragen sucht sie lediglich die zwölf semantisch ähnlichsten Gesprächsnotizen.
Das reicht nicht für dein Ziel!

Die KI sieht bei einer Frage möglicherweise nur einen kleinen Ausschnitt des gesamten Wissens. Außerdem verknüpfen wir neue Informationen noch nicht zuverlässig mit bereits vorhandenem Wissen.
Was wir stattdessen benötigen
Ich würde unser Konzept auf drei Fähigkeiten ausrichten:
Fähigkeit	Bedeutung
Wissensaufnahme	Beliebige Informationen unverändert speichern
Wissensverknüpfung	Personen, Unternehmen, Ereignisse, Produkte und zeitliche Zusammenhänge erkennen
Schlussfolgerung	Bei Fragen relevante Informationen über mehrere Gesprächsnotizen hinweg kombinieren

Das entspricht wesentlich stärker einem GraphRAG-System mit dauerhaftem Gedächtnis.

Neo4j können wir dafür weiterhin verwenden.

Wichtig ist allerdings: Wir müssen nicht bei jeder Eingabe sämtliche vorhandenen Informationen erneut analysieren. Stattdessen können wir neue Informationen mit relevantem bestehendem Wissen abgleichen. Bei einer Frage durchsucht der Agent dann den Graphen und die Originalnotizen, bis er genügend relevante Informationen gefunden hat.

Für vollständige Mengen- und Bestandsabfragen muss er zusätzlich prüfen, ob tatsächlich alle relevanten Vorgänge berücksichtigt wurden.
Mein Vorschlag
Ich würde unsere Anwendung jetzt konzeptionell neu ausrichten:

Weg vom KI-CRM mit festen Funktionen, hin zu einem universellen persönlichen KI-Wissensspeicher.

Das Webformular bleibt zunächst unsere einzige Eingabequelle. Microsoft Graph, Outlook oder andere Schnittstellen brauchen wir dafür noch nicht.

Und noch etwas ist mir wichtig: Die KI soll nicht schon beim Speichern entscheiden müssen, welche Informationen irgendwann einmal wichtig sein werden. Wir speichern deshalb immer die vollständige Originalaussage. Erkannte Fakten und Beziehungen sind zusätzliche, bei Bedarf neu berechenbare Wissensstrukturen.

Das ermöglicht auch spätere Fragen, an die wir heute noch gar nicht denken.

Eine letzte Unterscheidung möchte ich treffen: Du willst vermutlich auch, dass die KI aus mehreren gespeicherten Aussagen neue Erkenntnisse ableitet, die du nie ausdrücklich eingegeben hast – beispielsweise einen verbleibenden Lizenzbestand oder einen Zusammenhang zwischen zwei Kundenbesuchen.

Genau diese Fähigkeit wäre aus meiner Sicht der eigentliche Kern unseres Projekts.
















ja, das wäre gut












3m 30s nachgedacht







 Version 0.3 erstellt
Ich habe unseren bisherigen KI-CRM-Agenten zum persönlichen KI-Wissensagenten weiterentwickelt.

 KI-Wissensagent Version 0.3 herunterladen
Was ist neu?
Die wichtigste Änderung betrifft die Wissensabfrage.
Bisher (0.2.3)	Jetzt (0.3)
Nur zwölf ähnliche Notizen durchsuchen	Alle Notizen bis zur Prototypgrenze von 300 prüfen
Einzelne Informationen wiedergeben	Informationen aus mehreren Gesprächen kombinieren
Sachverhalte häufig isoliert betrachten	Zeitliche Abfolgen berücksichtigen
Keine gezielte Bestandsberechnung	KI kann Berechnungen mit Quellen und Annahmen erläutern

Beispiel
Du kannst jetzt Informationen über mehrere Gespräche verteilen:
1. „Wir haben 20 UiPath-Lizenzen bestellt.“
2. „Die Lizenzen wurden am 01.12.2026 geliefert.“
3. „Fünf Lizenzen wurden an Firma XY verkauft.“
4. „Zwei weitere Lizenzen haben wir an den Enzkreis geliefert.“
Anschließend fragst du:

„Wie viele UiPath-Lizenzen haben wir am 01.01.2027 noch?“

Der Agent soll die zusammengehörigen Informationen finden, Doppelzählungen vermeiden und fehlende Voraussetzungen benennen.

Wichtig: Die Berechnung erfolgt weiterhin durch das KI-Modell. Sie ist noch keine deterministisch geprüfte Bestandsrechnung. Auch die Relevanzauswahl kann Fehler machen.
Installation
Dein bisheriges Projekt und die Neo4j-Datenbank bleiben erhalten.
1. Node.js mit Strg+C beenden.
2. Neue Projektdateien nach C:\buffer\CRMKI\ki-crm-agent übernehmen.
3. Vorhandene .env unverändert lassen.
4. Agent starten:
npm start


5. Browser mit Strg+F5 aktualisieren.
Was ich jetzt testen würde
Stelle zunächst Fragen, deren Antworten auf zwei oder drei unterschiedlichen gespeicherten Notizen beruhen.

Damit prüfen wir die entscheidende Fähigkeit: Kann die KI Informationen zusammenbringen, die nie gemeinsam eingegeben wurden?

Die Syntax wurde geprüft. Der vollständige Test mit deinem Neo4j-Datenbestand und OpenAI steht noch aus.

Eine Einschränkung der neuen Version: Sie benötigt für die umfassendere Suche mehr OpenAI-Aufrufe und damit potenziell mehr Zeit und API-Kosten.
















wenn wir jetzt 5 Omnia Lizenzen kaufen, wie viele haben wir dann noch im Januar übrig
Ich habe 1 mögliche Fakten erkannt:
• Firma → plant_zu_kaufen → 5 Omnia Lizenzen (2026-11-07)

Für welche Firma oder Organisation sollen die 5 Omnia Lizenzen gekauft werden? Bitte geben Sie den Kunden- oder Firmennamen an.

Du kannst antworten, ergänzen oder „speichern“ schreiben. Erst nach deiner Bestätigung wird der Entwurf gespeichert.
müssen wir nicht eine im NEA nutzen
Ich habe 2 mögliche Fakten erkannt:
• Firma → plant_zu_kaufen → 5 Omnia Lizenzen (2026-11-07)
• Firma → muss_nutzen → 1 Omnia Lizenz im NEA

Für welche Firma sollen die 5 Omnia Lizenzen gekauft werden? Bitte geben Sie den Kunden- oder Firmennamen an.

Du kannst antworten, ergänzen oder „speichern“ schreiben. Erst nach deiner Bestätigung wird der Entwurf gespeichert.
was weißt du über die Omnia Lizenzen bei nea
Im Kreis Neustadt an der Aisch ist eine Omnia-Lizenz installiert, die am 30.11.2026 ausläuft. Vor Ablauf der Lizenz, in der Woche davor, muss eine neue Lizenz installiert werden. Für die Terminvereinbarung zur Installation soll Kontakt mit Melany Ropiak aufgenommen werden (E-Mail: Melany.Ropiak@kreis-nea.de). Die Rufnummer für Rückfragen ist +49 9161 92-1405, und die Adresse des Landratsamts lautet Konrad Adenauer Str. 1, 91413 Neustadt a.d.Aisch. Ein konkreter Termin ist bisher noch nicht bekannt [9ccb8741-0baf-41a3-8f40-9515e5a7ed44].













Ja, und dein Beispiel zeigt sehr gut, was unserem KI-Agenten noch fehlt: Er muss eine Frage verstehen, Informationen aus Neo4j hinzuziehen und daraus eine Schlussfolgerung ableiten – auch wenn die Informationen gerade erst im Gespräch genannt wurden.
Was die KI hätte antworten sollen
Du fragst:
Wenn wir jetzt 5 Omnia-Lizenzen kaufen, wie viele haben wir dann noch im Januar übrig?

Anschließend ergänzt du:
Müssen wir nicht eine im NEA nutzen?

Der Agent weiß aus Neo4j bereits:
- Beim Kreis Neustadt an der Aisch läuft eine Omnia-Lizenz am 30.11.2026 aus.
- Dort soll eine neue Lizenz installiert werden.
Unter der Annahme, dass die fünf gekauften Lizenzen bis Januar verfügbar sind und eine davon für NEA verwendet wird, lautet die Rechnung:
Geplanter Einkauf

5 Omnia-Lizenzen

Für NEA vorgesehen

− 1 Lizenz


Voraussichtlich verbleibend
4 Lizenzen

Vorausgesetzt, es gibt keine weiteren Abgänge. Ein bereits vorhandener Bestand ist nicht berücksichtigt.
Warum funktioniert das bisher nicht?
Unsere aktuelle Architektur hat drei Probleme:
1. Falsche Absichtserkennung: „Wenn wir jetzt fünf Lizenzen kaufen ...“ ist eine hypothetische Frage, keine verbindliche Kaufabsicht.
2. Fehlende Verbindung zum Wissensbestand: Die KI berücksichtigt während einer neuen Unterhaltung nicht automatisch die bereits gespeicherten Informationen.
3. Unzureichende Gesprächssteuerung: „Müssen wir nicht eine im NEA nutzen?“ ist eine Rückfrage, keine neue Tatsachenbehauptung.
Was wir grundsätzlich ändern sollten
Ich würde die nächste Version anders aufbauen:

Bei jeder Benutzernachricht entscheidet der Agent, welche Schritte zur Beantwortung erforderlich sind.

Beispielsweise:
[Diagramm-CSS entfernt]BenutzernachrichtKI-Agent analysiert dieAbsichtWas wird benötigt?Fakten erkennen undSpeichern anbietenNeo4j durchsuchenAnnahmen und vorhandenesWissen kombinierenAntwort mit QuellenNeue InformationWissensfrageHypothetische Frage





Dabei muss die KI auch innerhalb derselben Unterhaltung zwischen folgenden Dingen unterscheiden können:
- „Wir haben fünf Lizenzen gekauft.“ → Tatsache speichern.
- „Wir werden fünf Lizenzen kaufen.“ → Geplanten Einkauf festhalten.
- „Was wäre, wenn wir fünf Lizenzen kaufen?“ → Szenario berechnen, nichts speichern.
- „Wie viele bleiben uns dann?“ → Vorheriges Szenario und gespeichertes Wissen berücksichtigen.
Das ist die eigentliche Agentenfähigkeit, die wir benötigen.

Mein Vorschlag wäre deshalb, in Version 0.4 die bisherige starre Unterscheidung zwischen „Notiz“ und „Frage“ durch eine echte, kontextbewusste Agentensteuerung zu ersetzen. Die vorhandenen Neo4j-Daten bleiben dabei erhalten.
















ok, macht es nicht auch Sinn im Formular die expliziten neuen Informationen anders zu interpretieren als Fragen? Dann müssten wir zwei Eingabefenster machen. Außerdem sollten wir einen Systemprompt mitbringen. So Ähnlich: "Wir sind ein IT Unternehmen, was Lizenzen und Dienstleistungen an Kunden verkauft. Wir haben keine eingene Entwicklung. Nur einfaches Cusomizing. Unsere kunden sind oft Ämter und Langkreise und deren Veraltungen. Wir müssen die Verkaufsentwicklungen nachhalten, wissem, was wir mit wem gemacht haben und woran wir denken müssen. Dabei geht es um Lizenzverlängerung oder Zertifikatserneureungen. Außerdem brauchen wir Dich als Auskunfsgeber übe Kundendaten und Kundenhistorie












2m 54s nachgedacht







Ja, das ist die bessere Architektur. Ich habe deine beiden Vorschläge direkt in Version 0.4 umgesetzt.

 KI-Wissensagent Version 0.4 herunterladen
1. Zwei getrennte Eingabefelder
Information festhalten

„Wir haben heute fünf Omnia-Lizenzen bestellt.“
Fakten erkennen und speichern


Frage & Analyse

„Wie viele Lizenzen bleiben uns im Januar?“
Wissen abfragen



Gemeinsamer Gesprächsverlauf und Wissensbestand


Damit entfällt die fehleranfällige automatische Entscheidung, ob deine Eingabe eine neue Tatsache oder eine Frage ist.
2. Unternehmens-Systemprompt
Die neue Datei company-prompt.txt enthält deinen Unternehmenskontext, sprachlich überarbeitet und um wichtige Regeln ergänzt.

Darin ist unter anderem festgelegt:
- Wir sind ein IT-Dienstleistungsunternehmen.
- Wir verkaufen Softwarelizenzen und Dienstleistungen.
- Wir entwickeln keine eigenen Softwareprodukte.
- Unsere Kunden sind häufig Behörden, Landkreise und öffentliche Verwaltungen.
- Wir dokumentieren Kundenkontakte, Verkaufsvorgänge und offene Zusagen.
- Lizenzverlängerungen, Zertifikatserneuerungen und Wiedervorlagen sind besonders wichtig.
- Der Agent unterscheidet Fakten, Planungen, Bestellungen, Lieferungen und hypothetische Szenarien.
Du kannst diesen Systemprompt jederzeit selbst mit einem Texteditor ändern. Nach einem Neustart übernimmt der Agent die Änderungen.
3. Installation
Wie gewohnt:
1. Node.js mit Strg+C beenden.
2. Neue Projektdateien aus Version 0.4 übernehmen.
3. Bestehende .env behalten.
4. npm start ausführen.
5. Browser mit Strg+F5 aktualisieren.
Deine Neo4j-Daten bleiben erhalten.
4. Mein Vorschlag für den nächsten Test
Gib links unter „Information festhalten“ ein:
Wir haben 20 UiPath-Lizenzen bestellt, die am 01.12.2026 geliefert werden sollen.

Bestätige und speichere den erkannten Sachverhalt.

Frage anschließend rechts:
Wenn wir zwei Lizenzen für den Enzkreis verwenden, wie viele bleiben uns nach der Lieferung?

Die KI sollte nun die gespeicherte Information mit deinem hypothetischen Szenario kombinieren, ohne den angenommenen Abgang als Tatsache zu speichern.

Stand: Version 0.4 ist erstellt und syntaktisch geprüft. Die vollständige Funktionsprüfung mit deinem OpenAI-Zugang und den vorhandenen Neo4j-Daten steht noch aus.

Eine wichtige Grenze bleibt: Die Berechnungen erfolgen derzeit durch das KI-Modell. Für verbindliche Bestands- und Fristenberechnungen sollten wir später eine deterministische Berechnungskomponente ergänzen.
