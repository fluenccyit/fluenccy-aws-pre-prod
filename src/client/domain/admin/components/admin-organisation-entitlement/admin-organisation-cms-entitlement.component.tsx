import React, { useState, useEffect } from 'react';
import { CurrencyReserves } from '@client/currency-management';
import { useParams } from 'react-router-dom';
import { useQueryLocalOrganisation } from '@client/organisation';
import { OrgCMSPricingEntitlement } from './admin-organisation-cms-entitlement-pricing.component';

export const OrgCMSEntitlement = ({ mode }) => {
  const [selected, setSelected] = useState();
  const [fetchingCurrencies, setFetchingCurrencies] = useState(true);
  const { organisation } = useQueryLocalOrganisation();

  useEffect(() => {
    setSelected();
  }, [organisation]);

  return (
    <div className="mb-6 px-4">
      <span className="flex mb-2 text-lg font-bold antialiased text-gray-900">Entitlements for CMS</span>
      <CurrencyReserves
        fetchingCurrencies={fetchingCurrencies}
        setFetchingCurrencies={setFetchingCurrencies}
        onChange={setSelected}
        selected={selected}
        horizontal
        organisation={organisation}
        editable
        mode={mode}
      />
      <OrgCMSPricingEntitlement orgId={organisation?.id} currency={selected} mode={mode} />
    </div>
  );
};
