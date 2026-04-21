-- V6__seed_bookings.sql
-- 20 bookings across different statuses, users and resources

DO $$
DECLARE
    admin_id   BIGINT;
    tech_id    BIGINT;
    usr_id     BIGINT;
    res1_id    BIGINT;
    res2_id    BIGINT;
    res3_id    BIGINT;
    res4_id    BIGINT;
    res5_id    BIGINT;
    res6_id    BIGINT;
    res7_id    BIGINT;
BEGIN
    SELECT user_id INTO admin_id FROM users WHERE role = 'ROLE_ADMIN'      LIMIT 1;
    SELECT user_id INTO tech_id  FROM users WHERE role = 'ROLE_TECHNICIAN' LIMIT 1;
    SELECT user_id INTO usr_id   FROM users WHERE role = 'ROLE_USER'       LIMIT 1;

    IF tech_id IS NULL THEN tech_id := admin_id; END IF;
    IF usr_id  IS NULL THEN usr_id  := admin_id; END IF;

    SELECT resource_id INTO res1_id FROM resource LIMIT 1 OFFSET 0;
    SELECT resource_id INTO res2_id FROM resource LIMIT 1 OFFSET 1;
    SELECT resource_id INTO res3_id FROM resource LIMIT 1 OFFSET 2;
    SELECT resource_id INTO res4_id FROM resource LIMIT 1 OFFSET 3;
    SELECT resource_id INTO res5_id FROM resource LIMIT 1 OFFSET 4;
    SELECT resource_id INTO res6_id FROM resource LIMIT 1 OFFSET 6;
    SELECT resource_id INTO res7_id FROM resource LIMIT 1 OFFSET 7;

    INSERT INTO booking (date, purpose, status, attendees, reject_reason, start_time, end_time, "userId", "resourceID")
    VALUES
        -- APPROVED
        ('2026-04-22', 'Data Structures practical session',         'APPROVED', 38, NULL, '09:00', '11:00', usr_id,   res1_id),
        ('2026-04-22', 'Operating Systems lab session',             'APPROVED', 30, NULL, '13:00', '15:00', usr_id,   res3_id),
        ('2026-04-23', 'Guest lecture — Cloud Computing',           'APPROVED', 95, NULL, '10:00', '12:00', admin_id, res4_id),
        ('2026-04-24', 'Final year project presentation',           'APPROVED', 25, NULL, '14:00', '17:00', usr_id,   res7_id),
        ('2026-04-25', 'Department seminar — AI in Education',      'APPROVED', 28, NULL, '09:00', '11:00', admin_id, res6_id),
        ('2026-04-28', 'Python workshop for first years',           'APPROVED', 35, NULL, '08:00', '12:00', tech_id,  res2_id),
        ('2026-04-29', 'Database Systems practical',                'APPROVED', 30, NULL, '13:00', '15:00', usr_id,   res3_id),

        -- PENDING
        ('2026-04-30', 'Mobile Application Development lab',        'PENDING',  32, NULL, '09:00', '11:00', usr_id,   res1_id),
        ('2026-04-30', 'Research group meeting',                    'PENDING',  12, NULL, '14:00', '16:00', tech_id,  res6_id),
        ('2026-05-01', 'Software Engineering group project review', 'PENDING',  20, NULL, '10:00', '12:00', usr_id,   res7_id),
        ('2026-05-02', 'Cybersecurity workshop',                    'PENDING',  22, NULL, '09:00', '13:00', admin_id, res3_id),
        ('2026-05-05', 'Annual tech symposium setup',               'PENDING',  80, NULL, '08:00', '18:00', admin_id, res4_id),

        -- REJECTED
        ('2026-04-20', 'Informal study group',                      'REJECTED', 15, 'Resource already booked for that slot. Please choose another time.', '18:00', '21:00', usr_id,   res1_id),
        ('2026-04-21', 'Photography club meeting',                  'REJECTED', 10, 'Requested time falls outside availability window for this resource.', '07:00', '08:00', tech_id,  res6_id),
        ('2026-04-19', 'Robotics club build session',               'REJECTED', 18, 'Resource is under maintenance on that date.',                         '10:00', '14:00', usr_id,   res3_id),

        -- CANCELLED
        ('2026-04-15', 'Lecture makeup session',                    'CANCELLED', 60, NULL, '15:00', '17:00', admin_id, res5_id),
        ('2026-04-16', 'Student presentation practice',             'CANCELLED', 20, NULL, '13:00', '15:00', usr_id,   res7_id),

        -- Upcoming PENDING
        ('2026-05-08', 'Embedded Systems lab — final practical',    'PENDING',  24, NULL, '09:00', '12:00', tech_id,  res1_id),
        ('2026-05-10', 'Computer Networks exam revision',           'PENDING',  35, NULL, '13:00', '15:00', usr_id,   res2_id),
        ('2026-05-12', 'Final year viva voce — batch 2022',        'PENDING',  15, NULL, '09:00', '17:00', admin_id, res6_id);

    RAISE NOTICE 'Booking seed complete.';
END $$;
