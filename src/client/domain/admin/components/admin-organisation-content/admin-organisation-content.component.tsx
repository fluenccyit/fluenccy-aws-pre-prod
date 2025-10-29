import React, { memo, useEffect, useState } from 'react';
import { last } from 'lodash';
import { useHistory } from 'react-router-dom';
import { AUTH_ROUTES } from '@client/auth';
import { VarianceChart } from '@client/variance';
import { GqlCurrencyScoreBreakdown } from '@graphql';
import { PerformanceChart } from '@client/performance';
import { InvoiceTableContainer } from '@client/invoice';
import { ChartErrorPanel, ChartLoader, chartDateRangeVar } from '@client/chart';
import { LocalAdminOrganisationType, useQueryLocalOrganisation } from '@client/organisation';
import { uiVar, APOLLO_ERROR_MESSAGE, loggerService, useQueryLocalCommon, localStorageService } from '@client/common';
import { CurrencyScoreChart, CurrencyScoreToggleSection, CurrencyScoreFactors } from '@client/currency-score';
import {
  AdminErrorPage,
  AdminOrganisationBreakdown,
  AdminOrganisationBreakdownContainer,
  AdminOrganisationDetails,
  AdminOrganisationTabsContainer,
  useQueryLocalAdmin,
} from '@client/admin';
import { FxPurchasesChart } from '@client/fx-purchases';
import { OrgEntitlementContainer, AdminOrganisationIms } from '@client/admin';
import { AdminOrganisationCms } from '../CMS';
import axios from 'axios';

export const AdminOrganisationContent = memo(() => {
  const { organisation: localOrganisation } = useQueryLocalOrganisation();
  const [currencyScoreBreakdown, setCurrencyScoreBreakdown] = useState<GqlCurrencyScoreBreakdown>();
  const { transactionBreakdown } = useQueryLocalAdmin();
  const [currencyScores, setCurrencyScores] = useState<GqlCurrencyScoreBreakdown[]>([]);
  const [entitlements, setEntitlements] = useState();
  const [receivablesEntitlements, setReceivablesEntitlements] = useState();
  const history = useHistory();
  const { ui } = useQueryLocalCommon();
  const { activeAdminTab } = useQueryLocalAdmin();

  useEffect(() => {
    (async () => {
      try {
        if (!localOrganisation) {
          return;
        }

        setCurrencyScoreBreakdown(last(localOrganisation.currencyScores));
        setCurrencyScores(localOrganisation.currencyScores);
        uiVar('ready');
      } catch (error) {
        if (error.message === APOLLO_ERROR_MESSAGE.authenticationFailed) {
          history.push(AUTH_ROUTES.login);
        } else {
          loggerService.error(error);
          uiVar('error');
        }
      }
    })();
  }, [localOrganisation]);

  useEffect(() => {
    chartDateRangeVar(null);
  }, [transactionBreakdown]);
  useEffect(() => {
    if (localOrganisation) {
      getEntitlements();
      getEntitlements('receivables');
    }
  }, [localOrganisation]);

  const getEntitlements = (mode = null) => {
    try {
      let url = `/api/orgEntitlement/get-OrgEntitlements`;
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        authorization: token,
      };

      const payload = {
        orgId: localOrganisation?.id,
        mode,
      };

      axios.post(url, payload, { headers: headers }).then((res) => {
        if (mode) {
          setReceivablesEntitlements(res.data.data.OrgEntitlements[0] || {});
        } else {
          setEntitlements(res.data.data.OrgEntitlements[0] || {});
        }
      });
    } catch (e) {
      // addToast('Exception occurred... Kindly try again by reloading page.', 'danger');
    }
  };

  if (ui === 'error') {
    return <AdminErrorPage />;
  }

  return (
    <div className="flex pt-16 min-h-screen">
      <AdminOrganisationBreakdownContainer>
        {localOrganisation && <AdminOrganisationDetails organisation={localOrganisation as LocalAdminOrganisationType} />}
        <AdminOrganisationBreakdown organisation={localOrganisation as LocalAdminOrganisationType} />
      </AdminOrganisationBreakdownContainer>
      <AdminOrganisationTabsContainer>
        {ui === 'ready' && (
          <>
            {activeAdminTab === 'currencyScore' && (
              <div className="flex flex-col bg-white overflow-x-hidden w-full">
                {Boolean(currencyScores.length) && (
                  <>
                    <CurrencyScoreChart currencyScores={currencyScores} />
                    <div className="p-3 lg:p-0">
                      <CurrencyScoreToggleSection />
                      {currencyScoreBreakdown && <CurrencyScoreFactors breakdown={currencyScoreBreakdown} />}
                    </div>
                  </>
                )}
                {!currencyScores.length && <ChartErrorPanel state="no-data" />}
              </div>
            )}
            {(activeAdminTab === 'varianceChart' || activeAdminTab === 'performance' || activeAdminTab === 'fxPurchases') && (
              <>
                {transactionBreakdown && Boolean(transactionBreakdown?.deliveryCost) && (
                  <>
                    {activeAdminTab === 'varianceChart' && (
                      <VarianceChart
                        transactionsByMonth={transactionBreakdown?.transactionsByMonth}
                        dateFrom={transactionBreakdown?.dateFrom}
                        dateTo={transactionBreakdown?.dateTo}
                      />
                    )}
                    {activeAdminTab === 'performance' && (
                      <PerformanceChart
                        transactionsByMonth={transactionBreakdown?.transactionsByMonth}
                        dateFrom={transactionBreakdown?.dateFrom}
                        dateTo={transactionBreakdown?.dateTo}
                      />
                    )}
                    {activeAdminTab === 'fxPurchases' && (
                      <FxPurchasesChart
                        transactionsByMonth={transactionBreakdown?.transactionsByMonth}
                        dateFrom={transactionBreakdown?.dateFrom}
                        dateTo={transactionBreakdown?.dateTo}
                      />
                    )}
                    <InvoiceTableContainer />
                  </>
                )}
                {!transactionBreakdown?.deliveryCost && <ChartErrorPanel state="no-data" />}
              </>
            )}
            {activeAdminTab === 'entitlement' && <OrgEntitlementContainer />}
            {activeAdminTab === 'feedback' && (
              <>
                <AdminOrganisationIms entitlements={entitlements} receivableEntitlements={receivablesEntitlements} />
                <AdminOrganisationCms entitlements={entitlements} receivableEntitlements={receivablesEntitlements} />
              </>
            )}
          </>
        )}
        {ui === 'loading' && <ChartLoader />}
      </AdminOrganisationTabsContainer>
    </div>
  );
});
