import React, { memo } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { PLAN_ROUTES } from './plan.routes';
import { PlanPageContainer } from './pages';
import UploadCSVContext, { UploadCSVProvider } from '../upload-csv/pages/upload-csv-context';
import { UploadCSVDetailsPage } from '@client/upload-csv';
import { PlanPageContainer as IMSContainer } from './IMS/pages';

export const PlanLayout = memo(() => (
  <UploadCSVProvider>
    <Switch>
      <Route path={PLAN_ROUTES.root} component={IMSContainer} exact />
      <Route path={PLAN_ROUTES.csvDetails} component={UploadCSVDetailsPage} exact />
      <Route path={PLAN_ROUTES.csvEdit} component={UploadCSVDetailsPage} exact />
      <Redirect to={PLAN_ROUTES.root} />
    </Switch>
  </UploadCSVProvider>
));
