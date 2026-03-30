/*
  # User Profiles and Personal Emergency Contacts Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users, unique)
      - `full_name` (text)
      - `phone_number` (text)
      - `date_of_birth` (date)
      - `nationality` (text)
      - `passport_number` (text)
      - `address` (text)
      - `city` (text)
      - `country` (text)
      - `bio` (text)
      - `avatar_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `user_emergency_contacts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `name` (text, required)
      - `relationship` (text, required)
      - `phone_number` (text, required)
      - `email` (text)
      - `address` (text)
      - `is_primary` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Users can only view and edit their own profile
    - Users can only view and manage their own emergency contacts
    - Policies ensure complete data isolation between users

  3. Important Notes
    - User profiles store personal information separate from auth data
    - Personal emergency contacts are user-level, not trip-specific
    - Primary emergency contact is marked with is_primary flag
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name text DEFAULT '',
  phone_number text DEFAULT '',
  date_of_birth date,
  nationality text DEFAULT '',
  passport_number text DEFAULT '',
  address text DEFAULT '',
  city text DEFAULT '',
  country text DEFAULT '',
  bio text DEFAULT '',
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_emergency_contacts table (user-level, not trip-specific)
CREATE TABLE IF NOT EXISTS user_emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  relationship text NOT NULL,
  phone_number text NOT NULL,
  email text DEFAULT '',
  address text DEFAULT '',
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_emergency_contacts ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE id = auth.uid()))
  WITH CHECK (user_id = (SELECT id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete own profile"
  ON user_profiles FOR DELETE
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE id = auth.uid()));

-- User Emergency Contacts Policies
CREATE POLICY "Users can view own emergency contacts"
  ON user_emergency_contacts FOR SELECT
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert own emergency contacts"
  ON user_emergency_contacts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update own emergency contacts"
  ON user_emergency_contacts FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE id = auth.uid()))
  WITH CHECK (user_id = (SELECT id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete own emergency contacts"
  ON user_emergency_contacts FOR DELETE
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE id = auth.uid()));

-- Create function to handle updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_emergency_contacts_updated_at ON user_emergency_contacts;
CREATE TRIGGER update_user_emergency_contacts_updated_at
  BEFORE UPDATE ON user_emergency_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_emergency_contacts_user_id ON user_emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_emergency_contacts_is_primary ON user_emergency_contacts(user_id, is_primary) WHERE is_primary = true;