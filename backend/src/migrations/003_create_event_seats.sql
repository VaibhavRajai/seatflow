CREATE TABLE event_seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    event_id UUID NOT NULL,
    seat_id UUID NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_event_seat_event
        FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_event_seat_seat
        FOREIGN KEY (seat_id)
        REFERENCES seats(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_event_seat
        UNIQUE (event_id, seat_id),

    CONSTRAINT valid_event_seat_status
        CHECK (status IN ('AVAILABLE', 'HELD', 'BOOKED'))
);

CREATE INDEX idx_event_seats_event_id
    ON event_seats(event_id);

CREATE INDEX idx_event_seats_seat_id
    ON event_seats(seat_id);

CREATE INDEX idx_event_seats_event_status
    ON event_seats(event_id, status);