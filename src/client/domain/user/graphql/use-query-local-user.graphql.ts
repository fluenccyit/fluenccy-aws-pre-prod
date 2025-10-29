import { gql, makeVar, useQuery } from '@apollo/client';
import { GqlUserQuery } from '@graphql';

type LocalUserType = GqlUserQuery['user'] & {
  email: string;
};

type LocalQuery = {
  localUser: LocalUserType | null;
};

export const QUERY_LOCAL_USER = gql`
  query LocalUser {
    localUser @client
  }
`;

export const userVar = makeVar<LocalQuery['localUser']>(null);

export const userQueryFields = {
  localUser: {
    read: () => userVar(),
  },
};

export const useQueryLocalUser = () => {
  const { data } = useQuery<LocalQuery>(QUERY_LOCAL_USER);

  return {
    user: data?.localUser || null,
  };
};

export const clearLocalUser = () => {
  userVar(null);
};
