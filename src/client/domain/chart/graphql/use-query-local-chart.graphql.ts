import { gql, makeVar, useQuery } from '@apollo/client';
import { GqlSupportedCurrency, GqlMonth } from '@graphql';
import { ChartType } from '@client/chart';

type LocalChartDateRange = {
  month: GqlMonth;
  year: number;
  dateFrom: Date;
  dateTo: Date;
};

type LocalQuery = {
  localChartType: ChartType;
  localChartCurrency: GqlSupportedCurrency | null;
  localChartDateRange: LocalChartDateRange | null;
  localChartIsPerformEnabled: boolean;
};

export const QUERY_LOCAL_CHART = gql`
  query LocalChart {
    localChartType @client
    localChartCurrency @client
    localChartDateRange @client
    localChartIsPerformEnabled @client
  }
`;

export const chartTypeVar = makeVar<LocalQuery['localChartType']>('variance');
export const chartCurrencyVar = makeVar<LocalQuery['localChartCurrency']>(null);
export const chartDateRangeVar = makeVar<LocalQuery['localChartDateRange']>(null);
export const chartIsPerformEnabledVar = makeVar<LocalQuery['localChartIsPerformEnabled']>(false);

export const chartQueryFields = {
  localChartCurrency: {
    read: () => chartCurrencyVar(),
  },
  localChartType: {
    read: () => chartTypeVar(),
  },
  localChartDateRange: {
    read: () => chartDateRangeVar(),
  },
  localChartIsPerformEnabled: {
    read: () => chartIsPerformEnabledVar(),
  },
};

export const useQueryLocalChart = () => {
  const { data } = useQuery<LocalQuery>(QUERY_LOCAL_CHART);

  return {
    chartType: data?.localChartType || 'variance',
    chartCurrency: data?.localChartCurrency || null,
    chartDateRange: data?.localChartDateRange || null,
    isChartPerformEnabled: data?.localChartIsPerformEnabled || false,
  };
};

export const clearLocalChart = () => {
  chartTypeVar('variance');
  chartCurrencyVar(null);
  chartDateRangeVar(null);
  chartIsPerformEnabledVar(false);
};
