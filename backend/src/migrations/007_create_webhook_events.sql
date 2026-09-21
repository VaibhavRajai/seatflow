CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    provider VARCHAR(50) NOT NULL,

    event_id VARCHAR(255) NOT NULL,

    event_type VARCHAR(100) NOT NULL,

    processed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_webhook_event
        UNIQUE (provider, event_id)
);

CREATE INDEX idx_webhook_events_event_type
    ON webhook_events(event_type);