Write-Host "Starting Zero Sum X Trading Platform..." -ForegroundColor Green
Write-Host ""

# Start Backend Server
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps\server; pnpm dev"

Start-Sleep -Seconds 3

# Start Frontend Server  
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps\web; pnpm dev"

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "✅ Servers are starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend Server: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend Server: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Opening frontend in browser..." -ForegroundColor Yellow

Start-Sleep -Seconds 2
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
