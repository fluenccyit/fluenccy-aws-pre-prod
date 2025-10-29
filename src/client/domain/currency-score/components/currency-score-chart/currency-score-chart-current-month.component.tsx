import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { VictoryPortal } from 'victory';
import { GqlCurrencyScoreBreakdown } from '@graphql';
import { CHART_STYLE, VictoryProps } from '@client/chart';
import { CURRENCY_SCORE_CHART_STYLE, CurrencyScoreChartTooltip, useQueryLocalCurrencyScore } from '@client/currency-score';
import { CURRENCY_SCORE_CHART_HEIGHT, CURRENCY_SCORE_CHART_MOBILE_HEIGHT, TAILWIND_SCREEN_LG, TAILWIND_THEME, useWindowWidth } from '@client/common';

type Props = VictoryProps<GqlCurrencyScoreBreakdown> & {
  width: number;
  isCurrentScore?: boolean;
};

const TOOLTIP_WIDTH = 90;
const TOOLTIP_HEIGHT = 40;

export const CurrencyScoreChartCurrentMonth = memo(({ index, datum, x, y, scale, data, isCurrentScore }: Props) => {
  const { windowWidth } = useWindowWidth();
  const { isCurrencyScorePlanActive } = useQueryLocalCurrencyScore();

  if (!scale || !datum || !x || !y || !data || index !== data.length - 1) {
    return null;
  }

  const isMobile = windowWidth < TAILWIND_SCREEN_LG;
  const chartHeight = isMobile ? CURRENCY_SCORE_CHART_MOBILE_HEIGHT : CURRENCY_SCORE_CHART_HEIGHT;
  const { currencyScore, benchmarkCurrencyScore } = datum;

  const tooltipY = y - TOOLTIP_HEIGHT;
  const solidColour = isCurrentScore ? TAILWIND_THEME.colors.orange[500] : TAILWIND_THEME.colors.green[500];

  return (
    <>
      {isCurrentScore && (
        <line
          y1={isMobile ? 5 : CURRENCY_SCORE_CHART_STYLE.paddingTop}
          y2={chartHeight - CURRENCY_SCORE_CHART_STYLE.paddingBottom}
          x1={x}
          x2={x}
          stroke={solidColour}
          strokeWidth={1}
          fill="transparent"
        />
      )}

      <VictoryPortal>
        <motion.circle
          r={CHART_STYLE.borderRadiusL}
          fill={TAILWIND_THEME.colors.white}
          animate={{ cy: y, cx: x }}
          transition={{ delay: 0.04, ease: 'easeIn', duration: 0.25 }}
        />
      </VictoryPortal>
      <VictoryPortal>
        <motion.circle
          r={CHART_STYLE.outerDotSize}
          fill={solidColour}
          animate={{ cy: y, cx: x }}
          transition={{ delay: 0.04, ease: 'easeIn', duration: 0.25 }}
        />
      </VictoryPortal>

      <VictoryPortal>
        {isCurrentScore ? (
          <foreignObject x={x - TOOLTIP_WIDTH / 2} y={tooltipY} width={TOOLTIP_WIDTH} height={TOOLTIP_HEIGHT}>
            <CurrencyScoreChartTooltip currencyScore={currencyScore} />
          </foreignObject>
        ) : (
          <motion.foreignObject
            x={x - TOOLTIP_WIDTH / 2}
            width={TOOLTIP_WIDTH}
            height={TOOLTIP_HEIGHT}
            animate={{ y: tooltipY, opacity: isCurrencyScorePlanActive ? 0.75 : 0 }}
            transition={{ delay: 0.04, ease: 'easeIn', duration: 0.25 }}
          >
            <CurrencyScoreChartTooltip currencyScore={benchmarkCurrencyScore} />
          </motion.foreignObject>
        )}
      </VictoryPortal>
    </>
  );
});
