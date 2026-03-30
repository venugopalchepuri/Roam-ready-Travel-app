import { supabase } from './supabase';

export interface LocalTransport {
  id: string;
  city: string;
  country: string;
  transport_type: 'metro' | 'bus' | 'taxi' | 'auto' | 'ferry' | 'tram';
  name: string;
  routes?: Record<string, any>[];
  fare_info?: Record<string, any>;
  operating_hours?: Record<string, any>;
  payment_methods?: string[];
  tips?: string;
  created_at: string;
  updated_at: string;
}

export async function getTransportOptions(city: string, country: string): Promise<LocalTransport[]> {
  const { data, error } = await supabase
    .from('local_transport')
    .select('*')
    .eq('city', city)
    .eq('country', country)
    .order('transport_type', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getTransportByType(
  city: string,
  country: string,
  transportType: string
): Promise<LocalTransport[]> {
  const { data, error } = await supabase
    .from('local_transport')
    .select('*')
    .eq('city', city)
    .eq('country', country)
    .eq('transport_type', transportType);

  if (error) throw error;
  return data || [];
}

export async function searchTransport(searchTerm: string): Promise<LocalTransport[]> {
  const { data, error } = await supabase
    .from('local_transport')
    .select('*')
    .or(`city.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
    .limit(20);

  if (error) throw error;
  return data || [];
}

export function calculateAutoFare(distanceKm: number, city: string): number {
  const fareRates: Record<string, { base: number; perKm: number }> = {
    'Mumbai': { base: 23, perKm: 16.5 },
    'Delhi': { base: 25, perKm: 13 },
    'Bangalore': { base: 30, perKm: 15 },
    'Chennai': { base: 25, perKm: 14 },
    'Kolkata': { base: 25, perKm: 13 },
    'Hyderabad': { base: 25, perKm: 14 },
    'default': { base: 25, perKm: 15 }
  };

  const rate = fareRates[city] || fareRates['default'];
  return rate.base + (distanceKm * rate.perKm);
}
