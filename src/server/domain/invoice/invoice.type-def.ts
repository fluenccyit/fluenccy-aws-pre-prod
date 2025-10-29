import { gql } from 'apollo-server-express';

export const invoiceTypeDef = gql`
  type Invoice {
    provider: Provider!
    tenantId: String!
    invoiceId: ID!
    invoiceNumber: String!
    invoiceStatus: String!
    invoiceType: String!
    contactName: String!
    currencyCode: SupportedCurrency!
    date: Date!
    dateDue: Date!
    total: Float!
    currencyRate: Float!
    amountCredited: Float!
    amountDue: Float!
    amountPaid: Float!
  }

  input InvoicesInput {
    tenantId: ID!
    currency: SupportedCurrency!
    dateTo: Date!
    mode: String
  }

  extend type Query {
    invoices(input: InvoicesInput!): [Invoice!]!
  }
`;
