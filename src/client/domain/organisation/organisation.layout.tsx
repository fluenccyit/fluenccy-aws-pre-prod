import React, { memo } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { ORGANISATION_ROUTES } from './organisation.routes';
import { OrganisationSelectPage } from './pages';

export const OrganisationLayout = memo(() => (
  <>
    <Switch>
      <Route path={ORGANISATION_ROUTES.root} component={OrganisationSelectPage} exact />
      <Redirect to={ORGANISATION_ROUTES.root} />
    </Switch>
  </>
));
