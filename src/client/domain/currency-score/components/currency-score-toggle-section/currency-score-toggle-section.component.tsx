import React, { memo } from 'react';
import cn from 'classnames';
import { useJoinWaitlist, useQueryLocalOrganisation } from '@client/organisation';
import { currencyScoreIsPlanActiveVar, useQueryLocalCurrencyScore } from '@client/currency-score';
import { Card, CardContent, Toggle, CardSeparator, Button, Text, useQueryLocalCommon, useAnalytics } from '@client/common';
import { useHistory } from "react-router-dom";

export const CurrencyScoreToggleSection = memo(() => {
  const { track } = useAnalytics();
  const { ui } = useQueryLocalCommon();
  const { joinWaitlist } = useJoinWaitlist();
  const { organisation } = useQueryLocalOrganisation();
  const { isCurrencyScorePlanActive } = useQueryLocalCurrencyScore();
  const history = useHistory();

  if (!organisation) {
    return null;
  }

  const ctaClasses = cn('w-full mt-5');

  const handlePlanActiveChange = () => {
    if (!isCurrencyScorePlanActive) {
      track('currencyscore_plan_toggle');
    }

    currencyScoreIsPlanActiveVar(!isCurrencyScorePlanActive);
  };
  const navigateToImsDashbpard = () => history.push({ pathname: '/plan', state: { showDashboard: true } });

  return (
    <Card className="my-6 lg:mb-0 lg:mt-2 lg:border-0 lg:shadow-none">
      <CardContent className="p-6">
        <div className="flex items-center">
          <Toggle onChange={handlePlanActiveChange} isChecked={isCurrencyScorePlanActive} />
          <Text className="text-sm ml-4">See what score you could have achieved with the Fluenccy Benchmark</Text>
        </div>
        <CardSeparator className="lg:hidden" />
        <div className="block lg:hidden">
          <Text className="text-sm">Your recommended strategy</Text>
          <div className="flex font-serif my-2">
            <Text className="text-green-500 mr-1 text-3xl">Fluenccy</Text>
            <Text className="text-3xl">Protect</Text>
            <Text className="text-base font-sans">&trade;</Text>
          </div>
          <Button className={ctaClasses} onClick={navigateToImsDashbpard} isDisabled={ui === 'saving'} isRounded>
            See live costs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
