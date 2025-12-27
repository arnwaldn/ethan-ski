@echo off
echo ============================================
echo ULTRA-CREATE v21.4 - Compilation Installateur
echo ============================================
echo.

REM Verifier si Inno Setup est installe
set ISCC="C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
if not exist %ISCC% (
    set ISCC="C:\Program Files\Inno Setup 6\ISCC.exe"
)
if not exist %ISCC% (
    echo ERREUR: Inno Setup 6 non trouve.
    echo.
    echo Installez Inno Setup 6 depuis:
    echo https://jrsoftware.org/isdl.php
    echo.
    pause
    exit /b 1
)

REM Creer le dossier output
if not exist "output" mkdir output

REM Creer les assets si necessaires
echo Creation des assets...
powershell -ExecutionPolicy Bypass -File "create-assets.ps1"

REM Compiler
echo.
echo Compilation de l'installateur...
%ISCC% "ultra-create-installer.iss"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo COMPILATION REUSSIE!
    echo ============================================
    echo.
    echo Installateur cree dans: output\
    dir output\*.exe
    echo.
) else (
    echo.
    echo ERREUR: La compilation a echoue.
    echo Verifiez les erreurs ci-dessus.
)

pause
