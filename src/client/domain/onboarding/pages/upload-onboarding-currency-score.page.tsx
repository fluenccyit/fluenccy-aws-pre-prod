import React, { memo, useEffect, useState, useMemo, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { AppErrorPage } from '@client/app';
import {
  Button,
  Card,
  loggerService,
  Page,
  PageContent,
  TAILWIND_SCREEN_MD,
  TheHeader,
  ToastGenericError,
  uiVar,
  useAnalytics,
  useInterval,
  useModal,
  useQueryLocalCommon,
  useToast,
  useWindowWidth,
} from '@client/common';
import { ONBOARDING_ROUTES, ONBOARDING_CURRENCY_SCORE } from '@client/onboarding';
import { useMutationOrganisation, useQueryLocalOrganisation } from '@client/organisation';
import { queryUser } from '@client/user';
import { OnboardingHeader, OnboardingSteps, OnboardingUploadPopupModal } from '../components';
import UploadOnboardingCurrencyScoreInfo from '../components/onboarding-upload-currency-score/onboarding-upload-currency-score-info';
import { UploadCSVBreakdown } from '@client/upload-csv';
import UploadCSVContext from '@client/upload-csv/pages/upload-csv-context';
import { UploadCSVProvider as PlanUploadCSVProvider } from '@client/plan';
import { UploadCSVProvider } from '@client/upload-csv/pages/upload-csv-context';
import { DASHBOARD_ROUTES } from '@client/dashboard';

// Poll data every 4 seconds when the organisations initial sync is not complete.
const POLL_TIMEOUT = 4000;

export const UploadOnboardingCurrencyScorePage = memo(() => {
  const history = useHistory();
  const { track } = useAnalytics();
  const { ui } = useQueryLocalCommon();
  const { organisation, organisations } = useQueryLocalOrganisation();
  const { updateOrganisation } = useMutationOrganisation();
  const { windowWidth } = useWindowWidth();
  const isMobile = useMemo(() => windowWidth <= TAILWIND_SCREEN_MD, [windowWidth]);
  const { openModal } = useModal();
  const [uploaded, setUploaded] = useState(false);
  const { addToast } = useToast();

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

        if (organisation && organisation.tenant.id.includes('tenant_')) {
          if (!organisation.onboardingComplete) {
            loggerService.debug('[<OnboardingQuestionnairePage />] Organisation not completed onboarding process. Redirecting to upload file page.');
            return history.push(ONBOARDING_ROUTES.uploadCurrencyScore);
          }
          return history.push(DASHBOARD_ROUTES.root);
        }

        if (!organisation?.buildPlanScore && user.role !== 'superdealer') {
          loggerService.debug('[<OnboardingCurrencyScoreSummaryPage />] Organisation has no build plan score. Redirecting to questionnaire.');
          return history.push(ONBOARDING_ROUTES.questionnaire);
        }
      } catch (error) {
        loggerService.error(error);
        track('currencyscore_summary_error');
        uiVar('error');
      }
    });
  }, [organisation, organisations]);

  if (ui === 'error' || !organisation) {
    return <AppErrorPage hasNoNavLinks />;
  }

  const onBtnClick = async () => {
    try {
      uiVar('saving');

      if (!organisation) {
        return;
      }

      await updateOrganisation({ variables: { input: { orgId: organisation.id, onboardingComplete: true } } });

      return history.push(DASHBOARD_ROUTES.root);
    } catch (error) {
      loggerService.error(error);
      addToast(<ToastGenericError />, 'danger');
      uiVar('ready');
    }
  };

  const onSuccess = () => {
    setUploaded(true);
    openModal(<OnboardingUploadPopupModal />);
  };

  return (
    <Page>
      <OnboardingHeader>{!isMobile && <OnboardingSteps activeLabel="Import Csv" />}</OnboardingHeader>
      {isMobile && (
        <div className="absolute left-0 top-14 bg-white border-b w-full px-4 py-2">
          <OnboardingSteps activeLabel="Import Csv" />
        </div>
      )}
      <PageContent className="min-h-screen mt-20 flex-col" isCentered={!isMobile}>
        <div className="w-full flex items-center justify-center">
          <Card className="p-4 ml-1/5 mt-10 md:mt-0 w-1/6">
            <UploadOnboardingCurrencyScoreInfo {...ONBOARDING_CURRENCY_SCORE.currencyScore} />
          </Card>
          <div style={{ fontWeight: 'bold', fontSize: 18, letterSpacing: '0.4px' }} className="mx-4">
            {ONBOARDING_CURRENCY_SCORE.title}
          </div>
          <Card className="p-4 mr-1/5 mt-10 md:mt-0 w-1/6">
            <UploadOnboardingCurrencyScoreInfo {...ONBOARDING_CURRENCY_SCORE.invoiceManager} />
          </Card>
        </div>
        <div className="w-full flex items-center justify-between mt-4">
          <UploadCSVProvider>
            <Card className="p-4 mt-10 md:mt-0 w-1/4" style={{ marginLeft: '15.8%' }}>
              <div className="p-6 pb-2 md:pb-6 lg:bg-gray-100 lg:border-r border-gray-200 p-0">
                <UploadCSVBreakdown onSuccess={onSuccess} />
              </div>
            </Card>
          </UploadCSVProvider>
          <PlanUploadCSVProvider>
            <Card className="p-4 mt-10 md:mt-0 w-1/4" style={{ marginRight: '15.8%' }}>
              <div className="p-6 pb-2 md:pb-6 lg:bg-gray-100 lg:border-r border-gray-200 p-0">
                <UploadCSVBreakdown isHedging onSuccess={onSuccess} />
              </div>
            </Card>
          </PlanUploadCSVProvider>
        </div>
        <div>
          <Button onClick={onBtnClick} className="mt-4 w-full" type="submit" data-testid="flnc-submit-button" isRounded>
            {uploaded ? 'Continue' : 'Skip this step'}
          </Button>
        </div>
      </PageContent>
    </Page>
  );
});
