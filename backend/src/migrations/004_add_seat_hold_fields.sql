ALTER TABLE event_seats
ADD COLUMN held_by UUID,
ADD COLUMN held_until TIMESTAMPTZ;

ALTER TABLE event_seats
ADD CONSTRAINT fk_event_seat_held_by
FOREIGN KEY (held_by)
REFERENCES users(id)
ON DELETE SET NULL;