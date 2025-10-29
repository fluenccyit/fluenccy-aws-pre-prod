import React, { memo, useMemo, useState, ReactNode } from 'react';
import cn from 'classnames';
import { split } from 'lodash';
import { differenceInCalendarMonths } from 'date-fns';
import { GqlMonth } from '@graphql';
import { CHART_HEIGHT, TAILWIND_THEME, useQueryLocalCommon } from '@client/common';
import { ChartText, CHART_FONT_SIZE, ChartMonthYearType, CHART_STYLE, VictoryProps } from '@client/chart';

type Props = VictoryProps & {
  dateFrom: Date;
  dateTo: Date;
  xDomainPadding: number;
  onClick: (monthYear: ChartMonthYearType) => void;
  onHover: (index: number) => void;
  renderTooltip: ({ month, year, x }: ChartMonthYearType & VictoryProps) => ReactNode;
  showEmptyText?: boolean;
  isDoubleAxes?: boolean;
};

const COLUMN_HEIGHT = CHART_HEIGHT - CHART_STYLE.xAxisHeight;
const ZERO_INVOICES_CONTAINER_OFFSET_Y = 24;
const ZERO_INVOICES_TEXT_Y_OFFSET = 10;
const ZERO_INVOICES_TEXT_X_OFFSET = 21;

export const ChartMonthColumn = memo((props: Props) => {
  const {
    dateFrom,
    dateTo,
    datum,
    index = 0,
    onClick,
    onHover,
    renderTooltip,
    scale,
    width = 0,
    x = 0,
    xDomainPadding,
    showEmptyText = true,
    isDoubleAxes,
  } = props;
  const { ui } = useQueryLocalCommon();
  const [isHovered, setIsHovered] = useState(false);
  const classes = cn({ 'cursor-pointer': ui === 'ready' });
  const baseColumnProps = useMemo(() => {
    const yAxisWidth = isDoubleAxes ? CHART_STYLE.yAxisWidth * 2 : CHART_STYLE.yAxisWidth;
    const chartWidth = width - yAxisWidth - CHART_STYLE.borderWidth;
    const numberOfMonths = differenceInCalendarMonths(dateTo, dateFrom);
    const columnWidth = chartWidth / numberOfMonths;

    return {
      x: x - xDomainPadding,
      y: CHART_STYLE.xAxisHeight,
      height: COLUMN_HEIGHT,
      width: columnWidth,
      stroke: TAILWIND_THEME.colors.gray[200],
      strokeDasharray: `0,${columnWidth},${COLUMN_HEIGHT}`,
    };
  }, [xDomainPadding, width, dateFrom, dateTo]);

  if (!datum) {
    return null;
  }

  const [month, yearStr] = split(datum.monthYear, ' ') as [GqlMonth, string];
  const year = Number(yearStr);

  const handleClick = () => {
    if (ui !== 'ready') {
      return;
    }

    onClick({ month, year });
  };

  const handleHover = (event: object | null, isHovered: boolean) => {
    let params = {
      hoverIndex: -1
    };
    if (isHovered) {
      const windowWidth = window.innerWidth;
      const position = (windowWidth - event.clientX) < CHART_STYLE.tooltipWidth * 2 ? "left" : 'right';
      const scrollTop = document.scrollingElement.scrollTop;
      const scrollLeft = document.scrollingElement.scrollLeft;
      params = {
        top: `${event.clientY + scrollTop - 108}px`,
        left: position === 'right' ? `${event.clientX + scrollLeft + 18}px` : `${event.clientX + scrollLeft + 18 - CHART_STYLE.tooltipWidth * 1.5}px`,
        month,
        year,
        hoverIndex: index,
        position
      }
    }
    onHover(params);
  };

  if (datum?.isEmpty && showEmptyText) {
    return (
      <>
        <rect {...baseColumnProps} fill={TAILWIND_THEME.colors.gray[150]} fillOpacity={0.3} />
        <ChartText
          x={x - ZERO_INVOICES_TEXT_X_OFFSET}
          y={CHART_STYLE.xAxisHeight + ZERO_INVOICES_CONTAINER_OFFSET_Y + ZERO_INVOICES_TEXT_Y_OFFSET}
          fill={TAILWIND_THEME.colors.gray[450]}
          fontSize={CHART_FONT_SIZE.text4Xs}
        >
          0 Invoices
        </ChartText>
      </>
    );
  }

  return (
    <rect
      {...baseColumnProps}
      className={classes}
      onClick={handleClick}
      onMouseEnter={(e) => handleHover(e, true)}
      onMouseLeave={(e) => handleHover(e, false)}
      fill={TAILWIND_THEME.colors.gray[300]}
      fillOpacity={isHovered ? 0.15 : 0}
      data-testid="flnc-chart-month"
    />
  );
});
