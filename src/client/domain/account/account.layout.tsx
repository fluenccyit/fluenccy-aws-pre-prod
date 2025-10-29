import React, { memo } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { ACCOUNT_ROUTES, ProfilePage, ChangePasswordPage } from '@client/account';

export const AccountLayout = memo(() => (
  <Switch>
    <Route path={ACCOUNT_ROUTES.root} component={ProfilePage} exact />
    <Route path={ACCOUNT_ROUTES.changePassword} component={ChangePasswordPage} exact />
    <Redirect to={ACCOUNT_ROUTES.root} />
  </Switch>
));
