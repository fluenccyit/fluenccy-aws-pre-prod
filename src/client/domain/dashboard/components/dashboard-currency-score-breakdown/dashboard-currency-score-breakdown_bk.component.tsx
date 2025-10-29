import React, { memo } from 'react';
import cn from 'classnames';
import { maxBy } from 'lodash';
import { GqlCurrencyScoreBreakdown } from '@graphql';
import { currencyScoreService, CURRENCY_SCORE_ROUTES, useIsMarkupVisible } from '@client/currency-score';
import { useQueryLocalOrganisation } from '@client/organisation';
import { CURRENCY_SCORE_ALLOCATION, CURRENCY_SCORE_OVERALL_PERFORMANCE_LIMIT } from '@shared/currency-score';
import { Button, Card, CardContent, FlagIcon, NumberAnimation, ProgressWheel, Text, useQueryLocalCommon, utilService } from '@client/common';

type Props = {
  breakdown: GqlCurrencyScoreBreakdown;
};

export const DashboardCurrencyScoreBreakdown = memo(({ breakdown }: Props) => {
  const { ui } = useQueryLocalCommon();
  const isMarkupVisible = useIsMarkupVisible();
  const { organisation } = useQueryLocalOrganisation();

  const currencyScore = breakdown.currencyScore;
  const markup = breakdown.fxCost;
  const saving = breakdown.performDeliveryGainLoss;
  const largestCurrencyScoreCurrencyByVolume = maxBy(breakdown.currencyScoreByCurrency, 'deliveryCost');
  const rate = largestCurrencyScoreCurrencyByVolume?.averageDeliveryRate || 0;

  if (!organisation || !largestCurrencyScoreCurrencyByVolume?.currency) {
    return null;
  }

  const ctaClasses = cn('text-sm w-full mt-6 md:mt-16', organisation.intentRegistered && 'pointer-events-none');
  const { variant, label } = currencyScoreService.getPerformanceConfig(currencyScore, CURRENCY_SCORE_OVERALL_PERFORMANCE_LIMIT);

  return (
    <>
      <div className="w-full md:max-w-dashboard-currency-score">
        <Card>
          <CardContent className="p-6">
            <div className="mb-2">
              <Text className="font-bold mr-2">Currency Score</Text>
            </div>
            <div className="flex justify-center my-6 md:my-13">
              <ProgressWheel completed={currencyScore} total={CURRENCY_SCORE_ALLOCATION.total} variant={variant} size="lg">
                <Text isBlock className="text-xs text-center">
                  Your currency score is
                </Text>
                <Text className="font-mono text-center text-4xl tracking-tight" isBlock>
                  <NumberAnimation value={currencyScore} />/{CURRENCY_SCORE_ALLOCATION.total}
                </Text>
                <Text isBlock className="text-xs text-center mt-6">
                  Performance
                </Text>
                <Text className="text-center text-lg mt-1" isBlock>
                  {label}
                </Text>
              </ProgressWheel>
            </div>
            {isMarkupVisible && (
              <div className="py-4 border-b flex justify-between items-center">
                <Text className="text-sm">Markup</Text>
                <NumberAnimation value={markup} format={(value) => utilService.formatCurrencyAmount(value, organisation.currency)} />
              </div>
            )}
            <div className="py-4 border-b flex justify-between items-center">
              <Text className="text-sm">Your Rate</Text>
              <div className="flex items-center">
                <FlagIcon currency={organisation.currency} />
                <div className=" inline-block bg-gray-450 mx-2 w-4 h-px" />
                <FlagIcon className="mr-2" currency={largestCurrencyScoreCurrencyByVolume.currency} />
                <NumberAnimation
                  value={rate}
                  format={(value) => utilService.formatRateAmount(value, largestCurrencyScoreCurrencyByVolume.currency)}
                />
              </div>
            </div>
            <div className="py-4 flex justify-between items-center">
              <Text className="text-sm">Saving</Text>
              <NumberAnimation value={saving} format={(value) => utilService.formatCurrencyAmount(value, organisation.currency)} />
            </div>
            <Button className={ctaClasses} href={CURRENCY_SCORE_ROUTES.root} isLink isRounded>
              Get the full report
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
});
