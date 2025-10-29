import numeral from 'numeral';
import React, { useMemo, useRef } from 'react';
import { maxBy, minBy, filter } from 'lodash';
import { VictoryAxis, VictoryBar, VictoryChart, VictoryLine, VictoryPortal } from 'victory';
import { CHART_FONT_FAMILY, CHART_FONT_SIZE, CHART_STYLE } from '@client/chart';
import { TransactionDetailsByMonthType } from '@shared/transaction';
import { DASHBOARD_CHART_HEIGHT, DASHBOARD_CHART_MIN_WIDTH, TAILWIND_THEME, useGetWidth } from '@client/common';
import { DashboardChartDots, DashboardChartMonthYearLabels, DashboardChartRateLabels } from '@client/dashboard';

type Props = {
  transactionsByMonth: TransactionDetailsByMonthType[];
};

export const DashboardChart = ({ transactionsByMonth }: Props) => {
  const chartRef = useRef<HTMLDivElement>(null);
  // Chart width is set based on screen width, so that on large screens the width will grow as far as the screen, and on small screens the left edge
  // of the chart will disappear behind hidden overflow, and the height of the chart will always remain static.
  const width = useGetWidth(chartRef, DASHBOARD_CHART_MIN_WIDTH);

  const maxBought = useMemo(() => {
    return numeral(maxBy(transactionsByMonth, 'bought')?.bought || 0).value() || 0;
  }, [transactionsByMonth]);
  const minBought = 0;

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
    )?.averageDeliveryRate;

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

  const chartDomainPadding = { y: [10, 30] };
  const chartPadding = { top: 20, bottom: 10, left: CHART_STYLE.yAxisWidth, right: 30 };

  return (
    <div className="relative h-dashboard-chart">
      <div className="absolute right-0 min-w-dashboard-chart">
        <VictoryChart
          domain={{ y: [minBought, maxBought] }}
          domainPadding={chartDomainPadding as any}
          padding={chartPadding}
          width={width}
          height={DASHBOARD_CHART_HEIGHT}
          style={{ parent: { fontFamily: CHART_FONT_FAMILY } }}
        >
          <VictoryAxis
            dependentAxis
            orientation="left"
            style={{
              axisLabel: { fontSize: 0, padding: 0, stroke: TAILWIND_THEME.colors.transparent },
              tickLabels: {
                fill: TAILWIND_THEME.colors.gray[500],
                fontFamily: CHART_FONT_FAMILY,
                fontSize: CHART_FONT_SIZE.text3Xs,
                fontWeight: 400,
                stroke: TAILWIND_THEME.colors.transparent,
                padding: 20,
              },
              axis: { stroke: TAILWIND_THEME.colors.transparent },
            }}
          />
          <VictoryAxis
            orientation="bottom"
            style={{ axis: { stroke: 'transparent' } }}
            tickLabelComponent={
              <VictoryPortal>
                <DashboardChartMonthYearLabels />
              </VictoryPortal>
            }
          />

          {/* Bought amount bars */}
          <VictoryPortal>
            <VictoryBar
              data={filter(transactionsByMonth, ({ monthYear, bought }) => ({ monthYear, bought }))}
              x="monthYear"
              y="bought"
              barWidth={CHART_STYLE.barWidth}
              dataComponent={<DashboardChartDots />}
            />
          </VictoryPortal>
        </VictoryChart>
        <div ref={chartRef} className="bg-transparent absolute top-0 w-full">
          <VictoryChart
            domain={{ y: [minRate, maxRate] }}
            domainPadding={chartDomainPadding as any}
            padding={chartPadding}
            width={width}
            height={DASHBOARD_CHART_HEIGHT}
            style={{ parent: { fontFamily: CHART_FONT_FAMILY } }}
          >
            <VictoryAxis
              dependentAxis
              orientation="right"
              style={{
                axisLabel: { fontSize: 0, padding: 0, stroke: TAILWIND_THEME.colors.transparent },
                tickLabels: {
                  fill: TAILWIND_THEME.colors.gray[500],
                  fontFamily: CHART_FONT_FAMILY,
                  fontSize: CHART_FONT_SIZE.text3Xs,
                  fontWeight: 400,
                  stroke: TAILWIND_THEME.colors.transparent,
                },
                axis: { stroke: TAILWIND_THEME.colors.transparent },
              }}
              tickLabelComponent={
                <VictoryPortal>
                  <DashboardChartRateLabels />
                </VictoryPortal>
              }
            />
            {/* Delivery rate line */}
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

            {/* Market rate line */}
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
          </VictoryChart>
        </div>
      </div>
    </div>
  );
};
