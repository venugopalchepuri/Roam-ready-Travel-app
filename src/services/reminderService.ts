import { supabase } from './supabase';

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

export async function getReminders(tripId?: string): Promise<SmartReminder[]> {
  let query = supabase
    .from('smart_reminders')
    .select('*')
    .order('reminder_time', { ascending: true });

  if (tripId) {
    query = query.eq('trip_id', tripId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function getPendingReminders(): Promise<SmartReminder[]> {
  const { data, error } = await supabase
    .from('smart_reminders')
    .select('*')
    .eq('status', 'pending')
    .gte('reminder_time', new Date().toISOString())
    .order('reminder_time', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function addReminder(reminder: Partial<SmartReminder>): Promise<SmartReminder> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('smart_reminders')
    .insert([{ ...reminder, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateReminder(id: string, updates: Partial<SmartReminder>): Promise<SmartReminder> {
  const { data, error } = await supabase
    .from('smart_reminders')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function dismissReminder(id: string): Promise<void> {
  await updateReminder(id, { status: 'dismissed' });
}

export async function deleteReminder(id: string): Promise<void> {
  const { error } = await supabase
    .from('smart_reminders')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function createCheckInReminder(journeyId: string, tripId: string, departureTime: string): Promise<SmartReminder> {
  const reminderTime = new Date(departureTime);
  reminderTime.setHours(reminderTime.getHours() - 24);

  return addReminder({
    trip_id: tripId,
    reminder_type: 'check-in',
    title: 'Web Check-in Reminder',
    description: 'Time to check-in for your journey!',
    reminder_time: reminderTime.toISOString(),
    is_recurring: false,
    status: 'pending',
    related_entity_id: journeyId,
    related_entity_type: 'journey'
  });
}
