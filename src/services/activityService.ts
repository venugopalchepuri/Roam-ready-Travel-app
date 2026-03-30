import { supabase } from './supabase';

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

export async function getActivities(tripId: string): Promise<ActivityBooking[]> {
  const { data, error } = await supabase
    .from('activity_bookings')
    .select('*')
    .eq('trip_id', tripId)
    .order('date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getActivity(id: string): Promise<ActivityBooking | null> {
  const { data, error } = await supabase
    .from('activity_bookings')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function addActivity(activity: Partial<ActivityBooking>): Promise<ActivityBooking> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('activity_bookings')
    .insert([{ ...activity, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateActivity(id: string, updates: Partial<ActivityBooking>): Promise<ActivityBooking> {
  const { data, error } = await supabase
    .from('activity_bookings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteActivity(id: string): Promise<void> {
  const { error } = await supabase
    .from('activity_bookings')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getUpcomingActivities(daysAhead = 7): Promise<ActivityBooking[]> {
  const today = new Date().toISOString().split('T')[0];
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const { data, error } = await supabase
    .from('activity_bookings')
    .select('*')
    .gte('date', today)
    .lte('date', futureDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error) throw error;
  return data || [];
}
