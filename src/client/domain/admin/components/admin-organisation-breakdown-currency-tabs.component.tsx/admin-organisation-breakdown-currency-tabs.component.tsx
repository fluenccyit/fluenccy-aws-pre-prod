import React, { useMemo } from 'react';
import { TabModel, Tabs, TabsSkeleton, useQueryLocalCommon } from '@client/common';
import { GqlSupportedCurrency } from '@graphql';
import { useQueryLocalChart } from '@client/chart';
import { map } from 'lodash';
import { LocalAdminOrganisationType } from '@client/organisation';

type Props = {
  setCurrency: (currency: GqlSupportedCurrency) => void;
  organisation: LocalAdminOrganisationType;
  isDisabled: boolean;
};

export const AdminOrganisationBreakdownCurrencyTabs = ({ setCurrency, organisation, isDisabled }: Props) => {
  const { chartCurrency } = useQueryLocalChart();
  const currencyOptions = useMemo(() => map(organisation?.tradeCurrencies || [], (currency) => ({ id: currency, label: currency })), [organisation]);
  const { ui } = useQueryLocalCommon();

  const handleCurrencyChange = ({ id: selectedCurrency }: TabModel<GqlSupportedCurrency>) => {
    setCurrency(selectedCurrency);
  };

  if (ui === 'loading') {
    return <TabsSkeleton />;
  }

  if (!currencyOptions.length) {
    return <TabsSkeleton isLoading={false} />;
  }

  return (
    <Tabs<GqlSupportedCurrency>
      tabs={currencyOptions}
      initialTabId={chartCurrency}
      onChange={handleCurrencyChange}
      isDisabled={ui === 'saving' || isDisabled}
    />
  );
};
