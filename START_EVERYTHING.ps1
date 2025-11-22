# ================================================================
# KHOI DONG HOAN CHINH DU AN EXAM CHEATING DETECTION
# ================================================================
# Script nay se khoi dong toan bo he thong (Backend + Frontend)
# ================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  KHOI DONG HE THONG" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Buoc 1: Kiem tra Docker
Write-Host "[1/5] Kiem tra Docker..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "DOCKER CHUA CHAY!" -ForegroundColor Red
    Write-Host "Vui long khoi dong Docker Desktop va chay lai script nay" -ForegroundColor Yellow
    exit 1
}
Write-Host "Docker dang chay" -ForegroundColor Green

# Buoc 2: Dung cac container cu (neu co)
Write-Host ""
Write-Host "[2/5] Dung cac container cu (neu co)..." -ForegroundColor Yellow
docker-compose down 2>&1 | Out-Null
Write-Host "Da don dep container cu" -ForegroundColor Green

# Buoc 3: Khoi dong Backend + Infrastructure
Write-Host ""
Write-Host "[3/5] Khoi dong Backend + Database + Redis + RabbitMQ..." -ForegroundColor Yellow
Write-Host "Dang build va khoi dong Docker containers..." -ForegroundColor Gray
docker-compose up -d --build

if ($LASTEXITCODE -ne 0) {
    Write-Host "LOI khoi dong Docker!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Doi cac services khoi dong hoan tat..." -ForegroundColor Gray
Start-Sleep -Seconds 15

# Kiem tra health
Write-Host ""
Write-Host "Kiem tra trang thai containers:" -ForegroundColor Gray
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Write-Host ""
Write-Host "Backend khoi dong thanh cong!" -ForegroundColor Green
Write-Host "   - Backend API: http://localhost:8080" -ForegroundColor Gray
Write-Host "   - Swagger UI: http://localhost:8080/swagger-ui.html" -ForegroundColor Gray
Write-Host "   - PostgreSQL: localhost:55432" -ForegroundColor Gray
Write-Host "   - Redis: localhost:6379" -ForegroundColor Gray
Write-Host "   - RabbitMQ Management: http://localhost:15672 (guest/guest)" -ForegroundColor Gray

# Buoc 4: Kiem tra Backend health
Write-Host ""
Write-Host "[4/5] Kiem tra Backend health..." -ForegroundColor Yellow
$maxRetries = 10
$retryCount = 0
$backendReady = $false

while ($retryCount -lt $maxRetries -and -not $backendReady) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
        if ($response.status -eq "UP") {
            $backendReady = $true
            Write-Host "Backend API san sang!" -ForegroundColor Green
        }
    }
    catch {
        $retryCount++
        Write-Host "Doi backend khoi dong... ($retryCount/$maxRetries)" -ForegroundColor Gray
        Start-Sleep -Seconds 3
    }
}

if (-not $backendReady) {
    Write-Host "Backend mat qua lau de khoi dong, nhung co the van dang chay" -ForegroundColor Yellow
    Write-Host "Kiem tra logs: docker logs exam-cheating-detection-v2-backend-1" -ForegroundColor Gray
}

# Buoc 5: Khoi dong Frontend
Write-Host ""
Write-Host "[5/5] Khoi dong Frontend..." -ForegroundColor Yellow
Write-Host "Dang khoi dong React frontend..." -ForegroundColor Gray

$frontendPath = "e:\HK1 Nam 4\TotNghiep\exam-cheating-detection-v2\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Khoi dong Frontend React...' -ForegroundColor Cyan; npm run dev"

Write-Host "Frontend dang khoi dong trong terminal moi" -ForegroundColor Green
Write-Host "   Frontend se chay tai: http://localhost:5173" -ForegroundColor Gray

# Ket qua
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  HE THONG DA KHOI DONG" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "CAC DUONG DAN QUAN TRONG:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend (Candidate/Reviewer):" -ForegroundColor Yellow
Write-Host "   -> http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Backend API:" -ForegroundColor Yellow  
Write-Host "   -> http://localhost:8080" -ForegroundColor White
Write-Host "   -> Swagger: http://localhost:8080/swagger-ui.html" -ForegroundColor White
Write-Host ""
Write-Host "Database Tools:" -ForegroundColor Yellow
Write-Host "   -> PostgreSQL: localhost:55432 (postgres/postgres/examdb)" -ForegroundColor White
Write-Host "   -> RabbitMQ: http://localhost:15672 (guest/guest)" -ForegroundColor White
Write-Host ""
Write-Host "TAI KHOAN TEST:" -ForegroundColor Cyan
Write-Host "   Candidate: candidate@example.com / password123" -ForegroundColor Gray
Write-Host "   Reviewer:  reviewer@example.com / password123" -ForegroundColor Gray
Write-Host ""
Write-Host "HUONG DAN SU DUNG:" -ForegroundColor Cyan
Write-Host "   1. Mo trinh duyet: http://localhost:5173" -ForegroundColor Gray
Write-Host "   2. Dang nhap voi tai khoan Candidate" -ForegroundColor Gray
Write-Host "   3. Vao thi thu (Mock Exam)" -ForegroundColor Gray
Write-Host "   4. He thong se theo doi: tab switch, paste, webcam" -ForegroundColor Gray
Write-Host "   5. Sau khi nop bai, xem ket qua tai My Results" -ForegroundColor Gray
Write-Host ""
Write-Host "KIEM TRA LOGS:" -ForegroundColor Cyan
Write-Host "   Backend:  docker logs exam-cheating-detection-v2-backend-1 -f" -ForegroundColor Gray
Write-Host "   All:      docker-compose logs -f" -ForegroundColor Gray
Write-Host ""
Write-Host "DUNG HE THONG:" -ForegroundColor Cyan
Write-Host "   docker-compose down" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Tu dong mo browser (tuy chon)
$openBrowser = Read-Host "Ban co muon mo trinh duyet ngay khong? (Y/n)"
if ($openBrowser -eq "" -or $openBrowser -eq "Y" -or $openBrowser -eq "y") {
    Write-Host ""
    Write-Host "Dang mo trinh duyet..." -ForegroundColor Gray
    Start-Sleep -Seconds 3
    Start-Process "http://localhost:5173"
}

Write-Host "Chuc ban lam viec vui ve!" -ForegroundColor Cyan
