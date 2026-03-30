/*
  # Add New Features to RoamReady

  ## Overview
  Adds comprehensive features for expense tracking, photo gallery, trip notes, and travel documents.

  ## New Tables

  ### 1. expenses
  - `id` (uuid, primary key) - Unique expense identifier
  - `trip_id` (uuid, foreign key) - References trips table
  - `category` (text) - Expense category
  - `description` (text) - Expense description
  - `amount` (numeric) - Amount in INR
  - `date` (date) - Expense date
  - `created_at` (timestamptz) - Record creation timestamp

  ### 2. trip_photos
  - `id` (uuid, primary key) - Unique photo identifier
  - `trip_id` (uuid, foreign key) - References trips table
  - `url` (text) - Photo URL
  - `caption` (text) - Photo caption
  - `day` (integer) - Day of trip
  - `created_at` (timestamptz) - Upload timestamp

  ### 3. trip_notes
  - `id` (uuid, primary key) - Unique note identifier
  - `trip_id` (uuid, foreign key) - References trips table
  - `day` (integer) - Day number
  - `content` (text) - Note content
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. travel_documents
  - `id` (uuid, primary key) - Unique document identifier
  - `trip_id` (uuid, foreign key) - References trips table
  - `document_type` (text) - Type of document
  - `document_name` (text) - Document name
  - `url` (text) - Document URL
  - `expiry_date` (date) - Document expiry date
  - `created_at` (timestamptz) - Upload timestamp

  ## Security
  - RLS enabled on all tables
  - Users can only access data for their own trips
*/

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  description text DEFAULT '',
  amount numeric NOT NULL,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS expenses_trip_id_idx ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS expenses_date_idx ON expenses(date);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = expenses.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = expenses.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = expenses.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = expenses.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = expenses.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Create trip_photos table
CREATE TABLE IF NOT EXISTS trip_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  caption text DEFAULT '',
  day integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS trip_photos_trip_id_idx ON trip_photos(trip_id);

ALTER TABLE trip_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trip photos"
  ON trip_photos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_photos.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own trip photos"
  ON trip_photos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_photos.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own trip photos"
  ON trip_photos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_photos.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_photos.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own trip photos"
  ON trip_photos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_photos.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Create trip_notes table
CREATE TABLE IF NOT EXISTS trip_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  day integer NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS trip_notes_trip_id_idx ON trip_notes(trip_id);

ALTER TABLE trip_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trip notes"
  ON trip_notes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_notes.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own trip notes"
  ON trip_notes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_notes.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own trip notes"
  ON trip_notes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_notes.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_notes.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own trip notes"
  ON trip_notes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_notes.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Create travel_documents table
CREATE TABLE IF NOT EXISTS travel_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  document_type text NOT NULL,
  document_name text NOT NULL,
  url text NOT NULL,
  expiry_date date,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS travel_documents_trip_id_idx ON travel_documents(trip_id);

ALTER TABLE travel_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own travel documents"
  ON travel_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = travel_documents.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own travel documents"
  ON travel_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = travel_documents.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own travel documents"
  ON travel_documents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = travel_documents.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = travel_documents.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own travel documents"
  ON travel_documents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = travel_documents.trip_id
      AND trips.user_id = auth.uid()
    )
  );