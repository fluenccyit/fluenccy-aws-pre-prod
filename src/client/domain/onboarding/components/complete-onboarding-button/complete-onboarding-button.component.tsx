import React, { memo } from 'react';
import { useHistory } from 'react-router-dom';
import { DASHBOARD_ROUTES } from '@client/dashboard';
import { useMutationOrganisation, useQueryLocalOrganisation } from '@client/organisation';
import { Button, loggerService, ToastGenericError, uiVar, useAnalytics, useQueryLocalCommon, useToast } from '@client/common';

type Props = {
  currencyScore: number;
};

export const CompleteOnboardingButton = memo(({ currencyScore }: Props) => {
  const history = useHistory();
  const { addToast } = useToast();
  const { track } = useAnalytics();
  const { ui } = useQueryLocalCommon();
  const { organisation } = useQueryLocalOrganisation();
  const { updateOrganisation } = useMutationOrganisation();

  if (!organisation) {
    return null;
  }

  const handleSeeFullReportClick = async () => {
    try {
      track('currencyscore_summary_primary');
      uiVar('saving');
      await updateOrganisation({ variables: { input: { orgId: organisation.id, onboardingComplete: true } } });

      history.push(DASHBOARD_ROUTES.root);
    } catch (error) {
      loggerService.error(error);
      addToast(<ToastGenericError />, 'danger');
      uiVar('ready');
    }
  };

  return (
    <Button onClick={handleSeeFullReportClick} isDisabled={!currencyScore || ui === 'saving'} isRounded>
      See my full report
    </Button>
  );
});
