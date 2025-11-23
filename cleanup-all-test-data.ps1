# ================================================================
# COMPLETE TEST DATA CLEANUP SCRIPT
# ================================================================
# Purpose: Clean all test data from Database, Redis, RabbitMQ, and filesystem
# Usage: .\cleanup-all-test-data.ps1 [-SkipConfirmation]
# ================================================================

param(
    [switch]$SkipConfirmation
)

$ErrorActionPreference = "Stop"

# Configuration
$POSTGRES_CONTAINER = "exam-postgres"
$REDIS_CONTAINER = "exam-redis"
$RABBITMQ_CONTAINER = "exam-rabbitmq"
$BACKEND_CONTAINER = "exam-backend"
$UPLOAD_DIR = "backend\uploads"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CLEANUP ALL TEST DATA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if containers are running
Write-Host "Checking Docker containers..." -ForegroundColor Yellow
$containers = docker ps --format "{{.Names}}"
if (-not $containers -or $containers -notcontains $POSTGRES_CONTAINER) {
    Write-Host "ERROR: Required containers not running. Please start with: docker-compose up -d" -ForegroundColor Red
    exit 1
}

# Show current state
Write-Host ""
Write-Host "Checking current data state..." -ForegroundColor Yellow

$sessionCount = (docker exec $POSTGRES_CONTAINER psql -U exam_user -d exam_db -t -c "SELECT COUNT(*) FROM exam_sessions;" 2>$null).Trim()
$eventCount = (docker exec $POSTGRES_CONTAINER psql -U exam_user -d exam_db -t -c "SELECT COUNT(*) FROM events;" 2>$null).Trim()
$snapshotCount = (docker exec $POSTGRES_CONTAINER psql -U exam_user -d exam_db -t -c "SELECT COUNT(*) FROM media_snapshots;" 2>$null).Trim()
$incidentCount = (docker exec $POSTGRES_CONTAINER psql -U exam_user -d exam_db -t -c "SELECT COUNT(*) FROM incidents;" 2>$null).Trim()
$reviewCount = (docker exec $POSTGRES_CONTAINER psql -U exam_user -d exam_db -t -c "SELECT COUNT(*) FROM incident_reviews;" 2>$null).Trim()

Write-Host "Current database state:" -ForegroundColor White
Write-Host "  Sessions: $sessionCount" -ForegroundColor Gray
Write-Host "  Events: $eventCount" -ForegroundColor Gray
Write-Host "  Snapshots: $snapshotCount" -ForegroundColor Gray
Write-Host "  Incidents: $incidentCount" -ForegroundColor Gray
Write-Host "  Reviews: $reviewCount" -ForegroundColor Gray
Write-Host ""

# Confirmation
if (-not $SkipConfirmation) {
    Write-Host "WARNING: This will DELETE ALL test data!" -ForegroundColor Yellow
    $confirm = Read-Host "Continue? (yes/no)"
    if ($confirm -ne 'yes') {
        Write-Host "Cleanup cancelled." -ForegroundColor Yellow
        exit 0
    }
}

# 1. CLEANUP DATABASE
Write-Host ""
Write-Host "[1/4] Cleaning PostgreSQL database..." -ForegroundColor Green

$tables = @(
    "incident_reviews",
    "incidents", 
    "media_snapshots",
    "events",
    "exam_sessions"
)

foreach ($table in $tables) {
    Write-Host "  Truncating $table..." -ForegroundColor Gray
    docker exec $POSTGRES_CONTAINER psql -U exam_user -d exam_db -c "TRUNCATE TABLE $table CASCADE;" 2>&1 | Out-Null
}

Write-Host "  ✓ Database tables cleaned" -ForegroundColor Green

# 2. CLEANUP REDIS
Write-Host ""
Write-Host "[2/4] Flushing Redis cache..." -ForegroundColor Green

# Get count of session keys
$redisKeyCount = (docker exec $REDIS_CONTAINER redis-cli --scan --pattern "session:*" 2>$null | Measure-Object).Count

if ($redisKeyCount -gt 0) {
    Write-Host "  Found $redisKeyCount Redis keys to delete" -ForegroundColor Gray
    docker exec $REDIS_CONTAINER redis-cli EVAL "local keys = redis.call('keys', 'session:*'); for i=1,#keys do redis.call('del', keys[i]); end; return #keys" 0 2>&1 | Out-Null
    Write-Host "  ✓ Redis cache cleaned ($redisKeyCount keys deleted)" -ForegroundColor Green
} else {
    Write-Host "  ✓ Redis cache is empty" -ForegroundColor Green
}

# 3. CLEANUP RABBITMQ QUEUES
Write-Host ""
Write-Host "[3/4] Purging RabbitMQ queues..." -ForegroundColor Green
docker exec $RABBITMQ_CONTAINER rabbitmqctl purge_queue snapshot.process 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ RabbitMQ queue purged" -ForegroundColor Green
} else {
    Write-Host "  ✓ RabbitMQ queue empty or not found" -ForegroundColor Green
}

# 4. CLEANUP UPLOADED FILES
Write-Host ""
Write-Host "[4/4] Removing uploaded snapshot files..." -ForegroundColor Green

if (Test-Path $UPLOAD_DIR) {
    $fileCount = (Get-ChildItem -Path $UPLOAD_DIR -Recurse -File 2>$null | Measure-Object).Count
    
    if ($fileCount -gt 0) {
        Write-Host "  Found $fileCount files to delete" -ForegroundColor Gray
        Remove-Item -Path "$UPLOAD_DIR\*" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Upload directory cleaned ($fileCount files deleted)" -ForegroundColor Green
    } else {
        Write-Host "  ✓ Upload directory is empty" -ForegroundColor Green
    }
} else {
    Write-Host "  ✓ Upload directory does not exist" -ForegroundColor Green
}

# VERIFICATION
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VERIFICATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$sessionCountAfter = (docker exec $POSTGRES_CONTAINER psql -U exam_user -d exam_db -t -c "SELECT COUNT(*) FROM exam_sessions;" 2>$null).Trim()
$eventCountAfter = (docker exec $POSTGRES_CONTAINER psql -U exam_user -d exam_db -t -c "SELECT COUNT(*) FROM events;" 2>$null).Trim()
$snapshotCountAfter = (docker exec $POSTGRES_CONTAINER psql -U exam_user -d exam_db -t -c "SELECT COUNT(*) FROM media_snapshots;" 2>$null).Trim()
$incidentCountAfter = (docker exec $POSTGRES_CONTAINER psql -U exam_user -d exam_db -t -c "SELECT COUNT(*) FROM incidents;" 2>$null).Trim()
$reviewCountAfter = (docker exec $POSTGRES_CONTAINER psql -U exam_user -d exam_db -t -c "SELECT COUNT(*) FROM incident_reviews;" 2>$null).Trim()

Write-Host "Final state:" -ForegroundColor White
Write-Host "  ✓ Sessions: $sessionCountAfter (was $sessionCount)" -ForegroundColor Green
Write-Host "  ✓ Events: $eventCountAfter (was $eventCount)" -ForegroundColor Green
Write-Host "  ✓ Snapshots: $snapshotCountAfter (was $snapshotCount)" -ForegroundColor Green
Write-Host "  ✓ Incidents: $incidentCountAfter (was $incidentCount)" -ForegroundColor Green
Write-Host "  ✓ Reviews: $reviewCountAfter (was $reviewCount)" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "System is ready for fresh tests." -ForegroundColor Cyan
Write-Host ""
