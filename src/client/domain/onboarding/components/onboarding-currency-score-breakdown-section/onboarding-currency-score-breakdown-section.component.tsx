import React, { memo } from 'react';
import { GqlCurrencyScoreBreakdown } from '@graphql';
import { CompleteOnboardingButton } from '@client/onboarding';
import { useQueryLocalOrganisation } from '@client/organisation';
import { CardContent, CardSeparator, NumberAnimation, Text, utilService } from '@client/common';
import { useIsMarkupVisible } from '@client/currency-score';

type Props = {
  breakdown: GqlCurrencyScoreBreakdown;
};

export const OnboardingCurrencyScoreBreakdownSection = memo(({ breakdown }: Props) => {
  const { currencyScore, fxCost, marketProfitImpact, performDeliveryGainLoss } = breakdown;
  const isMarkupVisible = useIsMarkupVisible();
  const { organisation } = useQueryLocalOrganisation();

  if (!organisation) {
    return null;
  }

  const { currency } = organisation;

  return (
    <CardContent className="flex flex-col justify-end w-full lg:w-1/2 py-6 px-8 lg:py-16 lg:px-16">
      <div className="flex items-end mb-4 lg:mb-10">
        <Text className="text-sm uppercase" variant="gray">
          Your factors
        </Text>
        <Text className="text-sm ml-2" variant="gray">
          Last 12 months
        </Text>
      </div>

      {isMarkupVisible && (
        <>
          <div className="flex justify-between">
            <Text className="text-xl">Markup</Text>
            <Text className="text-xl ml-4 whitespace-nowrap">
              {currencyScore ? <NumberAnimation value={fxCost} format={(x) => utilService.formatCurrencyAmount(x, currency)} /> : '–'}
            </Text>
          </div>
          <Text className="text-sm w-full mt-4 sm:w-6/12 lg:w-10/12 xl:w-7/12" variant="gray" isBlock>
            How much you paid to your bank in foreign currency markup
          </Text>
          <CardSeparator />
        </>
      )}

      <div className="flex justify-between">
        <Text className="text-xl">Future Profit Impact</Text>
        <Text className="text-xl ml-4 whitespace-nowrap">
          {currencyScore ? <NumberAnimation value={marketProfitImpact} format={(x) => utilService.formatCurrencyAmount(x, currency)} /> : '–'}
        </Text>
      </div>
      <Text className="text-sm w-full mt-4 sm:w-6/12 lg:w-10/12 xl:w-7/12" variant="gray" isBlock>
        The amount your business has the potential to lose from market changes.
      </Text>
      <CardSeparator />

      <div className="flex justify-between">
        <Text className="text-xl">Saving</Text>
        <Text className="text-xl ml-4 whitespace-nowrap">
          {currencyScore ? <NumberAnimation value={performDeliveryGainLoss} format={(x) => utilService.formatCurrencyAmount(x, currency)} /> : '–'}
        </Text>
      </div>
      <Text className="text-sm w-full mt-4 sm:w-6/12 lg:w-10/12 xl:w-7/12" variant="gray" isBlock>
        How much your business saved on foreign currency compared to the benchmark.
      </Text>
      <CardSeparator className="hidden lg:block" />

      <div className="hidden items-center justify-end lg:flex">
        <CompleteOnboardingButton currencyScore={currencyScore} />
      </div>
    </CardContent>
  );
});
