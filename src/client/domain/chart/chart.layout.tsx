import React, { memo } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { CHART_ROUTES, ChartPage } from '@client/chart';

export const ChartLayout = memo(() => (
  <>
    <Switch>
      <Route path={CHART_ROUTES.root} component={ChartPage} exact />
      <Redirect to={CHART_ROUTES.root} />
    </Switch>
  </>
));
