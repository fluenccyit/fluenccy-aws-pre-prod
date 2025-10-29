import React from 'react';
import { GqlCoreOrganisationFieldsFragment } from '@graphql';
import { useMutationOrganisation } from '@client/organisation';
import { ToastGenericError, uiVar, useAnalytics, useToast } from '@client/common';

export const useJoinWaitlist = () => {
  const { addToast } = useToast();
  const { track } = useAnalytics();
  const { updateOrganisation } = useMutationOrganisation();

  const joinWaitlist = async (organisation: GqlCoreOrganisationFieldsFragment) => {
    if (organisation.intentRegistered) {
      return;
    }

    try {
      uiVar('saving');
      await updateOrganisation({ variables: { input: { orgId: organisation.id, intentRegistered: true } } });
      await track('currencyscore_plan_waitlist');
      uiVar('ready');
    } catch {
      addToast(<ToastGenericError />, 'danger');
      uiVar('ready');
    }
  };
  return { joinWaitlist };
};
