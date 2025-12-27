@echo off
REM Hindsight Auto-Start - Wait for Docker then start containers
timeout /t 30 /nobreak > nul
docker start hindsight-postgres hindsight 2>nul
