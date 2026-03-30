import { supabase } from './supabase';

export interface TripNote {
  id: string;
  trip_id: string;
  day: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export const tripNotesService = {
  async getTripNotes(tripId: string): Promise<TripNote[]> {
    const { data, error } = await supabase
      .from('trip_notes')
      .select('*')
      .eq('trip_id', tripId)
      .order('day', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createNote(note: Omit<TripNote, 'id' | 'created_at' | 'updated_at'>): Promise<TripNote> {
    const { data, error } = await supabase
      .from('trip_notes')
      .insert(note)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateNote(id: string, content: string): Promise<TripNote> {
    const { data, error } = await supabase
      .from('trip_notes')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteNote(id: string): Promise<void> {
    const { error } = await supabase
      .from('trip_notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
