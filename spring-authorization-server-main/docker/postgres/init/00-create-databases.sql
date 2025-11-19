DO
$$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'exam_identity') THEN
        CREATE ROLE exam_identity WITH LOGIN PASSWORD 'exam_identity';
    END IF;
END
$$;

SELECT 'CREATE DATABASE exam_identity OWNER exam_identity'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'exam_identity')
\gexec

