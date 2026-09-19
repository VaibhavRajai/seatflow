CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,
    event_id UUID NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    total_amount NUMERIC(10,2) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_booking_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_booking_event
        FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE RESTRICT,

    CONSTRAINT valid_booking_status
        CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED')),

    CONSTRAINT valid_booking_amount
        CHECK (total_amount >= 0)
);


CREATE TABLE booking_seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    booking_id UUID NOT NULL,
    event_seat_id UUID NOT NULL,

    price NUMERIC(10,2) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_booking_seat_booking
        FOREIGN KEY (booking_id)
        REFERENCES bookings(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_booking_seat_event_seat
        FOREIGN KEY (event_seat_id)
        REFERENCES event_seats(id)
        ON DELETE RESTRICT,

    CONSTRAINT unique_booking_event_seat
        UNIQUE (event_seat_id),

    CONSTRAINT valid_booking_seat_price
        CHECK (price >= 0)
);


CREATE INDEX idx_bookings_user_id
    ON bookings(user_id);

CREATE INDEX idx_bookings_event_id
    ON bookings(event_id);

CREATE INDEX idx_booking_seats_booking_id
    ON booking_seats(booking_id);