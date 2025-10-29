import React, { memo } from 'react';
import { Switch, Route } from 'react-router-dom';
import { AUTH_ROUTES, ForgotPasswordPage, LoginPage, LogoutPage, SignUpPage, TwoFactorAuthPage } from '@client/auth';

export const AuthLayout = memo(() => (
  <Switch>
    <Route path={AUTH_ROUTES.twoFactor} component={TwoFactorAuthPage} exact />
    <Route path={AUTH_ROUTES.forgotPassword} component={ForgotPasswordPage} exact />
    <Route path={AUTH_ROUTES.login} component={LoginPage} exact />
    <Route path={AUTH_ROUTES.logout} component={LogoutPage} exact />
    <Route path={AUTH_ROUTES.signUp} component={SignUpPage} exact />
  </Switch>
));
