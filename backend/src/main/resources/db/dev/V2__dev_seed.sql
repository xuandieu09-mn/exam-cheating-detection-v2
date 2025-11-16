-- Dev-only seed data (runs only when profile=dev via application-dev.yml locations)
-- Idempotent inserts using ON CONFLICT DO NOTHING

-- Ensure the well-known user exists (ID 2222...)
INSERT INTO users (id, username, email, password_hash, role)
VALUES ('22222222-2222-2222-2222-222222222222', 'demo.candidate', 'candidate@example.com', '$2a$10$demoHashDemoHashDemoHashDemoHashDemoHa', 'CANDIDATE')
ON CONFLICT DO NOTHING;

-- Ensure a simple admin/proctor exists for completeness (optional)
INSERT INTO users (id, username, email, password_hash, role)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'demo.admin', 'admin@example.com', '$2a$10$demoHashDemoHashDemoHashDemoHashDemoHa', 'ADMIN')
ON CONFLICT DO NOTHING;

-- Add proctor user
INSERT INTO users (id, username, email, password_hash, role)
VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'demo.proctor', 'proctor@example.com', '$2a$10$demoHashDemoHashDemoHashDemoHashDemoHa', 'PROCTOR')
ON CONFLICT DO NOTHING;

-- Add reviewer user
INSERT INTO users (id, username, email, password_hash, role)
VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'demo.reviewer', 'reviewer@example.com', '$2a$10$demoHashDemoHashDemoHashDemoHashDemoHa', 'REVIEWER')
ON CONFLICT DO NOTHING;

-- Ensure the well-known exam exists (ID 1111...)
INSERT INTO exams (id, name, description, start_time, end_time, created_by, retention_days)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Demo Exam - Active',
  'Seeded by V2__dev_seed.sql - Currently active exam',
  now() - interval '1 hour',
  now() + interval '2 hours',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  30
)
ON CONFLICT DO NOTHING;

-- Add more sample exams
INSERT INTO exams (id, name, description, start_time, end_time, created_by, retention_days)
VALUES (
  '22222222-3333-3333-3333-333333333333',
  'Midterm Exam - Ended',
  'Mathematics midterm exam - already ended',
  now() - interval '5 days',
  now() - interval '4 days',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  30
)
ON CONFLICT DO NOTHING;

INSERT INTO exams (id, name, description, start_time, end_time, created_by, retention_days)
VALUES (
  '33333333-4444-4444-4444-444444444444',
  'Final Exam - Upcoming',
  'Comprehensive final examination - scheduled for next week',
  now() + interval '7 days',
  now() + interval '8 days',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  60
)
ON CONFLICT DO NOTHING;

