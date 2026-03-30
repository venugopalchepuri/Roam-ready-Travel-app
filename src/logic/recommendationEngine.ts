import { RecommendationRule, Recommendation, Priority } from '../types';

export interface RecommendationInput {
  distance: number;
  priority: Priority;
}

export const generateRecommendations = (
  input: RecommendationInput,
  rules: RecommendationRule[]
): Recommendation[] => {
  const { distance, priority } = input;

  const applicableRules = rules.filter(
    (rule) =>
      distance >= rule.min_distance &&
      distance <= rule.max_distance &&
      rule.priority_type === priority
  );

  const allDistanceRules = rules.filter(
    (rule) => distance >= rule.min_distance && distance <= rule.max_distance
  );

  const recommendations: Recommendation[] = [];
  const modesAdded = new Set<string>();

  applicableRules.forEach((rule) => {
    if (!modesAdded.has(rule.recommended_mode)) {
      modesAdded.add(rule.recommended_mode);

      const baseCost = distance * rule.base_cost_per_km;
      const estimatedTime = distance * rule.estimated_time_per_km;

      recommendations.push({
        mode: rule.recommended_mode,
        platform: rule.recommended_platform,
        estimatedCost: {
          low: Math.round(baseCost * 0.8),
          average: Math.round(baseCost),
          high: Math.round(baseCost * 1.3),
        },
        estimatedTime: Math.round(estimatedTime * 10) / 10,
        reason: getRecommendationReason(rule, distance, priority),
        isRecommended: true,
      });
    }
  });

  allDistanceRules.forEach((rule) => {
    if (!modesAdded.has(rule.recommended_mode)) {
      modesAdded.add(rule.recommended_mode);

      const baseCost = distance * rule.base_cost_per_km;
      const estimatedTime = distance * rule.estimated_time_per_km;

      recommendations.push({
        mode: rule.recommended_mode,
        platform: rule.recommended_platform,
        estimatedCost: {
          low: Math.round(baseCost * 0.8),
          average: Math.round(baseCost),
          high: Math.round(baseCost * 1.3),
        },
        estimatedTime: Math.round(estimatedTime * 10) / 10,
        reason: getAlternativeReason(rule, priority),
        isRecommended: false,
      });
    }
  });

  return recommendations.sort((a, b) => {
    if (a.isRecommended && !b.isRecommended) return -1;
    if (!a.isRecommended && b.isRecommended) return 1;
    if (priority === 'cost') return a.estimatedCost.average - b.estimatedCost.average;
    if (priority === 'time') return a.estimatedTime - b.estimatedTime;
    return 0;
  });
};

const getRecommendationReason = (rule: RecommendationRule, distance: number, priority: Priority): string => {
  const reasons: string[] = [];

  if (distance < 300) {
    reasons.push('Short distance makes this mode practical');
  } else if (distance < 800) {
    reasons.push('Medium distance - balanced option');
  } else {
    reasons.push('Long distance - efficient for travel');
  }

  if (priority === 'cost') {
    reasons.push('Most economical option for your budget');
  } else if (priority === 'time') {
    reasons.push('Fastest travel time available');
  } else {
    reasons.push('Best comfort and convenience');
  }

  return reasons.join('. ');
};

const getAlternativeReason = (rule: RecommendationRule, priority: Priority): string => {
  if (priority === 'cost' && rule.priority_type === 'time') {
    return 'Faster but more expensive alternative';
  } else if (priority === 'time' && rule.priority_type === 'cost') {
    return 'More economical but slower option';
  } else if (priority === 'comfort') {
    return 'Alternative option with different trade-offs';
  }
  return 'Alternative transport mode';
};

export const getDistanceTier = (distance: number): string => {
  if (distance < 300) return 'Short Distance (0-300 km)';
  if (distance < 800) return 'Medium Distance (300-800 km)';
  return 'Long Distance (800+ km)';
};

export const getPriorityLabel = (priority: Priority): string => {
  const labels = {
    cost: 'Budget-Friendly',
    time: 'Time-Efficient',
    comfort: 'Maximum Comfort',
  };
  return labels[priority];
};
