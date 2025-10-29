import React, { memo, useRef } from 'react';
import { add, format } from 'date-fns';
import { last, map, max, min, find, forEach } from 'lodash';
import { VictoryAxis, VictoryChart, VictoryArea, VictoryBar, VictoryContainer } from 'victory';
import { GqlCurrencyScoreBreakdown } from '@graphql';
import { SHARED_DATE_TIME_FORMAT } from '@shared/common';
import { ChartAreaGradientReference, chartService, CHART_AREA_GRADIENT_FILL, CHART_FONT_FAMILY, CHART_FONT_SIZE } from '@client/chart';
import {
  CURRENCY_SCORE_CHART_HEIGHT,
  CURRENCY_SCORE_CHART_MOBILE_HEIGHT,
  TAILWIND_SCREEN_LG,
  TAILWIND_SCREEN_MD,
  TAILWIND_THEME,
  useGetWidth,
  useWindowWidth,
} from '@client/common';
import {
  useQueryLocalCurrencyScore,
  CurrencyScoreXAxisTickLabels,
  CurrencyScoreChartCurrentMonth,
  CURRENCY_SCORE_CHART_STYLE,
} from '@client/currency-score';

type Props = {
  currencyScores: GqlCurrencyScoreBreakdown[];
};

export const CurrencyScoreChart = memo(({ currencyScores = [] }: Props) => {
  const { windowWidth } = useWindowWidth();
  const { isCurrencyScorePlanActive } = useQueryLocalCurrencyScore();
  const chartRef = useRef<HTMLDivElement>(null);
  // Chart width is set based on screen width, so that on large screens the width will grow as far as the screen, and on small screens the left edge
  // of the chart will disappear behind hidden overflow, and the height of the chart will always remain static.
  const width = useGetWidth(chartRef, CURRENCY_SCORE_CHART_STYLE.minWidth);
  const isMobile = windowWidth < TAILWIND_SCREEN_LG;
  const mappedCurrencyScores = map(currencyScores, ({ month, year, ...rest }) => ({ ...rest, monthYear: `${month} ${year}` }));
  const lastCurrencyScore = last(mappedCurrencyScores) as typeof mappedCurrencyScores[number];
  const lastDate = add(new Date(lastCurrencyScore.date), { months: 1 });
  const lastMonth = format(lastDate, SHARED_DATE_TIME_FORMAT.month);
  const lastYear = format(lastDate, SHARED_DATE_TIME_FORMAT.year);
  const finalEntries = [lastCurrencyScore, { ...lastCurrencyScore, date: lastDate, monthYear: `${lastMonth} ${lastYear}` }];

  // If there is a currency score of 0, then we want to be able to set the min value to 0, as this is a value that actually exists in the set. However
  // if there is no currency score of 0, then we will set the min value to the lowest currency score that exists.
  const hasZero = Boolean(find(mappedCurrencyScores, ({ currencyScore, benchmarkCurrencyScore }) => !currencyScore || !benchmarkCurrencyScore));
  let maxValue = 0;
  let minValue = 0;
  forEach(mappedCurrencyScores, ({ currencyScore, benchmarkCurrencyScore }) => {
    maxValue = max([maxValue, currencyScore, benchmarkCurrencyScore]) as number;

    if (!hasZero) {
      minValue = minValue
        ? (min([minValue, currencyScore, benchmarkCurrencyScore]) as number)
        : (min([currencyScore, benchmarkCurrencyScore]) as number);
    }
  });

  return (
    <div ref={chartRef} className="relative h-currency-score-chart-mobile lg:h-currency-score-chart">
      <div className="absolute right-0">
        <VictoryChart
          containerComponent={<VictoryContainer responsive={false} />}
          domain={{ y: [minValue, maxValue] }}
          domainPadding={{
            x: [CURRENCY_SCORE_CHART_STYLE.domainPaddingLeft, 0],
          }}
          padding={{
            top: CURRENCY_SCORE_CHART_STYLE.paddingTop,
            right: isMobile ? 0 : CURRENCY_SCORE_CHART_STYLE.paddingRight,
            bottom: CURRENCY_SCORE_CHART_STYLE.paddingBottom,
            left: CURRENCY_SCORE_CHART_STYLE.paddingLeft,
          }}
          height={isMobile ? CURRENCY_SCORE_CHART_MOBILE_HEIGHT : CURRENCY_SCORE_CHART_HEIGHT}
          width={width}
          style={{ parent: { fontFamily: CHART_FONT_FAMILY } }}
        >
          <VictoryAxis {...chartService.getYAxisAttrs({ domain: [minValue, maxValue], isGrid: windowWidth > TAILWIND_SCREEN_MD })} />
          <VictoryAxis
            orientation="bottom"
            tickLabelComponent={<CurrencyScoreXAxisTickLabels />}
            style={{
              axis: { stroke: 'transparent' },
              tickLabels: {
                fill: TAILWIND_THEME.colors.gray[500],
                fontSize: CHART_FONT_SIZE.text3Xs,
                fontFamily: CHART_FONT_FAMILY,
              },
            }}
          />

          {/* Green area chart */}
          <VictoryArea
            data={mappedCurrencyScores}
            x="monthYear"
            y={isCurrencyScorePlanActive ? 'benchmarkCurrencyScore' : 'currencyScore'}
            style={{
              data: {
                stroke: isCurrencyScorePlanActive ? TAILWIND_THEME.colors.green[500] : TAILWIND_THEME.colors.transparent,
                fill: isCurrencyScorePlanActive ? CHART_AREA_GRADIENT_FILL.green : TAILWIND_THEME.colors.transparent,
                strokeWidth: 1,
              },
              labels: { display: 'none' },
            }}
            animate={{
              duration: 400,
              onLoad: { duration: 0 },
              easing: 'cubicInOut',
            }}
          />

          {/* Final entries for green dashed area chart */}
          <VictoryArea
            data={finalEntries}
            x="monthYear"
            y={isCurrencyScorePlanActive ? 'benchmarkCurrencyScore' : 'currencyScore'}
            style={{
              data: {
                stroke: isCurrencyScorePlanActive ? TAILWIND_THEME.colors.green[500] : TAILWIND_THEME.colors.transparent,
                fill: isCurrencyScorePlanActive ? CHART_AREA_GRADIENT_FILL.green : TAILWIND_THEME.colors.transparent,
                strokeWidth: 1,
                strokeDasharray: '3,3',
              },
              labels: { display: 'none' },
            }}
            animate={{
              duration: 400,
              onLoad: { duration: 0 },
              easing: 'cubicInOut',
            }}
          />

          {/* Green current month indicator */}
          <VictoryBar
            data={mappedCurrencyScores}
            x="monthYear"
            y={isCurrencyScorePlanActive ? 'benchmarkCurrencyScore' : 'currencyScore'}
            dataComponent={<CurrencyScoreChartCurrentMonth width={width} />}
            style={{
              data: {
                stroke: 'transparent',
                strokeWidth: 0,
                fill: 'transparent',
              },
            }}
          />

          {/* Orange area chart */}
          <VictoryArea
            data={mappedCurrencyScores}
            x="monthYear"
            y="currencyScore"
            style={{
              data: {
                stroke: TAILWIND_THEME.colors.orange[500],
                fill: CHART_AREA_GRADIENT_FILL.orange,
                strokeWidth: 1,
              },
            }}
          />

          {/* Final entries for orange dashed area chart */}
          <VictoryArea
            data={finalEntries}
            x="monthYear"
            y="currencyScore"
            style={{
              data: {
                stroke: TAILWIND_THEME.colors.orange[500],
                fill: CHART_AREA_GRADIENT_FILL.orange,
                strokeWidth: 1,
                strokeDasharray: '3,3',
              },
              labels: { display: 'none' },
            }}
          />

          {/* Orange current month indicator */}
          <VictoryBar
            data={mappedCurrencyScores}
            x="monthYear"
            y="currencyScore"
            dataComponent={<CurrencyScoreChartCurrentMonth width={width} isCurrentScore />}
            style={{
              data: {
                stroke: 'transparent',
                strokeWidth: 0,
                fill: 'transparent',
              },
            }}
          />
        </VictoryChart>
      </div>

      <ChartAreaGradientReference />
    </div>
  );
});
