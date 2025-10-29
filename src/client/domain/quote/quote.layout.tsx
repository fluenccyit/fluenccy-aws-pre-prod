import React, { memo } from 'react';
import { Switch, Route } from 'react-router-dom';
import { QUOTES_ROUTES } from './quote.routes';
import { QuotePageContainer } from './pages/quote.container';
import { UploadCSVProvider } from '../upload-csv/pages/upload-csv-context';

export const QuoteLayout = memo(() => (
  <UploadCSVProvider>
    <Switch>
      <Route path={QUOTES_ROUTES.root} component={QuotePageContainer} exact />
    </Switch>
  </UploadCSVProvider>
));
