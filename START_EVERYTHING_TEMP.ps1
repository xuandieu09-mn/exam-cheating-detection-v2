# ================================================================
# KHỞI ĐỘNG HOÀN CHỈNH DỰ ÁN EXAM CHEATING DETECTION
# ================================================================
# Script này sẽ khởi động toàn bộ hệ thống (Backend + Frontend)
# ================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  KHỞI ĐỘNG HỆ THỐNG" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Bước 1: Kiểm tra Docker
Write-Host "[1/5] Kiểm tra Docker..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ DOCKER CHƯA CHẠY!" -ForegroundColor Red
    Write-Host "Vui lòng khởi động Docker Desktop và chạy lại script này" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Docker đang chạy" -ForegroundColor Green

# Bước 2: Dừng các container cũ (nếu có)
Write-Host "`n[2/5] Dừng các container cũ (nếu có)..." -ForegroundColor Yellow
docker-compose down 2>&1 | Out-Null
Write-Host "✅ Đã dọn dẹp container cũ" -ForegroundColor Green

# Bước 3: Khởi động Backend + Infrastructure (PostgreSQL, Redis, RabbitMQ)
Write-Host "`n[3/5] Khởi động Backend + Database + Redis + RabbitMQ..." -ForegroundColor Yellow
Write-Host "Đang build và khởi động Docker containers..." -ForegroundColor Gray
docker-compose up -d --build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ LỖI khởi động Docker!" -ForegroundColor Red
    exit 1
}

Write-Host "`nĐợi các services khởi động hoàn tất..." -ForegroundColor Gray
Start-Sleep -Seconds 15

# Kiểm tra health
Write-Host "`nKiểm tra trạng thái containers:" -ForegroundColor Gray
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Write-Host "`n✅ Backend khởi động thành công!" -ForegroundColor Green
Write-Host "   - Backend API: http://localhost:8080" -ForegroundColor Gray
Write-Host "   - Swagger UI: http://localhost:8080/swagger-ui.html" -ForegroundColor Gray
Write-Host "   - PostgreSQL: localhost:55432" -ForegroundColor Gray
Write-Host "   - Redis: localhost:6379" -ForegroundColor Gray
Write-Host "   - RabbitMQ Management: http://localhost:15672 (guest/guest)" -ForegroundColor Gray

# Bước 4: Kiểm tra Backend health
Write-Host "`n[4/5] Kiểm tra Backend health..." -ForegroundColor Yellow
$maxRetries = 10
$retryCount = 0
$backendReady = $false

while ($retryCount -lt $maxRetries -and -not $backendReady) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
        if ($response.status -eq "UP") {
            $backendReady = $true
            Write-Host "✅ Backend API sẵn sàng!" -ForegroundColor Green
        }
    } catch {
        $retryCount++
        Write-Host "Đợi backend khởi động... ($retryCount/$maxRetries)" -ForegroundColor Gray
        Start-Sleep -Seconds 3
    }
}

if (-not $backendReady) {
    Write-Host "⚠️ Backend mất quá lâu để khởi động, nhưng có thể vẫn đang chạy" -ForegroundColor Yellow
    Write-Host "Kiểm tra logs: docker logs exam-cheating-detection-v2-backend-1" -ForegroundColor Gray
}

# Bước 5: Khởi động Frontend
Write-Host "`n[5/5] Khởi động Frontend..." -ForegroundColor Yellow
Write-Host "Đang khởi động React frontend..." -ForegroundColor Gray

# Kiểm tra nếu đã có terminal frontend đang chạy
$frontendProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*frontend*" }

if ($frontendProcess) {
    Write-Host "⚠️ Frontend có vẻ đã chạy rồi" -ForegroundColor Yellow
} 
else {
    # Mở terminal mới và chạy frontend
    $frontendPath = "e:\HK1 Nam 4\TotNghiep\exam-cheating-detection-v2\frontend"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Khởi động Frontend React...' -ForegroundColor Cyan; npm run dev"
    
    Write-Host "✅ Frontend đang khởi động trong terminal mới" -ForegroundColor Green
    Write-Host "   Frontend sẽ chạy tại: http://localhost:5173" -ForegroundColor Gray
}

# Kết quả
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  ✅ HỆ THỐNG ĐÃ KHỞI ĐỘNG" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 CÁC ĐƯỜNG DẪN QUAN TRỌNG:" -ForegroundColor Cyan
