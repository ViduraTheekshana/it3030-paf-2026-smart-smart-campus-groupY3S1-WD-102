-- seed data - uses subqueries to find real user IDs
-- since M4's AdminSeeder creates users with auto-generated BIGINT IDs

INSERT INTO tickets (id, reported_by, title, description, location,
                     category, priority, status, preferred_contact)
VALUES (
    'aaaaaaaa-0000-0000-0000-000000000001',
    (SELECT user_id FROM users WHERE email = 'admin@gmail.com' LIMIT 1),
    'Projector not working in Lab A101',
    'The ceiling projector flickers and shuts off after 5 minutes of use.',
    'Block A, Floor 1 - Lab A101',
    'EQUIPMENT', 'HIGH', 'OPEN',
    'admin@gmail.com'
);

INSERT INTO ticket_comments (ticket_id, author_id, content)
VALUES (
    'aaaaaaaa-0000-0000-0000-000000000001',
    (SELECT user_id FROM users WHERE email = 'admin@gmail.com' LIMIT 1),
    'Will investigate this tomorrow morning.'
);