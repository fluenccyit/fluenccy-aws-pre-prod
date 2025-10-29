import React, { memo } from 'react';
import { TAILWIND_THEME } from '@client/common';
import { CHART_STYLE, VictoryProps } from '@client/chart';
import { TransactionDetailsByMonthType } from '@shared/transaction';

type Props = VictoryProps<TransactionDetailsByMonthType> & {
  hoverIndex: number;
  index?: number;
};

const { borderRadiusL, barWidth, innerDotSize, outerDotOffsetY, outerDotSize } = CHART_STYLE;

export const PerformanceChartDots = memo(({ x = 0, y = 0, datum, scale, hoverIndex, index }: Props) => {
  if (!scale || !datum?.deliveryGainLoss) {
    return null;
  }

  let topDotY = scale.y(datum.potentialGain);
  let bottomDotY = scale.y(datum.potentialLoss);

  // If the dots are close enough to overlap, pad them out.
  topDotY = y - topDotY < outerDotOffsetY ? y - outerDotOffsetY : topDotY;
  bottomDotY = bottomDotY - y < outerDotOffsetY ? y + outerDotOffsetY : bottomDotY;

  const yTopBar = topDotY - outerDotSize - outerDotOffsetY - innerDotSize;
  const yBottomBar = bottomDotY + outerDotSize + outerDotOffsetY + innerDotSize;
  const barHeight = yBottomBar - yTopBar;

  return (
    <>
      <rect
        x={x - barWidth / 2}
        y={yTopBar}
        height={barHeight}
        width={barWidth}
        fill={hoverIndex === index ? TAILWIND_THEME.colors.gray[450] : TAILWIND_THEME.colors.gray[200]}
        rx={borderRadiusL}
        data-testid="flnc-chart-performance-dots"
      />

      <circle cx={x} cy={topDotY - outerDotOffsetY} r={outerDotSize} fill={TAILWIND_THEME.colors.white} />
      <circle cx={x} cy={topDotY - outerDotOffsetY} r={innerDotSize} fill={TAILWIND_THEME.colors.green[500]} />
      <circle cx={x} cy={bottomDotY + outerDotOffsetY} r={outerDotSize} fill={TAILWIND_THEME.colors.white} />
      <circle cx={x} cy={bottomDotY + outerDotOffsetY} r={innerDotSize} fill={TAILWIND_THEME.colors.red[500]} />
    </>
  );
});
