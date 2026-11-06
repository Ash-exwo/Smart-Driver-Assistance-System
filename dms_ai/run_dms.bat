@echo off
title AI Driver Monitoring System (DMS) & Safety Rover Interlock
echo ==============================================================
echo  Launching AI Driver Monitoring & Safety Rover Interlock
echo ==============================================================
echo.

cd /d "%~dp0"

set "PY_EXE=python"
if exist ".venv\Scripts\python.exe" (
    set "PY_EXE=.venv\Scripts\python.exe"
) else if exist "venv\Scripts\python.exe" (
    set "PY_EXE=venv\Scripts\python.exe"
)

echo Starting AI Vision Pipeline & FastAPI Server using %PY_EXE%...
"%PY_EXE%" drowsiness_detector.py
pause
