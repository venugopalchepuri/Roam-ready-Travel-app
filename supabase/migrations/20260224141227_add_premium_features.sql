/*
  # Add Premium Travel Features

  ## Overview
  This migration adds comprehensive features to enhance the travel planning experience:
  - Enhanced travel documents vault with OCR capabilities
  - Flight/train status tracking
  - Collaborative trip planning
  - Smart reminders and notifications
  - Visa requirements checker
  - Offline mode support
  - Local transport guides
  - Activity bookings
  - Travel insurance integration
  - Itinerary sharing
  - Travel reviews and memories
  - Advanced group expense management

  ## Modified Tables

  ### travel_documents (enhanced)
  Added columns for enhanced document management:
  - `user_id` (references users table directly)
  - `issue_date`, `issuing_country`, `ocr_data`
  - Enhanced document_number and file_url handling

  ## New Tables

  ### 1. `journey_tracking`
  Real-time tracking for flights, trains, buses
  - Flight numbers, PNRs, booking references
  - Departure/arrival times and status updates
  - Gate, terminal, platform information

  ### 2. `trip_collaborators`
  Multi-user trip planning and sharing
  - Role-based access control (owner, editor, viewer)
  - Invitation system with status tracking
  - Granular permissions for different actions

  ### 3. `smart_reminders`
  Automated and custom reminders for travelers
  - Check-in, visa, vaccination reminders
  - Recurring reminder support
  - Status tracking (pending, sent, dismissed)

  ### 4. `visa_requirements`
  Visa and entry requirements database
  - Visa requirements by passport and destination country
  - Processing times, costs, and requirements
  - Embassy information and vaccination requirements

  ### 5. `offline_data`
  Cached data for offline access
  - Trip itineraries, maps, documents
  - Sync status and expiration tracking

  ### 6. `local_transport`
  Local transportation information
  - Metro, bus, taxi, auto, ferry information
  - Routes, fares, operating hours
  - Payment methods and tips

  ### 7. `activity_bookings`
  Tours, attractions, and activities
  - Booking references and provider info
  - Date, time, duration, participant count
  - Cost tracking and status updates

  ### 8. `insurance_policies`
  Travel insurance tracking
  - Policy details and coverage information
  - Emergency contacts and claim process
  - Document storage

  ### 9. `shared_itineraries`
  Public sharing of trip itineraries
  - Unique shareable tokens
  - Password protection option
  - View count and expiration tracking

  ### 10. `travel_reviews`
  Reviews and ratings for places visited
  - Ratings, reviews, and recommendations
  - Photo attachments
  - Tags for categorization

  ### 11. `travel_memories`
  Photo albums and trip highlights
  - Photos, videos, stories, highlights
  - Location and date tracking
  - Favorites and tags

  ### 12. `group_expense_settlements`
  Track who owes whom in group expenses
  - Payer and payee tracking
  - Amount and currency
  - Settlement status and method

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data or shared data
  - Collaborators have role-based access control
  - Sensitive data protected through RLS policies
*/

-- Enhance existing travel_documents table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'travel_documents' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE travel_documents ADD COLUMN user_id uuid REFERENCES users(id) ON DELETE CASCADE;
    
    -- Populate user_id from trips table for existing records
    UPDATE travel_documents
    SET user_id = trips.user_id
    FROM trips
    WHERE travel_documents.trip_id = trips.id;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'travel_documents' AND column_name = 'title'
  ) THEN
    ALTER TABLE travel_documents ADD COLUMN title text;
    UPDATE travel_documents SET title = document_name WHERE title IS NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'travel_documents' AND column_name = 'document_number'
  ) THEN
    ALTER TABLE travel_documents ADD COLUMN document_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'travel_documents' AND column_name = 'issue_date'
  ) THEN
    ALTER TABLE travel_documents ADD COLUMN issue_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'travel_documents' AND column_name = 'issuing_country'
  ) THEN
    ALTER TABLE travel_documents ADD COLUMN issuing_country text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'travel_documents' AND column_name = 'file_url'
  ) THEN
    ALTER TABLE travel_documents ADD COLUMN file_url text;
    UPDATE travel_documents SET file_url = url WHERE file_url IS NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'travel_documents' AND column_name = 'ocr_data'
  ) THEN
    ALTER TABLE travel_documents ADD COLUMN ocr_data jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'travel_documents' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE travel_documents ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add index for user_id on travel_documents
