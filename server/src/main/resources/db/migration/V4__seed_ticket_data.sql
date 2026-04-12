-- seed data for local development and testing
-- Assumes V1 (users) and V2 (resources) seeds have already run
-- Uses the fixed UUIDs from those seed files

INSERT INTO tickets (id, reported_by, resource_id, title, description, location,
                     category, priority, status, preferred_contact)
VALUES ('aaaaaaaa-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0000-000000000010',
        'Projector not working in Lab A101',
        'The ceiling projector flickers and shuts off after 5 minutes of use.',
        'Block A, Floor 1 - Lab A101',
        'EQUIPMENT', 'HIGH', 'OPEN',
        'user@smartcampus.com'),

       ('aaaaaaaa-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000003',
        NULL,
        'Broken AC in hallway',
        'Air conditioning unit near stairwell B2 is leaking water onto the floor.',
        'Block B, Floor 2, near stairwell',
        'ELECTRICAL', 'MEDIUM', 'IN_PROGRESS',
        '0771234567');

-- Assign the second ticket to the technician
UPDATE tickets
SET assigned_to = '00000000-0000-0000-0000-000000000002'
WHERE id = 'aaaaaaaa-0000-0000-0000-000000000002';

-- Add a comment to the second ticket
INSERT INTO ticket_comments (ticket_id, author_id, content)
VALUES ('aaaaaaaa-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000002',
        'Checked the unit. Drain pipe is blocked. Will fix by EOD.');
