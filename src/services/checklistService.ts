import { supabase } from './supabase';
import { ChecklistItem } from '../types';

export const checklistService = {
  async getChecklistItems(tripId: string): Promise<ChecklistItem[]> {
    const { data, error } = await supabase
      .from('checklists')
      .select('*')
      .eq('trip_id', tripId)
      .order('category', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createChecklistItem(item: Omit<ChecklistItem, 'id' | 'created_at'>): Promise<ChecklistItem> {
    const { data, error } = await supabase
      .from('checklists')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateChecklistItem(itemId: string, updates: Partial<ChecklistItem>): Promise<ChecklistItem> {
    const { data, error } = await supabase
      .from('checklists')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleChecklistItem(itemId: string, completed: boolean): Promise<ChecklistItem> {
    const { data, error } = await supabase
      .from('checklists')
      .update({ completed })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteChecklistItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('checklists')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  },
};
