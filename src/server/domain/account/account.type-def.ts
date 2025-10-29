import { gql } from 'apollo-server-express';

export const accountTypeDef = gql`
  enum AccountType {
    accountant
    sme
  }

  type Account {
    id: String!
    type: AccountType!
    name: String
  }

  input SignUpInput {
    firstName: String!
    lastName: String!
    accountName: String!
    accountType: AccountType!
    email: String!
    password: String!
    currencyCode: String!
  }

  extend type Query {
    account: Account!
  }

  extend type Mutation {
    signUp(input: SignUpInput!): User!
  }
`;
