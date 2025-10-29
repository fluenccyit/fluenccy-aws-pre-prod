import React, { memo, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import OnboardingImage from '@assets/images/onboarding.png';
import { useQueryLocalOrganisation } from '@client/organisation';
import { ONBOARDING_ROUTES, OnboardingErrorPage, OnboardingQuestionnaire, OnboardingHeader, OnboardingSteps } from '@client/onboarding';
import {
  Button,
  Card,
  loggerService,
  Page,
  PageContent,
  TAILWIND_SCREEN_MD,
  Text,
  uiVar,
  useAnalytics,
  useQueryLocalCommon,
  useWindowWidth,
} from '@client/common';
import { DASHBOARD_ROUTES } from '@client/dashboard';

export const OnboardingQuestionnairePage = memo(() => {
  const history = useHistory();
  const { track } = useAnalytics();
  const { ui } = useQueryLocalCommon();
  const { windowWidth } = useWindowWidth();
  const { organisations, organisation } = useQueryLocalOrganisation();
  const [isQuestionnaireStarted, setIsQuestionnaireStarted] = useState(false);
  const isMobile = useMemo(() => windowWidth <= TAILWIND_SCREEN_MD, [windowWidth]);

  useEffect(() => {
    if (!organisations?.length) {
      loggerService.debug('[<OnboardingQuestionnairePage />] Account has no organisations. Redirecting to connect Xero page.');
      return history.push(ONBOARDING_ROUTES.connectXero);
    }

    if (!organisation) {
      loggerService.error('[<OnboardingQuestionnairePage />] No organisation in local state.');
      uiVar('error');
      return;
    }

    if (organisation && organisation.tenant.id.includes('tenant_')) {
      if (!organisation.onboardingComplete && organisation.buildPlanAnswers.length) {
        loggerService.debug('[<OnboardingQuestionnairePage />] Organisation not completed onboarding process. Redirecting to upload file page.');
        return history.push(ONBOARDING_ROUTES.uploadCurrencyScore);
      } else if (organisation.onboardingComplete) {
        return history.push(DASHBOARD_ROUTES.root);
      }
    }

    if (organisation.buildPlanScore) {
      loggerService.debug('[<OnboardingQuestionnairePage />] Organisation already has build plan score. Redirecting to summary.');
      return history.push(ONBOARDING_ROUTES.currencyScoreSummary);
    }

    track('onboarding_questions_viewed');
    uiVar('ready');
  }, [organisation]);

  if (ui === 'loading') {
    return null;
  }

  if (ui === 'error' || !organisation) {
    return <OnboardingErrorPage />;
  }

  const handleStartQuestionnaireClick = () => {
    track('onboarding_questions_primary');
    setIsQuestionnaireStarted(true);
  };

  const renderContent = () => {
    if (!isQuestionnaireStarted) {
      return (
        <>
          <img className="mx-auto" src={OnboardingImage} alt="Build your plan" />
          <Text className="text-4xl text-center font-serif mt-4" variant="success" isBlock>
            Help us understand {organisation.name}
          </Text>
          <Text className="text-center mt-4" isBlock>
            To help us build a comprehensive picture of your foreign currency position we need to know a few things about how you do business.
          </Text>
          <div className="flex justify-center mt-6">
            <Button className="w-full md:w-auto" onClick={handleStartQuestionnaireClick} data-testid="flnc-onboarding-start-button" isRounded>
              Let&apos;s go
            </Button>
          </div>
        </>
      );
    }

    return <OnboardingQuestionnaire />;
  };

  return (
    <Page>
      <OnboardingHeader>{!isMobile && <OnboardingSteps activeLabel="Questions" />}</OnboardingHeader>
      {isMobile && (
        <div className="absolute left-0 top-14 bg-white border-b w-full px-4 py-2">
          <OnboardingSteps activeLabel="Questions" />
        </div>
      )}
      <PageContent className="min-h-screen mt-20" isCentered={!isMobile}>
        <Card className="w-full max-w-3xl p-4 mt-10 md:mt-0 md:p-20">{renderContent()}</Card>
      </PageContent>
    </Page>
  );
});
