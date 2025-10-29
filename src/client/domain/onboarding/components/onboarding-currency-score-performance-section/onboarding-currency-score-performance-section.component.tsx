import React, { memo, useMemo } from 'react';
import { GqlCurrencyScoreBreakdown } from '@graphql';
import { currencyScoreService } from '@client/currency-score';
import { CompleteOnboardingButton } from '@client/onboarding';
import { CardContent, NumberAnimation, ProgressWheel, TAILWIND_SCREEN_XL, Text, useWindowWidth } from '@client/common';
import { CURRENCY_SCORE_ALLOCATION, CURRENCY_SCORE_OVERALL_PERFORMANCE_LIMIT } from '@shared/currency-score';

type Props = {
  breakdown: GqlCurrencyScoreBreakdown;
};

export const OnboardingCurrencyScorePerformanceSection = memo(({ breakdown }: Props) => {
  const { currencyScore } = breakdown;
  const { windowWidth } = useWindowWidth();
  const progressWheelSize = useMemo(() => (windowWidth >= TAILWIND_SCREEN_XL ? 'xl' : 'lg'), [windowWidth]);
  const { variant, label } = currencyScoreService.getPerformanceConfig(currencyScore, CURRENCY_SCORE_OVERALL_PERFORMANCE_LIMIT);

  return (
    <CardContent className="border-r-0 border-gray-200 w-full py-6 px-8 lg:border-r lg:w-1/2 lg:py-12 lg:py-16 lg:px-16">
      <div className="flex justify-center w-full lg:justify-start lg:items-start">
        <Text className="text-3xl font-serif sm:text-4xl" isBlock>
          Currency Score
        </Text>
        <Text className="text-base">&trade;</Text>
      </div>
      <Text className="mt-2 text-center lg:text-left" variant="gray" isBlock>
        Your currency performance, simplified
      </Text>
      <div className="flex items-center">
        <ProgressWheel
          className="my-8 mx-auto lg:mb-0 lg:mt-16"
          completed={currencyScore}
          total={CURRENCY_SCORE_ALLOCATION.total}
          variant={variant}
          size={progressWheelSize}
        >
          <Text className="text-center text-sm xl:text-lg" isBlock>
            Your currency score is
          </Text>
          <Text className="font-mono text-center text-4xl tracking-tight mt-1 xl:text-6xl" isBlock>
            <NumberAnimation value={currencyScore} />/{currencyScore ? CURRENCY_SCORE_ALLOCATION.total : 0}
          </Text>
          <Text className="text-center text-sm mt-4 xl:text-lg xl:mt-10" isBlock>
            Performance
          </Text>
          <Text className="text-center text-2xl mt-1 xl:text-3xl" isBlock>
            {currencyScore ? label : '–'}
          </Text>
        </ProgressWheel>
      </div>

      <Text className="hidden text-center text-sm mt-10 lg:block" variant="gray" isBlock>
        *Industry benchmark 550
      </Text>

      {/* Mobile */}
      <div className="flex flex-col items-center justify-center lg:hidden">
        <CompleteOnboardingButton currencyScore={currencyScore} />
      </div>
    </CardContent>
  );
});
