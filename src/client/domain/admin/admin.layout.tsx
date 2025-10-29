import React, { memo } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import {
  ADMIN_ROUTES,
  AdminInvitePage,
  AdminHeader,
  AdminOrganisationPage,
  AdminOrganisationsPage,
  AdminMasqueradeCurrencyScorePage,
  AdminMasqueradeChartPage,
} from '@client/admin';

export const AdminLayout = memo(() => (
  <>
    <AdminHeader />
    <div className="flex flex-col mt-24">
      <Switch>
        <Route path={ADMIN_ROUTES.organisations} component={AdminOrganisationsPage} exact />
        <Route path={ADMIN_ROUTES.organisation} component={AdminOrganisationPage} exact />
        <Route path={ADMIN_ROUTES.invite} component={AdminInvitePage} exact />
        <Route path={ADMIN_ROUTES.masqueradeCurrencyScore} component={AdminMasqueradeCurrencyScorePage} exact />
        <Route path={ADMIN_ROUTES.masqueradeDashboard} component={AdminMasqueradeChartPage} exact />
        <Redirect from={ADMIN_ROUTES.masqueradeRoot} to={ADMIN_ROUTES.masqueradeCurrencyScore} />
        <Redirect from={ADMIN_ROUTES.root} to={ADMIN_ROUTES.organisations} />
      </Switch>
    </div>
  </>
));
