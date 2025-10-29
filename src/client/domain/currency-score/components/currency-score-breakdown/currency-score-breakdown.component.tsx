import React, { memo, useMemo } from 'react';
import cn from 'classnames';
import { GqlCurrencyScoreBreakdown } from '@graphql';
import { useQueryLocalOrganisation } from '@client/organisation';
import { currencyScoreService, useIsMarkupVisible, useQueryLocalCurrencyScore } from '@client/currency-score';
import { CURRENCY_SCORE_ALLOCATION, CURRENCY_SCORE_OVERALL_PERFORMANCE_LIMIT } from '@shared/currency-score';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardSeparator,
  NumberAnimation,
  ProgressWheel,
  TAILWIND_SCREEN_MD,
  Text,
  useQueryLocalCommon,
  useWindowWidth,
  utilService,
} from '@client/common';
import { maxBy } from 'lodash';
import { useHistory } from 'react-router-dom';

type Props = {
  breakdown: GqlCurrencyScoreBreakdown;
};

export const CurrencyScoreBreakdown = memo(({ breakdown = {} }: Props) => {
  const { ui } = useQueryLocalCommon();
  const { windowWidth } = useWindowWidth();
  const history = useHistory();
  const isMarkupVisible = useIsMarkupVisible();
  const { organisation } = useQueryLocalOrganisation();
  const { isCurrencyScorePlanActive } = useQueryLocalCurrencyScore();

  const currencyScore = isCurrencyScorePlanActive ? breakdown.benchmarkCurrencyScore : breakdown.currencyScore;
  const markup = isCurrencyScorePlanActive ? breakdown.hedgedFxCost : breakdown.fxCost;
  const saving = isCurrencyScorePlanActive ? 0 : breakdown.performDeliveryGainLoss;
  const largestCurrencyScoreCurrencyByVolume = maxBy(breakdown.currencyScoreByCurrency, 'deliveryCost');
  const deliveryRate = largestCurrencyScoreCurrencyByVolume?.averageDeliveryRate || 0;

  const progressWheelSize = useMemo(() => {
    if (windowWidth <= TAILWIND_SCREEN_MD) {
      return 'xs';
    }

    return 'md';
  }, [windowWidth]);

  if (!organisation) {
    return null;
  }

  const navigateToImsDashbpard = () => history.push({ pathname: '/plan', state: { showDashboard: true } });
  const ctaClasses = cn('w-full mt-5');
  const { variant, label } = currencyScoreService.getPerformanceConfig(currencyScore, CURRENCY_SCORE_OVERALL_PERFORMANCE_LIMIT);

  return (
    <>
      <div className="hidden min-w-chart-breakdown max-w-chart-breakdown p-6 lg:block">
        <div className="mb-2">
          <Text className="text-lg mr-2">Your Currency Score</Text>
          <Text className="text-xs">12 months</Text>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center mb-4">
              <ProgressWheel completed={currencyScore} total={CURRENCY_SCORE_ALLOCATION.total} variant={variant}>
                <Text className="font-mono text-center text-3xl tracking-tight" isBlock>
                  <NumberAnimation value={currencyScore} />/{CURRENCY_SCORE_ALLOCATION.total}
                </Text>
                <Text className="text-center text-lg mt-3" isBlock>
                  {label}
                </Text>
              </ProgressWheel>
            </div>
            {isMarkupVisible && (
              <>
                <Text isBlock>Markup</Text>
                <Badge className="mb-3" variant={markup < 0 ? 'danger' : 'gray'}>
                  <NumberAnimation value={markup} format={(value) => utilService.formatCurrencyAmount(value, organisation.currency)} />
                </Badge>
              </>
            )}
            <Text isBlock>Your Rate</Text>
            <Badge className="mb-3" variant="gray">
              <NumberAnimation
                value={deliveryRate}
                format={(value) => utilService.formatRateAmount(value, largestCurrencyScoreCurrencyByVolume?.currency)}
              />
            </Badge>
            <Text isBlock>{saving > 0 ? 'You beat the benchmark by' : 'Your loss against benchmark is'}</Text>
            <Badge variant={'gray'}>
              <NumberAnimation value={Math.abs(saving)} format={(value) => utilService.formatCurrencyAmount(value, organisation.currency)} />
            </Badge>
            <CardSeparator hasCarat />
            <Text className="font-helvetica text-base mb-3 mt-2 font-bold" variant="dark" isBlock>
              Invoice Manager
            </Text>
            <div className="flex">
              <Text className="text-2xl font-serif">Need help with invoice costs?</Text>
            </div>
            <Text className="font-helvetica text-base font-bold mt-3" variant="gray" isBlock>
              Invoice Manager helps you see the impact of currency movement on your invoices and take action.
            </Text>
            <Button className={ctaClasses} onClick={navigateToImsDashbpard} isDisabled={ui === 'saving'} isRounded>
              See live costs
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="lg:hidden">
        <div className="mb-4">
          <Text className="text-xl mr-2">Your Currency Score</Text>
          <Text className="text-sm">12 months</Text>
        </div>
        <div className="flex items-center">
          <ProgressWheel
            className="mr-4"
            completed={currencyScore}
            total={CURRENCY_SCORE_ALLOCATION.total}
            variant={variant}
            size={progressWheelSize}
          >
            <div className="hidden flex-col items-center md:flex">
              <Text className="font-mono text-center text-3xl tracking-tight" isBlock>
                <NumberAnimation value={currencyScore} />/{CURRENCY_SCORE_ALLOCATION.total}
              </Text>
              <Text className="text-center text-xl mt-3" isBlock>
                {label}
              </Text>
            </div>
          </ProgressWheel>

          <div className="md:hidden">
            <Text className="text-2xl" isBlock>
              <NumberAnimation value={currencyScore} />/{CURRENCY_SCORE_ALLOCATION.total}
            </Text>
            <Text className="text-sm mt-1" isBlock>
              {label}
            </Text>
          </div>

          <div className="hidden w-full ml-4 md:block">
            {isMarkupVisible && (
              <div className="flex justify-between items-center w-full mb-6">
                <Text className="text-lg" isBlock>
                  Markup
                </Text>
                <Badge variant={markup < 0 ? 'danger' : 'gray'}>
                  <NumberAnimation value={markup} format={(value) => utilService.formatCurrencyAmount(value, organisation.currency)} />
                </Badge>
              </div>
            )}

            <div className="flex justify-between items-center w-full mb-6">
              <Text className="text-lg" isBlock>
                Your Rate
              </Text>
              <Badge variant="gray">
                <NumberAnimation
                  value={deliveryRate}
                  format={(value) => utilService.formatCurrencyAmount(value, largestCurrencyScoreCurrencyByVolume?.currency)}
                />
              </Badge>
            </div>

            <div className="flex justify-between items-center w-full">
              <Text className="text-lg" isBlock>
                Saving
              </Text>
              <Badge variant={saving < 0 ? 'danger' : 'gray'}>
                <NumberAnimation value={saving} format={(value) => utilService.formatCurrencyAmount(value, organisation.currency)} />
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
