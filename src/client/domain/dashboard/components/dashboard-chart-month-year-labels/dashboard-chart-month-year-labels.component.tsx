import React, { memo } from 'react';
import { TAILWIND_THEME } from '@client/common';
import { ChartText, CHART_FONT_SIZE, CHART_STYLE, VictoryProps } from '@client/chart';

const OFFSET_X = 21;

export const DashboardChartMonthYearLabels = memo(({ text, x = 0, y = 0 }: VictoryProps) => (
  <ChartText x={x - OFFSET_X - CHART_STYLE.borderWidth} y={y} fill={TAILWIND_THEME.colors.gray[500]} fontSize={CHART_FONT_SIZE.text3Xs}>
    {text}
  </ChartText>
));
