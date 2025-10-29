import { gql } from 'apollo-server-express';

export const organisationTypeDef = gql`
  enum OrganisationSyncStatus {
    pullingInvoicesAndPayments
    calculatingTransactionDetails
    calculatingTransactionDetailsComplete
    calculatingTransactionDetailsError
    calculatingCurrencyScores
    calculatingCurrencyScoresError
    synced
    syncError
  }

  enum OrganisationTokenStatus {
    active
    expired
    disconnected
  }

  enum OrganisationBuildPlanQuestionId {
    profitMargin
    salesCosts
    sensitivity
    strategy
  }

  enum OrganisationBuildPlanAnswerId {
    balanced
    certainty
    everyCoupleOfMonths
    fifteenPercent
    fivePercent
    highRisk
    lessThanTenPercent
    monthlyOrMore
    moreThanThirtyPercent
    quarterlyOrLess
    tenPercent
    tenToThirtyPercent
  }

  type OrganisationBuildPlanAnswer {
    questionId: OrganisationBuildPlanQuestionId!
    answerId: OrganisationBuildPlanAnswerId!
  }

  type Organisation {
    id: ID!
    name: String!
    # We have to set the organisation currency to a string, as this value comes from an external source (E.g. Xero), so it might be a currency that
    # isn't supported by us. If we do encounter an organisation with an unsupported currency, this will be handled on the client.
    currency: String!
    tradeCurrencies: [SupportedCurrency!]!
    syncStatus: OrganisationSyncStatus
    tokenStatus: OrganisationTokenStatus
    buildPlanScore: Int!
    buildPlanAnswers: [OrganisationBuildPlanAnswer!]!
    currencyScores: [CurrencyScoreBreakdown!]!
    hedgeMargin: Float!
    tenant: Tenant!
    account: Account!
    primaryUser: User
    onboardingComplete: Boolean!
    intentRegistered: Boolean!
    initialSyncComplete: Boolean!
    variableProbability: String
  }

  input ByOrgIdInput {
    orgId: ID!
  }

  input OrganisationBuildPlanAnswerInput {
    questionId: OrganisationBuildPlanQuestionId!
    answerId: OrganisationBuildPlanAnswerId!
  }

  input UpdateOrganisationInput {
    orgId: ID!
    buildPlanAnswers: [OrganisationBuildPlanAnswerInput!]
    buildPlanScore: Int
    hedgeMargin: Float
    intentRegistered: Boolean
    onboardingComplete: Boolean
    variableProbability: String
  }

  extend type Query {
    organisationById(input: ByIdInput!): Organisation!
    organisations: [Organisation!]!
    organisationsByEmail(input: ByEmailInput!): [Organisation!]!
    organisationsByToken(input: ByPaymentTypeInput): [Organisation!]!
  }

  extend type Mutation {
    deleteOrganisation(input: ByOrgIdInput!): Boolean!
    disconnectOrganisation(input: ByOrgIdInput!): Boolean!
    recalculateOrganisationCurrencyScores(input: ByOrgIdInput!): Organisation!
    refreshOrganisationToken(input: ByOrgIdInput!): Organisation!
    resyncOrganisation(input: ByOrgIdInput!): Organisation!
    updateOrganisation(input: UpdateOrganisationInput!): Organisation!
  }
`;
