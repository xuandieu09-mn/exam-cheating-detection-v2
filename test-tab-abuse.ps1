# Test Tab-Abuse Detection Rule
# This script tests the Redis-based tab-abuse detection

$baseUrl = "http://localhost:8080"

Write-Host "=== Testing Tab-Abuse Detection ===" -ForegroundColor Cyan

# Step 1: Start a mock exam session
Write-Host "`n1. Starting mock exam session..." -ForegroundColor Yellow
$startResponse = Invoke-RestMethod -Uri "$baseUrl/api/mock-exam/start" `
    -Method POST `
    -ContentType "application/json" `
    -Body (@{
        examId = "11111111-1111-1111-1111-111111111111"
        userId = "22222222-2222-2222-2222-222222222222"
    } | ConvertTo-Json)

$sessionId = $startResponse.sessionId
Write-Host "✓ Session created: $sessionId" -ForegroundColor Green

# Step 2: Send 12 TAB_SWITCH events to trigger the rule
Write-Host "`n2. Sending 12 TAB_SWITCH events (all in same minute)..." -ForegroundColor Yellow

$events = @()
$baseTime = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
for ($i = 0; $i -lt 12; $i++) {
    $timestamp = $baseTime + ($i * 100) # 100ms apart (same minute)
    $events += @{
        sessionId = $sessionId
        ts = $timestamp
        eventType = "TAB_SWITCH"
        idempotencyKey = [guid]::NewGuid().ToString()
    }
}

$ingestResponse = Invoke-RestMethod -Uri "$baseUrl/api/ingest/events" `
    -Method POST `
    -ContentType "application/json" `
    -Body (@{items = $events} | ConvertTo-Json -Depth 10)

Write-Host "✓ Sent $($ingestResponse.created) events" -ForegroundColor Green

# Step 3: Wait a bit for async processing
Write-Host "`n3. Waiting for rule processing..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Step 4: Check if TAB_ABUSE incident was created
Write-Host "`n4. Checking incidents..." -ForegroundColor Yellow
$incidents = Invoke-RestMethod -Uri "$baseUrl/api/incidents?sessionId=$sessionId"

# Handle both array and single object response
$incidentList = if ($incidents.content) { $incidents.content } elseif ($incidents -is [array]) { $incidents } else { @($incidents) }
$tabAbuseIncident = $incidentList | Where-Object { $_.type -eq "TAB_ABUSE" }

if ($tabAbuseIncident) {
    Write-Host "✓ SUCCESS! TAB_ABUSE incident detected!" -ForegroundColor Green
    Write-Host "`nIncident details:" -ForegroundColor Cyan
    Write-Host "  ID: $($tabAbuseIncident.id)"
    Write-Host "  Type: $($tabAbuseIncident.type)"
    Write-Host "  Score: $($tabAbuseIncident.score)"
    Write-Host "  Reason: $($tabAbuseIncident.reason)"
    Write-Host "  Status: $($tabAbuseIncident.status)"
} else {
    Write-Host "✗ FAILED! No TAB_ABUSE incident found" -ForegroundColor Red
    Write-Host "All incidents:" -ForegroundColor Yellow
    $incidentList | Format-Table -Property type, score, reason
}

# Step 5: Check Redis keys
Write-Host "`n5. Checking Redis keys..." -ForegroundColor Yellow
$redisKeys = docker exec exam-redis redis-cli --scan --pattern "session:$sessionId*"
Write-Host "Redis keys created:" -ForegroundColor Cyan
$redisKeys | ForEach-Object { Write-Host "  $_" }

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
