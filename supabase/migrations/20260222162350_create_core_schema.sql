/*
  # Create Roam Ready Core Schema

  ## Overview
  Sets up the complete database schema for the Roam Ready travel preparedness platform.
  
  ## New Tables
  
  ### 1. users
  - `id` (uuid, primary key) - User identifier from auth.users
  - `email` (text, unique) - User email address
  - `full_name` (text) - User's full name
  - `created_at` (timestamptz) - Account creation timestamp
  
  ### 2. trips
  - `id` (uuid, primary key) - Unique trip identifier
  - `user_id` (uuid, foreign key) - References users table
  - `source` (text) - Starting location
  - `destination` (text) - Destination location
  - `start_date` (date) - Trip start date
  - `end_date` (date) - Trip end date
  - `distance_km` (numeric) - Distance in kilometers
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 3. itineraries
  - `id` (uuid, primary key) - Unique itinerary entry identifier
  - `trip_id` (uuid, foreign key) - References trips table
  - `day` (integer) - Day number of trip
  - `activities` (jsonb) - Array of activities for the day
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### 4. checklists
  - `id` (uuid, primary key) - Unique checklist item identifier
  - `trip_id` (uuid, foreign key) - References trips table
  - `item` (text) - Checklist item description
  - `category` (text) - Category (e.g., documents, clothing, essentials)
  - `completed` (boolean) - Completion status
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### 5. budgets
  - `id` (uuid, primary key) - Unique budget entry identifier
  - `trip_id` (uuid, foreign key) - References trips table
  - `category` (text) - Budget category (e.g., transport, accommodation, food)
  - `amount` (numeric) - Budgeted amount
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### 6. preparedness_scores
  - `trip_id` (uuid, primary key, foreign key) - References trips table
  - `score` (numeric) - Overall preparedness score (0-100)
  - `checklist_completion` (numeric) - Checklist completion percentage
  - `itinerary_completion` (numeric) - Itinerary completion percentage
  - `emergency_info_complete` (boolean) - Emergency info status
  - `budget_added` (boolean) - Budget entry status
  - `updated_at` (timestamptz) - Last calculation timestamp
  
  ### 7. emergency_contacts
  - `id` (uuid, primary key) - Unique contact identifier
  - `trip_id` (uuid, foreign key) - References trips table
  - `name` (text) - Contact name
  - `phone` (text) - Contact phone number
  - `relationship` (text) - Relationship to traveler
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### 8. recommendation_rules
  - `id` (uuid, primary key) - Unique rule identifier
  - `min_distance` (numeric) - Minimum distance in km
  - `max_distance` (numeric) - Maximum distance in km
  - `priority_type` (text) - Priority type (cost, time, comfort)
  - `recommended_mode` (text) - Recommended transport mode
  - `recommended_platform` (text) - Recommended booking platform
  - `base_cost_per_km` (numeric) - Base cost per kilometer
  - `estimated_time_per_km` (numeric) - Estimated time per kilometer in hours
  
  ### 9. chatbot_data
  - `id` (uuid, primary key) - Unique chatbot entry identifier
  - `intent` (text) - Intent category
  - `keywords` (text[]) - Array of keywords for matching
  - `response` (text) - Response template
  - `created_at` (timestamptz) - Record creation timestamp
  
  ## Security
  - Row Level Security (RLS) enabled on all user-facing tables
  - Users can only access their own trips and related data
  - Public read access for recommendation_rules and chatbot_data
  - Indexes added for performance on foreign keys and commonly queried fields
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text DEFAULT '',
  created_at timestamptz DEFAULT now()
);



CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  source text NOT NULL,
  destination text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  distance_km numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS trips_user_id_idx ON trips(user_id);
CREATE INDEX IF NOT EXISTS trips_start_date_idx ON trips(start_date);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trips"
  ON trips FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trips"
  ON trips FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips"
  ON trips FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips"
  ON trips FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create itineraries table
CREATE TABLE IF NOT EXISTS itineraries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  day integer NOT NULL,
  activities jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS itineraries_trip_id_idx ON itineraries(trip_id);

ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own itineraries"
  ON itineraries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = itineraries.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own itineraries"
  ON itineraries FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = itineraries.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own itineraries"
  ON itineraries FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = itineraries.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = itineraries.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own itineraries"
  ON itineraries FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = itineraries.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Create checklists table
CREATE TABLE IF NOT EXISTS checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  item text NOT NULL,
  category text DEFAULT 'general',
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS checklists_trip_id_idx ON checklists(trip_id);

ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checklists"
  ON checklists FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = checklists.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own checklists"
  ON checklists FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = checklists.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own checklists"
  ON checklists FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = checklists.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = checklists.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own checklists"
  ON checklists FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = checklists.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS budgets_trip_id_idx ON budgets(trip_id);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own budgets"
  ON budgets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = budgets.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own budgets"
  ON budgets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = budgets.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own budgets"
  ON budgets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = budgets.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = budgets.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own budgets"
  ON budgets FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = budgets.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Create preparedness_scores table
CREATE TABLE IF NOT EXISTS preparedness_scores (
  trip_id uuid PRIMARY KEY REFERENCES trips(id) ON DELETE CASCADE,
  score numeric DEFAULT 0,
  checklist_completion numeric DEFAULT 0,
  itinerary_completion numeric DEFAULT 0,
  emergency_info_complete boolean DEFAULT false,
  budget_added boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE preparedness_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preparedness scores"
  ON preparedness_scores FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = preparedness_scores.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own preparedness scores"
  ON preparedness_scores FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = preparedness_scores.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own preparedness scores"
  ON preparedness_scores FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = preparedness_scores.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = preparedness_scores.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Create emergency_contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  relationship text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS emergency_contacts_trip_id_idx ON emergency_contacts(trip_id);

ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own emergency contacts"
  ON emergency_contacts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = emergency_contacts.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own emergency contacts"
  ON emergency_contacts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = emergency_contacts.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own emergency contacts"
  ON emergency_contacts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = emergency_contacts.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = emergency_contacts.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own emergency contacts"
  ON emergency_contacts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = emergency_contacts.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Create recommendation_rules table (public read)
CREATE TABLE IF NOT EXISTS recommendation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  min_distance numeric NOT NULL,
  max_distance numeric NOT NULL,
  priority_type text NOT NULL,
  recommended_mode text NOT NULL,
  recommended_platform text NOT NULL,
  base_cost_per_km numeric NOT NULL,
  estimated_time_per_km numeric NOT NULL
);

ALTER TABLE recommendation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view recommendation rules"
  ON recommendation_rules FOR SELECT
  TO authenticated
  USING (true);

-- Create chatbot_data table (public read)
CREATE TABLE IF NOT EXISTS chatbot_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intent text NOT NULL,
  keywords text[] NOT NULL,
  response text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chatbot_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view chatbot data"
  ON chatbot_data FOR SELECT
  TO authenticated
  USING (true);

-- Insert default recommendation rules
INSERT INTO recommendation_rules (min_distance, max_distance, priority_type, recommended_mode, recommended_platform, base_cost_per_km, estimated_time_per_km)
VALUES
  -- Short distance (0-300 km)
  (0, 300, 'cost', 'Bus', 'RedBus', 0.8, 0.025),
  (0, 300, 'time', 'Car/Taxi', 'Ola/Uber', 6.0, 0.015),
  (0, 300, 'comfort', 'Car/Taxi', 'Ola/Uber', 6.0, 0.015),
  
  -- Medium distance (300-800 km)
  (300, 800, 'cost', 'Train (Sleeper)', 'IRCTC', 0.5, 0.020),
  (300, 800, 'time', 'Train (AC)', 'IRCTC', 1.2, 0.018),
  (300, 800, 'comfort', 'Train (AC)', 'IRCTC', 1.2, 0.018),
  
  -- Long distance (800+ km)
  (800, 99999, 'cost', 'Train (Sleeper)', 'IRCTC', 0.5, 0.020),
  (800, 99999, 'time', 'Flight', 'MakeMyTrip', 4.0, 0.001),
  (800, 99999, 'comfort', 'Flight', 'MakeMyTrip', 4.0, 0.001)
ON CONFLICT DO NOTHING;

-- Insert default chatbot responses
INSERT INTO chatbot_data (intent, keywords, response)
VALUES
  ('greeting', ARRAY['hello', 'hi', 'hey', 'namaste'], 'Hello! Welcome to Roam Ready. How can I help you plan your trip today?'),
  ('packing_help', ARRAY['pack', 'packing', 'checklist', 'what to bring'], 'I can help you with packing! Visit the Checklist page to create a customized packing list based on your destination and trip duration.'),
  ('destination_info', ARRAY['destination', 'place', 'visit', 'where'], 'Explore our Destinations page to discover amazing places in India with detailed information about weather, best time to visit, and attractions.'),
  ('budget_help', ARRAY['budget', 'cost', 'money', 'expense'], 'I can help you plan your budget! Use the Budget Tracker to categorize your expenses: transport, accommodation, food, activities, and more.'),
  ('transport', ARRAY['travel', 'transport', 'flight', 'train', 'bus'], 'Get smart transport recommendations based on your route, budget, and priorities. I can suggest the best mode of transport and booking platforms.'),
  ('emergency', ARRAY['emergency', 'help', 'panic', 'urgent'], 'Don''t worry! Access Panic Mode for essential checklists, emergency contacts, and important documents. Stay calm and prepared.'),
  ('weather', ARRAY['weather', 'climate', 'temperature', 'rain'], 'Check the weather widget on your dashboard or destination pages for real-time weather information to help you pack appropriately.')
ON CONFLICT DO NOTHING;