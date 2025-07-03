-- Add pending_verification to user_status enum
ALTER TYPE user_status ADD VALUE IF NOT EXISTS 'pending_verification';