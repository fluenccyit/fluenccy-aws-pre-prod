import React, { Fragment, memo, useMemo } from 'react';
import { groupBy, map } from 'lodash';
import { add, differenceInCalendarMonths, format, toDate } from 'date-fns';
import { GqlMonth } from '@graphql';
import { TAILWIND_THEME } from '@client/common';
import { SHARED_DATE_TIME_FORMAT } from '@shared/common';
import { CHART_FONT_SIZE, ChartText, CHART_STYLE, VictoryProps } from '@client/chart';

type Props = VictoryProps & {
  dateFrom: Date;
  dateTo: Date;
  isChartDoubleAxes?: boolean;
};

type ColumnType = {
  month: GqlMonth;
  year: number;
};

const TEXT_X_OFFSET = 12;
const TEXT_Y = CHART_STYLE.xAxisHeight / 2 + CHART_FONT_SIZE.textSm / 2 - CHART_STYLE.borderWidth;

export const ChartYears = memo(({ width = 0, dateFrom, dateTo, isChartDoubleAxes }: Props) => {
  const yAxisWidth = isChartDoubleAxes ? CHART_STYLE.yAxisWidth * 2 : CHART_STYLE.yAxisWidth;
  const chartWidth = width - yAxisWidth - CHART_STYLE.borderWidth;
  const numberOfMonths = useMemo(() => differenceInCalendarMonths(dateTo, dateFrom), [dateFrom, dateTo]);
  const monthWidth = useMemo(() => chartWidth / numberOfMonths, [chartWidth, numberOfMonths]);
  const groupedColumns = useMemo(() => {
    const columns: ColumnType[] = [];
    let date = toDate(dateFrom);

    for (let i = numberOfMonths; i > 0; i -= 1) {
      columns.push({
        month: format(date, SHARED_DATE_TIME_FORMAT.month) as GqlMonth,
        year: Number(format(date, SHARED_DATE_TIME_FORMAT.year)),
      });

      date = add(date, { months: 1 });
    }

    return groupBy(columns, ({ year }) => year);
  }, [dateFrom, dateTo, numberOfMonths]);

  const renderContent = () => {
    let cumulativeWidth = CHART_STYLE.yAxisWidth;

    return (
      <>
        {map(groupedColumns, (months, year) => {
          const yearWidth = monthWidth * months.length;
          const x = cumulativeWidth + yearWidth / 2 - TEXT_X_OFFSET;
          cumulativeWidth += yearWidth;

          return (
            <Fragment key={year}>
              {/* Border right of year column */}
              <line
                x1={cumulativeWidth + CHART_STYLE.borderWidth}
                x2={cumulativeWidth + CHART_STYLE.borderWidth}
                y1={1.75}
                y2={CHART_STYLE.xAxisHeight}
                stroke={TAILWIND_THEME.colors.gray[200]}
                fill={TAILWIND_THEME.colors.gray[200]}
              />
              {/* Year label */}
              <ChartText x={x} y={TEXT_Y} fontSize={CHART_FONT_SIZE.textSm} fontWeight="bold">
                {year}
              </ChartText>
            </Fragment>
          );
        })}
      </>
    );
  };

  return (
    <g data-testid="flnc-chart-years">
      {/* Border bottom */}
      <line
        x1={CHART_STYLE.yAxisWidth}
        x2={width}
        y1={CHART_STYLE.xAxisHeight}
        y2={CHART_STYLE.xAxisHeight}
        stroke={TAILWIND_THEME.colors.gray[200]}
        fill="transparent"
      />
      {renderContent()}
    </g>
  );
});
