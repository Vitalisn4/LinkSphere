-- Add migration script here

-- Enable UUID extension for better distributed systems scalability
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_gender AS ENUM ('male', 'female', 'other');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');

-- Create users table with all necessary fields
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    gender user_gender NOT NULL,
    status user_status NOT NULL DEFAULT 'inactive',
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verification_attempts INTEGER NOT NULL DEFAULT 0,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create links table with proper relations
CREATE TABLE links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    click_count INTEGER NOT NULL DEFAULT 0,
    preview jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add constraints for data integrity
ALTER TABLE users
    ADD CONSTRAINT chk_email_format 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    ADD CONSTRAINT chk_username_format 
    CHECK (username ~ '^[a-zA-Z0-9_]{3,50}$');

-- Create indexes for performance optimization
CREATE UNIQUE INDEX idx_users_username ON users(username);
CREATE UNIQUE INDEX idx_users_verified_email ON users(email) WHERE is_verified = true;
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_links_user_id ON links(user_id);
CREATE INDEX idx_links_created_at ON links(created_at DESC);
CREATE INDEX idx_links_preview ON links USING gin (preview);

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_links_updated_at
    BEFORE UPDATE ON links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function and trigger for user verification status
CREATE OR REPLACE FUNCTION update_user_verification_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.verified_at IS NOT NULL AND OLD.verified_at IS NULL THEN
        NEW.is_verified = true;
        NEW.status = 'active';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_verification
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_user_verification_status();

-- Add comments for better documentation
COMMENT ON TABLE users IS 'Stores user account information with authentication and verification status';
COMMENT ON TABLE links IS 'Stores user-created links with metadata';
COMMENT ON INDEX idx_users_verified_email IS 'Ensures email uniqueness only for verified users';
