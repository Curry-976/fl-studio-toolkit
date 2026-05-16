@echo off
title FL Studio Toolkit — Serveur local
cd /d "%~dp0"
echo.
echo  ========================================
echo   FL Studio Toolkit — Serveur local
echo  ========================================
echo.
echo  Demarrage sur http://localhost:8080
echo  Ouvre ce lien dans ton navigateur :
echo.
echo    http://localhost:8080/songstats.html
echo.
echo  Appuie sur Ctrl+C pour arreter.
echo.

:: Essayer Python 3 d'abord
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  start "" "http://localhost:8080/songstats.html"
  python -m http.server 8080
  goto :end
)

where python3 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  start "" "http://localhost:8080/songstats.html"
  python3 -m http.server 8080
  goto :end
)

:: Python introuvable
echo  ERREUR : Python n'est pas installe ou pas dans le PATH.
echo.
echo  Installe Python sur https://www.python.org/downloads/
echo  (coche "Add Python to PATH" a l'installation)
echo.
pause
:end
