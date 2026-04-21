-- V3__seed_users.sql
-- Seed users for local development
-- Note: AdminSeeder.java handles admin@gmail.com on startup
-- Password hash below = BCrypt of 'password'

INSERT INTO users (full_name, email, password, role, provider, enabled, email_verified, created_at, updated_at)
VALUES
    -- Admin
    ('System Admin',     'admin@gmail.com',               '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ROLE_ADMIN',      'LOCAL', true, true, NOW(), NOW()),

    -- Technicians
    ('Kasun Perera',     'kasun.perera@smartcampus.lk',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ROLE_TECHNICIAN', 'LOCAL', true, true, NOW(), NOW()),
    ('Nimali Fernando',  'nimali.fernando@smartcampus.lk', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ROLE_TECHNICIAN', 'LOCAL', true, true, NOW(), NOW()),
    ('Ruwan Silva',      'ruwan.silva@smartcampus.lk',     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ROLE_TECHNICIAN', 'LOCAL', true, true, NOW(), NOW()),

    -- Regular users
    ('Amara Jayasinghe', 'amara.j@smartcampus.lk',        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ROLE_USER', 'LOCAL', true, true, NOW(), NOW()),
    ('Dilshan Bandara',  'dilshan.b@smartcampus.lk',       '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ROLE_USER', 'LOCAL', true, true, NOW(), NOW()),
    ('Sachini Madushani','sachini.m@smartcampus.lk',       '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ROLE_USER', 'LOCAL', true, true, NOW(), NOW()),
    ('Tharaka Wijeratne','tharaka.w@smartcampus.lk',       '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ROLE_USER', 'LOCAL', true, true, NOW(), NOW()),
    ('Nadeesha Kumari',  'nadeesha.k@smartcampus.lk',      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ROLE_USER', 'LOCAL', true, true, NOW(), NOW());