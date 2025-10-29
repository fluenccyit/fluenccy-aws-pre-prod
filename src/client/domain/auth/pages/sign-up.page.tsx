import React, { useEffect, memo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { GqlSignUpInput } from '@graphql';
import { SignUpForm, useAuth } from '@client/auth';
import WomanOnLaptopImage from '@assets/images/woman-on-laptop.jpg';
import { OnboardingSteps, OnboardingHeader } from '@client/onboarding';
import { Page, BackgroundImage, useAnalytics, PageContent, utilService } from '@client/common';

export const SignUpPage = memo(() => {
  const history = useHistory();
  const { logout } = useAuth();
  const { track } = useAnalytics();
  const [isLoading, setIsLoading] = useState(true);
  const [initialFormValues, setInitialFormValues] = useState<Partial<GqlSignUpInput>>({});

  useEffect(() => {
    (async () => {
      // Logging the user out of any sessions they may be in if they come directly to the login page.
      await logout();
      await track('onboarding_signup_viewed');

      setInitialFormValues({
        firstName: utilService.getUrlSearchParamByKey('firstName') || '',
        lastName: utilService.getUrlSearchParamByKey('lastName') || '',
        email: utilService.getUrlSearchParamByKey('email') || '',
      });

      // Clear any search params from the URL.
      history.replace(location.pathname);
      setIsLoading(false);
    })();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <Page variant="light" autoHeight>
      <OnboardingHeader>
        <OnboardingSteps activeLabel="Create account" />
      </OnboardingHeader>
      <PageContent className="flex h-screen mt-20" hasPadding={false}>
        <SignUpForm initialFormValues={initialFormValues} />
        <BackgroundImage className="hidden md:flex md:w-full" src={WomanOnLaptopImage} />
      </PageContent>
    </Page>
  );
});
