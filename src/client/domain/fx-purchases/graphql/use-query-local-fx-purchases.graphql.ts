import { gql, makeVar, useQuery } from '@apollo/client';

type LocalQuery = {
  localShowMarketRate: boolean;
  localShowFluenccyPerform: boolean;
};

export const QUERY_LOCAL_FX_PURCHASES = gql`
  query LocalFxPurchases {
    localShowMarketRate @client
    localShowFluenccyPerform @client
  }
`;

export const showMarketRateVar = makeVar<LocalQuery['localShowMarketRate']>(false);
export const showFluenccyPerformVar = makeVar<LocalQuery['localShowFluenccyPerform']>(false);

export const fxPurchasesQueryFields = {
  localShowMarketRate: { read: () => showMarketRateVar() },
  localShowFluenccyPerform: { read: () => showFluenccyPerformVar() },
};

export const useQueryLocalFxPurchases = () => {
  const { data } = useQuery<LocalQuery>(QUERY_LOCAL_FX_PURCHASES);

  return {
    showMarketRate: data?.localShowMarketRate,
    showFluenccyPerform: data?.localShowFluenccyPerform,
  };
};

export const clearLocalFxPurchases = () => {
  showMarketRateVar(false);
  showFluenccyPerformVar(false);
};
