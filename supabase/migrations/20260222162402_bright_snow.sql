/*
  # RoamReady Database Schema

  1. New Tables
    - `users` - Extended user profiles
    - `trips` - Trip information
    - `itineraries` - Daily trip plans
    - `checklists` - Packing and preparation items
    - `budgets` - Budget planning
    - `preparedness_score` - Trip preparedness tracking
    - `emergency_contacts` - Emergency contact information
    - `recommendation_rules` - Travel recommendation logic

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Enable RLS for all tables


-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trips table
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  source text NOT NULL,
  destination text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text DEFAULT 'planning' CHECK (status IN ('planning', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Itineraries table
CREATE TABLE IF NOT EXISTS itineraries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips ON DELETE CASCADE NOT NULL,
  day integer NOT NULL,
  activities jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(trip_id, day)
);

-- Checklists table
CREATE TABLE IF NOT EXISTS checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips ON DELETE CASCADE NOT NULL,
  item text NOT NULL,
  completed boolean DEFAULT false,
  category text NOT NULL DEFAULT 'general',
  essential boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Budget table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  amount decimal(10,2) NOT NULL DEFAULT 0,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Preparedness score table
CREATE TABLE IF NOT EXISTS preparedness_score (
  trip_id uuid PRIMARY KEY REFERENCES trips ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  breakdown jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

-- Emergency contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  relationship text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Recommendation rules table
CREATE TABLE IF NOT EXISTS recommendation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  min_distance integer NOT NULL,
  max_distance integer NOT NULL,
  priority_type text NOT NULL CHECK (priority_type IN ('time', 'cost', 'comfort')),
  recommended_mode text NOT NULL CHECK (recommended_mode IN ('bus', 'train', 'flight', 'car')),
  recommended_platform text NOT NULL,
  base_cost_per_km decimal(5,2) NOT NULL,
  estimated_time_per_km decimal(5,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS trips_user_id_idx ON trips(user_id);
CREATE INDEX IF NOT EXISTS trips_start_date_idx ON trips(start_date);
CREATE INDEX IF NOT EXISTS itineraries_trip_id_idx ON itineraries(trip_id);
CREATE INDEX IF NOT EXISTS checklists_trip_id_idx ON checklists(trip_id);
CREATE INDEX IF NOT EXISTS budgets_trip_id_idx ON budgets(trip_id);
CREATE INDEX IF NOT EXISTS emergency_contacts_trip_id_idx ON emergency_contacts(trip_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE preparedness_score ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles policies
-- CREATE POLICY "Users can view own profile"
--   ON profiles FOR SELECT
--   TO authenticated
--   USING (auth.uid() = id);

-- CREATE POLICY "Users can update own profile"
--   ON profiles FOR UPDATE
--   TO authenticated
--   USING (auth.uid() = id);

-- CREATE POLICY "Users can insert own profile"
--   ON profiles FOR INSERT
--   TO authenticated
--   WITH CHECK (auth.uid() = id);

-- -- Trips policies
-- CREATE POLICY "Users can view own trips"
--   ON trips FOR SELECT
--   TO authenticated
--   USING (auth.uid() = user_id);

-- CREATE POLICY "Users can insert own trips"
--   ON trips FOR INSERT
--   TO authenticated
--   WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can update own trips"
--   ON trips FOR UPDATE
--   TO authenticated
--   USING (auth.uid() = user_id);

-- CREATE POLICY "Users can delete own trips"
--   ON trips FOR DELETE
--   TO authenticated
--   USING (auth.uid() = user_id);

-- -- Itineraries policies
-- CREATE POLICY "Users can access itineraries for own trips"
--   ON itineraries FOR ALL
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM trips 
--       WHERE trips.id = itineraries.trip_id 
--       AND trips.user_id = auth.uid()
--     )
--   );

-- -- Checklists policies
-- CREATE POLICY "Users can access checklists for own trips"
--   ON checklists FOR ALL
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM trips 
--       WHERE trips.id = checklists.trip_id 
--       AND trips.user_id = auth.uid()
--     )
--   );

-- -- Budget policies
-- CREATE POLICY "Users can access budgets for own trips"
--   ON budgets FOR ALL
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM trips 
--       WHERE trips.id = budgets.trip_id 
--       AND trips.user_id = auth.uid()
--     )
--   );

-- -- Preparedness score policies
-- CREATE POLICY "Users can access preparedness scores for own trips"
--   ON preparedness_score FOR ALL
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM trips 
--       WHERE trips.id = preparedness_score.trip_id 
--       AND trips.user_id = auth.uid()
--     )
--   );

-- -- Emergency contacts policies
-- CREATE POLICY "Users can access emergency contacts for own trips"
--   ON emergency_contacts FOR ALL
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM trips 
--       WHERE trips.id = emergency_contacts.trip_id 
--       AND trips.user_id = auth.uid()
--     )
--   );

-- -- Recommendation rules policies (read-only for all authenticated users)
-- CREATE POLICY "Authenticated users can read recommendation rules"
--   ON recommendation_rules FOR SELECT
--   TO authenticated
--   USING (true);

-- Insert default recommendation rules
INSERT INTO recommendation_rules (min_distance, max_distance, priority_type, recommended_mode, recommended_platform, base_cost_per_km, estimated_time_per_km) VALUES
(0, 300, 'time', 'car', 'Self Drive', 8.00, 1.50),
(0, 300, 'cost', 'bus', 'RedBus', 1.50, 2.00),
(0, 300, 'comfort', 'car', 'Ola/Uber', 12.00, 1.20),
(300, 800, 'time', 'flight', 'MakeMyTrip', 8.00, 0.20),
(300, 800, 'cost', 'train', 'IRCTC', 2.00, 1.00),
(300, 800, 'comfort', 'train', 'IRCTC', 4.00, 1.00),
(800, 5000, 'time', 'flight', 'MakeMyTrip', 6.00, 0.15),
(800, 5000, 'cost', 'train', 'IRCTC', 1.80, 0.80),
(800, 5000, 'comfort', 'flight', 'IndiGo/Vistara', 10.00, 0.15);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_itineraries_updated_at BEFORE UPDATE ON itineraries FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_checklists_updated_at BEFORE UPDATE ON checklists FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_preparedness_score_updated_at BEFORE UPDATE ON preparedness_score FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON emergency_contacts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();