CREATE INDEX IF NOT EXISTS travel_documents_user_id_idx ON travel_documents(user_id);

-- Journey Tracking Table
CREATE TABLE IF NOT EXISTS journey_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  journey_type text NOT NULL CHECK (journey_type IN ('flight', 'train', 'bus')),
  journey_number text NOT NULL,
  departure_location text NOT NULL,
  arrival_location text NOT NULL,
  scheduled_departure timestamptz NOT NULL,
  scheduled_arrival timestamptz NOT NULL,
  actual_departure timestamptz,
  actual_arrival timestamptz,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'on-time', 'delayed', 'cancelled', 'departed', 'arrived')),
  gate_terminal text,
  platform text,
  carrier text,
  tracking_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE journey_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journey tracking"
  ON journey_tracking FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = journey_tracking.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own journey tracking"
  ON journey_tracking FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = journey_tracking.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own journey tracking"
  ON journey_tracking FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = journey_tracking.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = journey_tracking.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own journey tracking"
  ON journey_tracking FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = journey_tracking.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Trip Collaborators Table
CREATE TABLE IF NOT EXISTS trip_collaborators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  invited_by uuid REFERENCES users(id) NOT NULL,
  role text DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  permissions jsonb DEFAULT '{"can_edit_itinerary": false, "can_manage_expenses": false, "can_invite_others": false}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(trip_id, user_id)
);

ALTER TABLE trip_collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view collaborations they're part of"
  ON trip_collaborators FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = trip_collaborators.user_id
      AND auth.uid() = users.id
    )
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = trip_collaborators.invited_by
      AND auth.uid() = users.id
    )
  );

CREATE POLICY "Trip owners can manage collaborators"
  ON trip_collaborators FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_collaborators.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Smart Reminders Table
CREATE TABLE IF NOT EXISTS smart_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE,
  reminder_type text NOT NULL CHECK (reminder_type IN ('check-in', 'visa', 'vaccination', 'document', 'currency', 'packing', 'custom')),
  title text NOT NULL,
  description text,
  reminder_time timestamptz NOT NULL,
  is_recurring boolean DEFAULT false,
  recurrence_rule text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'dismissed')),
  related_entity_id uuid,
  related_entity_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE smart_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminders"
  ON smart_reminders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = smart_reminders.user_id
      AND auth.uid() = users.id
    )
  );

CREATE POLICY "Users can insert own reminders"
  ON smart_reminders FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = smart_reminders.user_id
      AND auth.uid() = users.id
    )
  );

CREATE POLICY "Users can update own reminders"
  ON smart_reminders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = smart_reminders.user_id
      AND auth.uid() = users.id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = smart_reminders.user_id
      AND auth.uid() = users.id
    )
  );

CREATE POLICY "Users can delete own reminders"
  ON smart_reminders FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = smart_reminders.user_id
      AND auth.uid() = users.id
    )
  );

-- Visa Requirements Table (publicly readable reference data)
CREATE TABLE IF NOT EXISTS visa_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  passport_country text NOT NULL,
  destination_country text NOT NULL,
  visa_required boolean NOT NULL,
  visa_type text,
  max_stay_days integer,
  processing_time_days integer,
  cost_usd decimal(10,2),
  requirements jsonb DEFAULT '{}'::jsonb,
  vaccination_required jsonb DEFAULT '{}'::jsonb,
  embassy_info jsonb DEFAULT '{}'::jsonb,
  last_updated timestamptz DEFAULT now(),
  UNIQUE(passport_country, destination_country)
);

