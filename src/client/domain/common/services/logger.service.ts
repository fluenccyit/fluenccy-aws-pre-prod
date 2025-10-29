/* eslint no-console: 0 */

import { envService } from '@client/common';

class LoggerService {
  debug = (message?: any) => {
    if (!message || envService.isJest()) {
      return;
    }

    console.debug(message);
  };

  error = (message?: any) => {
    if (!message || envService.isJest()) {
      return;
    }

    console.error(message);
  };
}

export const loggerService = new LoggerService();
