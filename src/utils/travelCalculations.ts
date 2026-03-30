export type TravelMode = 'flight' | 'train' | 'bus' | 'car';

export interface TravelRecommendation {
  mode: TravelMode;
  cost: number;
  time: string;
  alternatives: Array<{
    mode: TravelMode;
    cost: number;
    time: string;
  }>;
}

const RATES = {
  flight: 5,
  train: 1.5,
  bus: 2,
  car: 8,
};

const SPEEDS = {
  flight: 600,
  train: 65,
  bus: 50,
  car: 60,
};

export const calculateCost = (distance: number, mode: TravelMode): number => {
  return Math.round(distance * RATES[mode]);
};

export const calculateTime = (distance: number, mode: TravelMode): string => {
  const hours = distance / SPEEDS[mode];

  if (hours < 1) {
    return `${Math.ceil(hours * 60)} minutes`;
  } else if (hours < 24) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h} hours`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days} days`;
  }
};

export const getRecommendedMode = (distance: number): TravelMode => {
  if (distance < 300) return 'car';
  if (distance < 800) return 'train';
  return 'flight';
};

export const calculateTravelRecommendations = (distance: number): TravelRecommendation => {
  const recommendedMode = getRecommendedMode(distance);

  const allModes: TravelMode[] = ['flight', 'train', 'bus', 'car'];
  const alternatives = allModes
    .filter(mode => mode !== recommendedMode)
    .map(mode => ({
      mode,
      cost: calculateCost(distance, mode),
      time: calculateTime(distance, mode),
    }))
    .sort((a, b) => a.cost - b.cost)
    .slice(0, 2);

  return {
    mode: recommendedMode,
    cost: calculateCost(distance, recommendedMode),
    time: calculateTime(distance, recommendedMode),
    alternatives,
  };
};

export const calculateTripDuration = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '1 day';
  if (diffDays === 1) return '2 days';
  return `${diffDays + 1} days`;
};

export const getTripStatus = (startDate: string, endDate: string): 'upcoming' | 'ongoing' | 'past' => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) return 'upcoming';
  if (now > end) return 'past';
  return 'ongoing';
};

export const getDaysUntilTrip = (startDate: string): number => {
  const now = new Date();
  const start = new Date(startDate);
  const diffTime = start.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
