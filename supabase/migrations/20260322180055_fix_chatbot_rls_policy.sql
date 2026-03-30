/*
  # Fix Chatbot Data RLS Policy

  1. Changes
    - Drop the existing restrictive policy
    - Add new policy allowing anyone (authenticated or anonymous) to read chatbot responses
    - Chatbot data is general knowledge and should be publicly accessible

  2. Security
    - Read-only access for everyone
    - No insert/update/delete permissions for public users
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Anyone can view chatbot data" ON chatbot_data;
DROP POLICY IF EXISTS "Anyone can read chatbot responses" ON chatbot_data;

-- Create new public read policy
CREATE POLICY "Public can read chatbot responses"
  ON chatbot_data
  FOR SELECT
  USING (true);
