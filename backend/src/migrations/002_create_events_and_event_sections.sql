-- 002_create_events_and_event_sections.sql

-- 1. Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_area_id UUID NOT NULL REFERENCES venue_areas(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_event_time CHECK (end_time > start_time)
);

-- 2. Create event_sections table
CREATE TABLE IF NOT EXISTS event_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  venue_section_id UUID NOT NULL REFERENCES venue_sections(id) ON DELETE CASCADE,
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_price_positive CHECK (price >= 0),
  CONSTRAINT unique_event_venue_section UNIQUE (event_id, venue_section_id)
);

-- 3. Create indexes for foreign keys to optimize query performance
CREATE INDEX IF NOT EXISTS idx_events_venue_area_id ON events(venue_area_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_event_sections_event_id ON event_sections(event_id);
CREATE INDEX IF NOT EXISTS idx_event_sections_venue_section_id ON event_sections(venue_section_id);
