import { GqlMonth } from '@graphql';

export type GroupedByMonthYearType = DateRangeParam & {
  month: GqlMonth;
  year: number;
  monthYear: string;
};
