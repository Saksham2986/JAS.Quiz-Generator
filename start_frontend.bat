
@echo off
title AI Quiz Generator - Frontend

cd /d "%~dp0"

if not exist "frontend\node_modules" (
    echo Frontend dependencies missing.
    echo Please run setup_college.bat first.
    pause
    exit /b 1
)

cd frontend
call npm run dev -- --host 0.0.0.0

pause
