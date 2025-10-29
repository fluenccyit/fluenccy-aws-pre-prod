import React, { memo } from 'react';
import { DASHBOARD_CHART_HEIGHT, TAILWIND_THEME } from '@client/common';
import { ChartText, CHART_FONT_SIZE, CHART_STYLE, VictoryProps } from '@client/chart';
import { TransactionDetailsByMonthType } from '@shared/transaction';

type Props = VictoryProps<TransactionDetailsByMonthType> & {
  hoverIndex?: number;
  index?: number;
};

const { borderRadiusL, barWidth, innerDotSize, outerDotOffsetY, outerDotSize } = CHART_STYLE;

const ZERO_INVOICES_TEXT_Y_OFFSET = 25;
const ZERO_INVOICES_TEXT_X_OFFSET = 22;
const COLUMN_HEIGHT = DASHBOARD_CHART_HEIGHT - ZERO_INVOICES_TEXT_Y_OFFSET;

export const DashboardChartDots = memo(({ x = 0, y = 0, datum, scale, hoverIndex, index }: Props) => {
  if (!scale) {
    return null;
  }

  let topDotY = scale.y(datum?.bought || 0);
  let bottomDotY = scale.y(0);

  // If the dots are close enough to overlap, pad them out.
  topDotY = y - topDotY < outerDotOffsetY ? y - outerDotOffsetY : topDotY;
  bottomDotY = bottomDotY - y < outerDotOffsetY ? y + outerDotOffsetY : bottomDotY;

  const yTopBar = topDotY - outerDotSize - outerDotOffsetY - innerDotSize;
  const yBottomBar = bottomDotY + outerDotSize - 20 + innerDotSize;
  const barHeight = yBottomBar - yTopBar;

  if (!datum?.bought) {
    return (
      <ChartText x={x - ZERO_INVOICES_TEXT_X_OFFSET} y={COLUMN_HEIGHT} fill={TAILWIND_THEME.colors.gray[450]} fontSize={CHART_FONT_SIZE.text4Xs}>
        0 Invoices
      </ChartText>
    );
  }

  return (
    <>
      <rect
        x={x - barWidth / 2}
        y={yTopBar}
        height={barHeight}
        width={barWidth}
        fill={hoverIndex === index ? TAILWIND_THEME.colors.gray[450] : TAILWIND_THEME.colors.gray[200]}
        rx={borderRadiusL}
        data-testid="flnc-chart-fx-purchases-dots"
      />

      <circle cx={x} cy={topDotY - outerDotOffsetY} r={outerDotSize} fill={TAILWIND_THEME.colors.white} />
      <circle cx={x} cy={topDotY - outerDotOffsetY} r={innerDotSize} fill={TAILWIND_THEME.colors.gray[900]} />
    </>
  );
});
