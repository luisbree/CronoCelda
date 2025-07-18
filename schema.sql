-- PostgreSQL schema for the ChronoVault application

-- Users Table
-- Stores user information, linking to Firebase Auth users via their UID.
CREATE TABLE users (
    uid VARCHAR(255) PRIMARY KEY,
    display_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories Table
-- Stores user-defined categories for milestones, including their custom color.
CREATE TABLE categories (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20) NOT NULL,
    user_uid VARCHAR(255) REFERENCES users(uid) ON DELETE CASCADE,
    created_at TIMESTAMTz DEFAULT NOW(),
    UNIQUE(user_uid, name) -- A user cannot have two categories with the same name
);

-- Milestones Table
-- This is the core table, storing each event or milestone in the timeline.
CREATE TABLE milestones (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    occurred_at TIMESTAMPTZ NOT NULL,
    category_id VARCHAR(255) REFERENCES categories(id) ON DELETE SET NULL,
    user_uid VARCHAR(255) REFERENCES users(uid) ON DELETE CASCADE,
    is_important BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Associated Files Table
-- Stores information about files attached to each milestone.
CREATE TABLE associated_files (
    id VARCHAR(255) PRIMARY KEY,
    milestone_id VARCHAR(255) REFERENCES milestones(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    size_kb NUMERIC(10, 2), -- Storing size in KB
    file_type VARCHAR(50) -- 'document', 'image', 'video', 'audio', 'other'
);

-- Milestone Tags Table
-- A many-to-many relationship between milestones and tags.
-- This is more flexible than a simple array, allowing for tag-based queries.
CREATE TABLE milestone_tags (
    milestone_id VARCHAR(255) REFERENCES milestones(id) ON DELETE CASCADE NOT NULL,
    tag_name VARCHAR(50) NOT NULL,
    PRIMARY KEY (milestone_id, tag_name)
);

-- Milestone History Table
-- Logs all changes made to a milestone for auditing purposes.
CREATE TABLE milestone_history (
    id SERIAL PRIMARY KEY,
    milestone_id VARCHAR(255) REFERENCES milestones(id) ON DELETE CASCADE NOT NULL,
    entry TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_milestones_occurred_at ON milestones(occurred_at);
CREATE INDEX idx_milestones_category_id ON milestones(category_id);
CREATE INDEX idx_milestones_user_uid ON milestones(user_uid);
CREATE INDEX idx_associated_files_milestone_id ON associated_files(milestone_id);
CREATE INDEX idx_milestone_tags_tag_name ON milestone_tags(tag_name);
CREATE INDEX idx_milestone_history_milestone_id ON milestone_history(milestone_id);

-- Function to automatically update the `updated_at` timestamp on milestone changes
CREATE OR REPLACE FUNCTION update_milestone_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_milestone_modtime
BEFORE UPDATE ON milestones
FOR EACH ROW
EXECUTE FUNCTION update_milestone_updated_at_column();