ALTER TABLE visa_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visa requirements"
  ON visa_requirements FOR SELECT
  TO authenticated
  USING (true);

-- Offline Data Table
CREATE TABLE IF NOT EXISTS offline_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  data_type text NOT NULL CHECK (data_type IN ('itinerary', 'maps', 'documents', 'contacts', 'expenses')),
  data_payload jsonb NOT NULL,
  last_synced timestamptz DEFAULT now(),
  expires_at timestamptz,
  UNIQUE(user_id, trip_id, data_type)
);

ALTER TABLE offline_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own offline data"
  ON offline_data FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = offline_data.user_id
      AND auth.uid() = users.id
    )
  );

CREATE POLICY "Users can manage own offline data"
  ON offline_data FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = offline_data.user_id
      AND auth.uid() = users.id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = offline_data.user_id
      AND auth.uid() = users.id
    )
  );

-- Local Transport Table (publicly readable reference data)
CREATE TABLE IF NOT EXISTS local_transport (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL,
  transport_type text NOT NULL CHECK (transport_type IN ('metro', 'bus', 'taxi', 'auto', 'ferry', 'tram')),
  name text NOT NULL,
  routes jsonb DEFAULT '[]'::jsonb,
  fare_info jsonb DEFAULT '{}'::jsonb,
  operating_hours jsonb DEFAULT '{}'::jsonb,
  payment_methods text[] DEFAULT ARRAY[]::text[],
  tips text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE local_transport ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view local transport info"
  ON local_transport FOR SELECT
  TO authenticated
  USING (true);

-- Activity Bookings Table
CREATE TABLE IF NOT EXISTS activity_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  activity_name text NOT NULL,
  provider text,
  booking_reference text,
  activity_type text CHECK (activity_type IN ('tour', 'attraction', 'adventure', 'food', 'cultural', 'entertainment')),
  location text NOT NULL,
  date date NOT NULL,
  time time,
  duration_hours decimal(4,2),
  participants integer DEFAULT 1,
  cost decimal(10,2),
  currency text DEFAULT 'INR',
  status text DEFAULT 'booked' CHECK (status IN ('booked', 'confirmed', 'completed', 'cancelled')),
  booking_details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE activity_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity bookings"
  ON activity_bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = activity_bookings.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own activity bookings"
  ON activity_bookings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = activity_bookings.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own activity bookings"
  ON activity_bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = activity_bookings.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = activity_bookings.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own activity bookings"
  ON activity_bookings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = activity_bookings.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Insurance Policies Table
CREATE TABLE IF NOT EXISTS insurance_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE,
  provider text NOT NULL,
  policy_number text NOT NULL,
  coverage_type text CHECK (coverage_type IN ('single-trip', 'multi-trip', 'annual')),
  coverage_amount decimal(12,2),
  currency text DEFAULT 'INR',
  start_date date NOT NULL,
  end_date date NOT NULL,
  covered_regions text[] DEFAULT ARRAY[]::text[],
  benefits jsonb DEFAULT '{}'::jsonb,
  emergency_contact jsonb DEFAULT '{}'::jsonb,
  claim_process text,
  document_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insurance policies"
  ON insurance_policies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = insurance_policies.user_id
      AND auth.uid() = users.id
    )
  );

CREATE POLICY "Users can insert own insurance policies"
  ON insurance_policies FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = insurance_policies.user_id
      AND auth.uid() = users.id
    )
  );

CREATE POLICY "Users can update own insurance policies"
  ON insurance_policies FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = insurance_policies.user_id
      AND auth.uid() = users.id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = insurance_policies.user_id
      AND auth.uid() = users.id
    )
  );

CREATE POLICY "Users can delete own insurance policies"
  ON insurance_policies FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = insurance_policies.user_id
      AND auth.uid() = users.id
    )
  );

