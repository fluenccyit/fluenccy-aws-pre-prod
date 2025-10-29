import React, { memo } from 'react';
import cn from 'classnames';
import { maxBy } from 'lodash';
import { GqlCurrencyScoreBreakdown } from '@graphql';
import { useHistory } from "react-router-dom";
import { currencyScoreService, CURRENCY_SCORE_ROUTES, useIsMarkupVisible } from '@client/currency-score';
import { useQueryLocalOrganisation } from '@client/organisation';
import { CURRENCY_SCORE_ALLOCATION, CURRENCY_SCORE_OVERALL_PERFORMANCE_LIMIT } from '@shared/currency-score';
import { Button, Card, CardContent, FlagIcon, NumberAnimation, ProgressWheel, Text, useQueryLocalCommon, utilService, TAILWIND_THEME } from '@client/common';

type Props = {
  breakdown: GqlCurrencyScoreBreakdown;
};

export const DashboardCurrencyScoreBreakdown = memo(({ breakdown, isFullWidth, showTitle = false }: Props) => {
  const { ui } = useQueryLocalCommon();
  const { organisation } = useQueryLocalOrganisation();

  const currencyScore = breakdown?.currencyScore;
  const saving = breakdown?.performDeliveryGainLoss;
  const largestCurrencyScoreCurrencyByVolume = maxBy(breakdown.currencyScoreByCurrency, 'deliveryCost');
  const history = useHistory();

  if (!organisation || !largestCurrencyScoreCurrencyByVolume?.currency) {
    return null;
  }

  const gotoReport = () => history.push('/currency-score');

  const ctaClasses = cn('text-sm w-full', organisation.intentRegistered);
  const { variant, label } = currencyScoreService.getPerformanceConfig(currencyScore, CURRENCY_SCORE_OVERALL_PERFORMANCE_LIMIT);

  return (
    <>
      <div className="w-full" style={{ width: isFullWidth ? '25%' : '30%' }}>
        {showTitle && <span className="text-lg p-2 font-medium">Currency Score</span>}
        <Card>
          <CardContent className="px-10 pt-6 pb-15">
            <div className="flex justify-center my-2 md:my-6 pb-5">
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
              <Text className="text-sm">{saving > 0 ? 'You beat the benchmark by' : 'Your loss against benchmark is' }</Text>
              <NumberAnimation
                value={Math.abs(saving)}
                format={(value) => utilService.formatCurrencyAmount(value, organisation.currency)}
                style={{
                  color: TAILWIND_THEME.colors.black,
                  fontSize: '30px',
                  fontWeight: 'bold'
                }}
              />
            </div>
            <Button className={ctaClasses} isLink isRounded onClick={gotoReport} style={{paddingTop: '12px', paddingBottom: '12px'}}>
              View Full Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
});
