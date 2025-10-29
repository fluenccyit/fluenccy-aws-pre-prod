import { useMemo } from 'react';
import { useQueryLocalOrganisation } from '@client/organisation';

export const useIsOrganisationTokenInactive = () => {
  const { organisation } = useQueryLocalOrganisation();

  return useMemo(() => Boolean(organisation && organisation.tokenStatus !== 'active' && !organisation?.tenant.id.includes('tenant_')), [organisation]);
};
