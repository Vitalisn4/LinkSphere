-- Down migration for schema update
-- Version: 20240315223100

-- Drop triggers first
DROP TRIGGER IF EXISTS update_user_verification ON users;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_links_updated_at ON links;

-- Drop functions
DROP FUNCTION IF EXISTS update_user_verification_status();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop indexes
DROP INDEX IF EXISTS idx_links_preview;
DROP INDEX IF EXISTS idx_links_created_at;
DROP INDEX IF EXISTS idx_links_user_id;
DROP INDEX IF EXISTS idx_users_status;
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_verified_email;
DROP INDEX IF EXISTS idx_users_username;

-- Drop tables
DROP TABLE IF EXISTS links;
DROP TABLE IF EXISTS users;

-- Drop enum types
DROP TYPE IF EXISTS user_status;
DROP TYPE IF EXISTS user_gender;

-- Note: We don't drop the uuid-ossp extension as it might be used by other parts of the database 