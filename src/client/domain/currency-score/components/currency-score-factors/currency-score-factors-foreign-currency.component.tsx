import React, { memo } from 'react';
import { GqlCurrencyScoreBreakdown } from '@graphql';
import { useQueryLocalOrganisation } from '@client/organisation';
import { useQueryLocalCurrencyScore } from '@client/currency-score';
import { Badge, CardSeparator, NumberAnimation, Text, utilService } from '@client/common';

type Props = {
  breakdown: GqlCurrencyScoreBreakdown;
};

export const CurrencyScoreFactorsForeignCurrency = memo(({ breakdown }: Props) => {
  const { organisation } = useQueryLocalOrganisation();
  const { isCurrencyScorePlanActive } = useQueryLocalCurrencyScore();

  if (!organisation) {
    return null;
  }

  const gainLoss = isCurrencyScorePlanActive ? breakdown.performDeliveryGainLoss : breakdown.deliveryGainLoss;

  return (
    <div className="pt-8 pb-8 px-4 w-full xl:max-w-lg xl:ml-11 xl:pt-0 xl:px-0">
      <div className="flex items-center justify-between">
        <Text className="text-sm">Gain/Loss</Text>
        <Badge className="text-sm" variant={gainLoss < 0 ? 'danger' : 'success'}>
          <NumberAnimation
            value={gainLoss}
            format={(value) => utilService.formatCurrencyAmount(value, organisation.currency)}
            isAnimatedInitially={false}
          />
        </Badge>
      </div>
      <CardSeparator />
      <div className="flex items-center justify-between">
        <Text className="text-sm">Fees</Text>
        <Badge className="text-sm" variant="success" state="solid">
          Coming soon
        </Badge>
      </div>
    </div>
  );
});
