import { gql } from '@apollo/client';
import { apolloService, loggerService } from '@client/common';
import { GqlAccountQuery } from '@graphql';

export const QUERY_ACCOUNT = gql`
  query Account {
    account {
      id
      name
      type
    }
  }
`;

export const queryAccount = async () => {
  loggerService.debug('[queryAccount] Query account by token.');

  const { data } = await apolloService.query<GqlAccountQuery>({
    query: QUERY_ACCOUNT,
    fetchPolicy: 'network-only',
  });

  return data.account;
};
