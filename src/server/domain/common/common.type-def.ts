import { gql } from 'apollo-server-express';

export const rootTypeDef = gql`
  scalar Date

  enum Provider {
    xero
    fluenccy
  }

  enum Month {
    Jan
    Feb
    Mar
    Apr
    May
    Jun
    Jul
    Aug
    Sep
    Oct
    Nov
    Dec
  }

  enum SupportedCurrency {
    AUD
    CAD
    EUR
    GBP
    JPY
    NZD
    USD
    AED
    ARS
    BDT
    BGN
    BWP
    CHF
    CLP
    CNY
    CRC
    CZK
    DKK
    EGP
    GEL
    GHS
    HKD
    HRK
    HUF
    IDR
    ILS
    INR
    KES
    KRW
    LKR
    MAD
    MXN
    MYR
    NGN
    NOK
    NPR
    PEN
    PHP
    PKR
    PLN
    RON
    RUB
    SEK
    SGD
    THB
    TRY
    TZS
    UAH
    UGX
    UYU
    VND
    CFA
    ZAR
    ZMW
  }

  input ByIdInput {
    id: ID!
  }

  input ByEmailInput {
    email: String!
  }

  type Query {
    root: String
  }

  type Mutation {
    root: String
  }
  input ByPaymentTypeInput {
    paymentType: String!
  }
`;
