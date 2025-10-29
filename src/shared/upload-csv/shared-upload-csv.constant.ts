export const CURRENCY_SCORE_ALLOCATION = {
  total: 850,
  costPlan: 400,
  present: 100,
  margin: 100,
  gainLoss: 50,
  target: 50,
} as const;

export type CurrencyScorePerformanceLimitMapType = {
  low: number;
  fair: number;
  good: number;
  great: number;
};

export const CURRENCY_SCORE_OVERALL_PERFORMANCE_LIMIT: CurrencyScorePerformanceLimitMapType = {
  low: 299,
  fair: 499,
  good: 699,
  great: 799,
} as const;

// The cost plan score is spread across the Foreign Currency factor, and the Risk factor. So we just divide it by 2 to get an equal weighting across
// the two factors.
const halfCostPlanScore = CURRENCY_SCORE_ALLOCATION.costPlan / 2;

// Foreign currency allocation = 350
export const CURRENCY_SCORE_FOREIGN_CURRENCY_ALLOCATION = halfCostPlanScore + CURRENCY_SCORE_ALLOCATION.gainLoss + CURRENCY_SCORE_ALLOCATION.margin;
export const CURRENCY_SCORE_FOREIGN_CURRENCY_PERFORMANCE_LIMIT: CurrencyScorePerformanceLimitMapType = {
  low: 100,
  fair: 210,
  good: 275,
  great: 325,
} as const;

// Risk allocation = 200
export const CURRENCY_SCORE_RISK_ALLOCATION = halfCostPlanScore;
export const CURRENCY_SCORE_RISK_PERFORMANCE_LIMIT: CurrencyScorePerformanceLimitMapType = {
  low: 60,
  fair: 120,
  good: 150,
  great: 175,
} as const;

// Rate allocation = 150
export const CURRENCY_SCORE_RATE_ALLOCATION = CURRENCY_SCORE_ALLOCATION.target + CURRENCY_SCORE_ALLOCATION.present;
export const CURRENCY_SCORE_RATE_PERFORMANCE_LIMIT: CurrencyScorePerformanceLimitMapType = {
  low: 45,
  fair: 90,
  good: 115,
  great: 135,
} as const;
