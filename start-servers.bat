@echo off
echo Starting Zero Sum X Trading Platform...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd apps\server && pnpm dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd apps\web && pnpm dev"

timeout /t 5 /nobreak > nul

echo.
echo ✅ Servers are starting up!
echo.
echo Backend Server: http://localhost:5000
echo Frontend Server: http://localhost:3000
echo.
echo Opening frontend in browser...
timeout /t 2 /nobreak > nul
start http://localhost:3000

echo.
echo Press any key to close this window...
pause > nul
