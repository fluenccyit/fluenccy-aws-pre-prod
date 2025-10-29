import React, { memo, useMemo } from 'react';
import { CHART_FONT_SIZE, ChartText, VictoryProps } from '@client/chart';
import { split } from 'lodash';
import { TAILWIND_THEME } from '@client/common';

const MONTH_Y_OFFSET = 20;
const YEAR_Y_OFFSET = 38;
const YEAR_X_OFFSET = 3;

export const CurrencyScoreXAxisTickLabels = memo(({ x, y, text, index }: VictoryProps) => {
  const [month, year] = split(text, ' ');
  // Only show the year label on the month of January.
  const isYearVisible = useMemo(() => !index || text?.includes('Jan'), [text]);

  // Hide the last month.
  if (!x || !y || index === 12) {
    return null;
  }

  return (
    <>
      <ChartText fill={TAILWIND_THEME.colors.gray[500]} fontSize={CHART_FONT_SIZE.textXs} x={x} y={y + MONTH_Y_OFFSET} textAnchor="middle">
        {month}
      </ChartText>
      {isYearVisible && (
        <ChartText
          fill={TAILWIND_THEME.colors.gray[450]}
          fontSize={CHART_FONT_SIZE.textXs}
          x={x + YEAR_X_OFFSET}
          y={y + YEAR_Y_OFFSET}
          textAnchor="middle"
        >
          {year}
        </ChartText>
      )}
    </>
  );
});
