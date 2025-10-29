import { gql } from '@apollo/client';

export const ORGANISATION_CORE_FIELDS_FRAGMENT = gql`
  fragment CoreOrganisationFields on Organisation {
    id
    name
    currency
    tradeCurrencies
    syncStatus
    tokenStatus
    onboardingComplete
    initialSyncComplete
    intentRegistered
    buildPlanAnswers {
      questionId
      answerId
    }
    buildPlanScore
    hedgeMargin
    tenant {
      id
      lastSynced
    }
    variableProbability
  }
`;
