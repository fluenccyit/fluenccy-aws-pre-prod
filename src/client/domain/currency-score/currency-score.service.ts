import { round } from 'lodash';
import { CurrencyScorePerformanceLimitMapType } from '@shared/currency-score';

type GetPerformanceResult = {
  label: string;
  variant: 'success' | 'warning' | 'danger';
};

class CurrencyScoreService {
  getPerformanceConfig = (score: number, performanceLimitMap: CurrencyScorePerformanceLimitMapType): GetPerformanceResult => {
    if (score < performanceLimitMap.low) {
      return { label: 'Low', variant: 'danger' };
    } else if (score < performanceLimitMap.fair) {
      return { label: 'Fair', variant: 'warning' };
    } else if (score < performanceLimitMap.good) {
      return { label: 'Good', variant: 'success' };
    } else {
      return { label: 'Great', variant: 'success' };
    }
  };

  getScorePercentage = (score: number, allocation: number) => `${round((score / allocation) * 100)}%`;
}

export const currencyScoreService = new CurrencyScoreService();
