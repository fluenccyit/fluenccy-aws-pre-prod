import React, { createElement, ComponentType, memo, useEffect, useState } from 'react';
import { last } from 'lodash';
import { Route, RouteProps, useHistory } from 'react-router-dom';
import { ADMIN_ROUTES } from '@client/admin';
import { sharedRateService } from '@shared/rate';
import { AUTH_ROUTES, useAuth } from '@client/auth';
import { OnboardingErrorPage, ONBOARDING_ROUTES } from '@client/onboarding';
import { queryAccount, accountVar, useQueryLocalAccount } from '@client/account';
import { localStorageService, loggerService, useAnalytics, useCookies } from '@client/common';
import { queryUser, useQueryLocalUser, userService, userVar } from '@client/user';
import { LocalOrganisationType, organisationsVar, organisationVar, queryOrganisationsByToken, useQueryLocalOrganisation } from '@client/organisation';

type Props = RouteProps & {
  component: ComponentType<any>;
};

export const OnboardingRoute = memo(({ component, ...rest }: Props) => {
  const history = useHistory();
  const { identify, page } = useAnalytics();
  const { user: localUser } = useQueryLocalUser();
  const { account: localAccount } = useQueryLocalAccount();
  const { isAuthenticating, isAuthenticated, firebaseUser } = useAuth();
  const { organisation: localOrganisation, organisations: localOrganisations } = useQueryLocalOrganisation();
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { getCookie } = useCookies();

  useEffect(() => {
    (async () => {
      try {
        if (isAuthenticating) {
          return;
        }

        if (!isAuthenticated || !firebaseUser) {
          loggerService.debug('[<OnboardingRoute />] User is not authenticated. Redirecting to login.');
          return history.push(AUTH_ROUTES.login);
        }

        if (getCookie('two-factor-auth') === 'false' || !getCookie('two-factor-auth')) {
          loggerService.debug('[<AppRoute />] User is not authenticated via two factor. Redirecting to two factor auth.');
          return history.push({pathname: AUTH_ROUTES.twoFactor, state: { email: firebaseUser?.email }});
        }

        if (localAccount && localUser && localOrganisations?.length && localOrganisation) {
          loggerService.debug('[<OnboardingRoute />] Context already fetched.');
          return;
        }

        loggerService.debug('[<OnboardingRoute />] Fetching context data.');

        const user = await queryUser();

        // If we detect that the user is a `superuser`, redirect them to the AdminPage, as they won't have any accounts, or organisations.
        if (user.role === 'superuser') {
          loggerService.debug('[<OnboardingRoute />] User is a `superuser`. Redirecting to admin.');
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
          loggerService.error('[<OnboardingRoute />] There is no account associated with the token.');
          setIsError(true);
          setIsLoading(false);
          return;
        }

        accountVar(account);
        organisationsVar(organisations as LocalOrganisationType[]);

        if (organisations.length) {
          // Select the last organisation in the response, as this will be the most recently created.
          const organisation = last(organisations) || organisations[0];

          // Store the organisation id if default was used.
          localStorageService.setItem('selected-organisation-id', organisation.id);
          localStorageService.setItem('tenant-id', organisation.tenant.id);
          console.log('organisation', organisation);

          organisationVar(organisation as LocalOrganisationType);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        loggerService.error(error);
        setIsError(true);
        setIsLoading(false);
      }
    })();
  }, [isAuthenticating]);

  useEffect(() => {
    if (!localOrganisation) {
      return;
    }

    // If the organisation has completed onboarding, redirect them to the root of the app.
    if (localOrganisation.onboardingComplete) {
      loggerService.debug('[<OnboardingRoute />] Organisation has completed onboarding. Redirecting to app.');
      return history.push('/');
    }

    if (!sharedRateService.isCurrencySupported(localOrganisation.currency)) {
      loggerService.error('[<OnboardingRoute />] Organisation currency not supported.');
      setIsError(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  }, [localOrganisation]);

  return (
    <Route
      {...rest}
      render={(props) => {
        if (isLoading) {
          return null;
        }

        if (isError) {
          return <OnboardingErrorPage />;
        }

        return createElement(component, props);
      }}
    />
  );
});
