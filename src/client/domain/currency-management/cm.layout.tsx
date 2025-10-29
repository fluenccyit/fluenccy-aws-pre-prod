import React, { memo } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { CURRENY_MANAGEMENT_ROUTES } from './cm.routes';
import { UploadCSVDetailsPage } from '@client/upload-csv';
import { CMPageContainer } from './pages';
import { UploadCSVProvider } from '../upload-csv/pages/upload-csv-context';

export const CurrencyManagementLayout = memo(() => (
  <UploadCSVProvider>
    <Switch>
      <Route path={CURRENY_MANAGEMENT_ROUTES.root} component={CMPageContainer} exact />
      <Route path={CURRENY_MANAGEMENT_ROUTES.csvDetails} component={props => <UploadCSVDetailsPage {...props} isInCMS/>} exact />
      <Route path={CURRENY_MANAGEMENT_ROUTES.csvEdit} component={props => <UploadCSVDetailsPage {...props} isInCMS/>} exact />
      <Redirect to={CURRENY_MANAGEMENT_ROUTES.root} />
    </Switch>
  </UploadCSVProvider>
));
