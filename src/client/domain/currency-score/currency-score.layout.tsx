import React, { memo } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { CURRENCY_SCORE_ROUTES, CurrencyScorePage } from '@client/currency-score';

export const CurrencyScoreLayout = memo(() => (
  <>
    <Switch>
      <Route path={CURRENCY_SCORE_ROUTES.root} component={CurrencyScorePage} exact />
      <Redirect to={CURRENCY_SCORE_ROUTES.root} />
    </Switch>
  </>
));
