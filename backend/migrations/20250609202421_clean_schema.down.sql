-- Drop triggers first
DROP TRIGGER IF EXISTS update_user_verification ON users;
DROP FUNCTION IF EXISTS update_user_verification_status();

DROP TRIGGER IF EXISTS update_links_updated_at ON links;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables in correct order (respect foreign key constraints)
DROP TABLE IF EXISTS links;
DROP TABLE IF EXISTS users;

-- Drop enum types
DROP TYPE IF EXISTS user_status;
DROP TYPE IF EXISTS user_gender; 