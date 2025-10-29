import React, { useState, memo, useMemo, useRef } from 'react';
import numeral from 'numeral';
import { filter, findIndex, indexOf, map, maxBy } from 'lodash';
import { differenceInCalendarMonths, endOfMonth, startOfMonth } from 'date-fns';
import { VictoryBar, VictoryLine, VictoryChart, VictoryAxis, VictoryPortal } from 'victory';
import { chartDateRangeVar } from '@client/chart';
import { TransactionDetailsByMonthType } from '@shared/transaction';
import { VarianceChartDots, VarianceChartTooltip } from '@client/variance';
import { MONTHS, TAILWIND_THEME, useGetWidth, useAnalytics } from '@client/common';
import { CHART_STYLE, ChartMonthColumn, ChartMonthYearType, chartService, ChartYAxisBorder, ChartYears, VictoryProps } from '@client/chart';

type Props = {
  transactionsByMonth: TransactionDetailsByMonthType[];
  dateFrom: Date;
  dateTo: Date;
  mode: String | null;
};

export const VarianceChart = memo(({ transactionsByMonth, dateFrom, dateTo, mode }: Props) => {
  const { track } = useAnalytics();
  const [hoverData, setHoverData] = useState({ hoverIndex: -1 });
  const chartRef = useRef<HTMLDivElement>(null);
  const width = useGetWidth(chartRef);

  const maxValue = useMemo(() => {
    const highestCost = maxBy(transactionsByMonth, 'maxCost');

    return numeral(highestCost?.maxCost || 0).value();
  }, [transactionsByMonth]);

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

      return <VarianceChartTooltip isOnLeft={isOnLeft} transaction={transaction} top={top} left={left} position={position} mode={mode} />;
    }
  };

  const xDomainPadding = (width - CHART_STYLE.yAxisWidth) / (transactionsByMonth.length * 2);

  return (
    <div ref={chartRef} className="bg-white min-w-chart border-b border-r border-gray-200">
      <VictoryChart {...chartService.getChartAttrs({ yDomainPadding: 50, xDomainPadding, width })}>
        <ChartYears dateFrom={dateFrom} dateTo={dateTo} />
        <VictoryAxis {...chartService.getYAxisAttrs({ domain: [0, maxValue] })} />
        <ChartYAxisBorder />
        <VictoryAxis {...chartService.getXAxisAttrs({ hoverIndex: hoverData.hoverIndex })} />

        {/* We need an invisible line chart that fills the whole chart, so we can render the partial line chart
          immediately afterwards */}
        <VictoryLine
          data={transactionsByMonth}
          x="monthYear"
          y="deliveryCost"
          style={{
            data: { display: 'none' },
            labels: { display: 'none' },
          }}
        />

        {/* Delivery cost */}
        <VictoryPortal>
          <VictoryLine
            data={filter(transactionsByMonth, ({ deliveryCost }) => deliveryCost)}
            x="monthYear"
            y="deliveryCost"
            style={{
              data: { stroke: TAILWIND_THEME.colors.gray[450], strokeWidth: 1 },
              labels: { display: 'none' },
            }}
          />
        </VictoryPortal>

        {/* Variance dots */}
        <VictoryPortal>
          <VictoryBar
            data={transactionsByMonth}
            x="monthYear"
            y="deliveryCost"
            barWidth={CHART_STYLE.barWidth}
            dataComponent={<VarianceChartDots hoverIndex={hoverData.hoverIndex} transactionsByMonth={transactionsByMonth} mode={mode} />}
          />
        </VictoryPortal>

        {/* Month columns */}
        <VictoryBar
          data={map(transactionsByMonth, ({ monthYear, deliveryCost }) => ({
            monthYear,
            isEmpty: !deliveryCost,
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
