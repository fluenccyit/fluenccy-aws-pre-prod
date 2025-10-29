import { gql, makeVar, useQuery } from '@apollo/client';

type LocalQuery = {
  localIsCurrencyScorePlanActive: boolean;
};

export const QUERY_LOCAL_CURRENCY_SCORE = gql`
  query LocalCurrencyScore {
    localIsCurrencyScorePlanActive @client
  }
`;

export const currencyScoreIsPlanActiveVar = makeVar<LocalQuery['localIsCurrencyScorePlanActive']>(false);

export const currencyScoreQueryFields = {
  localIsCurrencyScorePlanActive: {
    read: () => currencyScoreIsPlanActiveVar(),
  },
};

export const useQueryLocalUploadCSV = () => {
  const { data } = useQuery<LocalQuery>(QUERY_LOCAL_CURRENCY_SCORE);

  return {
    isCurrencyScorePlanActive: data?.localIsCurrencyScorePlanActive || false,
  };
};

export const clearLocalCurrencyScore = () => {
  currencyScoreIsPlanActiveVar(false);
};
