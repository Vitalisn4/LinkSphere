-- Update existing unverified users to pending_verification status
UPDATE users 
SET status = 'pending_verification'
WHERE is_verified = false AND status = 'inactive'; 