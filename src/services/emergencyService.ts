import { supabase } from './supabase';
import { EmergencyContact } from '../types';

export const emergencyService = {
  async getEmergencyContacts(tripId: string): Promise<EmergencyContact[]> {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createEmergencyContact(contact: Omit<EmergencyContact, 'id' | 'created_at'>): Promise<EmergencyContact> {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .insert(contact)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateEmergencyContact(contactId: string, updates: Partial<EmergencyContact>): Promise<EmergencyContact> {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .update(updates)
      .eq('id', contactId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteEmergencyContact(contactId: string): Promise<void> {
    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('id', contactId);

    if (error) throw error;
  },
};
