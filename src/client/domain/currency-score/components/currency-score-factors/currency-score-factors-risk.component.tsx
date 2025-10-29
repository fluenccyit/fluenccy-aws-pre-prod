import React, { memo } from 'react';
import { GqlCurrencyScoreBreakdown } from '@graphql';
import { useQueryLocalOrganisation } from '@client/organisation';
import { useQueryLocalCurrencyScore } from '@client/currency-score';
import { CardSeparator, NumberAnimation, Text, utilService } from '@client/common';

type Props = {
  breakdown: GqlCurrencyScoreBreakdown;
};

export const CurrencyScoreFactorsRisk = memo(({ breakdown }: Props) => {
  const { organisation } = useQueryLocalOrganisation();
  const { isCurrencyScorePlanActive } = useQueryLocalCurrencyScore();

  if (!organisation) {
    return null;
  }

  const pastRisk = isCurrencyScorePlanActive ? breakdown.performDeliveryProfitImpact : breakdown.deliveryProfitImpact;
  const presentRisk = isCurrencyScorePlanActive ? breakdown.performMarketProfitImpact : breakdown.marketProfitImpact;

  return (
    <div className="py-8 px-4 w-full xl:max-w-lg xl:ml-11 xl:py-0 xl:px-0">
      <div className="flex items-center justify-between">
        <Text className="text-sm">Past Risk</Text>
        <Text className="text-sm">
          <NumberAnimation
            value={pastRisk}
            format={(value) => utilService.formatCurrencyAmount(value, organisation.currency)}
            isAnimatedInitially={false}
          />
        </Text>
      </div>
      <CardSeparator />
      <div className="flex items-center justify-between">
        <Text className="text-sm">Present Risk</Text>
        <Text className="text-sm">
          <NumberAnimation
            value={presentRisk}
            format={(value) => utilService.formatCurrencyAmount(value, organisation.currency)}
            isAnimatedInitially={false}
          />
        </Text>
      </div>
    </div>
  );
});
