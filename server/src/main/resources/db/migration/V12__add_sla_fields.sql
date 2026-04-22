ALTER TABLE tickets
    ADD COLUMN first_response_at TIMESTAMP,
    ADD COLUMN resolved_at       TIMESTAMP;
