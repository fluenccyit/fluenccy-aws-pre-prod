import React, { memo } from 'react';
import { round } from 'lodash';
import { currencyScoreService } from '@client/currency-score';
import { CurrencyScorePerformanceLimitMapType } from '@shared/currency-score';
import { NumberAnimation, ProgressWheel, TAILWIND_SCREEN_XL, Text, useWindowWidth } from '@client/common';

type Props = {
  heading: string;
  score: number;
  allocation: number;
  limitMap?: CurrencyScorePerformanceLimitMapType;
};

export const CurrencyScoreFactorsProgressWheel = memo(({ heading, score, allocation, limitMap }: Props) => {
  const { windowWidth } = useWindowWidth();
  const performanceConfig = limitMap && currencyScoreService.getPerformanceConfig(score, limitMap);
  const percentage = limitMap ? round((score / allocation) * 100) : null;
  const isXlScreen = windowWidth >= TAILWIND_SCREEN_XL;

  return (
    <div className="flex items-center px-4 xl:items-start">
      <ProgressWheel total={allocation} completed={score} variant={performanceConfig?.variant} size={isXlScreen ? 'sm' : 'xs'}>
        {!isXlScreen && <>{percentage ? <NumberAnimation value={percentage} format={(x) => `${round(x)}%`} /> : '–'}</>}
        {isXlScreen && performanceConfig && (
          <>
            <Text className="text-4xl text-center" isBlock>
              {percentage ? <NumberAnimation value={percentage} format={(x) => `${round(x)}%`} /> : '–'}
            </Text>
            <Text className="text-center" isBlock>
              {performanceConfig.label}
            </Text>
          </>
        )}
      </ProgressWheel>
      {!isXlScreen && (
        <div className="ml-4">
          <Text isBlock>{heading}</Text>
          {performanceConfig && (
            <Text className="text-sm" variant={performanceConfig.variant} isBlock>
              {performanceConfig.label}
            </Text>
          )}
        </div>
      )}
    </div>
  );
});
