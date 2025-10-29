import { gql, makeVar, useQuery } from '@apollo/client';
import { TransactionBreakdownType } from '@shared/transaction';

type LocalQuery = {
  localAdminEmail: string;
  adminOrganisationTabId: string;
  transactionBreakdown: TransactionBreakdownType | null;
};

export const QUERY_LOCAL_ADMIN = gql`
  query LocalAdminEmail {
    localAdminEmail @client
    adminOrganisationTabId @client
    transactionBreakdown @client
  }
`;

export const adminEmailVar = makeVar<LocalQuery['localAdminEmail']>('');
export const adminOrganisationTabVar = makeVar<LocalQuery['adminOrganisationTabId']>('currencyScore');
export const transactionBreakdownVar = makeVar<LocalQuery['transactionBreakdown']>(null);

export const adminQueryFields = {
  localAdminEmail: {
    read: () => adminEmailVar(),
  },
  adminOrganisationTabId: {
    read: () => adminOrganisationTabVar(),
  },
  transactionBreakdown: {
    read: () => transactionBreakdownVar(),
  },
};

export const useQueryLocalAdmin = () => {
  const { data } = useQuery<LocalQuery>(QUERY_LOCAL_ADMIN);

  return {
    adminEmail: data?.localAdminEmail || '',
    activeAdminTab: data?.adminOrganisationTabId || 'currencyScore',
    transactionBreakdown: data?.transactionBreakdown || null,
  };
};

export const clearLocalAdmin = () => {
  adminEmailVar('');
  adminOrganisationTabVar('');
  transactionBreakdownVar(null);
};
