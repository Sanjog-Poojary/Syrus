@echo off
echo Starting Cyrus Development Servers...

echo Starting Backend...
:: Change directory to backend and run the uvicorn server
start "Cyrus Backend" cmd /k "cd backend && uvicorn main:app --reload --port 8000"

echo Starting Frontend...
:: Change directory to frontend and run the dev server
start "Cyrus Frontend" cmd /k "cd frontend && npm run dev"

echo Windows opened for Frontend and Backend. You can close this window now.
pause
