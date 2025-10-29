import { map } from 'lodash';
import { format, parseISO } from 'date-fns';
import { gql } from '@apollo/client';
import { apolloService } from '@client/common';
import { GqlRatesQuery, GqlRatesQueryVariables, GqlRatesInput } from '@graphql';

export const QUERY_RATES = gql`
  query Rates($input: RatesInput!) {
    rates(input: $input) {
      date
      baseCurrency
      tradeCurrency
      open
      high
      low
      last
    }
  }
`;

export const queryRates = async (input: GqlRatesInput) => {
  try {
    console.log(format(new Date(), 'dd-MM-yyyy HH:mm:ss'), "Rates input >> ", JSON.stringify(input, null, 2));
    
    // Validate input
    if (!input.baseCurrency || !input.tradeCurrency) {
      throw new Error('baseCurrency and tradeCurrency are required');
    }
    
    const { data } = await apolloService.query<GqlRatesQuery, GqlRatesQueryVariables>({
      query: QUERY_RATES,
      variables: { input },
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    });

    console.log(format(new Date(), 'dd-MM-yyyy HH:mm:ss'), "Rates response >> ", {
      ratesCount: data.rates?.length || 0,
      dateRange: input.dateFrom && input.dateTo ? `${input.dateFrom} to ${input.dateTo}` : 'No date filter',
      currencies: `${input.baseCurrency}/${input.tradeCurrency}`
    });
    
    if (!data.rates || data.rates.length === 0) {
      console.warn('No rates returned from server for input:', input);
      return [];
    }
    
    return map(data.rates, ({ date, ...rest }, index) => {
      try {
        if (!date) {
          console.warn(`Skipping rate ${index}: date is null/undefined`);
          return null;
        }

        const parsedDate = parseISO(String(date));
        
        if (isNaN(parsedDate.getTime())) {
          console.warn(`Invalid parsed date for rate ${index}: "${date}"`);
          return null;
        }

        return {
          ...rest,
          date: parsedDate,
        };
      } catch (parseError) {
        console.error(`Error parsing date for rate ${index}:`, parseError, 'Date value:', date);
        return null;
      }
    }).filter(Boolean);
    
  } catch (error) {
    console.error(format(new Date(), 'dd-MM-yyyy HH:mm:ss'), "Error querying rates:", error);
    
    if (error.networkError) {
      console.error("Network error:", error.networkError);
    }
    if (error.graphQLErrors) {
      console.error("GraphQL errors:", error.graphQLErrors);
    }
    
    throw error;
  }
};
