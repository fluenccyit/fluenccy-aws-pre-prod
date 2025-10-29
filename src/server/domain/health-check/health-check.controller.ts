import { Express, Request, Response } from 'express';
import { HEALTH_CHECK_ROUTES } from '@server/health-check';
import { authService, dbService, ERROR_CODE, loggerService } from '@server/common';

class HealthCheckController {
  init = (app: Express) => {
    app.get(HEALTH_CHECK_ROUTES.healthCheck, this.healthCheck);
  };

  healthCheck = async (request: Request, response: Response) => {
    loggerService.info('Health checking services.');

    const [dbHealthCheck, authHealthCheck] = await Promise.all([dbService.healthCheck(), authService.healthCheck()]);
    let status = ERROR_CODE.serviceUnavailable;

    if (dbHealthCheck && authHealthCheck) {
      status = ERROR_CODE.success;
    }

    response.set('Cache-Control', 'no-cache').status(status).json({ status });
  };
}

export const healthCheckController = new HealthCheckController();
