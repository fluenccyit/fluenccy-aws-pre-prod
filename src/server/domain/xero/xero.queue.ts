import { Queue } from 'bull';
import { find } from 'lodash';
import { OrganisationDbo } from '@server/organisation';
import { ERROR_MESSAGE, loggerService, queueService } from '@server/common';

export type XeroSyncJobDataType = {
  orgId: string;
  isCalculateCurrencyScoreEnabled: boolean;
};

const queue = 'XeroQueue';
class XeroQueue {
  private _queue: Queue<XeroSyncJobDataType> | undefined;

  init = () => {
    const logParam = { queue, method: 'init' };

    if (!this._queue) {
      loggerService.info('Setting up Xero queue.', logParam);

      this._queue = queueService.getQueue('xero-sync');
    }
  };

  add = async ({ id: orgId, tenantId }: OrganisationDbo, isCalculateCurrencyScoreEnabled = false) => {
    const logParam = { queue, method: 'add', orgId, tenantId };

    if (!this._queue) {
      throw new Error(ERROR_MESSAGE.xeroQueueNotInitialised);
    }

    loggerService.info('Getting all jobs that are not completed or failed.', logParam);
    const jobs = await this._queue.getJobs(['waiting', 'active', 'delayed', 'paused']);

    loggerService.info('Checking if we already have a job to sync this organisation.', logParam);
    const existingJob = find(jobs, ({ data }) => data.orgId === orgId);

    if (existingJob) {
      loggerService.info('Job for organisation or tenant already exists, skipping.', logParam);
      return;
    }

    loggerService.info('Adding organisation to Xero sync queue', logParam);
    await this._queue.add({ orgId, isCalculateCurrencyScoreEnabled });
  };
}

export const xeroQueue = new XeroQueue();
