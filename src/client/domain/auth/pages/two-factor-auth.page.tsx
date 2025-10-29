import React, { useEffect, memo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { TokenAuthForm, AUTH_ROUTES } from '@client/auth';
import WomanOnLaptopImage from '@assets/images/woman-on-laptop.jpg';
import { OnboardingSteps, OnboardingHeader } from '@client/onboarding';
import { Page, BackgroundImage, useAnalytics, PageContent, Button, Text } from '@client/common';
import FluenccyLogoSvg from '@assets/svg/fluenccy-logo.svg';

export const TwoFactorAuthPage = memo(() => {
  const history = useHistory();
  const { track } = useAnalytics();

  useEffect(() => {
    (async () => {
      await track('onboarding_2factor-auth_viewed');
    })();
  }, []);

  if (history.location.state?.from === 'signup') {
    return (
      <Page variant="light">
        <OnboardingHeader>
          <OnboardingSteps activeLabel="2 Factor Auth" />
        </OnboardingHeader>
        <PageContent className="flex h-screen mt-20" hasPadding={false}>
          <TokenAuthForm />
          <BackgroundImage className="hidden md:flex md:w-full" src={WomanOnLaptopImage} />
        </PageContent>
      </Page>
    );
  }
  return (
    <Page variant="light">
      <PageContent className="flex h-screen" isCentered hasPadding={false}>
        <div className="w-full sm:w-96 text-center">
          <FluenccyLogoSvg className="mx-auto" />
          <Text className="font-bold text-lg sm:text-3xl mt-4" isBlock>
            Two Factor Authentication
          </Text>
          <Text className="text-sm mt-2" variant="gray" isBlock>
            Or{' '}
            <Button href={AUTH_ROUTES.login} state="text" variant="info" isLink>
              back to login
            </Button>
          </Text>
          <TokenAuthForm />
        </div>
      </PageContent>
    </Page>
  );
});
