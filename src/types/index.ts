export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  source: string;
  destination: string;
  start_date: string;
  end_date: string;
  distance_km: number;
  created_at: string;
  updated_at: string;
}

export interface Itinerary {
  id: string;
  trip_id: string;
  day: number;
  activities: Activity[];
  created_at: string;
}

export interface Activity {
  time: string;
  title: string;
  description: string;
}

export interface ChecklistItem {
  item_text: string;
  is_packed: boolean;
  id: string;
  trip_id: string;
  item: string;
  category: string;
  completed: boolean;
  created_at: string;
}

export interface Budget {
  id: string;
  trip_id: string;
  category: string;
  amount: number;
  created_at: string;
}

export interface PreparednessScore {
  trip_id: string;
  score: number;
  checklist_completion: number;
  itinerary_completion: number;
  emergency_info_complete: boolean;
  budget_added: boolean;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  trip_id: string;
  name: string;
  phone: string;
  relationship: string;
  created_at: string;
}

export interface RecommendationRule {
  id: string;
  min_distance: number;
  max_distance: number;
  priority_type: 'cost' | 'time' | 'comfort';
  recommended_mode: string;
  recommended_platform: string;
  base_cost_per_km: number;
  estimated_time_per_km: number;
}

export interface ChatbotData {
  id: string;
  intent: string;
  keywords: string[];
  response: string;
  created_at: string;
}

export interface Recommendation {
  mode: string;
  platform: string;
  estimatedCost: {
    low: number;
    average: number;
    high: number;
  };
  estimatedTime: number;
  reason: string;
  isRecommended: boolean;
}

export interface TripWithScore extends Trip {
  preparedness_score?: PreparednessScore;
}

export type Priority = 'cost' | 'time' | 'comfort';

export interface TravelDocument {
  id: string;
  user_id: string;
  trip_id?: string;
  document_type: 'passport' | 'visa' | 'ticket' | 'insurance' | 'vaccination' | 'other';
  title: string;
  document_number?: string;
  issue_date?: string;
  expiry_date?: string;
  issuing_country?: string;
  file_url?: string;
  ocr_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface JourneyTracking {
  id: string;
  trip_id: string;
  user_id: string;
  journey_type: 'flight' | 'train' | 'bus';
  journey_number: string;
  departure_location: string;
  arrival_location: string;
  scheduled_departure: string;
  scheduled_arrival: string;
  actual_departure?: string;
  actual_arrival?: string;
  status: 'scheduled' | 'on-time' | 'delayed' | 'cancelled' | 'departed' | 'arrived';
  gate_terminal?: string;
  platform?: string;
  carrier?: string;
  tracking_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TripCollaborator {
  id: string;
  trip_id: string;
  user_id: string;
  invited_by: string;
  role: 'owner' | 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'declined';
  permissions: {
    can_edit_itinerary: boolean;
    can_manage_expenses: boolean;
    can_invite_others: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface SmartReminder {
  id: string;
  user_id: string;
  trip_id?: string;
  reminder_type: 'check-in' | 'visa' | 'vaccination' | 'document' | 'currency' | 'packing' | 'custom';
  title: string;
  description?: string;
  reminder_time: string;
  is_recurring: boolean;
  recurrence_rule?: string;
  status: 'pending' | 'sent' | 'dismissed';
  related_entity_id?: string;
  related_entity_type?: string;
  created_at: string;
  updated_at: string;
}

export interface VisaRequirement {
  id: string;
  passport_country: string;
  destination_country: string;
  visa_required: boolean;
  visa_type?: string;
  max_stay_days?: number;
  processing_time_days?: number;
  cost_usd?: number;
  requirements?: Record<string, any>;
  vaccination_required?: Record<string, any>;
  embassy_info?: Record<string, any>;
  last_updated: string;
}

export interface LocalTransport {
  id: string;
  city: string;
  country: string;
  transport_type: 'metro' | 'bus' | 'taxi' | 'auto' | 'ferry' | 'tram';
  name: string;
  routes?: Record<string, any>[];
  fare_info?: Record<string, any>;
  operating_hours?: Record<string, any>;
  payment_methods?: string[];
  tips?: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityBooking {
  id: string;
  trip_id: string;
  user_id: string;
  activity_name: string;
  provider?: string;
  booking_reference?: string;
  activity_type?: 'tour' | 'attraction' | 'adventure' | 'food' | 'cultural' | 'entertainment';
  location: string;
  date: string;
  time?: string;
  duration_hours?: number;
  participants: number;
  cost?: number;
  currency: string;
  status: 'booked' | 'confirmed' | 'completed' | 'cancelled';
  booking_details?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface InsurancePolicy {
  id: string;
  user_id: string;
  trip_id?: string;
  provider: string;
  policy_number: string;
  coverage_type?: 'single-trip' | 'multi-trip' | 'annual';
  coverage_amount?: number;
  currency: string;
  start_date: string;
  end_date: string;
  covered_regions?: string[];
  benefits?: Record<string, any>;
  emergency_contact?: Record<string, any>;
  claim_process?: string;
  document_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SharedItinerary {
  id: string;
  trip_id: string;
  user_id: string;
  share_token: string;
  is_public: boolean;
  password_protected: boolean;
  password_hash?: string;
  view_count: number;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TravelReview {
  id: string;
  user_id: string;
  trip_id: string;
  place_name: string;
  place_type?: 'hotel' | 'restaurant' | 'attraction' | 'city' | 'activity' | 'transport';
  location: string;
  rating?: number;
  review_text?: string;
  visited_date?: string;
  would_recommend: boolean;
  tags?: string[];
  photos?: string[];
  created_at: string;
  updated_at: string;
}

export interface TravelMemory {
  id: string;
  user_id: string;
  trip_id: string;
  title: string;
  description?: string;
  memory_type: 'photo' | 'video' | 'story' | 'highlight';
  media_urls?: string[];
  location?: string;
  date_captured?: string;
  tags?: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface GroupExpenseSettlement {
  id: string;
  trip_id: string;
  payer_id: string;
  payee_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'settled';
  settled_at?: string;
  settlement_method?: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  trip_id: string;
  user_id?: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  created_at: string;
}
