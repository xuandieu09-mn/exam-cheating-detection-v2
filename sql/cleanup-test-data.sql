-- ================================================================
-- DATABASE CLEANUP SCRIPT - Test Data Removal
-- ================================================================
-- Purpose: Remove all test sessions, incidents, events, and snapshots
--          while preserving seed data (exams, users)
--
-- Usage:
--   1. Via Docker:
--      docker exec -it examdb psql -U postgres -d examdb -f /path/to/cleanup-test-data.sql
--
--   2. Via psql directly:
--      psql -U postgres -d examdb -f cleanup-test-data.sql
--
--   3. Via PowerShell:
--      Get-Content sql\cleanup-test-data.sql | docker exec -i examdb psql -U postgres -d examdb
-- ================================================================

BEGIN;

-- Display counts before cleanup
SELECT 'BEFORE CLEANUP:' as status;
SELECT 
    (SELECT COUNT(*) FROM sessions) as total_sessions,
    (SELECT COUNT(*) FROM incidents) as total_incidents,
    (SELECT COUNT(*) FROM events) as total_events,
    (SELECT COUNT(*) FROM media_snapshots) as total_snapshots,
    (SELECT COUNT(*) FROM reviews) as total_reviews;

-- 1. Delete all reviews (no foreign key constraints)
DELETE FROM reviews;

-- 2. Delete all incidents (referenced by reviews, but we deleted those)
DELETE FROM incidents;

-- 3. Delete all events
DELETE FROM events;

-- 4. Delete all media snapshots
DELETE FROM media_snapshots;

-- 5. Delete all sessions
DELETE FROM sessions;

-- Display counts after cleanup
SELECT 'AFTER CLEANUP:' as status;
SELECT 
    (SELECT COUNT(*) FROM sessions) as total_sessions,
    (SELECT COUNT(*) FROM incidents) as total_incidents,
    (SELECT COUNT(*) FROM events) as total_events,
    (SELECT COUNT(*) FROM media_snapshots) as total_snapshots,
    (SELECT COUNT(*) FROM reviews) as total_reviews;

-- Reset sequences (optional - ensures IDs start fresh)
-- Note: UUIDs don't use sequences, so this is only for any auto-increment fields
-- ALTER SEQUENCE IF EXISTS <sequence_name> RESTART WITH 1;

-- Display preserved data
SELECT 'PRESERVED DATA:' as status;
SELECT 
    (SELECT COUNT(*) FROM exams) as total_exams,
    (SELECT COUNT(*) FROM users) as total_users;

SELECT 'Exams preserved:' as info;
SELECT id, name, status FROM exams ORDER BY start_time;

COMMIT;

-- ================================================================
-- NOTES:
-- ================================================================
-- 1. This script preserves:
--    - All exams (seed data from migrations)
--    - All users (from dev seed)
--
-- 2. This script removes:
--    - All test sessions
--    - All incidents (violations)
--    - All events (TAB_SWITCH, PASTE, etc.)
--    - All media snapshots
--    - All reviews
--
-- 3. To also clear Redis cache after running this:
--    docker exec -it exam-redis redis-cli FLUSHDB
--
-- 4. To clear RabbitMQ queues:
--    docker exec -it exam-rabbitmq rabbitmqadmin purge queue name=snapshot.process
--    (or restart RabbitMQ container)
--
-- 5. To clear uploaded files (media snapshots):
--    docker exec -it exam-cheating-detection-v2-backend-1 rm -rf /app/uploads/*
--    (be careful with this command!)
-- ================================================================
