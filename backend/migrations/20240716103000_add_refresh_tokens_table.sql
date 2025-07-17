-- Add refresh_tokens table for storing user refresh tokens
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index for quick lookup by token
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- Index for user_id (optional, for multi-device support)
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id); 