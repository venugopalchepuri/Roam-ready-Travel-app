import { supabase } from './supabase';
import { RecommendationRule } from '../types';

export const recommendationService = {
  async getRecommendationRules(): Promise<RecommendationRule[]> {
    const { data, error } = await supabase
      .from('recommendation_rules')
      .select('*')
      .order('min_distance', { ascending: true });

    if (error) throw error;
    return data || [];
  },
};
