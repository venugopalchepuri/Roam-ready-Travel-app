import { supabase } from './supabase';

export interface JourneyProgress {
  id: string;
  trip_id: string;
  total_distance: number;
  covered_distance: number;
  last_updated: string;
}

export const journeyProgressService = {
  async getJourneyProgress(tripId: string): Promise<JourneyProgress | null> {
    const { data, error } = await supabase
      .from('journey_tracker')
      .select('*')
      .eq('trip_id', tripId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching journey progress:', error);
      throw error;
    }

    return data;
  },

  async createJourneyTracker(tripId: string, totalDistance: number): Promise<JourneyProgress> {
    const { data, error } = await supabase
      .from('journey_tracker')
      .insert({
        trip_id: tripId,
        total_distance: totalDistance,
        covered_distance: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating journey tracker:', error);
      throw error;
    }

    return data;
  },

  async updateCoveredDistance(tripId: string, coveredDistance: number): Promise<void> {
    const { error } = await supabase
      .from('journey_tracker')
      .update({
        covered_distance: coveredDistance,
        last_updated: new Date().toISOString(),
      })
      .eq('trip_id', tripId);

    if (error) {
      console.error('Error updating covered distance:', error);
      throw error;
    }
  },

  calculateProgress(totalDistance: number, coveredDistance: number): number {
    if (totalDistance === 0) return 0;
    return Math.round((coveredDistance / totalDistance) * 100);
  },
};
