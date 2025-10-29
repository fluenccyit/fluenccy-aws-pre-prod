import React, { memo, useState } from 'react';
import { format } from 'date-fns';
import { GqlCurrencyScoreBreakdown } from '@graphql';
import { SHARED_DATE_TIME_FORMAT } from '@shared/common';
import { currencyScoreService } from '@client/currency-score';
import { Accordion, CardSeparator, NumberAnimation, TabModel, Tabs, TAILWIND_SCREEN_XL, Text, useAnalytics, useWindowWidth } from '@client/common';
import {
  CurrencyScoreFactorsCredit,
  CurrencyScoreFactorsForecast,
  CurrencyScoreFactorsForeignCurrency,
  CurrencyScoreFactorsProgressWheel,
  CurrencyScoreFactorsRate,
  CurrencyScoreFactorsRisk,
  CurrencyScoreFactorType,
  useQueryLocalCurrencyScore,
} from '@client/currency-score';
import {
  CURRENCY_SCORE_FOREIGN_CURRENCY_ALLOCATION,
  CURRENCY_SCORE_FOREIGN_CURRENCY_PERFORMANCE_LIMIT,
  CURRENCY_SCORE_RATE_ALLOCATION,
  CURRENCY_SCORE_RATE_PERFORMANCE_LIMIT,
  CURRENCY_SCORE_RISK_ALLOCATION,
  CURRENCY_SCORE_RISK_PERFORMANCE_LIMIT,
} from '@shared/currency-score';

type Props = {
  breakdown: GqlCurrencyScoreBreakdown;
};

