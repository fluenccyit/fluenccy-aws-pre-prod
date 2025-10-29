/* eslint no-console: 0 */
// This has to be included before anything else, so we can gather APM metrics correctly.
// if (process.env.ENVIRONMENT !== 'local' && process.env.NEW_RELIC_APP_NAME && process.env.NEW_RELIC_LICENCE_KEY) {
//  console.log(`Connecting to the <${process.env.NEW_RELIC_APP_NAME}> New Relic service.`);
//  require('newrelic');
// }

import { sharedUtilService } from '@shared/common';
import { dbService, loggerService } from '@server/common';
import { rateDbCreators, rateDbGetters, rateResource, STORED_CURRENCY_PAIRS, DEFAULT_FETCH_FOR_DAYS } from '@server/rate';

const scheduler = 'RateSyncScheduler';
const runRateSync = async () => {
  await dbService.init();
  loggerService.info('Running Rate sync.', { scheduler });

  await sharedUtilService.asyncForEach(STORED_CURRENCY_PAIRS, async (currencyPair) => {
    try {

      // Debug code to disable fetch for specific currency pair
      // if(['AUD/USD', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'NZD/USD', 'USD/CAD', 'NZD/AUD', 'NZD/EUR', 'NZD/GBP'].includes(currencyPair)){
      //   loggerService.info('101 -> disabling job for '+ currencyPair);
      //   return;
      // }
      
      const rates = await rateDbGetters.queryRateByCurrencyPair(currencyPair);
      let latestRate = rates[0];
      
      // if we can't find any rates in our DB with the passed currency pair, then fetch rates for last 40 days
      let fetchFromDate;
      if (latestRate) {
        fetchFromDate = latestRate.date
      } else {
        loggerService.info(`Currency code not available in DB, so fetching last ${DEFAULT_FETCH_FOR_DAYS} days rates`);
        var today = new Date();
        fetchFromDate = new Date(new Date().setDate(today.getDate() - DEFAULT_FETCH_FOR_DAYS));
        
        console.log('fetchFromDate.getDay() ', fetchFromDate.getDay());
        //Please note, as per fxmarketapi documentation fetchFromDate should not be a weekend date
        //If fetchFromDate is Sunday then, subtract two more days
        if(fetchFromDate.getDay() == 0){
          fetchFromDate = new Date(new Date().setDate(today.getDate() - (DEFAULT_FETCH_FOR_DAYS - 2)));
        } else if(fetchFromDate.getDay() == 6){//If fetchFromDate is Sunday then, subtract one more day
          fetchFromDate = new Date(new Date().setDate(today.getDate() - (DEFAULT_FETCH_FOR_DAYS - 1)));
        }
       }

      loggerService.info(`Fetching new rates for ${currencyPair}.`, { scheduler, currencyPair });
      console.log('fetchFromDate ', fetchFromDate)
      const newRates = await rateResource.fetchRateFeed({ dateFrom: fetchFromDate, currencyPair });
      
      loggerService.info(`Saving ${newRates.length} new rates for ${currencyPair}.`, { scheduler, currencyPair, rateCount: newRates.length });

      await sharedUtilService.asyncForEach(newRates, async (newRate) => {
        if(newRate.high == 0 && newRate.low == 0 && newRate.open == 0 && newRate.last == 0){
          console.log("Recived all values zeros, so skiping to insert");
          loggerService.info("Recived all values zeros, so skiping to insert");
        } else {
          await rateDbCreators.createRate(newRate);
        }
      });
    } catch (error) {

      loggerService.error('Failed to sync rates', { scheduler, stackTrace: JSON.stringify(error) });
      loggerService.error('error ' + JSON.stringify(error));
    }
  });

  loggerService.info('Rate sync complete.', { scheduler });
  process.exit();
};

runRateSync();
