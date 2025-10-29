import { gql, makeVar, useQuery } from '@apollo/client';

type LocalQuery = {
  localUi: 'ready' | 'loading' | 'saving' | 'error' | 'not-found';
};

export const QUERY_LOCAL_UI = gql`
  query LocalUi {
    localUi @client
  }
`;

export const uiVar = makeVar<LocalQuery['localUi']>('loading');

export const commonQueryFields = {
  localUi: { read: () => uiVar() },
};

export const useQueryLocalCommon = () => {
  const { data } = useQuery<LocalQuery>(QUERY_LOCAL_UI);

  return {
    ui: data?.localUi || 'loading',
  };
};

export const clearLocalCommon = () => {
  uiVar('loading');
};
