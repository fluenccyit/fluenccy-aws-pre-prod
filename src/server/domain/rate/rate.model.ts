import { GqlSupportedCurrency, GqlMonth } from '@graphql';

// Rates
export type BaseRate = {
  baseCurrency: GqlSupportedCurrency;
  tradeCurrency: GqlSupportedCurrency;
};

export type RateDbo = BaseRate & {
  date: string;
  open: number | string;
  high: number | string;
  low: number | string;
  last: number | string;
};

export type RateModel = BaseRate & {
  date: Date;
  open: number;
  high: number;
  low: number;
  last: number;
};

// Forward Points
export type BaseForward = BaseRate & {
  month: GqlMonth;
  year: string;
};

export type ForwardPointDbo = BaseForward & {
  date: string;
  forwardPoints: number | string;
};

export type ForwardPointModel = BaseForward & {
  date: Date;
  forwardPoints: number;
};

export type ForwardRateModel = BaseForward & {
  date: Date;
  forwardRate: number;
};
