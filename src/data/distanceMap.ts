type DistanceKey = `${string}-${string}`;

export const distanceMap: Record<DistanceKey, number> = {
  'Mumbai-Delhi': 1440,
  'Delhi-Mumbai': 1440,
  'Mumbai-Bangalore': 985,
  'Bangalore-Mumbai': 985,
  'Mumbai-Hyderabad': 710,
  'Hyderabad-Mumbai': 710,
  'Mumbai-Chennai': 1335,
  'Chennai-Mumbai': 1335,
  'Mumbai-Kolkata': 2050,
  'Kolkata-Mumbai': 2050,
  'Mumbai-Pune': 150,
  'Pune-Mumbai': 150,

  'Delhi-Bangalore': 2150,
  'Bangalore-Delhi': 2150,
  'Delhi-Hyderabad': 1580,
  'Hyderabad-Delhi': 1580,
  'Delhi-Chennai': 2180,
  'Chennai-Delhi': 2180,
  'Delhi-Kolkata': 1530,
  'Kolkata-Delhi': 1530,
  'Delhi-Jaipur': 280,
  'Jaipur-Delhi': 280,
  'Delhi-Agra': 230,
  'Agra-Delhi': 230,

  'Bangalore-Hyderabad': 570,
  'Hyderabad-Bangalore': 570,
  'Bangalore-Chennai': 350,
  'Chennai-Bangalore': 350,
  'Bangalore-Mysore': 145,
  'Mysore-Bangalore': 145,

  'Hyderabad-Chennai': 630,
  'Chennai-Hyderabad': 630,
  'Chennai-Kolkata': 1670,
  'Kolkata-Chennai': 1670,
  'Kolkata-Guwahati': 1030,
  'Guwahati-Kolkata': 1030,

  'Pune-Bangalore': 840,
  'Bangalore-Pune': 840,
  'Pune-Hyderabad': 560,
  'Hyderabad-Pune': 560,

  'Ahmedabad-Mumbai': 530,
  'Mumbai-Ahmedabad': 530,
  'Ahmedabad-Delhi': 950,
  'Delhi-Ahmedabad': 950,

  'Jaipur-Udaipur': 395,
  'Udaipur-Jaipur': 395,
  'Jaipur-Jodhpur': 340,
  'Jodhpur-Jaipur': 340,

  'Delhi-Shimla': 350,
  'Shimla-Delhi': 350,
  'Delhi-Manali': 540,
  'Manali-Delhi': 540,
  'Delhi-Rishikesh': 240,
  'Rishikesh-Delhi': 240,
  'Delhi-Dehradun': 255,
  'Dehradun-Delhi': 255,

  'Kolkata-Darjeeling': 615,
  'Darjeeling-Kolkata': 615,
  'Kolkata-Gangtok': 720,
  'Gangtok-Kolkata': 720,

  'Chennai-Ooty': 560,
  'Ooty-Chennai': 560,
  'Chennai-Kodaikanal': 525,
  'Kodaikanal-Chennai': 525,
  'Chennai-Coimbatore': 510,
  'Coimbatore-Chennai': 510,

  'Kochi-Thiruvananthapuram': 220,
  'Thiruvananthapuram-Kochi': 220,

  'Mumbai-Goa': 590,
  'Goa-Mumbai': 590,
  'Bangalore-Goa': 560,
  'Goa-Bangalore': 560,

  'Delhi-Amritsar': 450,
  'Amritsar-Delhi': 450,
  'Delhi-Chandigarh': 245,
  'Chandigarh-Delhi': 245,

  'Bangalore-Hampi': 340,
  'Hampi-Bangalore': 340,
  'Hyderabad-Visakhapatnam': 620,
  'Visakhapatnam-Hyderabad': 620,

  'Delhi-Varanasi': 820,
  'Varanasi-Delhi': 820,
  'Mumbai-Nashik': 165,
  'Nashik-Mumbai': 165,
  'Delhi-Lucknow': 555,
  'Lucknow-Delhi': 555,
  'Delhi-Srinagar': 880,
  'Srinagar-Delhi': 880,
};

export function getDistance(from: string, to: string): number {
  if (from === to) return 0;

  const key1: DistanceKey = `${from}-${to}`;
  const key2: DistanceKey = `${to}-${from}`;

  return distanceMap[key1] || distanceMap[key2] || 0;
}