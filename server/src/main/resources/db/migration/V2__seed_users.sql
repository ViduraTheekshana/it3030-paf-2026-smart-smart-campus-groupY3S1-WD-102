-- V2__seed_users.sql
-- Seed users: 1 admin, 2 managers, 2 technicians, 10 users
-- Assumes:
--   - users.user_id is auto-generated
--   - password column stores BCrypt hashes
--   - provider is enum/string like LOCAL
--   - role values are ROLE_ADMIN / ROLE_MANAGER / ROLE_TECHNICIAN / ROLE_USER

-- IMPORTANT:
-- Replace the password hashes below with real BCrypt hashes from your app.
-- Example plaintext plan:
--   Admin@123     -> admin
--   Manager@123   -> managers
--   Tech@123      -> technicians
--   User@123      -> users

INSERT INTO users (
    full_name,
    email,
    password,
    enabled,
    email_verified,
    phone_number,
    provider,
    role,
    created_at,
    updated_at
) VALUES
-- 1 ADMIN
(
    'System Admin',
    'admin@gmail.com',
    '$2a$10$REPLACE_WITH_BCRYPT_HASH_FOR_Admin@123',
    true,
    true,
    '0712345678',
    'LOCAL',
    'ROLE_ADMIN',
    NOW(),
    NOW()
),

-- 2 MANAGERS
(
    'Manager One',
    'manager1@gmail.com',
    '$2a$10$REPLACE_WITH_BCRYPT_HASH_FOR_Manager@123',
    true,
    true,
    '0712345601',
    'LOCAL',
    'ROLE_MANAGER',
    NOW(),
    NOW()
),
(
    'Manager Two',
    'manager2@gmail.com',
    '$2a$10$REPLACE_WITH_BCRYPT_HASH_FOR_Manager@123',
    true,
    true,
    '0712345602',
    'LOCAL',
    'ROLE_MANAGER',
    NOW(),
    NOW()
),

-- 2 TECHNICIANS
(
    'Technician One',
    'tech1@gmail.com',
    '$2a$10$REPLACE_WITH_BCRYPT_HASH_FOR_Tech@123',
    true,
    true,
    '0712345701',
    'LOCAL',
    'ROLE_TECHNICIAN',
    NOW(),
    NOW()
),
(
    'Technician Two',
    'tech2@gmail.com',
    '$2a$10$REPLACE_WITH_BCRYPT_HASH_FOR_Tech@123',
    true,
    true,
    '0712345702',
    'LOCAL',
    'ROLE_TECHNICIAN',
    NOW(),
    NOW()
),

-- 10 USERS
(
    'User One',
    'user1@gmail.com',
    '$2a$10$REPLACE_WITH_BCRYPT_HASH_FOR_User@123',
    true,
    true,
    '0712345801',
    'LOCAL',
    'ROLE_USER',
    NOW(),
    NOW()
),
(
    'User Two',
    'user2@gmail.com',
    '$2a$10$REPLACE_WITH_BCRYPT_HASH_FOR_User@123',
    true,
    true,
    '0712345802',
    'LOCAL',
    'ROLE_USER',
    NOW(),
    NOW()
),
(
    'User Three',
    'user3@gmail.com',
    '$2a$10$REPLACE_WITH_BCRYPT_HASH_FOR_User@123',
    true,
    true,
    '0712345803',
    'LOCAL',
    'ROLE_USER',
    NOW(),
    NOW()
),
(
    'User Four',
    'user4@gmail.com',
    '$2a$10$REPLACE_WITH_BCRYPT_HASH_FOR_User@123',
    true,
    true,
    '0712345804',
    'LOCAL',
    'ROLE_USER',
    NOW(),
    NOW()
),
(
    'User Five',
    'user5@gmail.com',
    '$2a$10$REPLACE_WITH_BCRYPT_HASH_FOR_User@123',
    true,
    true,
    '0712345805',
    'LOCAL',
    'ROLE_USER',
    NOW(),
    NOW()
),
(
    'User Six',
    'user6@gmail.com',
    '$2a$10$REPLACE_WITH_BCRYPT_HASH_FOR_User@123',
    true,
    true,
    '0712345806',
    'LOCAL',
    'ROLE_USER',
    NOW(),
    NOW()
),
(
    'User Seven',
    'user7@gmail.com',
    '$2a$10$REPLACE_WITH_BCRYPT_HASH_FOR_User@123',
    true,
    true,
    '0712345807',
    'LOCAL',
    'ROLE_USER',
    NOW(),
    NOW()
),
(
    'User Eight',
    'user8@gmail.com',
    '$2a$10$REPLACE_WITH_BCRYPT_HASH_FOR_User@123',
    true,
    true,
    '0712345808',
    'LOCAL',
    'ROLE_USER',
    NOW(),
    NOW()
),
(
    'User Nine',
    'user9@gmail.com',
    '$2a$10$REPLACE_WITH_BCRYPT_HASH_FOR_User@123',
    true,
    true,
    '0712345809',
    'LOCAL',
    'ROLE_USER',
    NOW(),
    NOW()
),
(
    'User Ten',
    'user10@gmail.com',
    '$2a$10$REPLACE_WITH_BCRYPT_HASH_FOR_User@123',
    true,
    true,
    '0712345810',
    'LOCAL',
    'ROLE_USER',
    NOW(),
    NOW()
);