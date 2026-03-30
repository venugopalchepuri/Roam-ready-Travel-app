import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone_number: string;
  date_of_birth: string | null;
  nationality: string;
  passport_number: string;
  address: string;
  city: string;
  country: string;
  bio: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export interface UserEmergencyContact {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  phone_number: string;
  email: string;
  address: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

class ProfileService {
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createUserProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([
        {
          user_id: userId,
          ...profile,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getOrCreateUserProfile(userId: string): Promise<UserProfile> {
    let profile = await this.getUserProfile(userId);

    if (!profile) {
      profile = await this.createUserProfile(userId, {
        full_name: '',
        phone_number: '',
        nationality: '',
        passport_number: '',
        address: '',
        city: '',
        country: '',
        bio: '',
        avatar_url: '',
      });
    }

    return profile;
  }

  async getEmergencyContacts(userId: string): Promise<UserEmergencyContact[]> {
    const { data, error } = await supabase
      .from('user_emergency_contacts')
      .select('*')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createEmergencyContact(userId: string, contact: Omit<UserEmergencyContact, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<UserEmergencyContact> {
    const { data, error } = await supabase
      .from('user_emergency_contacts')
      .insert([
        {
          user_id: userId,
          ...contact,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateEmergencyContact(contactId: string, updates: Partial<UserEmergencyContact>): Promise<UserEmergencyContact> {
    const { data, error } = await supabase
      .from('user_emergency_contacts')
      .update(updates)
      .eq('id', contactId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteEmergencyContact(contactId: string): Promise<void> {
    const { error } = await supabase
      .from('user_emergency_contacts')
      .delete()
      .eq('id', contactId);

    if (error) throw error;
  }

  async setPrimaryEmergencyContact(userId: string, contactId: string): Promise<void> {
    await supabase
      .from('user_emergency_contacts')
      .update({ is_primary: false })
      .eq('user_id', userId);

    const { error } = await supabase
      .from('user_emergency_contacts')
      .update({ is_primary: true })
      .eq('id', contactId);

    if (error) throw error;
  }
}

export const profileService = new ProfileService();
