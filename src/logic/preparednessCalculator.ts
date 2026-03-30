import { ChecklistItem, Itinerary, Budget, EmergencyContact, PreparednessScore } from '../types';
import { supabase } from '../services/supabase';

const WEIGHTS = {
  CHECKLIST: 0.4,
  ITINERARY: 0.3,
  EMERGENCY: 0.2,
  BUDGET: 0.1,
};

export const calculatePreparednessScore = async (
  tripId: string,
  startDate: string,
  endDate: string
): Promise<PreparednessScore> => {
  const [checklistItems, itineraries, budgets, emergencyContacts] = await Promise.all([
    fetchChecklistItems(tripId),
    fetchItineraries(tripId),
    fetchBudgets(tripId),
    fetchEmergencyContacts(tripId),
  ]);

  const checklistCompletion = calculateChecklistCompletion(checklistItems);
  const itineraryCompletion = calculateItineraryCompletion(itineraries, startDate, endDate);
  const emergencyInfoComplete = emergencyContacts.length > 0;
  const budgetAdded = budgets.length > 0;

  const score = Math.round(
    checklistCompletion * WEIGHTS.CHECKLIST * 100 +
    itineraryCompletion * WEIGHTS.ITINERARY * 100 +
    (emergencyInfoComplete ? WEIGHTS.EMERGENCY * 100 : 0) +
    (budgetAdded ? WEIGHTS.BUDGET * 100 : 0)
  );

  const preparednessScore: PreparednessScore = {
    trip_id: tripId,
    score,
    checklist_completion: Math.round(checklistCompletion * 100),
    itinerary_completion: Math.round(itineraryCompletion * 100),
    emergency_info_complete: emergencyInfoComplete,
    budget_added: budgetAdded,
    updated_at: new Date().toISOString(),
  };

  await savePreparednessScore(preparednessScore);

  return preparednessScore;
};

const calculateChecklistCompletion = (items: ChecklistItem[]): number => {
  if (items.length === 0) return 0;
  const completedCount = items.filter((item) => item.completed).length;
  return completedCount / items.length;
};

const calculateItineraryCompletion = (
  itineraries: Itinerary[],
  startDate: string,
  endDate: string
): number => {
  const tripDays = Math.ceil(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  if (tripDays === 0) return 0;

  const plannedDays = itineraries.filter(
    (itinerary) => itinerary.activities && itinerary.activities.length > 0
  ).length;

  return plannedDays / tripDays;
};

const fetchChecklistItems = async (tripId: string): Promise<ChecklistItem[]> => {
  const { data, error } = await supabase
    .from('checklists')
    .select('*')
    .eq('trip_id', tripId);

  if (error) throw error;
  return data || [];
};

const fetchItineraries = async (tripId: string): Promise<Itinerary[]> => {
  const { data, error } = await supabase
    .from('itineraries')
    .select('*')
    .eq('trip_id', tripId);

  if (error) throw error;
  return data || [];
};

const fetchBudgets = async (tripId: string): Promise<Budget[]> => {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('trip_id', tripId);

  if (error) throw error;
  return data || [];
};

const fetchEmergencyContacts = async (tripId: string): Promise<EmergencyContact[]> => {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('trip_id', tripId);

  if (error) throw error;
  return data || [];
};

const savePreparednessScore = async (score: PreparednessScore): Promise<void> => {
  const { error } = await supabase
    .from('preparedness_scores')
    .upsert(score, { onConflict: 'trip_id' });

  if (error) throw error;
};

export const getScoreStatus = (score: number): { label: string; color: string } => {
  if (score >= 71) {
    return { label: 'Ready to Go!', color: 'text-green-600' };
  } else if (score >= 41) {
    return { label: 'Moderate', color: 'text-yellow-600' };
  } else {
    return { label: 'Needs Attention', color: 'text-red-600' };
  }
};
