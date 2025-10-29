import Queue from 'bull';
import RedisOptions from 'bull';

import { loggerService } from './logger.service';

const { REDIS_URL } = process.env;

type QueueName = 'xero-sync' | 'currency-score';

const service = 'QueueService';
class QueueService {
  getQueue = (queueName: QueueName) => {
    try {
      return process.env.ENVIRONMENT == 'local' ? new Queue(queueName, REDIS_URL) : new Queue(queueName, REDIS_URL,{ redis: { tls: { rejectUnauthorized: false }, enableTLSForSentinelMode: false, maxRetriesPerRequest:100 } });
    } catch (error) {
      loggerService.error('Failed to connect to Redis', { service, stackTrace: JSON.stringify(error) });
      
      throw error;
    }
  };
}

export const queueService = new QueueService();
