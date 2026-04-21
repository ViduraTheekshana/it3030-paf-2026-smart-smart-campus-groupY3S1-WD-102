-- V5__seed_resources.sql
-- 15 campus resources across different types

INSERT INTO resource (name, type, capacity, location, availability_start, availability_end, status, description, image_url)
VALUES
    ('Computer Lab A101',        'LAB',        40, 'Block A, Floor 1',   '08:00', '20:00', 'ACTIVE',         'Main undergraduate computer lab with 40 workstations running Windows 11 and Ubuntu dual boot.',          NULL),
    ('Computer Lab A102',        'LAB',        35, 'Block A, Floor 1',   '08:00', '20:00', 'ACTIVE',         'Secondary computer lab with 35 workstations, dedicated for programming courses.',                       NULL),
    ('Computer Lab B201',        'LAB',        30, 'Block B, Floor 2',   '08:00', '18:00', 'ACTIVE',         'Networking lab equipped with Cisco routers and switches for networking practical sessions.',             NULL),
    ('Lecture Hall LH-01',       'ROOM',      120, 'Block C, Floor 1',   '07:30', '21:00', 'ACTIVE',         'Large lecture hall with projector, audio system and air conditioning. Suitable for large lectures.',     NULL),
    ('Lecture Hall LH-02',       'ROOM',      100, 'Block C, Floor 1',   '07:30', '21:00', 'ACTIVE',         'Lecture hall with smart board and document camera.',                                                    NULL),
    ('Lecture Hall LH-03',       'ROOM',       80, 'Block C, Floor 2',   '07:30', '21:00', 'OUT_OF_SERVICE', 'Under renovation. Expected to reopen end of semester.',                                                 NULL),
    ('Seminar Room SR-01',       'ROOM',       30, 'Block D, Floor 1',   '08:00', '18:00', 'ACTIVE',         'Small seminar room ideal for group discussions and presentations.',                                     NULL),
    ('Seminar Room SR-02',       'ROOM',       25, 'Block D, Floor 1',   '08:00', '18:00', 'ACTIVE',         'Small seminar room with whiteboard and projector.',                                                    NULL),
    ('Seminar Room SR-03',       'ROOM',       20, 'Block D, Floor 2',   '08:00', '17:00', 'ACTIVE',         'Compact seminar room for tutorials and small group sessions.',                                         NULL),
    ('Conference Room CR-01',    'ROOM',       15, 'Admin Block, F2',    '09:00', '17:00', 'ACTIVE',         'Executive conference room with video conferencing facilities.',                                         NULL),
    ('Research Lab RL-01',       'LAB',        20, 'Block E, Floor 1',   '08:00', '22:00', 'ACTIVE',         'Research lab for postgraduate students. Equipped with high-performance workstations.',                  NULL),
    ('Electronics Lab EL-01',    'LAB',        24, 'Block B, Floor 1',   '08:00', '17:00', 'ACTIVE',         'Electronics and embedded systems lab with oscilloscopes, function generators and soldering stations.',  NULL),
    ('Projector Unit PJ-01',     'EQUIPMENT',   1, 'Equipment Store',    '08:00', '18:00', 'ACTIVE',         'Portable Epson HD projector. Borrow for events and presentations.',                                    NULL),
    ('Portable PA System PA-01', 'EQUIPMENT',   1, 'Equipment Store',    '08:00', '18:00', 'ACTIVE',         'Portable PA system with two wireless microphones. For events and outdoor use.',                        NULL),
    ('Video Camera VC-01',       'EQUIPMENT',   1, 'Equipment Store',    '08:00', '18:00', 'OUT_OF_SERVICE', 'Sony 4K video camera. Currently out for repair.',                                                      NULL);
