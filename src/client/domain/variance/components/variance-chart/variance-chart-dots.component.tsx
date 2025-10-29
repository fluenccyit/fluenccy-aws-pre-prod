import React, { memo } from 'react';
import { find } from 'lodash';
import { TAILWIND_THEME } from '@client/common';
import { CHART_STYLE, VictoryProps } from '@client/chart';
import { TransactionDetailsByMonthType } from '@shared/transaction';

type Props = VictoryProps<TransactionDetailsByMonthType> & {
  transactionsByMonth: TransactionDetailsByMonthType[];
  hoverIndex: number;
  index?: number;
};

const { borderRadiusL, barWidth, innerDotSize, outerDotOffsetY, outerDotSize } = CHART_STYLE;

export const VarianceChartDots = memo((props: Props) => {
  const { x = 0, y = 0, transactionsByMonth, datum, scale, hoverIndex, index, mode } = props;
  const varianceItem = find(transactionsByMonth, ({ monthYear }) => datum?.monthYear === monthYear);
  const isReceivable = mode === 'receivables';

  if (!scale || !varianceItem || !varianceItem.deliveryCost) {
    return null;
  }

  let topDotY = scale.y(varianceItem.maxCost);
  let bottomDotY = scale.y(varianceItem.minCost);

  // If the dots are close enough to overlap, pad them out.
  topDotY = y - topDotY < outerDotOffsetY ? y - outerDotOffsetY : topDotY;
  bottomDotY = bottomDotY - y < outerDotOffsetY ? y + outerDotOffsetY : bottomDotY;

  const topBarY = topDotY - outerDotSize - outerDotOffsetY - innerDotSize;
  const bottomBarY = bottomDotY + outerDotSize + outerDotOffsetY + innerDotSize;
  const barHeight = bottomBarY - topBarY;

  return (
    <>
      <rect
        x={x - barWidth / 2}
        y={topBarY}
        height={barHeight}
        width={barWidth}
        fill={hoverIndex === index ? TAILWIND_THEME.colors.gray[450] : TAILWIND_THEME.colors.gray[200]}
        rx={borderRadiusL}
        data-testid="flnc-chart-payment-variance-dots"
      />
      <circle cx={x} cy={topDotY - outerDotOffsetY} r={outerDotSize} fill={TAILWIND_THEME.colors.white} />
      <circle
        cx={x}
        cy={topDotY - outerDotOffsetY}
        r={innerDotSize}
        fill={isReceivable ? TAILWIND_THEME.colors.green[500] : TAILWIND_THEME.colors.red[500]}
      />

      <circle cx={x} cy={y} r={outerDotSize} fill={TAILWIND_THEME.colors.white} />
      <circle cx={x} cy={y} r={innerDotSize} fill={TAILWIND_THEME.colors.gray[900]} />

      <circle cx={x} cy={bottomDotY + outerDotOffsetY} r={outerDotSize} fill={TAILWIND_THEME.colors.white} />
      <circle
        cx={x}
        cy={bottomDotY + outerDotOffsetY}
        r={innerDotSize}
        fill={isReceivable ? TAILWIND_THEME.colors.red[500] : TAILWIND_THEME.colors.green[500]}
      />
    </>
  );
});
