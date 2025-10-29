import React, { createElement, ComponentType, memo, useEffect, useState } from 'react';
import { useIntercom } from 'react-use-intercom';
import { Route, RouteProps, useHistory } from 'react-router-dom';
import { loggerService } from '@client/common';
import { AdminErrorPage } from '@client/admin';
import { queryUser, userVar } from '@client/user';
import { AUTH_ROUTES, useAuth } from '@client/auth';

type Props = RouteProps & {
  component: ComponentType<any>;
};

export const AdminRoute = memo((props: Props) => {
  const { component, ...rest } = props;
  const history = useHistory();
  const { shutdown } = useIntercom();
  const { isAuthenticating, isAuthenticated, firebaseUser } = useAuth();
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (isAuthenticating) {
          return;
        }

        if (!isAuthenticated || !firebaseUser) {
          loggerService.debug('<AdminRoute /> User is not authenticated. Redirecting to login.');
          return history.push(AUTH_ROUTES.login);
        }

        // We don't want intercom to show on the admin screen. So we shut it down.
        shutdown();

        const user = await queryUser();

        if (user.role !== 'superuser') {
          setIsLoading(false);
          setIsError(true);
          return;
        }

        userVar({ ...user, email: firebaseUser.email || '' });
        setIsLoading(false);
      } catch (error) {
        loggerService.error(error);
        setIsError(true);
        setIsLoading(false);
      }
    })();
  }, [isAuthenticating]);

  return (
    <Route
      {...rest}
      render={(props) => {
        if (isLoading) {
          return null;
        }

        if (isError) {
          return <AdminErrorPage />;
        }

        return createElement(component, props);
      }}
    />
  );
});