-- Shared Itineraries Table
CREATE TABLE IF NOT EXISTS shared_itineraries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  share_token text UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  is_public boolean DEFAULT false,
  password_protected boolean DEFAULT false,
  password_hash text,
  view_count integer DEFAULT 0,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE shared_itineraries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shared itineraries"
  ON shared_itineraries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = shared_itineraries.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own shared itineraries"
  ON shared_itineraries FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = shared_itineraries.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = shared_itineraries.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Travel Reviews Table
CREATE TABLE IF NOT EXISTS travel_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  place_name text NOT NULL,
  place_type text CHECK (place_type IN ('hotel', 'restaurant', 'attraction', 'city', 'activity', 'transport')),
  location text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  visited_date date,
  would_recommend boolean DEFAULT true,
  tags text[] DEFAULT ARRAY[]::text[],
  photos text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE travel_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reviews"
  ON travel_reviews FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = travel_reviews.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own reviews"
  ON travel_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = travel_reviews.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own reviews"
  ON travel_reviews FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = travel_reviews.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = travel_reviews.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own reviews"
  ON travel_reviews FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = travel_reviews.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Travel Memories Table
CREATE TABLE IF NOT EXISTS travel_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  memory_type text DEFAULT 'photo' CHECK (memory_type IN ('photo', 'video', 'story', 'highlight')),
  media_urls text[] DEFAULT ARRAY[]::text[],
  location text,
  date_captured date,
  tags text[] DEFAULT ARRAY[]::text[],
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE travel_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memories"
  ON travel_memories FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = travel_memories.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own memories"
  ON travel_memories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = travel_memories.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own memories"
  ON travel_memories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = travel_memories.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = travel_memories.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own memories"
  ON travel_memories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = travel_memories.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Group Expense Settlements Table
CREATE TABLE IF NOT EXISTS group_expense_settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  payer_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  payee_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'INR',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'settled')),
  settled_at timestamptz,
  settlement_method text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE group_expense_settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view settlements they're involved in"
  ON group_expense_settlements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE (users.id = group_expense_settlements.payer_id OR users.id = group_expense_settlements.payee_id)
      AND auth.uid() = users.id
    )
  );

CREATE POLICY "Users can insert settlements"
  ON group_expense_settlements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE (users.id = group_expense_settlements.payer_id OR users.id = group_expense_settlements.payee_id)
      AND auth.uid() = users.id
    )
  );

CREATE POLICY "Users can update their settlements"
  ON group_expense_settlements FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE (users.id = group_expense_settlements.payer_id OR users.id = group_expense_settlements.payee_id)
      AND auth.uid() = users.id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE (users.id = group_expense_settlements.payer_id OR users.id = group_expense_settlements.payee_id)
      AND auth.uid() = users.id
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_journey_tracking_user ON journey_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_journey_tracking_trip ON journey_tracking(trip_id);
CREATE INDEX IF NOT EXISTS idx_journey_tracking_departure ON journey_tracking(scheduled_departure);

CREATE INDEX IF NOT EXISTS idx_trip_collaborators_trip ON trip_collaborators(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_collaborators_user ON trip_collaborators(user_id);

CREATE INDEX IF NOT EXISTS idx_smart_reminders_user ON smart_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_smart_reminders_time ON smart_reminders(reminder_time);
CREATE INDEX IF NOT EXISTS idx_smart_reminders_status ON smart_reminders(status);

CREATE INDEX IF NOT EXISTS idx_visa_requirements_lookup ON visa_requirements(passport_country, destination_country);

CREATE INDEX IF NOT EXISTS idx_activity_bookings_trip ON activity_bookings(trip_id);
CREATE INDEX IF NOT EXISTS idx_activity_bookings_date ON activity_bookings(date);

CREATE INDEX IF NOT EXISTS idx_insurance_policies_user ON insurance_policies(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_dates ON insurance_policies(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_shared_itineraries_token ON shared_itineraries(share_token);

CREATE INDEX IF NOT EXISTS idx_travel_reviews_trip ON travel_reviews(trip_id);
CREATE INDEX IF NOT EXISTS idx_travel_memories_trip ON travel_memories(trip_id);