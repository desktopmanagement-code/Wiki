// Git: Änderungen speichern (Commit) und zu GitHub hochladen (Push).
import { execFile } from 'node:child_process';

function git(wikiDir, args) {
  return new Promise((resolve, reject) => {
    execFile('git', args, { cwd: wikiDir, timeout: 120000 }, (err, stdout, stderr) => {
      if (err) reject(new Error((stderr || stdout || err.message).trim()));
      else resolve(stdout.trim());
    });
  });
}

const pushAn = () => (process.env.GIT_AUTO_PUSH || 'true').toLowerCase() !== 'false';
const branch = () => process.env.GIT_BRANCH || 'Main';

/** Vor dem Schreiben den neuesten Stand holen (falls z. B. mit Claude Code parallel gearbeitet wurde). */
export async function aktualisieren(wikiDir) {
  if (!pushAn()) return { ok: true, hinweis: 'Git-Abgleich deaktiviert' };
  try {
    await git(wikiDir, ['pull', '--rebase', '--autostash', 'origin', branch()]);
    return { ok: true };
  } catch (e) {
    return { ok: false, hinweis: `Abgleich mit GitHub nicht möglich: ${e.message}` };
  }
}

/** Dateien committen und (falls aktiviert) pushen. Fehler beim Push sind nicht fatal. */
export async function speichern(wikiDir, dateien, nachricht) {
  try {
    await git(wikiDir, ['add', '--', ...dateien]);
    await git(wikiDir, ['commit', '-m', nachricht, '--', ...dateien]);
  } catch (e) {
    return { commit: false, push: false, hinweis: `Commit fehlgeschlagen: ${e.message}` };
  }
  if (!pushAn()) return { commit: true, push: false, hinweis: 'Hochladen deaktiviert (GIT_AUTO_PUSH=false)' };
  try {
    await git(wikiDir, ['push', 'origin', branch()]);
    return { commit: true, push: true };
  } catch (e) {
    return { commit: true, push: false, hinweis: `Gespeichert, aber Hochladen zu GitHub fehlgeschlagen: ${e.message}` };
  }
}
