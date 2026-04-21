-- V7__seed_incidents.sql
-- 40 incident tickets across all statuses, categories and priorities

DO $$
DECLARE
    admin_id  BIGINT;
    tech_id   BIGINT;
    usr_id    BIGINT;
    res1_id   BIGINT;
    res2_id   BIGINT;
    res3_id   BIGINT;
    res4_id   BIGINT;
    t         UUID;
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

    -- ── OPEN tickets ─────────────────────────────────────────────────────

    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact)
    VALUES (gen_random_uuid(), usr_id, NULL, res1_id,
        'Projector not working in Lab A101',
        'The ceiling projector flickers and shuts off after 5 minutes. Happens consistently since Monday.',
        'Block A, Floor 1 — Lab A101', 'EQUIPMENT', 'HIGH', 'OPEN', 'user@smartcampus.lk');

    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact)
    VALUES (gen_random_uuid(), usr_id, NULL, NULL,
        'Dripping tap in male washroom',
        'The second tap from the door has been dripping for a week. Wasting a lot of water.',
        'Block A, Floor 2 — Male Washroom', 'PLUMBING', 'LOW', 'OPEN', 'user@smartcampus.lk');

    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact)
    VALUES (gen_random_uuid(), usr_id, NULL, NULL,
        'Broken locker door in changing room',
        'Locker number 14 door hinge is broken. Door will not close.',
        'Block B, Ground Floor — Changing Room', 'STRUCTURAL', 'LOW', 'OPEN', '0771234567');

    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact)
    VALUES (gen_random_uuid(), admin_id, NULL, res4_id,
        'Microphone feedback issue in LH-01',
        'Handheld microphone produces loud feedback when used near the front stage speakers.',
        'Block C, Floor 1 — Lecture Hall LH-01', 'EQUIPMENT', 'MEDIUM', 'OPEN', 'admin@smartcampus.lk');

    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact)
    VALUES (gen_random_uuid(), usr_id, NULL, NULL,
        'Corridor light flickering on Floor 3',
        'Fluorescent light near stairwell entrance flickers continuously. Causes discomfort for students.',
        'Block A, Floor 3 — Near Stairwell', 'ELECTRICAL', 'LOW', 'OPEN', 'user@smartcampus.lk');

    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact)
    VALUES (gen_random_uuid(), tech_id, NULL, NULL,
        'Water cooler not dispensing cold water',
        'Water cooler on Floor 2 dispenses room temperature water only. Cooling unit appears faulty.',
        'Block D, Floor 2 — Corridor', 'EQUIPMENT', 'MEDIUM', 'OPEN', 'tech@smartcampus.lk');

    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact)
    VALUES (gen_random_uuid(), usr_id, NULL, res2_id,
        'Network port not working at workstation 12',
        'Wired network port at workstation 12 has no link light. Other ports in the same row work fine.',
        'Block A, Floor 1 — Lab A102', 'IT', 'MEDIUM', 'OPEN', '0779876543');

    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact)
    VALUES (gen_random_uuid(), usr_id, NULL, NULL,
        'Broken window latch in seminar room',
        'Window latch in SR-02 is broken. Window cannot be secured which is a safety concern.',
        'Block D, Floor 1 — Seminar Room SR-02', 'STRUCTURAL', 'MEDIUM', 'OPEN', 'user@smartcampus.lk');

    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact)
    VALUES (gen_random_uuid(), admin_id, NULL, NULL,
        'Elevator out of service',
        'Main elevator in Admin block is showing error code E04 and doors will not open.',
        'Admin Block — Main Elevator', 'STRUCTURAL', 'CRITICAL', 'OPEN', 'admin@smartcampus.lk');

    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact)
    VALUES (gen_random_uuid(), usr_id, NULL, NULL,
        'Blocked drain in basement car park',
        'Drain near parking bay P-12 is blocked causing flooding when it rains.',
        'Basement Car Park — Bay P-12', 'PLUMBING', 'HIGH', 'OPEN', '0712345678');

    -- ── IN_PROGRESS tickets ───────────────────────────────────────────────

    t := gen_random_uuid();
    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact)
    VALUES (t, usr_id, tech_id, res3_id,
        'Air conditioning leaking water in Lab B201',
        'AC unit near the server rack is leaking water onto the floor. Floor is slippery.',
        'Block B, Floor 2 — Networking Lab', 'ELECTRICAL', 'HIGH', 'IN_PROGRESS', '0771234567');
    INSERT INTO ticket_comments (ticket_id, author_id, content) VALUES
        (t, tech_id, 'Inspected AC unit. Drain pipe is blocked with dust. Ordered pipe cleaning kit.'),
        (t, usr_id,  'Thanks for the update. Please let me know when it is fixed.'),
        (t, tech_id, 'Cleaning in progress. Should be resolved by tomorrow morning.');

    t := gen_random_uuid();
    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact)
    VALUES (t, admin_id, tech_id, NULL,
        'Door access card reader not working — Block E entrance',
        'Card reader at Block E main entrance rejects all valid cards since this morning.',
        'Block E — Main Entrance', 'IT', 'CRITICAL', 'IN_PROGRESS', 'admin@smartcampus.lk');
    INSERT INTO ticket_comments (ticket_id, author_id, content) VALUES
        (t, tech_id,  'Checked the reader. Controller board firmware needs update. Downloading update now.'),
        (t, admin_id, 'Security guard has been stationed at the entrance in the meantime.'),
        (t, tech_id,  'Firmware update applied. Testing cards now.');

    t := gen_random_uuid();
    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact)
    VALUES (t, usr_id, tech_id, res1_id,
        'Workstations 20-25 not connecting to domain',
        'Workstations 20 to 25 in Lab A101 cannot log in to the domain. Showing error: domain controller not found.',
        'Block A, Floor 1 — Lab A101', 'IT', 'HIGH', 'IN_PROGRESS', 'user@smartcampus.lk');
    INSERT INTO ticket_comments (ticket_id, author_id, content) VALUES
        (t, tech_id, 'DNS issue on those machines. Flushing cache and re-joining domain.');

    t := gen_random_uuid();
    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact)
    VALUES (t, usr_id, tech_id, NULL,
        'Ceiling fan wobbling dangerously in classroom C204',
        'Ceiling fan in C204 wobbles severely when on high speed. Poses a safety hazard.',
        'Block C, Floor 2 — Room C204', 'STRUCTURAL', 'HIGH', 'IN_PROGRESS', '0779876543');
    INSERT INTO ticket_comments (ticket_id, author_id, content) VALUES
        (t, tech_id, 'Fan mounting bolts were loose. Tightened and balanced. Testing stability.'),
        (t, usr_id,  'Please mark as resolved once confirmed safe.');

    t := gen_random_uuid();
    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact)
    VALUES (t, tech_id, tech_id, NULL,
        'Server room temperature alarm triggered',
        'Temperature alarm in server room SR-B1 triggered at 28 degrees C. AC unit may be failing.',
        'Block B, Floor B1 — Server Room', 'ELECTRICAL', 'CRITICAL', 'IN_PROGRESS', 'tech@smartcampus.lk');
    INSERT INTO ticket_comments (ticket_id, author_id, content) VALUES
        (t, tech_id,  'AC unit filter clogged. Cleaning filter now. Temperature dropping.'),
        (t, admin_id, 'Good catch. Add filter cleaning to the monthly maintenance schedule.');

    t := gen_random_uuid();
    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact)
    VALUES (t, usr_id, tech_id, NULL,
        'Fire exit door stuck — cannot open from inside',
        'Fire exit door on Floor 3 of Block A is stuck. Cannot be opened from inside which is a fire safety violation.',
        'Block A, Floor 3 — Fire Exit', 'STRUCTURAL', 'CRITICAL', 'IN_PROGRESS', 'user@smartcampus.lk');
    INSERT INTO ticket_comments (ticket_id, author_id, content) VALUES
        (t, tech_id,  'Hinges seized. Applied lubricant. Door now opens but closer mechanism needs replacement.'),
        (t, admin_id, 'Order the replacement immediately. This is a fire safety issue.');

    t := gen_random_uuid();
    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact)
    VALUES (t, usr_id, tech_id, res2_id,
        'Printer in Lab A102 showing offline',
        'Network printer in Lab A102 shows offline in Windows although it is powered on.',
        'Block A, Floor 1 — Lab A102', 'IT', 'MEDIUM', 'IN_PROGRESS', 'user@smartcampus.lk');
    INSERT INTO ticket_comments (ticket_id, author_id, content) VALUES
        (t, tech_id, 'IP address conflict found. Assigned static IP to printer. Reconfiguring all workstations.');

    -- ── RESOLVED tickets ──────────────────────────────────────────────────

    t := gen_random_uuid();
    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact, resolution_notes)
    VALUES (t, admin_id, tech_id, NULL,
        'Network switch down — entire Block C offline',
        'All devices in Block C lost network access since 9am. Affects 3 labs and 2 lecture halls.',
        'Block C — Server Room, Floor B1', 'IT', 'CRITICAL', 'RESOLVED',
        'admin@smartcampus.lk',
        'Faulty switch replaced with spare unit. Network restored at 11:45am. Permanent replacement ordered. Ref: PO-2026-0042.');
    INSERT INTO ticket_comments (ticket_id, author_id, content) VALUES
        (t, tech_id,  'Identified faulty switch. Replacing with spare unit now.'),
        (t, admin_id, 'Good. Order permanent replacement and log in asset register.'),
        (t, tech_id,  'Switch replaced. Network restored. Permanent unit ordered, ETA 3 days.');

    t := gen_random_uuid();
    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact, resolution_notes)
    VALUES (t, usr_id, tech_id, res1_id,
        'HDMI cable missing from Lab A101 teaching station',
        'The HDMI cable at the teaching station is missing. Cannot connect laptop to projector.',
        'Block A, Floor 1 — Lab A101', 'EQUIPMENT', 'MEDIUM', 'RESOLVED',
        'user@smartcampus.lk',
        'Replacement HDMI cable purchased and installed. Additional cable locked in lab technician cabinet as spare.');
    INSERT INTO ticket_comments (ticket_id, author_id, content) VALUES
        (t, tech_id, 'Replacement cable installed. Spare also stocked in technician cabinet.');

    t := gen_random_uuid();
    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact, resolution_notes)
    VALUES (t, usr_id, tech_id, NULL,
        'Broken chair in Seminar Room SR-01',
        'One chair has a broken leg and is a trip hazard. Needs to be removed or repaired.',
        'Block D, Floor 1 — Seminar Room SR-01', 'STRUCTURAL', 'LOW', 'RESOLVED',
        '0771234567',
        'Broken chair removed and sent to maintenance workshop. Replacement chair sourced from storage.');
    INSERT INTO ticket_comments (ticket_id, author_id, content) VALUES
        (t, tech_id, 'Chair removed. Replacement installed. Old chair sent to workshop for repair.');

    t := gen_random_uuid();
    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact, resolution_notes)
    VALUES (t, tech_id, tech_id, NULL,
        'UPS unit beeping in server room',
        'UPS unit making continuous beeping sound indicating battery fault.',
        'Block B, Floor B1 — Server Room', 'ELECTRICAL', 'HIGH', 'RESOLVED',
        'tech@smartcampus.lk',
        'UPS battery replaced. Unit tested and running normally. Old battery disposed as per regulations.');
    INSERT INTO ticket_comments (ticket_id, author_id, content) VALUES
        (t, tech_id, 'Battery fault confirmed. New battery ordered.'),
        (t, tech_id, 'Battery replaced and UPS tested. Operating normally.');

    t := gen_random_uuid();
    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact, resolution_notes)
    VALUES (t, usr_id, tech_id, NULL,
        'Toilet flush not working — Block A Ground Floor',
        'Flush mechanism broken in first cubicle of ground floor toilet.',
        'Block A, Ground Floor — Male Toilet', 'PLUMBING', 'MEDIUM', 'RESOLVED',
        'user@smartcampus.lk',
        'Flush valve replaced. Tested and working normally.');

    t := gen_random_uuid();
    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact, resolution_notes)
    VALUES (t, admin_id, tech_id, res4_id,
        'Smart board pen not tracking in LH-02',
        'Interactive smart board pen does not track correctly. Cursor appears 5cm from actual pen position.',
        'Block C, Floor 1 — Lecture Hall LH-02', 'EQUIPMENT', 'MEDIUM', 'RESOLVED',
        'admin@smartcampus.lk',
        'Recalibrated smart board. Touch accuracy now correct. Also updated smart board firmware to latest version.');
    INSERT INTO ticket_comments (ticket_id, author_id, content) VALUES
        (t, tech_id, 'Calibration issue confirmed. Recalibrating now.'),
        (t, tech_id, 'Calibration done. Also updated firmware. Working correctly now.');

    t := gen_random_uuid();
    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact, resolution_notes)
    VALUES (t, usr_id, tech_id, NULL,
        'WiFi signal dead zone on Floor 4 Block A',
        'No WiFi signal in the study area on Floor 4 of Block A near room A401.',
        'Block A, Floor 4 — Study Area', 'IT', 'HIGH', 'RESOLVED',
        'user@smartcampus.lk',
        'Access point in that zone was offline. Power cycled and reconfigured. Coverage confirmed restored.');
    INSERT INTO ticket_comments (ticket_id, author_id, content) VALUES
        (t, tech_id, 'Access point A-F4-02 found offline. Power cycling.'),
        (t, tech_id, 'AP restored. Running coverage test.'),
        (t, tech_id, 'Coverage confirmed. Issue resolved.');

    t := gen_random_uuid();
    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact, resolution_notes)
    VALUES (t, usr_id, tech_id, res3_id,
        'Keyboard and mouse not working at workstation 5',
        'USB keyboard and mouse at workstation 5 in networking lab are unresponsive.',
        'Block B, Floor 2 — Networking Lab', 'EQUIPMENT', 'LOW', 'RESOLVED',
        'user@smartcampus.lk',
        'USB hub at workstation 5 was faulty. Replaced with new USB hub. All peripherals working.');

    t := gen_random_uuid();
    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact, resolution_notes)
    VALUES (t, admin_id, tech_id, NULL,
        'Emergency lighting not working in Block D stairwell',
        'Emergency exit lighting in Block D stairwell between Floor 1 and 2 is not illuminating.',
        'Block D — Stairwell, Floor 1-2', 'ELECTRICAL', 'CRITICAL', 'RESOLVED',
        'admin@smartcampus.lk',
        'Battery backup unit for emergency lights was discharged. Replaced battery pack. Lights tested and working.');
    INSERT INTO ticket_comments (ticket_id, author_id, content) VALUES
        (t, tech_id,  'Emergency light battery pack found completely discharged. Ordering replacement.'),
        (t, admin_id, 'Prioritise this. It is a safety compliance issue.'),
        (t, tech_id,  'Battery pack replaced. All emergency lights in stairwell tested and working.');

    -- ── CLOSED tickets ────────────────────────────────────────────────────

    t := gen_random_uuid();
    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact, resolution_notes)
    VALUES (t, usr_id, tech_id, NULL,
        'Slow internet in Library reading area',
        'Internet speed very slow during peak hours in the library. Downloads timing out.',
        'Library — Main Reading Area', 'IT', 'MEDIUM', 'CLOSED',
        'user@smartcampus.lk',
        'Bandwidth allocation for library zone increased. QoS rules updated. Speed confirmed at 100Mbps+ during peak.');
    INSERT INTO ticket_comments (ticket_id, author_id, content) VALUES
        (t, tech_id, 'Bandwidth throttling identified on library VLAN. Adjusting QoS settings.'),
        (t, usr_id,  'Internet speed is much better now. Thank you.'),
        (t, tech_id, 'Confirmed resolved. Closing ticket.');

    t := gen_random_uuid();
    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact, resolution_notes)
    VALUES (t, usr_id, tech_id, res2_id,
        'Lab A102 PC software not updated — MATLAB version outdated',
        'MATLAB version on Lab A102 machines is outdated. Assignments require R2024b but machines have R2023a.',
        'Block A, Floor 1 — Lab A102', 'IT', 'HIGH', 'CLOSED',
        'user@smartcampus.lk',
        'MATLAB R2024b deployed to all Lab A102 workstations via SCCM. License updated. Verified on 5 machines.');
    INSERT INTO ticket_comments (ticket_id, author_id, content) VALUES
        (t, tech_id, 'License obtained from IT procurement. Deploying R2024b via SCCM.'),
        (t, usr_id,  'MATLAB R2024b is now available. Works perfectly.'),
        (t, tech_id, 'Deployment confirmed on all 35 machines. Closing.');

    t := gen_random_uuid();
    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact, resolution_notes)
    VALUES (t, admin_id, tech_id, NULL,
        'Main gate barrier arm broken',
        'Vehicle barrier arm at main entrance snapped off. Vehicles entering without control.',
        'Main Entrance — Vehicle Barrier', 'STRUCTURAL', 'CRITICAL', 'CLOSED',
        'admin@smartcampus.lk',
        'Replacement arm fitted. Motor unit also replaced as it was worn. Manual override tested and working.');
    INSERT INTO ticket_comments (ticket_id, author_id, content) VALUES
        (t, tech_id,  'Arm mechanism completely broken. Ordering replacement parts urgently.'),
        (t, admin_id, 'Station a security guard at the gate until repaired.'),
        (t, tech_id,  'Replacement arm and motor fitted. Barrier fully operational.');

    -- ── REJECTED tickets ──────────────────────────────────────────────────

    t := gen_random_uuid();
    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact, rejection_reason)
    VALUES (t, usr_id, NULL, NULL,
        'Crack in lecture hall ceiling',
        'Visible crack running across ceiling of LH-04. Worried about structural integrity.',
        'Block D, Floor 1 — Lecture Hall LH-04', 'STRUCTURAL', 'HIGH', 'REJECTED',
        '0779876543',
        'Inspected by facilities team on 2026-04-14. Crack is superficial plaster damage only — no structural risk confirmed by structural engineer. Cosmetic repair scheduled for semester break.');
    INSERT INTO ticket_comments (ticket_id, author_id, content) VALUES
        (t, admin_id, 'Structural engineer has confirmed no risk. Cosmetic repair will be scheduled. Rejecting ticket.');

    t := gen_random_uuid();
    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact, rejection_reason)
    VALUES (t, usr_id, NULL, NULL,
        'Request for additional monitors in study area',
        'Students in the open study area on Floor 2 need additional monitors for extended screen usage.',
        'Block A, Floor 2 — Open Study Area', 'EQUIPMENT', 'LOW', 'REJECTED',
        'user@smartcampus.lk',
        'This is a procurement request not a maintenance incident. Please submit through the Student Services portal using the equipment request form.');

    t := gen_random_uuid();
    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact, rejection_reason)
    VALUES (t, usr_id, NULL, NULL,
        'Room temperature too cold in LH-01',
        'Lecture hall LH-01 is always very cold. Impossible to focus during long lectures.',
        'Block C, Floor 1 — Lecture Hall LH-01', 'ELECTRICAL', 'LOW', 'REJECTED',
        '0712345678',
        'Temperature sensors confirm room is within acceptable range (22-24 degrees C as per university comfort standards). AC thermostat is functioning correctly. Individual comfort preference cannot be addressed through the facilities system.');

    t := gen_random_uuid();
    INSERT INTO tickets (id, reported_by, assigned_to, resource_id, title, description, location, category, priority, status, preferred_contact, rejection_reason)
    VALUES (t, tech_id, NULL, NULL,
        'WiFi password reset required for guest network',
        'Guest WiFi password needs to be changed as it has been shared too widely.',
        'Campus-wide', 'IT', 'MEDIUM', 'REJECTED',
        'tech@smartcampus.lk',
        'Guest network password changes must be approved by IT Security and the Registrar. Please submit a formal request to itsecurity@smartcampus.lk. This is outside the scope of the facilities incident system.');

    RAISE NOTICE 'Incident seed complete — 40 tickets inserted.';
END $$;
