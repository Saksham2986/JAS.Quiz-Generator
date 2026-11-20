
@echo off
title AI Quiz Generator - Backend

cd /d "%~dp0"

echo Starting Backend...

if not exist "backend\.venv\Scripts\python.exe" (
    echo Environment missing. Please run setup_college.bat first.
    pause
    exit /b 1
)

if not exist "backend\.env" (
    echo ERROR: backend\.env file missing!
    pause
    exit /b 1
)

backend\.venv\Scripts\python.exe backend\app.py

pause
