import React, { memo, useEffect, useState } from 'react';
import { last } from 'lodash';
import { useHistory } from 'react-router-dom';
import { AUTH_ROUTES } from '@client/auth';
import { AppErrorPage } from '@client/app';
import { GqlCurrencyScoreBreakdown } from '@graphql';
import { ONBOARDING_ROUTES } from '@client/onboarding';
import { APOLLO_ERROR_MESSAGE, loggerService, Page, uiVar, useAnalytics, useQueryLocalCommon } from '@client/common';
import { useQueryLocalOrganisation } from '@client/organisation';
import {
  CurrencyScoreBreakdown,
  CurrencyScoreChart,
  CurrencyScoreFactors,
  CurrencyScorePageContent,
  CurrencyScoreToggleSection,
} from '@client/currency-score';
import { ChartErrorPanel } from '@client/chart';

export const CurrencyScorePage = memo(() => {
  const history = useHistory();
  const { track } = useAnalytics();
  const { ui } = useQueryLocalCommon();
  const { organisation } = useQueryLocalOrganisation();
  const [breakdown, setBreakdown] = useState<GqlCurrencyScoreBreakdown>();
  const [currencyScores, setCurrencyScores] = useState<GqlCurrencyScoreBreakdown[]>([]);

  useEffect(() => {
    track('currencyscore_viewed');
  }, []);

  useEffect(() => {
    (async () => {
      try {
        uiVar('loading');

        if (!organisation) {
          return;
        }

        if (!organisation.onboardingComplete) {
          loggerService.debug('[<CurrencyScorePage />] Organisation has not completed onboarding. Redirecting to onboarding.');
          return history.push(ONBOARDING_ROUTES.currencyScoreSummary);
        }

        setBreakdown(last(organisation.currencyScores));
        setCurrencyScores(organisation.currencyScores);
        uiVar('ready');
      } catch (error: any) {
        if (error.message === APOLLO_ERROR_MESSAGE.authenticationFailed) {
          history.push(AUTH_ROUTES.login);
        } else {
          loggerService.error(error);
          uiVar('error');
        }
      }
    })();
  }, [organisation]);

  if (ui === 'loading') {
    return null;
  }

  if (ui === 'error' || !organisation) {
    return <AppErrorPage />;
  }
  if (!breakdown) {
    return <ChartErrorPanel state="no-data" />;
  }

  return (
    <Page>
      <CurrencyScorePageContent>
        <div className="p-6 pb-2 md:pb-6 lg:bg-gray-100 lg:border-r lg:border-gray-200 lg:p-0">
          <CurrencyScoreBreakdown breakdown={breakdown} />
        </div>
        <div className="flex flex-col bg-white overflow-x-hidden w-full">
          <CurrencyScoreChart currencyScores={currencyScores} />

          <div className="p-3 lg:p-0">
            <CurrencyScoreToggleSection />
            <CurrencyScoreFactors breakdown={breakdown} />
          </div>
        </div>
      </CurrencyScorePageContent>
    </Page>
  );
});
