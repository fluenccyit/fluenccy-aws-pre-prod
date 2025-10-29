import React, { memo } from 'react';
import { slice, trim } from 'lodash';
import { TAILWIND_THEME } from '@client/common';
import { ChartText, CHART_FONT_SIZE, CHART_STYLE, VictoryProps } from '@client/chart';

type Props = VictoryProps & {
  hoverIndex?: number;
};

const OFFSET_X = 6;
const OFFSET_Y = 16;

export const ChartMonthYearLabels = memo(({ hoverIndex, index, text, x = 0 }: Props) => (
  <ChartText
    x={x - OFFSET_X - CHART_STYLE.borderWidth}
    y={CHART_STYLE.xAxisHeight + OFFSET_Y}
    fill={hoverIndex === index ? TAILWIND_THEME.colors.gray[550] : TAILWIND_THEME.colors.gray[500]}
    fontSize={CHART_FONT_SIZE.text4Xs}
  >
    {trim(slice(text, 0, 3).join(''))}
  </ChartText>
));
