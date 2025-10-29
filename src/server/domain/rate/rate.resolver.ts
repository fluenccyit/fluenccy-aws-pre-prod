import { format, parseISO } from 'date-fns';
import { IResolverObject } from 'apollo-server-express';
import { GqlRatesInput, GqlRate, GqlForwardPoint } from '@graphql';
import { rateResource } from '@server/rate';
import { authService } from '@server/common';

const Query: IResolverObject = {
  async rates(rt, { input }: GqlArgs<GqlRatesInput>, { token }: GqlContext): Promise<GqlRate[]> {
    try {
      await authService.verifyToken(token);

      const { baseCurrency, tradeCurrency, dateFrom, dateTo } = input;
      
      console.log('Rates resolver called with:', {
        baseCurrency,
        tradeCurrency,
        dateFrom,
        dateTo,
        dateFromType: typeof dateFrom,
        dateToType: typeof dateTo
      });

      // Use dateFrom/dateTo if provided, otherwise fall back to basic query
      return await rateResource.queryRateFromDate({
        baseCurrency,
        tradeCurrency,
        dateFrom,
        dateTo,
      });
    } catch (error) {
      console.error('Error in rates resolver:', error);
      throw error;
    }
  },

  async forwardPoints(rt, { input }: GqlArgs<GqlRatesInput>, { token }: GqlContext): Promise<GqlForwardPoint[]> {
    try {
      await authService.verifyToken(token);

      const { baseCurrency, tradeCurrency, dateFrom, dateTo } = input;
      
      console.log('Forward points resolver called with:', {
        baseCurrency,
        tradeCurrency,
        dateFrom,
        dateTo
      });

      return await rateResource.queryForwardPointBetweenDates({
        baseCurrency,
        tradeCurrency,
        dateFrom,
        dateTo,
      });
    } catch (error) {
      console.error('Error in forwardPoints resolver:', error);
      throw error;
    }
  },
};

export const rateResolvers = { Query };
