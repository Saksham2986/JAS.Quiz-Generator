
@echo off
title AI Quiz Generator - Setup

cd /d "%~dp0"

echo ====================================
echo       AI QUIZ GENERATOR SETUP
echo ====================================

echo.
echo Checking Python...
python --version
if errorlevel 1 (
    echo Python is not installed or not in PATH.
    pause
    exit /b 1
)

echo.
echo Creating backend environment...
if not exist "backend\.venv" (
    python -m venv backend\.venv
)

echo.
echo Installing backend packages...
backend\.venv\Scripts\python.exe -m pip install --upgrade pip
backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt

if errorlevel 1 (
    echo Backend installation failed.
    pause
    exit /b 1
)

echo.
echo Checking Node.js...
node --version
if errorlevel 1 (
    echo Node.js is not installed or not in PATH.
    pause
    exit /b 1
)

echo.
echo Installing frontend packages...
cd frontend
call npm install

if errorlevel 1 (
    echo Frontend installation failed.
    pause
    exit /b 1
)

cd ..

echo.
echo ====================================
echo SETUP COMPLETED SUCCESSFULLY!
echo ====================================
pause
