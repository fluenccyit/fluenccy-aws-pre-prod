import React from 'react';
import { ErrorPanel, Page, PageContent } from '@client/common';
import { OnboardingHeader } from '@client/onboarding';

export const OnboardingErrorPage = () => (
  <Page>
    <OnboardingHeader />
    <PageContent className="min-h-screen mt-20" isCentered>
      <ErrorPanel />
    </PageContent>
  </Page>
);
