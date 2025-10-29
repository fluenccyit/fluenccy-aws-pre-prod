import React, { memo } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { ONBOARDING_ROUTES, OnboardingConnectXeroPage, OnboardingCurrencyScoreSummaryPage, OnboardingQuestionnairePage } from '@client/onboarding';
import { UploadOnboardingCurrencyScorePage } from './pages/upload-onboarding-currency-score.page';

export const OnboardingLayout = memo(() => (
  <>
    <Switch>
      <Route path={ONBOARDING_ROUTES.connectXero} component={OnboardingConnectXeroPage} exact />
      <Route path={ONBOARDING_ROUTES.questionnaire} component={OnboardingQuestionnairePage} exact />
      <Route path={ONBOARDING_ROUTES.currencyScoreSummary} component={OnboardingCurrencyScoreSummaryPage} exact />
      <Route path={ONBOARDING_ROUTES.uploadCurrencyScore} component={UploadOnboardingCurrencyScorePage} exact />
      <Redirect from={ONBOARDING_ROUTES.root} to={ONBOARDING_ROUTES.connectXero} />
    </Switch>
  </>
));
