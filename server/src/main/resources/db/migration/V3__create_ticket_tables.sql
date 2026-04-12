CREATE TABLE tickets
(
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id      UUID REFERENCES resources (id) ON DELETE SET NULL,
    reported_by      UUID         NOT NULL REFERENCES users (id),
    assigned_to      UUID REFERENCES users (id) ON DELETE SET NULL,
    title            VARCHAR(200) NOT NULL,
    description      TEXT         NOT NULL,
    location         VARCHAR(200),
    category         VARCHAR(50)  NOT NULL,
    priority         VARCHAR(50)  NOT NULL,
    status           VARCHAR(50)  NOT NULL DEFAULT 'OPEN',
    preferred_contact VARCHAR(200),
    resolution_notes TEXT,
    rejection_reason TEXT,
    created_at       TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP        DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ticket_attachments
(
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id  UUID         NOT NULL REFERENCES tickets (id) ON DELETE CASCADE,
    file_path  TEXT         NOT NULL,
    file_name  VARCHAR(255) NOT NULL,
    mime_type  VARCHAR(100) NOT NULL,
    created_at TIMESTAMP        DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ticket_comments
(
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id  UUID NOT NULL REFERENCES tickets (id) ON DELETE CASCADE,
    author_id  UUID NOT NULL REFERENCES users (id),
    content    TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common query patterns
CREATE INDEX idx_tickets_reported_by ON tickets (reported_by);
CREATE INDEX idx_tickets_status ON tickets (status);
CREATE INDEX idx_tickets_category ON tickets (category);
CREATE INDEX idx_tickets_priority ON tickets (priority);
CREATE INDEX idx_ticket_attachments_ticket_id ON ticket_attachments (ticket_id);
CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments (ticket_id);
