import { supabase } from './supabase';
import { Trip, TripWithScore } from '../types';
import { journeyProgressService } from './journeyProgressService';

export const tripService = {
  async getUserTrips(userId: string): Promise<Trip[]> {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getTripsWithScores(userId: string): Promise<TripWithScore[]> {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        preparedness_score:preparedness_scores(*)
      `)
      .eq('user_id', userId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getTripById(tripId: string): Promise<Trip | null> {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createTrip(trip: Omit<Trip, 'id' | 'created_at' | 'updated_at'>): Promise<Trip> {
    const { data, error } = await supabase
      .from('trips')
      .insert(trip)
      .select()
      .single();

    if (error) throw error;

    if (data && trip.distance_km) {
      try {
        await journeyProgressService.createJourneyTracker(data.id, trip.distance_km);
      } catch (journeyError) {
        console.error('Failed to create journey tracker:', journeyError);
      }
    }

    return data;
  },

  async updateTrip(tripId: string, updates: Partial<Trip>): Promise<Trip> {
    const { data, error } = await supabase
      .from('trips')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', tripId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTrip(tripId: string): Promise<void> {
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId);

    if (error) throw error;
  },
};
