-- V8__seed_notifications.sql
-- Notifications for all users referencing ticket and booking activity

DO $$
DECLARE
    admin_id BIGINT;
    tech_id  BIGINT;
    usr_id   BIGINT;
BEGIN
    SELECT user_id INTO admin_id FROM users WHERE role = 'ROLE_ADMIN'      LIMIT 1;
    SELECT user_id INTO tech_id  FROM users WHERE role = 'ROLE_TECHNICIAN' LIMIT 1;
    SELECT user_id INTO usr_id   FROM users WHERE role = 'ROLE_USER'       LIMIT 1;

    IF tech_id IS NULL THEN tech_id := admin_id; END IF;
    IF usr_id  IS NULL THEN usr_id  := admin_id; END IF;

    -- Notifications for USER
    INSERT INTO notifications (user_id, type, title, message, read, action_url, created_at)
    VALUES
        (usr_id, 'TICKET_UPDATE',  'Ticket status updated',           'Your ticket "Projector not working in Lab A101" has been assigned to a technician.',                         false, '/incidents', NOW() - INTERVAL '2 hours'),
        (usr_id, 'TICKET_UPDATE',  'Ticket resolved',                 'Your ticket "HDMI cable missing from Lab A101" has been resolved. Please review and close if satisfied.',    false, '/incidents', NOW() - INTERVAL '1 day'),
        (usr_id, 'COMMENT',        'New comment on your ticket',      'A technician commented on your ticket "Air conditioning leaking water in Lab B201".',                        false, '/incidents', NOW() - INTERVAL '3 hours'),
        (usr_id, 'BOOKING_UPDATE', 'Booking approved',                'Your booking for Computer Lab A101 on 22 April 2026 has been approved.',                                     false, '/bookings',  NOW() - INTERVAL '5 hours'),
        (usr_id, 'BOOKING_UPDATE', 'Booking rejected',                'Your booking for Computer Lab A101 on 20 April 2026 was rejected. Reason: Resource already booked.',         true,  '/bookings',  NOW() - INTERVAL '2 days'),
        (usr_id, 'TICKET_UPDATE',  'Ticket rejected',                 'Your ticket "Crack in lecture hall ceiling" was reviewed. See rejection reason for details.',                 true,  '/incidents', NOW() - INTERVAL '3 days'),
        (usr_id, 'COMMENT',        'New comment on your ticket',      'Admin commented on your ticket "Crack in lecture hall ceiling".',                                             true,  '/incidents', NOW() - INTERVAL '3 days'),
        (usr_id, 'BOOKING_UPDATE', 'Booking pending review',          'Your booking for Mobile Application Development lab on 30 April 2026 is pending admin approval.',            false, '/bookings',  NOW() - INTERVAL '30 minutes'),
        (usr_id, 'TICKET_UPDATE',  'Ticket closed',                   'Your ticket "Slow internet in Library reading area" has been closed. Thank you for reporting.',              true,  '/incidents', NOW() - INTERVAL '5 days'),
        (usr_id, 'BOOKING_UPDATE', 'Upcoming booking reminder',       'Reminder: Your booking for Operating Systems lab session is tomorrow at 13:00.',                             false, '/bookings',  NOW() - INTERVAL '1 hour');

    -- Notifications for TECHNICIAN
    INSERT INTO notifications (user_id, type, title, message, read, action_url, created_at)
    VALUES
        (tech_id, 'TICKET_UPDATE', 'New ticket assigned to you',      'You have been assigned to ticket "Door access card reader not working". Priority: CRITICAL.',                false, '/incidents', NOW() - INTERVAL '1 hour'),
        (tech_id, 'TICKET_UPDATE', 'New ticket assigned to you',      'You have been assigned to ticket "Server room temperature alarm triggered". Priority: CRITICAL.',             false, '/incidents', NOW() - INTERVAL '2 hours'),
        (tech_id, 'COMMENT',       'New comment on assigned ticket',  'Admin commented on ticket "Air conditioning leaking water": "Thanks for the update."',                       false, '/incidents', NOW() - INTERVAL '4 hours'),
        (tech_id, 'TICKET_UPDATE', 'New ticket assigned to you',      'You have been assigned to ticket "Fire exit door stuck". Priority: CRITICAL. Please attend immediately.',    false, '/incidents', NOW() - INTERVAL '45 minutes'),
        (tech_id, 'COMMENT',       'New comment on assigned ticket',  'Admin replied on ticket "Emergency lighting not working": "Prioritise this — safety compliance issue."',    true,  '/incidents', NOW() - INTERVAL '2 days'),
        (tech_id, 'BOOKING_UPDATE','Your booking approved',           'Your booking for Python workshop on 28 April 2026 has been approved.',                                        true,  '/bookings',  NOW() - INTERVAL '1 day'),
        (tech_id, 'TICKET_UPDATE', 'Ticket resolved — awaiting closure', 'Ticket "WiFi signal dead zone on Floor 4" marked RESOLVED. Awaiting user confirmation.',                true,  '/incidents', NOW() - INTERVAL '3 days');

    -- Notifications for ADMIN
    INSERT INTO notifications (user_id, type, title, message, read, action_url, created_at)
    VALUES
        (admin_id, 'TICKET_UPDATE',  'Critical ticket opened',        'New CRITICAL priority ticket submitted: "Elevator out of service" — Admin Block.',                           false, '/incidents', NOW() - INTERVAL '20 minutes'),
        (admin_id, 'BOOKING_UPDATE', 'Booking awaiting approval',     'New booking request for Computer Lab A101 on 30 April. Requires your approval.',                            false, '/bookings',  NOW() - INTERVAL '30 minutes'),
        (admin_id, 'BOOKING_UPDATE', 'Bookings awaiting approval',    '5 new booking requests are pending your approval.',                                                          false, '/bookings',  NOW() - INTERVAL '1 hour'),
        (admin_id, 'TICKET_UPDATE',  'Critical ticket opened',        'New CRITICAL ticket: "Fire exit door stuck — cannot open from inside" — Block A, Floor 3.',                 false, '/incidents', NOW() - INTERVAL '45 minutes'),
        (admin_id, 'COMMENT',        'New comment on ticket',         'Technician updated ticket "Network switch down — entire Block C offline" with resolution details.',          true,  '/incidents', NOW() - INTERVAL '7 days'),
        (admin_id, 'TICKET_UPDATE',  'Ticket resolved',               'Ticket "UPS unit beeping in server room" has been resolved by technician. Please review.',                   true,  '/incidents', NOW() - INTERVAL '4 days'),
        (admin_id, 'BOOKING_UPDATE', 'Booking cancellation',          'A user has cancelled their booking for Lecture Hall LH-01 on 15 April 2026.',                               true,  '/bookings',  NOW() - INTERVAL '6 days'),
        (admin_id, 'TICKET_UPDATE',  'Multiple open critical tickets','3 CRITICAL priority tickets are currently open and unassigned. Please review and assign.',                   false, '/incidents', NOW() - INTERVAL '10 minutes');

    RAISE NOTICE 'Notification seed complete.';
END $$;
