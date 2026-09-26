-- Efecto Mariposa Project - Initial PostgreSQL Database Schema
-- Version: 0.1 MVP Core Engine

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE user_role_enum AS ENUM ('SUPER_ADMIN', 'EDITOR', 'CURATOR', 'REVIEWER', 'VIEWER');
CREATE TYPE project_day_status_enum AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'CURATION', 'EDITING', 'PUBLISHED');
CREATE TYPE platform_enum AS ENUM ('TIKTOK', 'INSTAGRAM', 'FACEBOOK', 'WEB', 'OTHER');
CREATE TYPE contribution_status_enum AS ENUM (
  'RECEIVED', 'VALIDATING', 'VALID', 'INVALID', 'SELECTED', 
  'REPLACEMENT_CANDIDATE', 'EDITORIAL_REVIEW', 'APPROVED', 'INCORPORATED', 'REJECTED'
);
CREATE TYPE character_status_enum AS ENUM ('ALIVE', 'DEAD', 'MISSING', 'UNKNOWN');
CREATE TYPE mystery_status_enum AS ENUM ('OPEN', 'PARTIALLY_RESOLVED', 'RESOLVED', 'ABANDONED');
CREATE TYPE narrative_seed_status_enum AS ENUM ('OPEN', 'DEVELOPING', 'CONNECTED', 'RESOLVED', 'DISCARDED');
CREATE TYPE severity_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- 2. PROJECTS TABLE
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  daily_word_limit INT DEFAULT 33,
  daily_selected_contributions INT DEFAULT 3,
  max_selected_per_user INT DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROJECT DAYS TABLE
CREATE TABLE project_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  date DATE NOT NULL,
  week_number INT NOT NULL,
  status project_day_status_enum DEFAULT 'DRAFT',
  opening_text TEXT,
  closing_text TEXT,
  editorial_notes TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, day_number)
);

-- 4. SOCIAL POSTS TABLE
CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_day_id UUID REFERENCES project_days(id) ON DELETE CASCADE,
  platform platform_enum NOT NULL,
  platform_post_id VARCHAR(255),
  post_url TEXT,
  caption TEXT,
  published_at TIMESTAMPTZ,
  comments_imported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PARTICIPANTS TABLE
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform platform_enum NOT NULL,
  platform_user_id VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  profile_url TEXT,
  selected_count INT DEFAULT 0 CHECK (selected_count <= 3),
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, platform_user_id)
);

-- 6. CONTRIBUTIONS TABLE (Central Table)
CREATE TABLE contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  project_day_id UUID REFERENCES project_days(id) ON DELETE CASCADE,
  social_post_id UUID REFERENCES social_posts(id) ON DELETE SET NULL,
  internal_id VARCHAR(50) UNIQUE NOT NULL, -- e.g. EMP-D023-00157
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  platform_comment_id VARCHAR(255),
  platform_comment_url TEXT,
  original_text TEXT NOT NULL,
  original_hash VARCHAR(64) NOT NULL, -- SHA-256
  normalized_text TEXT,
  word_count INT NOT NULL,
  capture_sequence INT NOT NULL,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  status contribution_status_enum DEFAULT 'RECEIVED',
  validation_status VARCHAR(50) DEFAULT 'PENDING',
  validation_reasons JSONB,
  selected_by_rule BOOLEAN DEFAULT FALSE,
  replacement_for_contribution_id UUID REFERENCES contributions(id),
  editorial_version TEXT,
  final_version TEXT,
  essence_preserved BOOLEAN,
  editorial_notes TEXT,
  ai_analysis_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_day_id, capture_sequence)
);

-- 7. DAILY SELECTION RULES TABLE
CREATE TABLE daily_selection_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_day_id UUID REFERENCES project_days(id) ON DELETE CASCADE,
  slot_number INT NOT NULL CHECK (slot_number BETWEEN 1 AND 3),
  target_sequence INT NOT NULL,
  selected_contribution_id UUID REFERENCES contributions(id),
  replacement_applied BOOLEAN DEFAULT FALSE,
  replacement_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_day_id, slot_number)
);

-- 8. SELECTION AUDIT LOG TABLE
CREATE TABLE selection_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_day_id UUID REFERENCES project_days(id) ON DELETE CASCADE,
  selection_slot INT NOT NULL,
  initial_target INT NOT NULL,
  candidate_sequence INT NOT NULL,
  contribution_id UUID REFERENCES contributions(id),
  valid BOOLEAN NOT NULL,
  reason TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 9. AUDIT LOGS TABLE
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  previous_value JSONB,
  new_value JSONB,
  reason TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 10. STORY BIBLE TABLES
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  aliases TEXT[],
  description TEXT,
  age INT,
  gender VARCHAR(50),
  status character_status_enum DEFAULT 'ALIVE',
  first_appearance_day INT,
  last_appearance_day INT,
  current_location VARCHAR(255),
  public_information TEXT,
  secret_information TEXT,
  editorial_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mysteries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  introduced_day INT NOT NULL,
  resolved_day INT,
  status mystery_status_enum DEFAULT 'OPEN',
  importance INT DEFAULT 1,
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE narrative_seeds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  source_contribution_id UUID REFERENCES contributions(id),
  introduced_day INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status narrative_seed_status_enum DEFAULT 'OPEN',
  potential_connections JSONB,
  resolved_day INT,
  resolution_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. MANUSCRIPT TABLES
CREATE TABLE manuscript (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  current_version INT DEFAULT 1,
  total_days_published INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE manuscript_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manuscript_id UUID REFERENCES manuscript(id) ON DELETE CASCADE,
  project_day_id UUID REFERENCES project_days(id) ON DELETE CASCADE,
  chapter_number INT NOT NULL,
  title VARCHAR(255),
  content TEXT NOT NULL,
  editorial_notes TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW()
);
