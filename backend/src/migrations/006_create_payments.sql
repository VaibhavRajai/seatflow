CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    booking_id UUID NOT NULL,

    provider VARCHAR(50) NOT NULL DEFAULT 'RAZORPAY',

    provider_order_id VARCHAR(255),

    provider_payment_id VARCHAR(255),

    amount NUMERIC(10,2) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'CREATED',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_payment_booking
        FOREIGN KEY (booking_id)
        REFERENCES bookings(id)
        ON DELETE RESTRICT,

    CONSTRAINT valid_payment_amount
        CHECK (amount >= 0),

    CONSTRAINT valid_payment_status
        CHECK (status IN ('CREATED', 'SUCCESS', 'FAILED')),

    CONSTRAINT unique_provider_order
        UNIQUE (provider_order_id),

    CONSTRAINT unique_provider_payment
        UNIQUE (provider_payment_id)
);

CREATE INDEX idx_payments_booking_id
    ON payments(booking_id);

CREATE INDEX idx_payments_status
    ON payments(status);