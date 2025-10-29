import React, { memo } from 'react';
import { TAILWIND_THEME } from '@client/common';
import { ChartText, CHART_FONT_SIZE, CHART_STYLE, VictoryProps } from '@client/chart';

const OFFSET_X = 21;
const BARWIDTH = 50;

export const DashboardChartMonthYearLabels = memo(({ text, x = 0, y = 0, index }: VictoryProps) => (
  <ChartText x={x - (index * (BARWIDTH / 2) - BARWIDTH/6) - CHART_STYLE.borderWidth} y={y + 12} fill={TAILWIND_THEME.colors.gray[500]} fontSize={CHART_FONT_SIZE.text3Xs}>
    {text}
  </ChartText>
));
