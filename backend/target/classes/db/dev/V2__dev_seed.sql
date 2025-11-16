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

-- Ensure the well-known exam exists (ID 1111...)
INSERT INTO exams (id, name, description, start_time, created_by)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Demo Exam',
  'Seeded by V2__dev_seed.sql',
  now(),
  NULL
)
ON CONFLICT DO NOTHING;
