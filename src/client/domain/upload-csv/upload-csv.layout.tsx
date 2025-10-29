import React, { memo } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { UPLOAD_CSV_ROUTES, UPLOAD_CSV_DETAILS_ROUTES, UploadCSVPage, UploadCSVDetailsPage } from '@client/upload-csv';
import UploadCSVContext, { UploadCSVProvider } from './pages/upload-csv-context';
export const UploadCSVLayout = memo(() => (
  <>
    <UploadCSVProvider>
      <Switch>
        <Route
          path={UPLOAD_CSV_ROUTES.root}
          component={(props) => <UploadCSVPage {...props} mode={props.location.state?.mode} showModeOptions />}
          exact
        />
        <Route path={UPLOAD_CSV_ROUTES.details} component={UploadCSVDetailsPage} exact />
        <Route path={UPLOAD_CSV_ROUTES.edit} component={UploadCSVDetailsPage} exact />
        <Redirect to={UPLOAD_CSV_ROUTES.root} />
      </Switch>
    </UploadCSVProvider>
  </>
));
