import React, { memo } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { DASHBOARD_ROUTES } from './dashboard.routes';
import { DashboardPage } from './pages';

export const DashboardLayout = memo(() => (
  <>
    <Switch>
      <Route path={DASHBOARD_ROUTES.root} component={DashboardPage} exact />
      <Redirect to={DASHBOARD_ROUTES.root} />
    </Switch>
  </>
));
