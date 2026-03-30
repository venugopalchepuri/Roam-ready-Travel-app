import { supabase } from './supabase';

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

export async function getVisaRequirement(
  passportCountry: string,
  destinationCountry: string
): Promise<VisaRequirement | null> {
  const { data, error } = await supabase
    .from('visa_requirements')
    .select('*')
    .eq('passport_country', passportCountry)
    .eq('destination_country', destinationCountry)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getAllVisaRequirements(passportCountry: string): Promise<VisaRequirement[]> {
  const { data, error } = await supabase
    .from('visa_requirements')
    .select('*')
    .eq('passport_country', passportCountry)
    .order('destination_country', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function searchVisaRequirements(searchTerm: string): Promise<VisaRequirement[]> {
  const { data, error } = await supabase
    .from('visa_requirements')
    .select('*')
    .or(`destination_country.ilike.%${searchTerm}%,passport_country.ilike.%${searchTerm}%`)
    .limit(20);

  if (error) throw error;
  return data || [];
}
