/* eslint no-console: 0 */
// This has to be included before anything else, so we can gather APM metrics correctly.
// if (process.env.ENVIRONMENT !== 'local' && process.env.NEW_RELIC_APP_NAME && process.env.NEW_RELIC_LICENCE_KEY) {
//  console.log(`Connecting to the <${process.env.NEW_RELIC_APP_NAME}> New Relic service.`);
//  require('newrelic');
// }

import { sharedUtilService } from '@shared/common';
import { xeroQueue, xeroService } from '@server/xero';
import { dbService, loggerService } from '@server/common';
import { organisationDbGetters } from '@server/organisation';

const scheduler = 'XeroSyncScheduler';
const runXeroSync = async () => {
  const logParam = { scheduler };
  loggerService.info('Running Xero sync scheduler.', logParam);
  await dbService.init();
  xeroQueue.init();

  const xeroClient = xeroService.getClient();
  const [organisationDbos] = await Promise.all([organisationDbGetters.queryOrganisation(), xeroClient.initialize()]);

  await sharedUtilService.asyncForEach(organisationDbos, async (organisationDbo) => {
    // If the organisation has a build plan score, then we need to recalculate the currency scores after the xero sync is complete.
    const isCalculateCurrencyScoreEnabled = Boolean(organisationDbo.buildPlanScore);

    loggerService.info('Adding organisation to the xero sync queue.', {
      ...logParam,
      orgId: organisationDbo.id,
      isCalculateCurrencyScoreEnabled,
    });

    await xeroQueue.add(organisationDbo, isCalculateCurrencyScoreEnabled);
  });

  loggerService.info('Xero sync scheduler complete.', logParam);
  process.exit();
};

runXeroSync();
