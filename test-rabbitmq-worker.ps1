# Test RabbitMQ + Face Detection Worker Integration
# This script tests the complete async snapshot processing flow

Write-Host "Testing RabbitMQ + Face Detection Worker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080/api"
$examId = "11111111-1111-1111-1111-111111111111"

# Step 1: Start mock exam session
Write-Host "`nStep 1: Creating mock exam session..." -ForegroundColor Yellow
$startResponse = Invoke-RestMethod -Uri "$baseUrl/mock-exam/start" -Method Post -ContentType "application/json" -Body (@{
    examId = $examId
    userId = "22222222-2222-2222-2222-222222222222"
} | ConvertTo-Json)

$sessionId = $startResponse.sessionId
Write-Host "Session created: $sessionId" -ForegroundColor Green

# Step 2: Upload snapshots (simulate webcam captures)
Write-Host "`nStep 2: Uploading 5 snapshots..." -ForegroundColor Yellow

for ($i = 1; $i -le 5; $i++) {
    $timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() + ($i * 1000)
    $snapshotData = @{
        items = @(
            @{
                sessionId = $sessionId
                ts = $timestamp
                objectKey = "snapshots/$sessionId/snapshot_$i.jpg"
                fileSize = 102400
                mimeType = "image/jpeg"
                idempotencyKey = "$sessionId-$timestamp"
            }
        )
    } | ConvertTo-Json -Depth 3

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/ingest/snapshots" -Method Post -ContentType "application/json" -Body $snapshotData
        Write-Host "  Snapshot $i uploaded: created=$($response.created), duplicates=$($response.duplicates)" -ForegroundColor Gray
    } catch {
        Write-Host "  Snapshot $i FAILED: $_" -ForegroundColor Red
    }
    
    # Small delay between uploads
    Start-Sleep -Milliseconds 500
}

Write-Host "5 snapshots upload complete" -ForegroundColor Green

# Step 3: Wait for worker to process
Write-Host "`nStep 3: Waiting for RabbitMQ worker to process snapshots (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 4: Check incidents created
Write-Host "`nStep 4: Checking for auto-created incidents..." -ForegroundColor Yellow
try {
    $incidents = Invoke-RestMethod -Uri "$baseUrl/incidents?sessionId=$sessionId" -Method Get
    
    if ($incidents.Count -gt 0) {
        Write-Host "Found $($incidents.Count) incident(s):" -ForegroundColor Green
        foreach ($incident in $incidents) {
            Write-Host "  - Type: $($incident.type), Score: $($incident.score), Reason: $($incident.reason)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "No incidents created (all snapshots had 1 face - normal)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error checking incidents: $_" -ForegroundColor Red
}

# Step 5: Check RabbitMQ Management UI
Write-Host "`nStep 5: RabbitMQ Status" -ForegroundColor Yellow
Write-Host "   Management UI: http://localhost:15672" -ForegroundColor Gray
Write-Host "   Username: guest, Password: guest" -ForegroundColor Gray
Write-Host "   Check queue 'snapshot.process' for message processing" -ForegroundColor Gray

# Step 6: Query database for face_count
Write-Host "`nStep 6: Database verification" -ForegroundColor Yellow
Write-Host "   Run this SQL to see face_count values:" -ForegroundColor Gray
Write-Host "   docker exec -it examdb psql -U postgres -d examdb -c `"SELECT id, session_id, face_count, object_key FROM media_snapshots WHERE session_id = '$sessionId';`"" -ForegroundColor White

Write-Host "`nTest complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Expected outcomes:" -ForegroundColor Cyan
Write-Host "  - 5 snapshots uploaded to DB" -ForegroundColor Gray
Write-Host "  - 5 messages sent to RabbitMQ queue" -ForegroundColor Gray
Write-Host "  - Worker consumed messages and updated face_count (0, 1, or 2)" -ForegroundColor Gray
Write-Host "  - Incidents created for face_count=0 (NO_FACE) or face_count>=2 (MULTI_FACE)" -ForegroundColor Gray
Write-Host ""
