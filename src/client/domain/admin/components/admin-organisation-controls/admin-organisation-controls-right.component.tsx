import { AdminOrganisationActionsDropdown, adminOrganisationTabVar } from '@client/admin';
import { TabModel, Tabs, useQueryLocalCommon } from '@client/common';
import { chartDateRangeVar } from '@client/chart';
import React from 'react';

export const AdminOrganisationControlsRight = () => {
  const { ui } = useQueryLocalCommon();
  const TABS = [
    {
      id: 'currencyScore',
      label: 'Currency Score',
    },
    {
      id: 'varianceChart',
      label: 'Variance',
    },
    {
      id: 'performance',
      label: 'Performance',
    },
    {
      id: 'fxPurchases',
      label: 'FX Purchases',
    },
    {
      id: 'entitlement',
      label: 'Entitlements',
    },
    {
      id: 'feedback',
      label: 'Feedback',
    }
  ];

  const handleChangeTab = (activeTab: TabModel<string>) => {
    chartDateRangeVar(null);
    adminOrganisationTabVar(activeTab.id);
  };

  return (
    <div className="flex items-center justify-between w-full h-full px-6">
      <Tabs tabs={TABS} variant="underline" onChange={handleChangeTab} isDisabled={ui === 'loading'} />
      <div className="flex items-center">
        <AdminOrganisationActionsDropdown />
      </div>
    </div>
  );
};
