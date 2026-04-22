-- Create password_reset_otps table for OTP-based password reset
CREATE TABLE IF NOT EXISTS password_reset_otps (
    otp_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    otp VARCHAR(10) NOT NULL,
    expiry_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_otp_user_id ON password_reset_otps(user_id);

-- Create index on expiry_time for cleanup of expired OTPs
CREATE INDEX IF NOT EXISTS idx_password_reset_otp_expiry_time ON password_reset_otps(expiry_time);

-- Create index on otp_code for verification
CREATE INDEX IF NOT EXISTS idx_password_reset_otp_code ON password_reset_otps(otp);
