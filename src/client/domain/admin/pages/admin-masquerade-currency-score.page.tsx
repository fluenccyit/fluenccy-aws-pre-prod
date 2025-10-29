import React, { memo, useEffect, useState } from 'react';
import { last } from 'lodash';
import { useHistory, useParams } from 'react-router-dom';
import { AUTH_ROUTES } from '@client/auth';
import { AdminErrorPage } from '@client/admin';
import { GqlCurrencyScoreBreakdown } from '@graphql';
import { queryOrganisationById, organisationVar, LocalOrganisationType } from '@client/organisation';
import { APOLLO_ERROR_MESSAGE, loggerService, Page, uiVar, useQueryLocalCommon } from '@client/common';
import {
  CurrencyScoreBreakdown,
  CurrencyScoreChart,
  CurrencyScoreFactors,
  CurrencyScorePageContent,
  CurrencyScoreToggleSection,
} from '@client/currency-score';

export const AdminMasqueradeCurrencyScorePage = memo(() => {
  const history = useHistory();
  const { ui } = useQueryLocalCommon();
  const { orgId } = useParams<{ orgId: string }>();
  const [breakdown, setBreakdown] = useState<GqlCurrencyScoreBreakdown>();
  const [currencyScores, setCurrencyScores] = useState<GqlCurrencyScoreBreakdown[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const organisation = await queryOrganisationById({ id: orgId });

        organisationVar(organisation as LocalOrganisationType);

        setBreakdown(last(organisation.currencyScores));
        setCurrencyScores(organisation.currencyScores);
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

  if (ui === 'error' || !breakdown || !currencyScores.length) {
    return <AdminErrorPage />;
  }

  return (
    <Page>
      <CurrencyScorePageContent>
        <div className="p-6 pb-2 md:pb-6 lg:bg-gray-100 lg:border-r lg:border-gray-200 lg:p-0">
          <CurrencyScoreBreakdown breakdown={breakdown} />
        </div>
        <div className="flex flex-col bg-white overflow-x-hidden w-full">
          <CurrencyScoreChart currencyScores={currencyScores} />

          <div className="p-3 lg:p-0">
            <CurrencyScoreToggleSection />
            <CurrencyScoreFactors breakdown={breakdown} />
          </div>
        </div>
      </CurrencyScorePageContent>
    </Page>
  );
});
