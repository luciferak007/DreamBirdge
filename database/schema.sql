-- Job Portal — MySQL schema and sample data
CREATE DATABASE IF NOT EXISTS jobportal_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE jobportal_db;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL,
  headline VARCHAR(255),
  bio VARCHAR(2000),
  company VARCHAR(255),
  created_at TIMESTAMP NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS jobs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  type VARCHAR(32) NOT NULL,
  category VARCHAR(100) NOT NULL,
  salary_min DOUBLE,
  salary_max DOUBLE,
  description VARCHAR(4000) NOT NULL,
  requirements VARCHAR(2000),
  employer_id BIGINT NOT NULL,
  posted_at TIMESTAMP NULL,
  active BIT(1) DEFAULT b'1',
  CONSTRAINT fk_jobs_employer FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS applications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  job_id BIGINT NOT NULL,
  applicant_id BIGINT NOT NULL,
  cover_letter VARCHAR(3000),
  resume_url VARCHAR(500),
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  applied_at TIMESTAMP NULL,
  UNIQUE KEY uniq_app (job_id, applicant_id),
  CONSTRAINT fk_app_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  CONSTRAINT fk_app_user FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Sample data (passwords: bcrypt hash of "password123")
-- The application also seeds these via DataSeeder on first run.

-- Audit log: every CREATE/UPDATE/DELETE/STATUS_CHANGE/LOGIN/REGISTER is recorded here.
-- Read via GET /api/admin/audit (ADMIN role only). Never mutated by the API.
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  action VARCHAR(32) NOT NULL,
  entity_type VARCHAR(64) NOT NULL,
  entity_id BIGINT,
  actor_email VARCHAR(255) NOT NULL,
  actor_role VARCHAR(32),
  details VARCHAR(2000),
  created_at TIMESTAMP NOT NULL,
  INDEX idx_audit_entity (entity_type),
  INDEX idx_audit_actor (actor_email),
  INDEX idx_audit_created (created_at)
) ENGINE=InnoDB;

-- NOTE: The single ADMIN account is bootstrapped at backend startup using the
-- credentials in backend/src/main/resources/application.properties (app.admin.*).
-- Default: admin@jobportal.com / Admin@12345  — change BEFORE first run in production.
