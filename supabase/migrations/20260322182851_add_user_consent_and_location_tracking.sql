/*
  # Add User Consent and Enhanced Location Tracking

  ## Overview
  This migration adds user consent management and enhances the trips table with coordinate tracking
  for automatic distance calculation using external APIs.

  ## New Tables

  ### 1. user_consents
  Tracks user acceptance of terms and conditions during signup
  - `id` (uuid, primary key) - Unique consent record identifier
  - `user_id` (uuid, foreign key) - References users table
  - `accepted_terms` (boolean) - Whether user accepted T&C
  - `accepted_at` (timestamptz) - When terms were accepted

  ### 2. journey_tracker
  Real-time journey progress tracking for active trips
  - `id` (uuid, primary key) - Unique tracker identifier
  - `trip_id` (uuid, foreign key) - References trips table
  - `total_distance` (numeric) - Total trip distance in km
  - `covered_distance` (numeric) - Distance covered so far in km
  - `last_updated` (timestamptz) - Last update timestamp

  ## Modified Tables

  ### trips (enhanced)
  Added columns for coordinate-based distance calculation:
  - `source_lat` (numeric) - Source latitude
  - `source_lon` (numeric) - Source longitude
  - `dest_lat` (numeric) - Destination latitude
  - `dest_lon` (numeric) - Destination longitude
  - `status` (text) - Trip status (planning, active, completed)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own consent records
  - Users can only track their own trips
*/

-- Create user_consents table
CREATE TABLE IF NOT EXISTS user_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  accepted_terms boolean DEFAULT true NOT NULL,
  accepted_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_consents_user_id_idx ON user_consents(user_id);

ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consent"
  ON user_consents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consent"
  ON user_consents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create journey_tracker table
CREATE TABLE IF NOT EXISTS journey_tracker (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_distance numeric DEFAULT 0 NOT NULL,
  covered_distance numeric DEFAULT 0 NOT NULL,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS journey_tracker_trip_id_idx ON journey_tracker(trip_id);

ALTER TABLE journey_tracker ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journey tracker"
  ON journey_tracker FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = journey_tracker.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own journey tracker"
  ON journey_tracker FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = journey_tracker.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own journey tracker"
  ON journey_tracker FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = journey_tracker.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = journey_tracker.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own journey tracker"
  ON journey_tracker FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = journey_tracker.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Enhance trips table with coordinate fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trips' AND column_name = 'source_lat'
  ) THEN
    ALTER TABLE trips ADD COLUMN source_lat numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trips' AND column_name = 'source_lon'
  ) THEN
    ALTER TABLE trips ADD COLUMN source_lon numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trips' AND column_name = 'dest_lat'
  ) THEN
    ALTER TABLE trips ADD COLUMN dest_lat numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trips' AND column_name = 'dest_lon'
  ) THEN
    ALTER TABLE trips ADD COLUMN dest_lon numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trips' AND column_name = 'status'
  ) THEN
    ALTER TABLE trips ADD COLUMN status text DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed'));
  END IF;
END $$;