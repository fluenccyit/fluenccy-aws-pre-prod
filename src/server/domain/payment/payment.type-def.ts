import { gql } from 'apollo-server-express';

export const paymentTypeDef = gql`
  type Payment {
    provider: Provider!
    tenantId: String!
    paymentId: String!
    paymentStatus: String!
    paymentType: String!
    invoiceId: ID!
    currencyCode: SupportedCurrency!
    date: Date!
    amount: Float!
    currencyRate: Float!
    maxCost: Float!
    maxRate: Float!
    minCost: Float!
    minRate: Float!
    actualCost: Float!
  }

  input PaymentsInput {
    tenantId: ID!
    currency: SupportedCurrency!
    dateFrom: Date!
    dateTo: Date!
    mode: String
  }

  extend type Query {
    payments(input: PaymentsInput!): [Payment!]!
  }
`;
