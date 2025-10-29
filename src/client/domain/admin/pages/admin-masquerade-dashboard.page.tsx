import React, { memo, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { AUTH_ROUTES } from '@client/auth';
import { AdminErrorPage } from '@client/admin';
import { queryCurrenciesByTenant } from '@client/tenant';
import { ChartContent, ChartControls, chartCurrencyVar } from '@client/chart';
import { queryOrganisationById, organisationVar, LocalOrganisationType } from '@client/organisation';
import { APOLLO_ERROR_MESSAGE, loggerService, Page, PageContent, uiVar, useQueryLocalCommon } from '@client/common';

export const AdminMasqueradeChartPage = memo(() => {
  const history = useHistory();
  const { ui } = useQueryLocalCommon();
  const { orgId } = useParams<{ orgId: string }>();

  useEffect(() => {
    (async () => {
      try {
        const organisation = await queryOrganisationById({ id: orgId });

        organisationVar(organisation as LocalOrganisationType);

        const currencies = await queryCurrenciesByTenant({ tenantId: organisation.tenant.id });

        chartCurrencyVar(currencies[0]);
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

    return () => {
      organisationVar(null);
    };
  }, []);

  if (ui === 'loading') {
    return null;
  }

  if (ui === 'error') {
    return <AdminErrorPage />;
  }

  return (
    <Page>
      <PageContent hasPadding={false}>
        <ChartControls />
        <ChartContent />
      </PageContent>
    </Page>
  );
});
