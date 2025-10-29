import { gql } from 'apollo-server-express';

export const adminTypeDef = gql`
  input AdminInviteUsersInput {
    emails: [String!]!
  }

  input AdminCreateSuperuserInput {
    email: String!
    firstName: String!
    lastName: String!
  }

  extend type Mutation {
    adminInviteUsers(input: AdminInviteUsersInput!): Boolean!
    adminCreateSuperuser(input: AdminCreateSuperuserInput!): Boolean!
  }
`;
