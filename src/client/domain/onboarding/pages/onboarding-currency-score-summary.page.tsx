import React, { memo, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { find, last } from 'lodash';
import { AppErrorPage } from '@client/app';
import { GqlCurrencyScoreBreakdown } from '@graphql';
import { Card, loggerService, Page, PageContent, TheHeader, uiVar, useAnalytics, useInterval, useQueryLocalCommon } from '@client/common';
import {
  ONBOARDING_ROUTES,
  OnboardingCurrencyScoreBreakdownSection,
  OnboardingCurrencyScorePerformanceSection,
  OnboardingCurrencyScoreSummaryLoader,
  OnboardingErrorBanner,
  ONBOARDING_SYNC_STATUS_ORDER,
} from '@client/onboarding';
import {
  LocalOrganisationType,
  OrganisationInactiveTokenBanner,
  organisationsVar,
  organisationVar,
  queryOrganisationsByToken,
  useIsOrganisationTokenInactive,
  useMutationOrganisation,
  useQueryLocalOrganisation,
} from '@client/organisation';
import { queryUser } from '@client/user';

// Poll data every 4 seconds when the organisations initial sync is not complete.
const POLL_TIMEOUT = 4000;

export const OnboardingCurrencyScoreSummaryPage = memo(() => {
  const history = useHistory();
  const { track } = useAnalytics();
  const { ui } = useQueryLocalCommon();
  const { organisation, organisations } = useQueryLocalOrganisation();
  const { recalculateOrganisationCurrencyScores } = useMutationOrganisation();
  const [stage, setStage] = useState(1);
  const [breakdown, setBreakdown] = useState<GqlCurrencyScoreBreakdown>();
  const isTokenInactive = useIsOrganisationTokenInactive();

  // Poll the sync status of the organisation.
  useInterval(
    async () => {
      try {
        if (!organisation) {
          return;
        }

        const organisations = await queryOrganisationsByToken();
        organisationsVar(organisations as LocalOrganisationType[]);

        const currentOrganisation = organisations.length ? find(organisations, ({ id }) => organisation.id === id) : null;

        if (!currentOrganisation) {
          loggerService.error('[usePollOrganisationSyncStatus] Currency organisation not returned in response.');
          uiVar('error');
          return;
        }

        const { syncStatus } = currentOrganisation;

        if (syncStatus === 'calculatingCurrencyScoresError' || syncStatus === 'calculatingTransactionDetailsError' || syncStatus === 'syncError') {
          loggerService.error('[usePollOrganisationSyncStatus] Organisation sync status in an error state.');
          uiVar('error');
          return;
        }

        if (syncStatus === 'calculatingTransactionDetailsComplete') {
          loggerService.debug('[usePollOrganisationSyncStatus] Starting recalculate currency scores job.');
          await recalculateOrganisationCurrencyScores({ variables: { input: { orgId: organisation.id } } });
        }

        if (!syncStatus) {
          return;
        }

        let newStage = stage;

        // If the current organisation sync status is greater than the current state, then increment the stage. This is so we go through each of the
        // loading stages.
        if (ONBOARDING_SYNC_STATUS_ORDER[syncStatus] > stage) {
          newStage += 1;
        }

        if (newStage > 3) {
          // Once we get past stage 3, then we know we're complete.
          loggerService.debug('[<OnboardingCurrencyScoreSummaryPage />] Loading complete.');
          track('currencyscore_summary_viewed');
          organisationVar(currentOrganisation as LocalOrganisationType);
          setBreakdown(last(currentOrganisation.currencyScores));
          uiVar('ready');
        } else {
          loggerService.debug(`[<OnboardingCurrencyScoreSummaryPage />] Incrementing loading stage to ${newStage}.`);
          // Otherwise just increment the stage.
          setStage(newStage);
        }
      } catch (error) {
        loggerService.error(error);
        uiVar('error');
      }
    },
    ui === 'loading' ? POLL_TIMEOUT : null
  );

  useEffect(() => {
    queryUser().then((user) => {
      try {
        if (!organisations?.length && user.role !== 'superdealer') {
          loggerService.debug('[<OnboardingCurrencyScoreSummaryPage />] Account has no organisations. Redirecting to connect Xero page.');
          return history.push(ONBOARDING_ROUTES.connectXero);
        }

        if (!organisation && user.role !== 'superdealer') {
          loggerService.error('[<OnboardingCurrencyScoreSummaryPage />] No organisation in local state.');
          track('currencyscore_summary_error');
          uiVar('error');
          return;
        }

        if (!organisation.buildPlanScore && user.role !== 'superdealer') {
          loggerService.debug('[<OnboardingCurrencyScoreSummaryPage />] Organisation has no build plan score. Redirecting to questionnaire.');
          return history.push(ONBOARDING_ROUTES.questionnaire);
        }

        if (!organisation.initialSyncComplete) {
          uiVar('loading');
          return;
        }
      } catch (error) {
        loggerService.error(error);
        track('currencyscore_summary_error');
        uiVar('error');
      }
    });
  }, [organisation, organisations]);

  if (ui === 'loading') {
    return <OnboardingCurrencyScoreSummaryLoader stage={stage} />;
  }

  if (ui === 'error' || !organisation || !breakdown) {
    return <AppErrorPage hasNoNavLinks />;
  }

  return (
    <Page>
      <TheHeader hasNoNavLinks />
      {!breakdown.currencyScore && !isTokenInactive && <OnboardingErrorBanner />}
      {isTokenInactive && <OrganisationInactiveTokenBanner absolute />}
      <PageContent hasBanner={!breakdown.currencyScore || isTokenInactive} className="mt-32">
        <Card className="flex flex-col w-full mx-auto lg:w-auto lg:max-w-7xl lg:flex-row">
          <OnboardingCurrencyScorePerformanceSection breakdown={breakdown} />
          <OnboardingCurrencyScoreBreakdownSection breakdown={breakdown} />
        </Card>
      </PageContent>
    </Page>
  );
});
