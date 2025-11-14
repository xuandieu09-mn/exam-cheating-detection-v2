-- Create a fixed reviewer for local dev convenience
-- Safe to run multiple times
INSERT INTO users (id, username, email, password_hash, role)
SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
       'dev-reviewer',
       'dev-reviewer@example.com',
       'pw-hash-reviewer',
       'REVIEWER'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid
);
