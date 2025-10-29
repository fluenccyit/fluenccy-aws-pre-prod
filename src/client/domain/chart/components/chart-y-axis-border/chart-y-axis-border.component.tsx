import React, { memo } from 'react';
import { VictoryPortal } from 'victory';
import { CHART_STYLE } from '@client/chart';
import { CHART_HEIGHT, TAILWIND_THEME } from '@client/common';

export const ChartYAxisBorder = memo(() => (
  <VictoryPortal>
    <line
      x1={CHART_STYLE.yAxisWidth}
      x2={CHART_STYLE.yAxisWidth}
      y1={0}
      y2={CHART_HEIGHT}
      stroke={TAILWIND_THEME.colors.gray[200]}
      fill="transparent"
    />
  </VictoryPortal>
));
