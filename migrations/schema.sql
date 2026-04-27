-- Content Broadcasting System - MySQL Schema

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('principal', 'teacher')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(100) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_by VARCHAR(36),
  status VARCHAR(20) DEFAULT 'pending',
  rejection_reason TEXT,
  approved_by VARCHAR(36),
  approved_at TIMESTAMP NULL,
  start_time TIMESTAMP NULL,
  end_time TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS content_slots (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  subject VARCHAR(100) NOT NULL,
  teacher_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_subject_teacher (subject, teacher_id)
);

CREATE TABLE IF NOT EXISTS content_schedule (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  content_id VARCHAR(36),
  slot_id VARCHAR(36),
  rotation_order INTEGER NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
  FOREIGN KEY (slot_id) REFERENCES content_slots(id) ON DELETE CASCADE,
  UNIQUE KEY unique_content_slot (content_id, slot_id)
);
