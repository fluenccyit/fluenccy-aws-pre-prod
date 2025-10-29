import React, { memo, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useQueryLocalOrganisation } from '@client/organisation';
import WomanOnLaptopImage from '@assets/images/woman-on-laptop.jpg';
import { ONBOARDING_ROUTES, OnboardingHeader, OnboardingSteps, OnboardingConnectXeroForm } from '@client/onboarding';
import { BackgroundImage, loggerService, Page, PageContent, uiVar, useAnalytics, useQueryLocalCommon } from '@client/common';

export const OnboardingConnectXeroPage = memo(() => {
  const history = useHistory();
  const { track } = useAnalytics();
  const { ui } = useQueryLocalCommon();
  const { organisations } = useQueryLocalOrganisation();

  useEffect(() => {
    if (organisations?.length) {
      loggerService.debug('[<OnboardingConnectXeroPage />] Account already has organisations. Redirecting to questionnaire.');
      return history.push(ONBOARDING_ROUTES.questionnaire);
    }

    track('onboarding_connectxero_viewed');
    uiVar('ready');
  }, []);

  if (ui === 'loading') {
    return null;
  }

  return (
    <Page variant="light">
      <OnboardingHeader>
        <OnboardingSteps activeLabel="Connect Xero" />
      </OnboardingHeader>
      <PageContent className="flex h-screen mt-20" hasPadding={false}>
        <OnboardingConnectXeroForm />
        <BackgroundImage className="hidden md:flex w-full" src={WomanOnLaptopImage} />
      </PageContent>
    </Page>
  );
});
