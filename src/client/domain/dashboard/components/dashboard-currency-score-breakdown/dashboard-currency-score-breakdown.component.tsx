import React, { memo } from 'react';
import cn from 'classnames';
import { maxBy } from 'lodash';
import { GqlCurrencyScoreBreakdown } from '@graphql';
import { currencyScoreService, CURRENCY_SCORE_ROUTES } from '@client/currency-score';
import { useQueryLocalOrganisation } from '@client/organisation';
import { CURRENCY_SCORE_ALLOCATION, CURRENCY_SCORE_OVERALL_PERFORMANCE_LIMIT } from '@shared/currency-score';
import {
  Button,
  Card,
  CardContent,
  FlagIcon,
  NumberAnimation,
  ProgressWheel,
  Text,
  useQueryLocalCommon,
  utilService,
  TAILWIND_THEME,
} from '@client/common';

type Props = {
  breakdown: GqlCurrencyScoreBreakdown;
};

export const DashboardCurrencyScoreBreakdown = memo(({ breakdown }: Props) => {
  const { ui } = useQueryLocalCommon();
  const { organisation } = useQueryLocalOrganisation();

  const currencyScore = breakdown.currencyScore;
  const saving = breakdown.performDeliveryGainLoss;
  const largestCurrencyScoreCurrencyByVolume = maxBy(breakdown?.currencyScoreByCurrency, 'deliveryCost');

  if (!organisation || !largestCurrencyScoreCurrencyByVolume?.currency) {
    return null;
  }

  const ctaClasses = cn('text-sm w-full', organisation.intentRegistered && 'pointer-events-none');
  const { variant, label } = currencyScoreService.getPerformanceConfig(currencyScore, CURRENCY_SCORE_OVERALL_PERFORMANCE_LIMIT);

  return (
    <div className="w-full">
      <Card>
        <CardContent className="px-10 pt-6 pb-10">
          <div className="flex justify-center my-2 md:my-6">
            <ProgressWheel completed={currencyScore} total={CURRENCY_SCORE_ALLOCATION.total} variant={variant} size="lg">
              <Text isBlock className="text-xs text-center">
                Your currency score is
              </Text>
              <Text className="font-mono text-center text-4xl tracking-tight font-bold" isBlock>
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
          <div className="pb-4 flex justify-between items-center flex-col">
            <Text className="text-sm">You could be saving around</Text>
            <NumberAnimation
              value={saving}
              format={(value) => utilService.formatCurrencyAmount(value, organisation.currency)}
              style={{
                color: TAILWIND_THEME.colors.green[500],
                fontSize: '30px',
                fontWeight: 'bold',
              }}
            />
            <Text className="text-sm text-base">per year</Text>
          </div>
          <Button className={ctaClasses} isLink isRounded href={CURRENCY_SCORE_ROUTES.root} style={{ paddingTop: '12px', paddingBottom: '12px' }}>
            View Full Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
});
