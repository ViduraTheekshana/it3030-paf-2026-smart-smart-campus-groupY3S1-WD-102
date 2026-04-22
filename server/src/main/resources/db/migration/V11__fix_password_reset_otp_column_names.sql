-- Fix column name mismatch in password_reset_otps table
-- Rename expires_at to expiry_time to match the entity mapping

-- First check if expires_at column exists and rename it
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'password_reset_otps' AND column_name = 'expires_at') THEN
        ALTER TABLE password_reset_otps RENAME COLUMN expires_at TO expiry_time;
    END IF;
END $$;

-- Also ensure the table exists with correct structure
CREATE TABLE IF NOT EXISTS password_reset_otps (
    otp_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    otp VARCHAR(10) NOT NULL,
    expiry_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_password_reset_otp_user_id ON password_reset_otps(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_otp_expiry_time ON password_reset_otps(expiry_time);
CREATE INDEX IF NOT EXISTS idx_password_reset_otp_code ON password_reset_otps(otp);
