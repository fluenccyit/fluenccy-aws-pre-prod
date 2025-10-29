import { Job } from 'bull';
import { find } from 'lodash';
import { userResource } from '@server/user';
import { tenantResource } from '@server/tenant';
import { currencyScoreQueue } from '@server/currency-score';
import { organisationResource } from '@server/organisation';
import { xeroService, XeroSyncJobDataType } from '@server/xero';
import { dbService, loggerService, queueService } from '@server/common';

const MAX_JOBS_PER_WORKER = 2;

const worker = 'XeroSyncWorker';
const runXeroSyncWorker = async () => {
  loggerService.info('Initialising Xero sync worker.', { worker });
  await dbService.init();
  currencyScoreQueue.init();

  const xeroSyncQueue = queueService.getQueue('xero-sync');

  xeroSyncQueue.process(MAX_JOBS_PER_WORKER, async ({ id: jobId, data }: Job<XeroSyncJobDataType>) => {
    const logParam = { worker, jobId, ...data };
    loggerService.info('Xero sync job received', logParam);

    const { orgId, isCalculateCurrencyScoreEnabled } = data;

    try {
      const organisationDbo = await organisationResource.getOrganisationDboById(orgId);

      const { tenantId, tokenUserId, currency: orgCurrency } = organisationDbo;

      if (!tokenUserId) {
        return { skipReason: 'No token user id for organisation', orgId };
      }

      loggerService.info('Getting tenant and token for organisation.', logParam);
      const [tenantDbo, userDbo] = await Promise.all([tenantResource.getTenantById(tenantId), userResource.getUserDboById(tokenUserId)]);

      if (!tenantDbo) {
        return { skipReason: 'No tenant for organisation', orgId };
      }

      if (!userDbo) {
        return { skipReason: 'No token user for organisation', orgId };
      }

      const { id: userId, tokenSet } = userDbo;

      if (!tokenSet) {
        return { skipReason: 'No token set for organisation token user', orgId };
      }

      loggerService.info('Refreshing token for user.', { ...logParam, userId });
      const newLastSynced = new Date();
      const xeroClient = xeroService.getClient();
      const newTokenSet = await xeroService.getRefreshedTokenSet(xeroClient, tokenSet, { userId, orgId });

      if (!newTokenSet) {
        // If we fail to refresh the token, then our refresh token has expired. If this happens, we will remove the token from the user, which will
        // indicate to the user that they need to reconnect Xero when they log back in.
        loggerService.info('Removing token set from user.', { ...logParam, userId });
        await userResource.updateUser({ userId, tokenSet: null });
        return { skipReason: 'Failed to refresh token.', orgId };
      }

      loggerService.info('Updating token against user.', { ...logParam, userId });
      await userResource.updateUser({ userId, tokenSet: newTokenSet });

      loggerService.info('Check that token contains tenant to sync.', { ...logParam, userId, tenantId });
      const tenants = await xeroClient.updateTenants();
      if (!find(tenants, ({ tenantId: tenantIdToCheck }) => tenantId === tenantIdToCheck)) {
        // If we cannot find the tenant we are trying to sync against the token we have, then the tenant has likely been removed, or we no longer have
        // access to it. In this case, we will remove the token user from the organisation, which will indicate to the user that they need to
        // reconnect Xero when they log back in.
        await organisationResource.updateOrganisation({ orgId, tokenUserId: null });
        return { skipReason: 'Tenant does not exist against the token.' };
      }

      loggerService.info('Updating sync status of organisation to <pullingInvoicesAndPayments>.', logParam);
      await organisationResource.updateOrganisation({ orgId, syncStatus: 'pullingInvoicesAndPayments' });

      const { lastSynced } = tenantDbo;

      await xeroService.syncInvoicesAndPayments({ orgId, xeroClient, tenantId, orgCurrency, lastSynced });

      loggerService.info('Updating tenant last synced value.', {
        ...logParam,
        tenantId,
        lastSynced: newLastSynced.toUTCString(),
      });
      await tenantResource.updateTenant({ tenantId, lastSynced: newLastSynced });

      if (isCalculateCurrencyScoreEnabled) {
        await currencyScoreQueue.add(organisationDbo);
      }

      return true;
    } catch (error) {
      loggerService.error('Failed to sync', { ...logParam, message: error.message });
      await organisationResource.updateOrganisation({ orgId, syncStatus: 'syncError' });
      throw error;
    }
  });

  loggerService.info('Xero sync worker ready!', { worker });
};

runXeroSyncWorker();
