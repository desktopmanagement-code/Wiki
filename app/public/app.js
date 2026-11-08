// Voice Second Brain – Oberfläche
const $ = (id) => document.getElementById(id);
const verlauf = []; // bisherige Fragen/Antworten für Folgefragen
let offenerVorschlag = null;

// ---------- Hilfen ----------
function laden(text) {
  $('laden').hidden = !text;
  $('laden').querySelector('span').textContent = text || '';
}

async function api(url, daten) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(daten) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.fehler || `Fehler ${r.status}`);
  return j;
}

function zeigeFehler(e) {
  alert(e.message || String(e));
}

try {
  const gespeichert = localStorage.getItem('vorlesen');
  if (gespeichert !== null) $('vorlesen-an').checked = gespeichert === 'ja';
} catch {}
$('vorlesen-an').addEventListener('change', () => {
  try { localStorage.setItem('vorlesen', $('vorlesen-an').checked ? 'ja' : 'nein'); } catch {}
});

fetch('/api/status').then((r) => r.json()).then((s) => {
  if (!s.schluessel) {
    $('warnung').hidden = false;
    $('warnung').textContent = 'Der OpenAI-Schlüssel fehlt (Datei app/.env). Sprache und KI funktionieren erst danach.';
  }
}).catch(() => {});

// ---------- Aufnahme ----------
let rekorder = null;
let aktiverKnopf = null;

async function starteAufnahme(knopf) {
  if (!navigator.mediaDevices?.getUserMedia) {
    zeigeFehler(new Error('Mikrofon nicht verfügbar. Am Handy die App über https:// öffnen (HTTPS=true in app/.env).'));
    return;
  }
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const typ = ['audio/webm', 'audio/mp4', 'audio/ogg'].find((t) => window.MediaRecorder?.isTypeSupported?.(t)) || '';
  rekorder = new MediaRecorder(stream, typ ? { mimeType: typ } : undefined);
  const teile = [];
  rekorder.ondataavailable = (e) => e.data.size && teile.push(e.data);
  rekorder.onstop = async () => {
    stream.getTracks().forEach((t) => t.stop());
    const blob = new Blob(teile, { type: rekorder.mimeType || 'audio/webm' });
    await verarbeiteAufnahme(blob, knopf.dataset.ziel);
  };
  rekorder.start();
  aktiverKnopf = knopf;
  knopf.classList.add('aktiv');
  knopf.textContent = '■ Stopp';
}

function stoppeAufnahme() {
  if (rekorder && rekorder.state !== 'inactive') rekorder.stop();
  if (aktiverKnopf) {
    aktiverKnopf.classList.remove('aktiv');
    aktiverKnopf.textContent = '🎙 Sprechen';
  }
  aktiverKnopf = null;
}

async function verarbeiteAufnahme(blob, ziel) {
  try {
    laden('Sprache wird erkannt …');
    const fd = new FormData();
    fd.append('audio', blob, 'aufnahme');
    const r = await fetch('/api/sprache-zu-text', { method: 'POST', body: fd });
    const j = await r.json();
    if (!r.ok) throw new Error(j.fehler || 'Spracherkennung fehlgeschlagen');
    const feld = $(`${ziel}-text`);
    feld.value = (feld.value.trim() ? feld.value.trim() + ' ' : '') + j.text;
    laden(null);
    if (ziel === 'notiz') await notizAuswerten();
    else await frageSenden();
  } catch (e) {
    laden(null);
    zeigeFehler(e);
  }
}

document.querySelectorAll('.mikro').forEach((knopf) => {
  knopf.addEventListener('click', async () => {
    if (aktiverKnopf === knopf) return stoppeAufnahme();
    if (aktiverKnopf) stoppeAufnahme();
    try { await starteAufnahme(knopf); } catch (e) { zeigeFehler(e); }
  });
});

