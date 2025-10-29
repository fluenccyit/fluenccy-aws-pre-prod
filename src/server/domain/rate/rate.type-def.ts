import { gql } from 'apollo-server-express';

export const rateTypeDef = gql`
  type Rate {
    date: Date!
    baseCurrency: SupportedCurrency!
    tradeCurrency: SupportedCurrency!
    open: Float!
    high: Float!
    low: Float!
    last: Float!
  }

  type ForwardPoint {
    date: Date!
    month: Month!
    year: String!
    baseCurrency: SupportedCurrency!
    tradeCurrency: SupportedCurrency!
    forwardPoints: Float!
  }

  input RatesInput {
    baseCurrency: SupportedCurrency!
    tradeCurrency: SupportedCurrency!
    dateFrom: Date
    mode: String
    dateTo: Date
  }

  extend type Query {
    rates(input: RatesInput!): [Rate!]!
    forwardPoints(input: RatesInput!): [ForwardPoint!]!
  }
`;
