import { gql } from 'apollo-server-express';

export const userTypeDef = gql`
  enum UserRole {
    accountowner
    superuser
    superdealer
  }

  type User {
    id: ID!
    accountId: ID
    firebaseUid: ID!
    firstName: String!
    lastName: String!
    role: UserRole!
  }

  extend type Query {
    user: User!
  }
`;
