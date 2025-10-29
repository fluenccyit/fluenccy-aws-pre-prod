import { map } from 'lodash';
import { format, parseISO } from 'date-fns';
import { gql } from '@apollo/client';
import { apolloService } from '@client/common';
import { GqlForwardPointsQuery, GqlForwardPointsQueryVariables, GqlRatesInput } from '@graphql';

export const QUERY_FORWARD_POINTS = gql`
  query ForwardPoints($input: RatesInput!) {
    forwardPoints(input: $input) {
      date
      month
      year
      baseCurrency
      tradeCurrency
      forwardPoints
    }
  }
`;

export const QUERY_FORWARD_POINTS_BETWEEN_DATES = gql`
  query ForwardPointsBetweenDates($input: RatesInput!) {
    forwardPoints(input: $input) {
      date
      month
      year
      baseCurrency
      tradeCurrency
      forwardPoints
    }
  }
`;

export const queryForwardPointsBetweenDates = async (input: GqlRatesInput) => {
  try {
    console.log(format(new Date(), 'dd-MM-yyyy HH:mm:ss'), "Starting query for forward points between dates with input:", JSON.stringify(input, null, 2));
    
    // Validate input before sending to server
    if (!input.baseCurrency || !input.tradeCurrency) {
      throw new Error('baseCurrency and tradeCurrency are required');
    }
    
    const result = await apolloService.query<GqlForwardPointsQuery, GqlForwardPointsQueryVariables>({
      query: QUERY_FORWARD_POINTS_BETWEEN_DATES,
      variables: { input },
      fetchPolicy: 'no-cache', // Force fresh data
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
    });
    
    const { data } = result;
    
    if (!data) {
      console.warn(format(new Date(), 'dd-MM-yyyy HH:mm:ss'), "No data returned from server");
      return [];
    }
    
    if (!data.forwardPoints) {
      console.warn(format(new Date(), 'dd-MM-yyyy HH:mm:ss'), "No forwardPoints in data");
      console.log(format(new Date(), 'dd-MM-yyyy HH:mm:ss'), "Available data keys:", Object.keys(data));
      return [];
    }

    console.log(format(new Date(), 'dd-MM-yyyy HH:mm:ss'), "Forward Points Data >> ", data);
    
    return map(data.forwardPoints, ({ date, ...rest }, index) => {
      try {
        if (!date) {
          console.warn(`Skipping item ${index}: date is null/undefined`);
          return null;
        }

        const parsedDate = parseISO(String(date));
        
        if (isNaN(parsedDate.getTime())) {
          console.warn(`Invalid parsed date for item ${index}: "${date}"`);
          return null;
        }

        return {
          ...rest,
          date: parsedDate,
        };
      } catch (parseError) {
        console.error(`Error parsing date for item ${index}:`, parseError, 'Date value:', date);
        return null;
      }
    }).filter(Boolean);

  } catch (error) {
    console.error(format(new Date(), 'dd-MM-yyyy HH:mm:ss'), "Error occurred during GraphQL query execution");
    console.error(format(new Date(), 'dd-MM-yyyy HH:mm:ss'), "Full error object:", error);
    
    // More detailed error logging
    if (error.networkError) {
      console.error("Network error details:", error.networkError);
      if (error.networkError.result) {
        console.error("Network error result:", JSON.stringify(error.networkError.result, null, 2));
      }
    }
    
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      error.graphQLErrors.forEach((gqlError, index) => {
        console.error(`GraphQL Error ${index}:`, gqlError);
      });
    }
    
    // Return empty array instead of throwing to prevent crashes
    console.warn("Returning empty array due to error");
    return [];
  }
};

export const queryForwardPoints = async (input: GqlRatesInput) => {
  try {
    console.log(format(new Date(), 'dd-MM-yyyy HH:mm:ss'), "Querying forward points with input", input);
    
    const { data } = await apolloService.query<GqlForwardPointsQuery, GqlForwardPointsQueryVariables>({
      query: QUERY_FORWARD_POINTS,
      variables: { input },
      fetchPolicy: 'cache-first',
    });

    console.log(format(new Date(), 'dd-MM-yyyy HH:mm:ss'), "Raw Forward Points Data >> ", JSON.stringify(data, null, 2));

    return map(data.forwardPoints, ({ date, ...rest }, index) => {
      try {
        if (!date) {
          console.warn(`Skipping item ${index}: date is null/undefined`);
          return null;
        }

        const parsedDate = parseISO(String(date));
        
        if (isNaN(parsedDate.getTime())) {
          console.warn(`Invalid parsed date for item ${index}: "${date}"`);
          return null;
        }

        return {
          ...rest,
          date: parsedDate,
        };
      } catch (parseError) {
        console.error(`Error parsing date for item ${index}:`, parseError, 'Date value:', date);
        return null;
      }
    }).filter(Boolean);

  } catch (error) {
    console.error(format(new Date(), 'dd-MM-yyyy HH:mm:ss'), "Error querying forward points", error);
    throw error;
  }
};

// Test with basic forward points query (without date filtering)
export const testQueryForwardPoints = async (input: GqlRatesInput) => {
  try {
    console.log("Testing basic forward points query with input:", input);
    
    const { data } = await apolloService.query({
      query: gql`
        query TestForwardPoints($input: RatesInput!) {
          forwardPoints(input: $input) {
            date
            baseCurrency
            tradeCurrency
            forwardPoints
          }
        }
      `,
      variables: { input: { baseCurrency: input.baseCurrency, tradeCurrency: input.tradeCurrency } },
      fetchPolicy: 'no-cache',
    });
    
    console.log("Test query result:", data);
    return data;
  } catch (error) {
    console.error("Test query error:", error);
    throw error;
  }
};
