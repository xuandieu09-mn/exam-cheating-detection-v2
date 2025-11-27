@echo off
echo Starting Docker Compose services...
docker compose up -d
echo.
echo Checking service status...
docker compose ps
echo.
echo Done!
pause
