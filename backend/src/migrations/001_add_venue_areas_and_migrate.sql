-- 001_add_venue_areas_and_migrate.sql

-- 1. Create venue_areas table
CREATE TABLE IF NOT EXISTS venue_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Add venue_area_id column to venue_sections (initially nullable for data migration)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'venue_sections' AND column_name = 'venue_area_id'
  ) THEN
    ALTER TABLE venue_sections ADD COLUMN venue_area_id UUID;
  END IF;
END $$;

-- 3. For any existing venue_sections that have venue_id, create a default area for that venue and link it
DO $$
DECLARE
  v_rec RECORD;
  new_area_id UUID;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'venue_sections' AND column_name = 'venue_id'
  ) THEN
    FOR v_rec IN 
      SELECT DISTINCT venue_id FROM venue_sections WHERE venue_id IS NOT NULL AND venue_area_id IS NULL
    LOOP
      INSERT INTO venue_areas (venue_id, name, description)
      VALUES (v_rec.venue_id, 'Main Area', 'Default area created during migration')
      RETURNING id INTO new_area_id;

      UPDATE venue_sections 
      SET venue_area_id = new_area_id 
      WHERE venue_id = v_rec.venue_id AND venue_area_id IS NULL;
    END LOOP;
  END IF;
END $$;

-- 4. Apply NOT NULL and Foreign Key constraints to venue_sections(venue_area_id)
DO $$
BEGIN
  ALTER TABLE venue_sections ALTER COLUMN venue_area_id SET NOT NULL;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_section_venue_area' AND table_name = 'venue_sections'
  ) THEN
    ALTER TABLE venue_sections 
    ADD CONSTRAINT fk_section_venue_area 
    FOREIGN KEY (venue_area_id) REFERENCES venue_areas(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 5. Drop old foreign key constraint and venue_id column from venue_sections if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_section_venue' AND table_name = 'venue_sections'
  ) THEN
    ALTER TABLE venue_sections DROP CONSTRAINT fk_section_venue;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'venue_sections' AND column_name = 'venue_id'
  ) THEN
    ALTER TABLE venue_sections DROP COLUMN venue_id;
  END IF;
END $$;
