import React, { memo, useEffect, useState } from 'react';
import { last } from 'lodash';
import { useHistory } from 'react-router-dom';
import { AppErrorPage } from '@client/app';
import { GqlCurrencyScoreBreakdown } from '@graphql';
import { ONBOARDING_ROUTES } from '@client/onboarding';
import { APOLLO_ERROR_MESSAGE, loggerService, Page, uiVar, useAnalytics, useQueryLocalCommon } from '@client/common';
import { useQueryLocalOrganisation } from '@client/organisation';
import { UploadCSVBreakdown, UploadCSVPageContent, UploadCSVTable, UploadCSVTableContainer } from '@client/upload-csv';
import Select from 'react-select';

const modeOptions = [
  { label: 'Payables', value: '' },
  { label: 'Receivables', value: 'receivables' },
];

export const UploadCSVPage = memo(({ mode, showModeOptions = false }) => {
  const history = useHistory();
  const { track } = useAnalytics();
  const { ui } = useQueryLocalCommon();
  const { organisation } = useQueryLocalOrganisation();
  const [breakdown, setBreakdown] = useState<GqlCurrencyScoreBreakdown>();
  const [currencyScores, setCurrencyScores] = useState<GqlCurrencyScoreBreakdown[]>([]);
  const [modeType, setModeType] = useState(modeOptions.find((o) => o.value === mode) || modeOptions[0]);

  useEffect(() => {
    track('currencyscore_viewed');
  }, []);

  useEffect(() => {
    (async () => {
      try {
        uiVar('loading');

        if (!organisation) {
          return;
        }

        if (!organisation.onboardingComplete) {
          loggerService.debug('[<CurrencyScorePage />] Organisation has not completed onboarding. Redirecting to onboarding.');
          return history.push(ONBOARDING_ROUTES.currencyScoreSummary);
        }

        setBreakdown(last(organisation.currencyScores));
        setCurrencyScores(organisation.currencyScores);
        uiVar('ready');
      } catch (error) {
        // if (error.message === APOLLO_ERROR_MESSAGE.authenticationFailed) {
        //   history.push(AUTH_ROUTES.login);
        // } else {
        //   loggerService.error(error);
        //   uiVar('error');
        // }
      }
    })();
  }, [organisation]);

  if (ui === 'loading') {
    return null;
  }

  if (ui === 'error' || !organisation) {
    return <AppErrorPage />;
  }

  return (
    <Page className="w-full">
      {/* <UploadCSVProvider> */}
      <UploadCSVPageContent className="w-full flex-row">
        <div className="p-6 pb-2 md:pb-6 lg:bg-gray-100 lg:border-r border-gray-200 p-0">
          <UploadCSVBreakdown breakdown={breakdown} mode={modeType?.value} />
        </div>
        
        <div className="p-6 pb-10 flex flex-col bg-white overflow-x-hidden w-full relative">
          {showModeOptions && (
          <div className="flex absolute top-2 w-1/2 pl-6" style={{ zIndex: 100 }}>
            <Select defaultValue={modeType} options={modeOptions} isDisabled={false} onChange={setModeType} value={modeType} />
          </div>
          )}
          <UploadCSVTableContainer mode={modeType?.value} />
        </div>
        
      </UploadCSVPageContent>
      {/* </UploadCSVProvider> */}
    </Page>
  );
});
