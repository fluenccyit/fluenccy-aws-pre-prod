import chalk from 'chalk';
import { identity, pickBy } from 'lodash';
import { createLogger, format, Logger, transports } from 'winston';
import { envService } from './env.service';

class LoggerService {
  private _logger: Logger;

  constructor() {
    this._logger = createLogger({
      level: 'info',
      format: format.json(),
    });

    if (envService.isProduction() || envService.isStaging() || envService.isPreProd()) {
      const coralogixFormat = format.printf((info) => {
        info.severity = info.level;

        return JSON.stringify(info);
      });

      this._logger.add(new transports.Console({ format: format.combine(format.json(), coralogixFormat) }));
    } else {
      const localFormat = format.printf(({ level, message }) => {
        if (level === 'info') {
          return `${chalk.blueBright('[i]')} ${message}`;
        }

        if (level === 'error') {
          return chalk.redBright(`[${level}]: ${message}`);
        }

        return `[${level}]: ${message}`;
      });
      this._logger.add(new transports.Console({ format: format.combine(localFormat) }));
    }
  }

  info = (message?: string, metadata?: Dictionary<string | number | boolean | null | undefined>) => {
    if (!message || envService.isJest()) {
      return;
    }

    console.log("=========== INFOconsol ===========", new Date());
    this._logger.info(message, !envService.isLocal() ? pickBy(metadata, identity) : undefined);
  };

  error = (message?: string, metadata?: Dictionary<string | number | boolean | null | undefined>) => {
    if (!message || envService.isJest()) {
      return;
    }

    this._logger.error(message, !envService.isLocal() ? pickBy(metadata, identity) : undefined);
  };
}

export const loggerService = new LoggerService();
