-- PostgreSQL compatible schema

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL,
  headline VARCHAR(255),
  bio VARCHAR(2000),
  company VARCHAR(255),
  created_at TIMESTAMP
);

-- JOBS
CREATE TABLE IF NOT EXISTS jobs (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  type VARCHAR(32) NOT NULL,
  category VARCHAR(100) NOT NULL,
  salary_min DOUBLE PRECISION,
  salary_max DOUBLE PRECISION,
  description VARCHAR(4000) NOT NULL,
  requirements VARCHAR(2000),
  employer_id BIGINT NOT NULL,
  posted_at TIMESTAMP,
  active BOOLEAN DEFAULT TRUE,

  CONSTRAINT fk_jobs_employer
    FOREIGN KEY (employer_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- APPLICATIONS
CREATE TABLE IF NOT EXISTS applications (
  id BIGSERIAL PRIMARY KEY,
  job_id BIGINT NOT NULL,
  applicant_id BIGINT NOT NULL,
  cover_letter VARCHAR(3000),
  resume_url VARCHAR(500),
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  applied_at TIMESTAMP,

  CONSTRAINT uniq_app UNIQUE (job_id, applicant_id),

  CONSTRAINT fk_app_job
    FOREIGN KEY (job_id)
    REFERENCES jobs(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_app_user
    FOREIGN KEY (applicant_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- ✅ AUDIT LOGS (FIXED FOR POSTGRESQL)
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  action VARCHAR(32) NOT NULL,
  entity_type VARCHAR(64) NOT NULL,
  entity_id BIGINT,
  actor_email VARCHAR(255) NOT NULL,
  actor_role VARCHAR(32),
  details VARCHAR(2000),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_email);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
