import React, { useState, memo, useMemo, useRef } from 'react';
import numeral from 'numeral';
import { filter, findIndex, indexOf, map, maxBy, minBy } from 'lodash';
import { differenceInCalendarMonths, endOfMonth, startOfMonth } from 'date-fns';
import { VictoryAxis, VictoryBar, VictoryChart, VictoryLine, VictoryPortal } from 'victory';
import { chartDateRangeVar, useQueryLocalChart } from '@client/chart';
import { TransactionDetailsByMonthType } from '@shared/transaction';
import { MONTHS, TAILWIND_THEME, useGetWidth, useAnalytics } from '@client/common';
import { PerformanceChartTooltip, PerformanceChartDots } from '@client/performance';
import { CHART_STYLE, ChartMonthColumn, ChartMonthYearType, chartService, ChartYAxisBorder, ChartYears, VictoryProps } from '@client/chart';

type Props = {
  transactionsByMonth: TransactionDetailsByMonthType[];
  dateFrom: Date;
  dateTo: Date;
};

export const PerformanceChart = memo(({ transactionsByMonth, dateFrom, dateTo, }: Props) => {
  const { track } = useAnalytics();
  const { isChartPerformEnabled } = useQueryLocalChart();
  const [hoverData, setHoverData] = useState({ hoverIndex: -1 });
  const chartRef = useRef<HTMLDivElement>(null);
  const width = useGetWidth(chartRef);
  const maxValue = useMemo(() => {
    const highestPerformance = maxBy(transactionsByMonth, 'potentialGain');

    return numeral(highestPerformance?.potentialGain || 0).value() || 0;
  }, [performance]);

  const minValue = useMemo(() => {
    const lowestPerformance = minBy(transactionsByMonth, 'potentialLoss');

    return numeral(lowestPerformance?.potentialLoss || 0).value() || 0;
  }, [performance]);

  const handleMonthClick = ({ year, month }: ChartMonthYearType) => {
    const date = new Date(year, indexOf(MONTHS, month) + 1, 0, 0, 0, 0, 0);
    const dateFrom = startOfMonth(date);
    const dateTo = endOfMonth(date);

    chartDateRangeVar({ month, year, dateFrom, dateTo });

    track('paymentvariance_date_select', { monthSelected: `[${month} ${year}]` });
  };

  const handleRenderTooltip = () => {
    const { year: yearToCheck, month: monthToCheck, top, left, hoverIndex, position } = hoverData;
    if (hoverIndex !== -1) {
      const index = findIndex(transactionsByMonth, ({ month, year }) => month === monthToCheck && year === yearToCheck);
      const transaction = transactionsByMonth[index];
      const isOnLeft = index >= differenceInCalendarMonths(dateTo, dateFrom) - transactionsByMonth.length / 4;

      if (transaction) {
        return (
          <PerformanceChartTooltip transaction={transaction} isOnLeft={isOnLeft} top={top} left={left} position={position}/>
        );
      }
    }
  };

  const xDomainPadding = (width - CHART_STYLE.yAxisWidth) / (transactionsByMonth.length * 2);

  return (
    <div ref={chartRef} className="bg-white min-w-chart border-b border-r border-gray-200">
      <VictoryChart {...chartService.getChartAttrs({ yDomainPadding: 50, xDomainPadding, width })}>
        <ChartYears dateFrom={dateFrom} dateTo={dateTo} />
        <VictoryAxis {...chartService.getYAxisAttrs({ domain: {y: [minValue, maxValue]} })} />
        <ChartYAxisBorder />
        <VictoryAxis {...chartService.getXAxisAttrs({ hoverIndex: hoverData.hoverIndex })} />

        {/* Variance dots */}
        <VictoryPortal>
          <VictoryBar
            data={transactionsByMonth}
            x="monthYear"
            y="deliveryGainLoss"
            barWidth={CHART_STYLE.barWidth}
            dataComponent={<PerformanceChartDots hoverIndex={hoverData.hoverIndex} />}
          />
        </VictoryPortal>

        {/* Zero line */}
        <VictoryPortal>
          <VictoryLine
            data={map(transactionsByMonth, ({ monthYear }) => ({ monthYear, y: 0 }))}
            x="monthYear"
            style={{
              data: { stroke: TAILWIND_THEME.colors.orange[500], strokeWidth: 1, strokeDasharray: '5,5' },
              labels: { display: 'none' },
            }}
          />
        </VictoryPortal>

        {/* Delivery gain & loss line */}
        <VictoryPortal>
          <VictoryLine
            data={filter(transactionsByMonth, ({ deliveryGainLoss }) => deliveryGainLoss)}
            x="monthYear"
            y="deliveryGainLoss"
            style={{
              data: { stroke: TAILWIND_THEME.colors.blue[500], strokeWidth: 1 },
              labels: { display: 'none' },
            }}
          />
        </VictoryPortal>

        {/* Perform gain & loss line */}
        {isChartPerformEnabled && (
          <VictoryPortal>
            <VictoryLine
              data={filter(transactionsByMonth, ({ performDeliveryGainLoss }) => performDeliveryGainLoss)}
              x="monthYear"
              y="performDeliveryGainLoss"
              style={{
                data: { stroke: TAILWIND_THEME.colors.green[500], strokeWidth: 1 },
                labels: { display: 'none' },
              }}
            />
          </VictoryPortal>
        )}

        {/* Month columns */}
        <VictoryBar
          data={map(transactionsByMonth, ({ monthYear, deliveryGainLoss }) => ({
            monthYear,
            isEmpty: !deliveryGainLoss,
            y: maxValue,
          }))}
          x="monthYear"
          dataComponent={
            <ChartMonthColumn
              xDomainPadding={xDomainPadding}
              dateFrom={dateFrom}
              dateTo={dateTo}
              onClick={handleMonthClick}
              onHover={(params) => setHoverData(params)}
              renderTooltip={handleRenderTooltip}
            />
          }
        />
      </VictoryChart>
      {handleRenderTooltip()}
    </div>
  );
});
