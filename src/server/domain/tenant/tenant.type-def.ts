import { gql } from 'apollo-server-express';

export const tenantTypeDef = gql`
  type Tenant {
    id: ID!
    provider: String!
    lastSynced: Date
  }

  input ByTenantIdInput {
    tenantId: ID!
  }

  extend type Query {
    currenciesByTenant(input: ByTenantIdInput!): [SupportedCurrency!]!
  }
`;
