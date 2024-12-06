@echo off

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv

    REM Activate the virtual environment
    call .\venv\Scripts\activate.bat

    REM Install dependencies from requirements.txt
    echo Installing dependencies...
    pip install -r requirements.txt
) else (
    REM Activate the virtual environment
    call .\venv\Scripts\activate.bat
)

REM Set environment variable
set NOTEBOOK_NAME=./notebook

REM Run the main script
echo Starting the application...
python main.py