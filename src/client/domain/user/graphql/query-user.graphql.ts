import { gql } from '@apollo/client';
import { GqlUserQuery } from '@graphql';
import { apolloService, loggerService } from '@client/common';

export const QUERY_USER = gql`
  query User {
    user {
      id
      firebaseUid
      firstName
      lastName
      role
    }
  }
`;

export const queryUser = async () => {
  loggerService.debug('[queryUser] Query user by token.');

  const { data } = await apolloService.query<GqlUserQuery>({ query: QUERY_USER });

  return data.user;
};
