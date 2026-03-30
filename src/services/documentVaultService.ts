import { supabase } from './supabase';

export interface TravelDocument {
  id: string;
  user_id: string;
  trip_id?: string;
  document_type: 'passport' | 'visa' | 'ticket' | 'insurance' | 'vaccination' | 'other';
  title: string;
  document_number?: string;
  issue_date?: string;
  expiry_date?: string;
  issuing_country?: string;
  file_url?: string;
  ocr_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export async function getDocuments(tripId?: string): Promise<TravelDocument[]> {
  let query = supabase
    .from('travel_documents')
    .select('*')
    .order('created_at', { ascending: false });

  if (tripId) {
    query = query.eq('trip_id', tripId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function getDocument(id: string): Promise<TravelDocument | null> {
  const { data, error } = await supabase
    .from('travel_documents')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function addDocument(document: Partial<TravelDocument>): Promise<TravelDocument> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('travel_documents')
    .insert([{ ...document, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateDocument(id: string, updates: Partial<TravelDocument>): Promise<TravelDocument> {
  const { data, error } = await supabase
    .from('travel_documents')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase
    .from('travel_documents')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getExpiringDocuments(daysAhead = 30): Promise<TravelDocument[]> {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const { data, error } = await supabase
    .from('travel_documents')
    .select('*')
    .not('expiry_date', 'is', null)
    .lte('expiry_date', futureDate.toISOString().split('T')[0])
    .order('expiry_date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function uploadDocumentFile(file: File, documentId: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${documentId}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('documents')
    .upload(fileName, file, { upsert: true });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('documents')
    .getPublicUrl(fileName);

  await updateDocument(documentId, { file_url: publicUrl });

  return publicUrl;
}
