import { Queue } from 'bull';
import { find } from 'lodash';
import { OrganisationDbo } from '@server/organisation';
import { ERROR_MESSAGE, loggerService, queueService } from '@server/common';

export type UploadCSVJobDataType = {
  orgId: string;
};

const queue = 'UploadCSVQueue';
class UploadCSVQueue {
  private _queue: Queue<UploadCSVJobDataType> | undefined;

  init = () => {
    const logParam = { queue, method: 'init' };

    if (!this._queue) {
      loggerService.info('Setting up currency score queue.', logParam);

      this._queue = queueService.getQueue('currency-score');
    }
  };

  add = async ({ id: orgId }: OrganisationDbo) => {
    const logParam = { queue, method: 'add', orgId };

    if (!this._queue) {
      throw new Error(ERROR_MESSAGE.currencyScoreQueueNotInitialised);
    }

    loggerService.info('Getting all jobs that are not completed or failed from upload csv.', logParam);
    const jobs = await this._queue.getJobs(['waiting', 'active', 'delayed', 'paused']);

    loggerService.info('Checking if we already have a job to recalculate this organisations currency scores.', logParam);
    const existingJob = find(jobs, ({ data }) => data.orgId === orgId);

    if (existingJob) {
      loggerService.info('Job for organisation or tenant already exists, skipping.', logParam);
      return;
    }

    loggerService.info('Adding organisation to currency score sync queue', logParam);
    await this._queue.add({ orgId });
  };
}

export const uploadCSVQueue = new UploadCSVQueue();
