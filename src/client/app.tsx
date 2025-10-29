import React, { useEffect, useRef, useState } from 'react';
import { find, map } from 'lodash';
import { useIntercom } from 'react-use-intercom';
import { Route, Switch, useHistory } from 'react-router-dom';
import { AppLayout, AppRoute } from '@client/app';
import { AUTH_ROUTES, AuthLayout, AuthRoute } from '@client/auth';
import { ADMIN_ROUTES, AdminLayout, AdminRoute } from '@client/admin';
import { ONBOARDING_ROUTES, OnboardingLayout, OnboardingRoute } from '@client/onboarding';
import { COMMON_ROUTE, FiveHundredPage, uiVar, loggerService, useFeature, useAnalytics } from '@client/common';

export const App = () => {
  const route = useRef(location.pathname);
  const history = useHistory();
  const { boot: initIntercom } = useIntercom();
  const { init: initFeatureService } = useFeature();
  const { init: initAnalytics, page } = useAnalytics();
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        history.listen((event, action) => {
          window.scroll(0, 0);

          // Only set the page state to loading on a `PUSH` history event, and if the previous route does not match the new path.
          if (action === 'PUSH' && route.current !== event.pathname) {
            uiVar('loading');
          }

          route.current = event.pathname;

          // Only fire the page event on non-auth routes, as this event is handled by the <AuthRoute /> component.
          if (!find(AUTH_ROUTES, (route) => route === event.pathname)) {
            page();
          }
        });

        loggerService.debug('[<App />] Initialising app.');

        await Promise.all([initIntercom(), initFeatureService(), initAnalytics()]);
      } catch (error) {
        loggerService.error(error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return null;
  }

  if (isError) {
    return <FiveHundredPage />;
  }

  return (
    <Switch>
      <Route path={COMMON_ROUTE.error} component={FiveHundredPage} exact />
      {map(AUTH_ROUTES, (route) => (
        <AuthRoute key={route} path={route} component={AuthLayout} exact />
      ))}
      <AdminRoute path={ADMIN_ROUTES.root} component={AdminLayout} />
      <OnboardingRoute path={ONBOARDING_ROUTES.root} component={OnboardingLayout} />
      <AppRoute path="/" component={AppLayout} />
    </Switch>
  );
};
