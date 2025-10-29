import React, { memo, useEffect, useMemo, useState } from 'react';
import {
  LocalOrganisationType,
  organisationsVar,
  organisationVar,
  queryOrganisationsByToken,
  useIsOrganisationTokenInactive,
  useQueryLocalOrganisation,
} from '@client/organisation';
import { ChartMobileSplash, ChartContent, ChartControls, chartCurrencyVar, chartTypeVar, useQueryLocalChart } from '@client/chart';
import { Page, PageContent, TAILWIND_SCREEN_MD, uiVar, useAnalytics, useWindowWidth } from '@client/common';
import { useHistory } from 'react-router-dom';
import { find } from 'lodash';

export const ChartPage = memo(() => {
  const { track } = useAnalytics();
  const { windowWidth } = useWindowWidth();
  const { organisation } = useQueryLocalOrganisation();
  const isTokenInactive = useIsOrganisationTokenInactive();
  const isSplashVisible = useMemo(() => windowWidth <= TAILWIND_SCREEN_MD, [windowWidth]);
  const history = useHistory();
  const [receivableTab, setReceivableTab] = useState(history.location.state?.mode || 'payables');
  const { chartCurrency } = useQueryLocalChart();

  useEffect(() => {
    track('chart_viewed');
    chartCurrencyVar(chartCurrency || organisation?.tradeCurrencies[0]);
    chartTypeVar(history.location?.state?.chartType || 'fx_purchases');
    uiVar('ready');
  }, []);

  useEffect(async () => {
    const organisations = await queryOrganisationsByToken({ paymentType: receivableTab === 'payables' ? 'ACCPAYPAYMENT' : 'ACCRECPAYMENT' });
    organisationsVar(organisations as LocalOrganisationType[]);

    if (!organisations.length) {
      organisationVar(null);
      return;
    }
    const currentOrganisation = organisations.length ? find(organisations, ({ id }) => organisation.id === id) : null;

    organisationVar(currentOrganisation as LocalOrganisationType);
  }, [receivableTab]);

  const onChangeMode = (v) => {
    setReceivableTab(v.id);
  };

  const mode = receivableTab === 'receivables' ? receivableTab : null;

  const renderContent = () => {
    if (isSplashVisible) {
      return (
        <PageContent className="min-h-screen" isCentered>
          <ChartMobileSplash />
        </PageContent>
      );
    }

    return (
      <PageContent className="min-h-screen h-full" hasPadding={false} hasBanner={isTokenInactive}>
        <ChartControls selected={receivableTab} onChange={onChangeMode} />
        <ChartContent mode={mode} />
      </PageContent>
    );
  };

  return <Page>{renderContent()}</Page>;
});
