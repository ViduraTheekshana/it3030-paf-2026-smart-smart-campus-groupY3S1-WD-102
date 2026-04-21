-- V9__fix_notification_type_constraint.sql
-- Step 1: Drop old constraint (IF EXISTS handles case where it was never there)
ALTER TABLE notifications
    DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Step 2: Migrate existing seed data to match new enum values BEFORE adding constraint
UPDATE notifications SET type = 'TICKET_STATUS_CHANGED' WHERE type = 'TICKET_UPDATE';
UPDATE notifications SET type = 'NEW_COMMENT'           WHERE type = 'COMMENT';
UPDATE notifications SET type = 'BOOKING_APPROVED'      WHERE type = 'BOOKING_UPDATE';

-- Step 3: NOW add the constraint after data is clean
ALTER TABLE notifications
    ADD CONSTRAINT notifications_type_check
    CHECK (type IN (
        'BOOKING_APPROVED',
        'BOOKING_REJECTED',
        'BOOKING_CANCELLED',
        'TICKET_STATUS_CHANGED',
        'NEW_COMMENT',
        'SYSTEM_ALERT'
    ));