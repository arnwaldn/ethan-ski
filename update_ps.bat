@echo off
chcp 65001 >nul
echo === MISE A JOUR POWERSHELL ===
echo.
echo [1] Version actuelle de PowerShell:
powershell -Command "$PSVersionTable.PSVersion"
echo.
echo [2] Verification de winget:
winget --version
echo.
echo [3] Installation/Mise a jour de PowerShell 7...
winget install Microsoft.PowerShell --source winget --accept-package-agreements --accept-source-agreements
echo.
echo [4] Verification de PowerShell 7:
pwsh --version
echo.
echo === MISE A JOUR TERMINEE ===
