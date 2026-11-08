@echo off
chcp 65001 >nul
title Voice Second Brain
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js ist nicht installiert. Bitte von https://nodejs.org installieren und erneut starten.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Erster Start: Pakete werden installiert ...
  call npm install
  if errorlevel 1 (
    echo Installation fehlgeschlagen.
    pause
    exit /b 1
  )
)

if not exist .env (
  copy .env.example .env >nul
  echo.
  echo Bitte jetzt im Editor deinen OpenAI-Schluessel bei OPENAI_API_KEY= eintragen,
  echo speichern und den Editor schliessen.
  notepad .env
)

set ADRESSE=http://localhost:3000
findstr /i /r "^HTTPS=true" .env >nul && set ADRESSE=https://localhost:3000

echo Die App startet. Zum Beenden dieses Fenster schliessen oder Strg+C druecken.
start "" cmd /c "timeout /t 3 >nul & start %ADRESSE%"
call npm start
pause
