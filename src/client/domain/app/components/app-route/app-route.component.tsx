import React, { createElement, ComponentType, memo, useEffect, useState } from 'react';
import { find } from 'lodash';
import { Route, RouteProps, useHistory } from 'react-router-dom';
import { ADMIN_ROUTES } from '@client/admin';
import { sharedRateService } from '@shared/rate';
import { AUTH_ROUTES, useAuth } from '@client/auth';
import { ONBOARDING_ROUTES } from '@client/onboarding';
import { queryAccount, accountVar } from '@client/account';
import { queryUser, userService, userVar, useQueryLocalUser } from '@client/user';
import { AppErrorPage, AppNoConnectedOrganisationsSplash } from '@client/app';
import { localStorageService, loggerService, useAnalytics, useCookies } from '@client/common';
import { LocalOrganisationType, organisationsVar, organisationVar, ORGANISATION_ROUTES, queryOrganisationsByToken, useQueryLocalOrganisation } from '@client/organisation';
import { DASHBOARD_ROUTES } from '@client/dashboard';

type Props = RouteProps & {
  component: ComponentType<any>;
};

export const AppRoute = memo((props: Props) => {
  const { component, ...rest } = props;
  const history = useHistory();
  const { identify, page } = useAnalytics();
  const { organisation, organisations } = useQueryLocalOrganisation();
  const { isAuthenticating, isAuthenticated, firebaseUser } = useAuth();
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNoConnectedOrganisationsSplashVisible, setIsNoConnectedOrganisationsSplashVisible] = useState(false);
  const { getCookie } = useCookies();

  useEffect(() => {
    (async () => {
      try {
        if (isAuthenticating) {
          return;
        }

        if (!isAuthenticated || !firebaseUser) {
          loggerService.debug('[<AppRoute />] User is not authenticated. Redirecting to login.');
          return history.push(AUTH_ROUTES.login);
        }

        if (getCookie('two-factor-auth') === 'false' || !getCookie('two-factor-auth')) {
          loggerService.debug('[<AppRoute />] User is not authenticated via two factor. Redirecting to two factor auth.');
          return history.push({pathname: AUTH_ROUTES.twoFactor, state: { email: firebaseUser?.email }});
        }

        const user = await queryUser();

        // If we detect that the user is a `superuser`, redirect them to the AdminPage, as they won't have any accounts, or organisations.
        if (user.role === 'superuser') {
          loggerService.debug('[<AppRoute />] User is a `superuser`. Redirecting to admin.');
          return history.push(ADMIN_ROUTES.root);
        }

        const email = firebaseUser.email || '';
        const userId = user.firebaseUid;
        userVar({ ...user, email });

        await identify({ userId, email, name: userService.getFullName(user) });
        await page();

        let tasks = [];
        if (user.role === "superdealer") {
          tasks.push(() => new Promise((res, rej) => res({})));
        } else {
          tasks.push(queryAccount());
        }
        tasks.push(queryOrganisationsByToken());
        const [account, organisations] = await Promise.all(tasks);

        if (!account) {
          loggerService.error('[<AppRoute />] There is no account associated with the token.');
          setIsError(true);
          setIsLoading(false);
          return;
        }

        accountVar(account);
        organisationsVar(organisations as LocalOrganisationType[]);

        // If the account doesn't have any organisations, bail out, so the useEffect listening to the organisations array can set the flag to show the
        // no connected organisations splash screen, which will allow them to navigate to onboarding.
        if (!organisations.length) {
          setIsNoConnectedOrganisationsSplashVisible(true);
          setIsLoading(false);
          return;
        }

        // Grab the organisation from local storage, otherwise default to the first organisation in the list.
        const orgId = localStorageService.getItem('selected-organisation-id');
        const organisation = find(organisations, ({ id }) => id === orgId) || organisations[0];

        // Store the organisation id if default was used.
        localStorageService.setItem('selected-organisation-id', organisation.id);

        organisationVar(organisation as LocalOrganisationType);

        const isOrgSelectedBySuperdealerUser = localStorageService.getItem('selected-organisation-id-by-superdealer');

        if (user.role === "superdealer" && !isOrgSelectedBySuperdealerUser && history.location.pathname !== ORGANISATION_ROUTES.root) {
          history.push(ORGANISATION_ROUTES.root);
        }
      } catch (error) {
        loggerService.error(error);
        setIsError(true);
        setIsLoading(false);
      }
    })();
  }, [isAuthenticating]);

  useEffect(() => {
    if (!organisation) {
      return;
    }

    // If the organisation has not completed onboarding, we need to check what stage the organisation is in, and redirect them to the appropriate
    // stage in their onboarding flow.
    if (!organisation.onboardingComplete && history.location.pathname !== ORGANISATION_ROUTES.root) {
      loggerService.debug('[<AppRoute />] Organisation has not completed onboarding. Redirecting to onboarding.');
      return history.push(ONBOARDING_ROUTES.root);
    }

    if (!sharedRateService.isCurrencySupported(organisation.currency)) {
      loggerService.error('[<AppRoute />] Organisation currency not supported.');
      setIsError(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  }, [organisation]);

  useEffect(() => {
    if (isLoading || !organisations) {
      return;
    }

    if (!organisations.length) {
      loggerService.debug('[<AppRoute />] Account has no organisations. Show no connected organisations splash.');
      setIsNoConnectedOrganisationsSplashVisible(true);
    }
  }, [organisations]);

  return (
    <Route
      {...rest}
      render={(props) => {
        if (isLoading) {
          return null;
        }

        if (isError) {
          return <AppErrorPage />;
        }

        if (isNoConnectedOrganisationsSplashVisible) {
          return <AppNoConnectedOrganisationsSplash />;
        }

        return createElement(component, props);
      }}
    />
  );
});
