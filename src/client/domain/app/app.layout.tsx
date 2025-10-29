import React, { memo } from 'react';
import { Switch, Route, Redirect, useHistory } from 'react-router-dom';
import { FourOhFourPage, localStorageService, TheHeader } from '@client/common';
import { ChartLayout, CHART_ROUTES } from '@client/chart';
import { CurrencyScoreLayout, CURRENCY_SCORE_ROUTES } from '@client/currency-score';
import { UploadCSVLayout, UPLOAD_CSV_ROUTES } from '@client/upload-csv';
import { DashboardLayout, DASHBOARD_ROUTES } from '@client/dashboard';
import { PlanLayout, PLAN_ROUTES } from '@client/plan';
import { ACCOUNT_ROUTES, AccountLayout } from '@client/account';
import { ORGANISATION_ROUTES, OrganisationLayout, OrganisationInactiveTokenBanner, useIsOrganisationTokenInactive } from '@client/organisation';
import { useQueryLocalUser } from '@client/user';
import { UserLoginBanner } from '@client/app/components/user-login-banner.component';
import { CURRENY_MANAGEMENT_ROUTES, CurrencyManagementLayout } from '@client/currency-management';
import cn from 'classnames';
import { QUOTES_ROUTES, QuoteLayout } from '@client/quote';

export const AppLayout = memo(() => {
  const history = useHistory();

  if (history.location.pathname === ORGANISATION_ROUTES.root) {
    localStorageService.setItem('hideHeader', 'true');
  } else {
    localStorageService.removeItem('hideHeader');
  }
  const { user } = useQueryLocalUser();
  const showUserLoginBanner = user?.role === 'superdealer';
  const isTokenInactive = useIsOrganisationTokenInactive();
  const hideHeader = localStorageService.getItem('hideHeader') === 'true';
  const hasBanner = showUserLoginBanner || isTokenInactive;
  const classes = cn(`w-full bg-white relative ${showUserLoginBanner ? 'md:mt-44' : 'md:mt-28'}`, {
    'mt-14 md:mt-20': !hideHeader && !hasBanner,
    'mt-16 md:mt-26': !hideHeader && !hasBanner,
    'mt-24 md:mt-32': !hideHeader && hasBanner,
  });

  return (
    <>
      {!hideHeader && <TheHeader />}
      {!hideHeader && hasBanner && (
        <div className="flex w-full flex-col absolute md:top-20">
          {showUserLoginBanner && <UserLoginBanner />}
          {isTokenInactive && <OrganisationInactiveTokenBanner />}
        </div>
      )}
      <div className={hideHeader ? 'w-full bg-white' : classes}>
        <Switch>
          <Route path={CURRENCY_SCORE_ROUTES.root} component={CurrencyScoreLayout} />
          <Route path={UPLOAD_CSV_ROUTES.root} component={UploadCSVLayout} />
          <Route path={CHART_ROUTES.root} component={ChartLayout} />
          <Route path={DASHBOARD_ROUTES.root} component={DashboardLayout} />
          <Route path={PLAN_ROUTES.root} component={PlanLayout} />
          <Route path={ACCOUNT_ROUTES.root} component={AccountLayout} />
          <Route path={ORGANISATION_ROUTES.root} component={OrganisationLayout} />
          <Route path={CURRENY_MANAGEMENT_ROUTES.root} component={CurrencyManagementLayout} />
          <Route path={QUOTES_ROUTES.root} component={QuoteLayout} />
          <Redirect from="/" to={DASHBOARD_ROUTES.root} exact />
          <Route component={FourOhFourPage} />
        </Switch>
      </div>
    </>
  );
});
