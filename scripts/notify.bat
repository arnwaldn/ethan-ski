@echo off
REM Quick notification shortcut for Claude Code
REM Usage: notify [complete|attention|error|validation|info] "message"

set TYPE=%1
set MESSAGE=%~2

if "%TYPE%"=="" set TYPE=info
if "%MESSAGE%"=="" set MESSAGE=Notification

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Claude-Code-Creation\scripts\notification-system.ps1" -Type %TYPE% -Message "%MESSAGE%"
