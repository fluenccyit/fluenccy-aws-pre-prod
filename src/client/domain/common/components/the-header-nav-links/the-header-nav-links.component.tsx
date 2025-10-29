import React, { memo } from 'react';
import { PLAN_ROUTES } from '@client/plan';
import { CHART_ROUTES } from '@client/chart';
import { DASHBOARD_ROUTES } from '@client/dashboard';
import { HeaderNavLink, EXTERNAL_LINK } from '@client/common';
import { CURRENCY_SCORE_ROUTES } from '@client/currency-score';
import FluenccyLogoSvg from '@assets/svg/fluenccy-icon-logo.svg';
import FluenccyLogoInverseSvg from '@assets/svg/fluenccy-logo-inverse.svg';
import { UPLOAD_CSV_ROUTES } from '@client/upload-csv';
import { CURRENY_MANAGEMENT_ROUTES } from '@client/currency-management';
import { QUOTES_ROUTES } from '@client/quote';

type Props = {
  hasNoNavLinks?: boolean;
};

export const TheHeaderNavLinks = memo(({ hasNoNavLinks }: Props) => (
  <>
    <section className="hidden md:flex flex-row justify-start w-full">
      {hasNoNavLinks ? (
        <FluenccyLogoInverseSvg />
      ) : (
        <>
          <HeaderNavLink to="/" hasActiveState={false}>
            <FluenccyLogoInverseSvg />
          </HeaderNavLink>
          <HeaderNavLink className="ml-12" to={DASHBOARD_ROUTES.root}>
            Dashboard
          </HeaderNavLink>
          <HeaderNavLink className="ml-12" to={CHART_ROUTES.root}>
            Reports
          </HeaderNavLink>
          <HeaderNavLink className="ml-12" to={CURRENCY_SCORE_ROUTES.root}>
            Currency Score
          </HeaderNavLink>
          <HeaderNavLink className="ml-12" to={UPLOAD_CSV_ROUTES.root}>
            Import Data
          </HeaderNavLink>
          {/* <HeaderNavLink className="ml-12" to={EXTERNAL_LINK.coaching} isExternal>
            Coaching
          </HeaderNavLink> */}
          <HeaderNavLink className="ml-12" to={QUOTES_ROUTES.root}>
            Quotes
          </HeaderNavLink>
          <HeaderNavLink className="ml-12 group" to={PLAN_ROUTES.root}>
            Invoice Management
          </HeaderNavLink>
          <HeaderNavLink className="ml-12 group" to={CURRENY_MANAGEMENT_ROUTES.root}>
            Currency Management
          </HeaderNavLink>
        </>
      )}
    </section>

    <section className="flex md:hidden">
      {hasNoNavLinks ? (
        <FluenccyLogoSvg />
      ) : (
        <HeaderNavLink to="/" hasActiveState={false}>
          <FluenccyLogoSvg />
        </HeaderNavLink>
      )}
    </section>
  </>
));
