import { gql, makeVar, useQuery } from '@apollo/client';
import { GqlAccountQuery } from '@graphql';

type LocalQuery = {
  localAccount: GqlAccountQuery['account'] | null;
};

export const QUERY_LOCAL_ACCOUNT = gql`
  query LocalAccount {
    localAccount @client
  }
`;

export const accountVar = makeVar<LocalQuery['localAccount']>(null);

export const accountQueryFields = {
  localAccount: {
    read: () => accountVar(),
  },
};

export const useQueryLocalAccount = () => {
  const { data } = useQuery<LocalQuery>(QUERY_LOCAL_ACCOUNT);

  return {
    account: data?.localAccount || null,
  };
};

export const clearLocalAccount = () => {
  accountVar(null);
};