export const CurrencyScoreFactors = memo(({ breakdown = {} }: Props) => {
  const { track } = useAnalytics();
  const { windowWidth } = useWindowWidth();
  const { isCurrencyScorePlanActive } = useQueryLocalCurrencyScore();
  const [activeTab, setActiveTab] = useState<CurrencyScoreFactorType>('foreign-currency');
  const isLargeScreen = windowWidth < TAILWIND_SCREEN_XL;

  let foreignExchangeScore = 0;
  let rateScore = 0;
  let riskScore = 0;

  if (isCurrencyScorePlanActive) {
    const halfCostPlanScore = breakdown.benchmarkCostPlanScore / 2;
    foreignExchangeScore = halfCostPlanScore + breakdown.benchmarkMarginScore + breakdown.benchmarkGainLossScore;
    rateScore = breakdown.benchmarkTargetScore + breakdown.benchmarkPresentScore;
    riskScore = halfCostPlanScore;
  } else {
    const halfCostPlanScore = breakdown.costPlanScore / 2;
    foreignExchangeScore = halfCostPlanScore + breakdown.marginScore + breakdown.gainLossScore;
    rateScore = breakdown.targetScore + breakdown.presentScore;
    riskScore = halfCostPlanScore;
  }

  const { getScorePercentage } = currencyScoreService;
  const factorTabs: TabModel<CurrencyScoreFactorType>[] = [
    {
      id: 'rate',
      label: (
        <>
          Rate
          <Text className="text-sm ml-1" variant="gray">
            <NumberAnimation
              value={rateScore}
              format={(value) => getScorePercentage(value, CURRENCY_SCORE_RATE_ALLOCATION)}
              isAnimatedInitially={false}
            />
          </Text>
        </>
      ),
    },
    {
      id: 'foreign-currency',
      label: (
        <>
          Foreign Currency
          <Text className="text-sm ml-1" variant="gray">
            <NumberAnimation
              value={foreignExchangeScore}
              format={(value) => getScorePercentage(value, CURRENCY_SCORE_FOREIGN_CURRENCY_ALLOCATION)}
              isAnimatedInitially={false}
            />
          </Text>
        </>
      ),
    },
    {
      id: 'risk',
      label: (
        <>
          Risk
          <Text className="text-sm ml-1" variant="gray">
            <NumberAnimation
              value={riskScore}
              format={(value) => getScorePercentage(value, CURRENCY_SCORE_RISK_ALLOCATION)}
              isAnimatedInitially={false}
            />
          </Text>
        </>
      ),
    },
    {
      id: 'credit',
      label: <>Credit</>,
    },
    {
      id: 'forecast',
      label: <>Forecast</>,
    },
  ];

  const getProgressWheelPropValues = () => {
    switch (activeTab) {
      case 'foreign-currency':
        return {
          heading: 'Foreign Currency',
          score: foreignExchangeScore,
          allocation: CURRENCY_SCORE_FOREIGN_CURRENCY_ALLOCATION,
          limitMap: CURRENCY_SCORE_FOREIGN_CURRENCY_PERFORMANCE_LIMIT,
        };
      case 'rate':
        return {
          heading: 'Rate',
          score: rateScore,
          allocation: CURRENCY_SCORE_RATE_ALLOCATION,
          limitMap: CURRENCY_SCORE_RATE_PERFORMANCE_LIMIT,
        };
      case 'risk':
        return {
          heading: 'Risk',
          score: riskScore,
          allocation: CURRENCY_SCORE_RISK_ALLOCATION,
          limitMap: CURRENCY_SCORE_RISK_PERFORMANCE_LIMIT,
        };
      default:
        return null;
    }
  };

  const renderTabsProgressWheel = () => {
    const result = getProgressWheelPropValues();

    if (!result) {
      return null;
    }

    const { heading, score, allocation, limitMap } = result;

    return <CurrencyScoreFactorsProgressWheel heading={heading} score={score} allocation={allocation} limitMap={limitMap} />;
  };

  const renderForeignCurrencyProgressWheel = () => (
    <CurrencyScoreFactorsProgressWheel
      heading="Foreign Currency"
      score={foreignExchangeScore}
      allocation={CURRENCY_SCORE_FOREIGN_CURRENCY_ALLOCATION}
      limitMap={CURRENCY_SCORE_FOREIGN_CURRENCY_PERFORMANCE_LIMIT}
    />
  );

  const renderRateProgressWheel = () => (
    <CurrencyScoreFactorsProgressWheel
      heading="Rate"
      score={rateScore}
      allocation={CURRENCY_SCORE_RATE_ALLOCATION}
      limitMap={CURRENCY_SCORE_RATE_PERFORMANCE_LIMIT}
    />
  );

  const renderRiskProgressWheel = () => (
    <CurrencyScoreFactorsProgressWheel
      heading="Risk"
      score={riskScore}
      allocation={CURRENCY_SCORE_RISK_ALLOCATION}
      limitMap={CURRENCY_SCORE_RISK_PERFORMANCE_LIMIT}
    />
  );

  const handleTabChange = async ({ id }: TabModel<CurrencyScoreFactorType>) => {
    if (id === 'foreign-currency') {
      track('currencyscore_factors_foreigncurrency');
    } else if (id === 'rate') {
      track('currencyscore_factors_rate');
    } else if (id === 'risk') {
      track('currencyscore_factors_risk');
    } else if (id === 'credit') {
      track('currencyscore_factors_credit');
    } else if (id === 'forecast') {
      track('currencyscore_factors_forecast');
    }

    setActiveTab(id);
  };

  return (
    <div className="mt-8 mb-4 border-gray-200 lg:px-6 lg:mt-0">
      <div className="flex items-center mb-6 xl:mb-0 xl:border-b">
        <div className="w-44 xl:mr-12 xl:mb-2">
          <Text className="text-xl whitespace-nowrap">Your factors</Text>
          <Text className="text-sm ml-1.5 whitespace-nowrap" variant="gray">
            {format(new Date(), SHARED_DATE_TIME_FORMAT.monthYear)}
          </Text>
        </div>
        {!isLargeScreen && (
          <Tabs<CurrencyScoreFactorType> tabs={factorTabs} onChange={handleTabChange} variant="underline" className="whitespace-nowrap" />
        )}
      </div>

      {/* Desktop */}
      {!isLargeScreen && (
        <div className="flex pt-8 min-h-factors-lg-screens">
          {renderTabsProgressWheel()}
          {activeTab === 'rate' && <CurrencyScoreFactorsRate breakdown={breakdown} />}
          {activeTab === 'foreign-currency' && <CurrencyScoreFactorsForeignCurrency breakdown={breakdown} />}
          {activeTab === 'risk' && <CurrencyScoreFactorsRisk breakdown={breakdown} />}
          {activeTab === 'credit' && <CurrencyScoreFactorsCredit />}
          {activeTab === 'forecast' && <CurrencyScoreFactorsForecast />}
        </div>
      )}

      {/* Mobile/Medium */}
      {isLargeScreen && (
        <>
          <Accordion label={renderRateProgressWheel()} onClick={(isOpen) => isOpen && track('currencyscore_factors_rate')}>
            <CurrencyScoreFactorsRate breakdown={breakdown} />
          </Accordion>
          <CardSeparator />
          <Accordion label={renderForeignCurrencyProgressWheel()} onClick={(isOpen) => isOpen && track('currencyscore_factors_foreigncurrency')}>
            <CurrencyScoreFactorsForeignCurrency breakdown={breakdown} />
          </Accordion>
          <CardSeparator />
          <Accordion label={renderRiskProgressWheel()} onClick={(isOpen) => isOpen && track('currencyscore_factors_risk')}>
            <CurrencyScoreFactorsRisk breakdown={breakdown} />
          </Accordion>
          <CardSeparator />
          <Accordion
            label={<CurrencyScoreFactorsProgressWheel heading="Credit" score={0} allocation={1} />}
            onClick={(isOpen) => isOpen && track('currencyscore_factors_credit')}
          >
            <CurrencyScoreFactorsCredit />
          </Accordion>
          <CardSeparator />
          <Accordion
            label={<CurrencyScoreFactorsProgressWheel heading="Forecast" score={0} allocation={1} />}
            onClick={(isOpen) => isOpen && track('currencyscore_factors_forecast')}
          >
            <CurrencyScoreFactorsForecast />
          </Accordion>
        </>
      )}
    </div>
  );
});
