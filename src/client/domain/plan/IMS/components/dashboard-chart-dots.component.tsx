import React, { memo, useState } from 'react';
import { DASHBOARD_CHART_HEIGHT, TAILWIND_THEME } from '@client/common';
import { ChartText, CHART_FONT_SIZE, CHART_STYLE, VictoryProps } from '@client/chart';
import { TransactionDetailsByMonthType } from '@shared/transaction';

type Props = VictoryProps<TransactionDetailsByMonthType> & {
  hoverIndex?: number;
  index?: number;
  onClick: Function;
  renderTooltip: Function;
};

const barWidth = 50;

const ZERO_INVOICES_TEXT_Y_OFFSET = 25;
const ZERO_INVOICES_TEXT_X_OFFSET = 22;
const COLUMN_HEIGHT = DASHBOARD_CHART_HEIGHT - ZERO_INVOICES_TEXT_Y_OFFSET;

export const DashboardChartDots = memo(({ x = 0, y = 0, datum, scale, hoverIndex, index, onClick, renderTooltip }: Props) => {
  const [isHovered, setIsHovered] = useState(false);
  if (!scale) {
    return null;
  }

  const handleClick = () => {
    console.log(datum)
    onClick(datum);
  };

  const handleHover = (isHovered: boolean) => {
    setIsHovered(isHovered);
  };

  let topDotY = scale.y(datum?.total || 0);
  let bottomDotY = scale.y(0);

  // If the dots are close enough to overlap, pad them out.
  topDotY = y - topDotY < 0 ? y : topDotY;
  bottomDotY = bottomDotY - y < 0 ? y : bottomDotY;

  const yTopBar = topDotY;
  const yBottomBar = bottomDotY;
  const barHeight = yBottomBar - yTopBar;
  const height3 = barHeight * (datum.dought3) / datum.total;
  const height2 = barHeight * (datum.dought2) / datum.total;
  const height1 = barHeight * (datum.dought1) / datum.total;
  const y3 = yTopBar;
  const y2 = height3 + yTopBar;
  const y1 = height2 + height3 + yTopBar

  if (!datum?.total) {
    return (
      <ChartText x={x - ZERO_INVOICES_TEXT_X_OFFSET} y={COLUMN_HEIGHT} fill={TAILWIND_THEME.colors.gray[450]} fontSize={CHART_FONT_SIZE.text4Xs}>
        0 Amount
      </ChartText>
    );
  }

  return (
    <>
      <rect
        x={x - (index * (barWidth / 2))}
        y={y3}
        height={height3}
        width={barWidth}
        fill={hoverIndex === index ? TAILWIND_THEME.colors.gray[450] : TAILWIND_THEME.colors.gray['light']}
        data-testid="flnc-chart-fx-invoices"
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
        className="cursor-pointer"
      />
      <rect
        x={x - (index * (barWidth / 2))}
        y={y2}
        height={height2}
        width={barWidth}
        fill={hoverIndex === index ? TAILWIND_THEME.colors.gray[450] : TAILWIND_THEME.colors.green['light']}
        data-testid="flnc-chart-fx-invoices"
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
      />
      <rect
        x={x - (index * (barWidth / 2))}
        y={y1}
        height={height1}
        width={barWidth}
        fill={hoverIndex === index ? TAILWIND_THEME.colors.gray[450] : TAILWIND_THEME.colors.green['dark']}
        data-testid="flnc-chart-fx-invoices"
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
      />
      {/* {isHovered && renderTooltip(datum, x, scale)} */}
    </>
  );
});
