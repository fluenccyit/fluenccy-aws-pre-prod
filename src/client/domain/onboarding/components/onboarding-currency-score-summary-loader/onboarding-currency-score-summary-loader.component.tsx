import React, { memo, useEffect } from 'react';
import { FluenccyLoader, Page, PageContent, ProgressBar, Text, TheHeader, useAnalytics } from '@client/common';

type Props = {
  stage: number;
};

export const OnboardingCurrencyScoreSummaryLoader = memo(({ stage }: Props) => {
  const { track } = useAnalytics();

  useEffect(() => {
    track('onboarding_loadingstate');
  }, []);

  const getLabel = () => {
    if (!stage) {
      return 'We are syncing your data';
    } else if (stage === 1) {
      return 'Extracting invoices and payments';
    } else if (stage === 2) {
      return 'Calculating transaction details';
    } else {
      return 'Calculating currency score';
    }
  };

  return (
    <Page>
      <TheHeader hasNoNavLinks />
      <PageContent className="min-h-screen" isCentered>
        <div className="flex flex-col items-center justify-center">
          <FluenccyLoader className="w-24 mb-16" />
          <Text className="text-lg text-center mb-4" isBlock>
            {getLabel()}
          </Text>
          <ProgressBar className="w-36" separatorClassName="bg-gray-200" total={3} completed={stage} isLoading />

          <Text className="text-sm text-center mt-16" variant="gray" isBlock>
            Connecting your Xero account could take up to 5 minutes
          </Text>
        </div>
      </PageContent>
    </Page>
  );
});
