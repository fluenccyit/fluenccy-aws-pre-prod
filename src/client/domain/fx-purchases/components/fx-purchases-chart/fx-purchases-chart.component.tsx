import React, { useState, memo, useMemo, useRef } from 'react';
import numeral from 'numeral';
import { filter, findIndex, indexOf, map, maxBy, minBy } from 'lodash';
import { differenceInCalendarMonths, endOfMonth, startOfMonth } from 'date-fns';
import { VictoryAxis, VictoryBar, VictoryChart, VictoryLine, VictoryPortal } from 'victory';
import { chartDateRangeVar, VictoryProps } from '@client/chart';
import { TransactionDetailsByMonthType } from '@shared/transaction';
import { MONTHS, useGetWidth, useAnalytics, TAILWIND_THEME } from '@client/common';
import { CHART_STYLE, ChartMonthColumn, ChartMonthYearType, chartService, ChartYAxisBorder, ChartYears } from '@client/chart';
import { useQueryLocalFxPurchases } from '@client/fx-purchases/graphql';
import { FxPurchasesChartDots, FxPurchasesChartTooltip } from '@client/fx-purchases';

type Props = {
  transactionsByMonth: TransactionDetailsByMonthType[];
  dateFrom: Date;
  dateTo: Date;
};

export const FxPurchasesChart = memo(({ transactionsByMonth, dateFrom, dateTo }: Props) => {
  const { track } = useAnalytics();
  const [hoverData, setHoverData] = useState({ hoverIndex: -1 });
  const chartRef = useRef<HTMLDivElement>(null);
  const width = useGetWidth(chartRef);
  const { showMarketRate, showFluenccyPerform } = useQueryLocalFxPurchases();

  const maxBoughtValue = useMemo(() => {
    const highestPerformance = maxBy(transactionsByMonth, 'bought');

    return numeral(highestPerformance?.bought || 0).value();
  }, [transactionsByMonth]);
  const minBoughtValue = 0;

  const maxRate = useMemo(() => {
    const highestDeliveryRate = maxBy(transactionsByMonth, 'averageDeliveryRate')?.averageDeliveryRate;
    const highestPerformDeliveryRate = maxBy(transactionsByMonth, 'performAverageDeliveryRate')?.performAverageDeliveryRate;
    const highestMarketRate = maxBy(transactionsByMonth, 'averageMarketRate')?.averageMarketRate;
    const highestOverall = maxBy([highestDeliveryRate, highestPerformDeliveryRate, highestMarketRate]);

    return highestOverall || 0;
  }, [transactionsByMonth]);

  const minRate = useMemo(() => {
    const lowestDeliveryRate = minBy(
      filter(transactionsByMonth, ({ averageDeliveryRate }) => Boolean(averageDeliveryRate)),
      'averageDeliveryRate'
    )?.averageDeliveryRate;
    const lowestPerformDeliveryRate = minBy(
      filter(transactionsByMonth, ({ performAverageDeliveryRate }) => Boolean(performAverageDeliveryRate)),
      'performAverageDeliveryRate'
    )?.performAverageDeliveryRate;
    const lowestMarketRate = minBy(
      filter(transactionsByMonth, ({ averageMarketRate }) => Boolean(averageMarketRate)),
      'averageMarketRate'
    )?.averageMarketRate;

    const allRates: number[] = [];

    if (lowestDeliveryRate) {
      allRates.push(lowestDeliveryRate);
    }

    if (lowestPerformDeliveryRate) {
      allRates.push(lowestPerformDeliveryRate);
    }

    if (lowestMarketRate) {
      allRates.push(lowestMarketRate);
    }

    return minBy(allRates) || 0;
  }, [transactionsByMonth]);

  const handleMonthClick = ({ year, month }: ChartMonthYearType) => {
    const date = new Date(year, indexOf(MONTHS, month) + 1, 0, 0, 0, 0, 0);
    const dateFrom = startOfMonth(date);
    const dateTo = endOfMonth(date);

    chartDateRangeVar({ month, year, dateFrom, dateTo });

    track('paymentvariance_date_select', { monthSelected: `[${month} ${year}]` });
  };

  const xDomainPadding = (width - CHART_STYLE.yAxisWidth) / (transactionsByMonth.length * 2);

  const handleRenderTooltip = () => {
    const { year: yearToCheck, month: monthToCheck, top, left, hoverIndex, position } = hoverData;

    if (hoverIndex !== -1) {
      const index = findIndex(transactionsByMonth, ({ month, year }) => month === monthToCheck && year === yearToCheck);
      const transaction = transactionsByMonth[index];
      const isOnLeft = index >= differenceInCalendarMonths(dateTo, dateFrom) - transactionsByMonth.length / 4;

      if (!transaction.bought) {
        return null;
      }
      return (
        <FxPurchasesChartTooltip isOnLeft={isOnLeft} transaction={transaction} top={top} left={left} position={position} />
      );
    }
  };

  return (
    <div className="h-chart">
      <div ref={chartRef} className="bg-white min-w-chart border-b border-r border-gray-200">
        <VictoryChart
          domain={{ y: [minRate, maxRate] }}
          {...chartService.getChartAttrs({ yDomainPadding: 50, xDomainPadding, width, isDoubleAxes: true })}
        >
          <VictoryAxis {...chartService.getYAxisAttrs({ domain: [minRate, maxRate], isRight: true })} />
          <ChartYAxisBorder />

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

          {/* Delivery line */}
          <VictoryPortal>
            <VictoryLine
              data={filter(transactionsByMonth, ({ averageDeliveryRate }) => averageDeliveryRate)}
              x="monthYear"
              y="averageDeliveryRate"
              style={{
                data: { stroke: TAILWIND_THEME.colors.blue[500], strokeWidth: 1 },
                labels: { display: 'none' },
              }}
            />
          </VictoryPortal>

          {/* Perform rate line */}
          {showFluenccyPerform && (
            <VictoryPortal>
              <VictoryLine
                data={filter(transactionsByMonth, ({ performAverageDeliveryRate }) => performAverageDeliveryRate)}
                x="monthYear"
                y="performAverageDeliveryRate"
                style={{
                  data: { stroke: TAILWIND_THEME.colors.green[500], strokeWidth: 1 },
                  labels: { display: 'none' },
                }}
              />
            </VictoryPortal>
          )}

          {/* Market line */}
          {showMarketRate && (
            <VictoryPortal>
              <VictoryLine
                data={filter(transactionsByMonth, ({ averageMarketRate }) => averageMarketRate)}
                x="monthYear"
                y="averageMarketRate"
                style={{
                  data: { stroke: TAILWIND_THEME.colors.red[500], strokeWidth: 1 },
                  labels: { display: 'none' },
                }}
              />
            </VictoryPortal>
          )}
        </VictoryChart>
      </div>
      <div ref={chartRef} className="bg-transparent min-w-chart relative bottom-full">
        <VictoryChart {...chartService.getChartAttrs({ yDomainPadding: 50, xDomainPadding, width, isDoubleAxes: true })}>
          <ChartYears dateFrom={dateFrom} dateTo={dateTo} isChartDoubleAxes={true} />
          <VictoryAxis {...chartService.getYAxisAttrs({ domain: [minBoughtValue, maxBoughtValue] })} />
          <ChartYAxisBorder />
          <VictoryAxis {...chartService.getXAxisAttrs({ hoverIndex: hoverData.hoverIndex })} />

          {/* Bought amount bars */}
          <VictoryPortal>
            <VictoryBar
              data={filter(transactionsByMonth, ({ monthYear, bought }) => ({ monthYear, bought }))}
              x="monthYear"
              y="bought"
              barWidth={CHART_STYLE.barWidth}
              dataComponent={<FxPurchasesChartDots hoverIndex={hoverData.hoverIndex} />}
            />
          </VictoryPortal>

          {/* Month columns */}
          <VictoryBar
            data={map(transactionsByMonth, ({ monthYear, bought }) => ({
              monthYear,
              isEmpty: !bought,
              y: maxBoughtValue,
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
                isDoubleAxes={true}
              />
            }
          />
        </VictoryChart>
      </div>
      {handleRenderTooltip()}
    </div>
  );
});
