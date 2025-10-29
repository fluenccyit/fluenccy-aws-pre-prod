import React, { memo } from 'react';
import { TAILWIND_THEME } from '@client/common';
import { ChartText, CHART_FONT_SIZE, useQueryLocalChart, VictoryProps } from '@client/chart';
import { utilService } from '@client/common';

export const DashboardChartRateLabels = memo(({ datum, x = 0, y = 0 }: VictoryProps) => {
  const { chartCurrency } = useQueryLocalChart();

  return (
    <ChartText x={x} y={y} fill={TAILWIND_THEME.colors.gray[500]} fontSize={CHART_FONT_SIZE.text3Xs}>
      {utilService.formatRateAmount(datum, chartCurrency)}
    </ChartText>
  );
});
