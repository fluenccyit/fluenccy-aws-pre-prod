import { GqlMonth } from '@graphql';
import { TAILWIND_THEME } from '@client/common';
import { TabModel } from '@client/common';

export type ChartMonthYearType = {
  month: GqlMonth;
  year: number;
};

export type ChartGroupedByMonthItem = ChartMonthYearType & {
  monthYear: string;
  isEmpty?: boolean;
};

export type VictoryProps<T = any> = {
  datum?: T & ChartGroupedByMonthItem;
  data?: T[];
  id?: string;
  index?: number;
  width?: number;
  x?: number;
  y?: number;
  y0?: number;
  text?: string;
  scale?: { y: (item: number) => number; x: (item: number) => number };
};

export const CHART_FONT_FAMILY = `'${TAILWIND_THEME.fontFamily.sans}'`;

export const CHART_STYLE = {
  barWidth: 12,
  borderRadiusL: 6,
  borderWidth: 1,
  innerDotSize: 3,
  outerDotOffsetY: 5,
  outerDotSize: 4,
  xAxisHeight: 35,
  yAxisWidth: 75,
  tooltipWidth: 300
};

export const CHART_FONT_SIZE = {
  text5Xs: 8,
  text4Xs: 9,
  text3Xs: 10,
  text2Xs: 11,
  textXs: 12,
  textSm: 14,
  textMd: 16,
  textLg: 18,
  textXl: 20,
  text2Xl: 24,
};

export type ChartType = 'variance' | 'performance' | 'fx_purchases';

export const chartTypeTabs = (mode): TabModel<ChartType>[] =>
  [{
    id: 'fx_purchases',
    label: `${mode === 'receivables' ? "FX Sales" : "FX Purchases"}`,
  },
  {
    id: 'performance',
    label: 'Performance',
  },
  {
    id: 'variance',
    label: `${mode === 'receivables' ? "Receivables" : "Payment"} Variance`,
  },
];
