import { Queue } from 'bull';
import { find } from 'lodash';
import { OrganisationDbo } from '@server/organisation';
import { ERROR_MESSAGE, loggerService, queueService } from '@server/common';

export type CurrencyScoreJobDataType = {
  orgId: string;
};

const queue = 'CurrencyScoreQueue';
class CurrencyScoreQueue {
  private _queue: Queue<CurrencyScoreJobDataType> | undefined;

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
    
    console.log("this._queue");
    console.log(typeof this._queue);
    console.log(this._queue);
    console.log("after this._queue");
    

    loggerService.info('Getting all jobs that are not completed or failed from currency score queue.', logParam);
    const jobs = await this._queue.getJobs(['waiting', 'active', 'delayed', 'paused']);

    console.log(jobs)

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

export const currencyScoreQueue = new CurrencyScoreQueue();