// ---------- Wissen festhalten ----------
async function notizAuswerten() {
  const text = $('notiz-text').value.trim();
  if (!text) return;
  $('notiz-ergebnis').hidden = true;
  try {
    laden('KI wertet die Information aus …');
    const v = await api('/api/notiz/vorschlag', { text });
    offenerVorschlag = v.id;
    $('bestaetigung-frage').textContent = v.frage;
    $('bestaetigung-dateien').innerHTML = '';
    for (const d of v.dateien) {
      const li = document.createElement('li');
      li.textContent = `${d.neu ? 'neu: ' : 'ändern: '}${d.pfad}`;
      $('bestaetigung-dateien').appendChild(li);
    }
    if (!v.dateien.length) $('bestaetigung-dateien').innerHTML = '<li>keine Änderung am Wiki</li>';
    $('bestaetigung-hinweise').innerHTML = '';
    for (const h of v.hinweise || []) {
      const li = document.createElement('li');
      li.textContent = h;
      $('bestaetigung-hinweise').appendChild(li);
    }
    $('bestaetigung').hidden = false;
    $('bestaetigung').scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (e) {
    zeigeFehler(e);
  } finally {
    laden(null);
  }
}

async function bestaetigen(ok) {
  if (!offenerVorschlag) return;
  try {
    laden(ok ? 'Wird gespeichert …' : '');
    const r = await api('/api/notiz/bestaetigen', { id: offenerVorschlag, ok });
    offenerVorschlag = null;
    $('bestaetigung').hidden = true;
    const erg = $('notiz-ergebnis');
    erg.hidden = false;
    erg.className = 'ergebnis ' + (r.gespeichert ? 'gut' : 'neutral');
    erg.textContent = r.meldung + (r.hinweis ? ` (${r.hinweis})` : '');
    if (r.gespeichert) $('notiz-text').value = '';
    else erg.textContent += ' Du kannst den Text oben korrigieren und erneut auswerten.';
  } catch (e) {
    zeigeFehler(e);
  } finally {
    laden(null);
  }
}

$('notiz-senden').addEventListener('click', notizAuswerten);
$('ja').addEventListener('click', () => bestaetigen(true));
$('nein').addEventListener('click', () => bestaetigen(false));

// ---------- Frage stellen ----------
async function vorlesen(text, knopf) {
  try {
    if (knopf) knopf.disabled = true;
    const r = await fetch('/api/vorlesen', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
    if (!r.ok) throw new Error('Vorlesen fehlgeschlagen');
    const url = URL.createObjectURL(await r.blob());
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    await audio.play();
  } catch (e) {
    // z. B. Autoplay blockiert – dann bleibt der Knopf zum manuellen Abspielen
    console.warn(e);
  } finally {
    if (knopf) knopf.disabled = false;
  }
}

async function frageSenden() {
  const frage = $('frage-text').value.trim();
  if (!frage) return;
  try {
    laden('KI sucht im Wiki …');
    const a = await api('/api/frage', { frage, verlauf });
    verlauf.push({ frage, antwort: a.antwort });
    $('frage-text').value = '';
    const box = document.createElement('div');
    box.className = 'antwort';
    box.innerHTML = `<p class="gestellt"></p><div class="markdown"></div><button type="button" class="abspielen">🔊 Vorlesen</button>`;
    box.querySelector('.gestellt').textContent = frage;
    box.querySelector('.markdown').innerHTML = a.antwortHtml; // vom Server aus Markdown erzeugt, HTML maskiert
    const knopf = box.querySelector('.abspielen');
    knopf.addEventListener('click', () => vorlesen(a.vorlesen, knopf));
    $('antworten').prepend(box);
    laden(null);
    if ($('vorlesen-an').checked) vorlesen(a.vorlesen, knopf);
  } catch (e) {
    laden(null);
    zeigeFehler(e);
  }
}

$('frage-senden').addEventListener('click', frageSenden);
$('frage-text').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); frageSenden(); }
});
