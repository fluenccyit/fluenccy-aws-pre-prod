import Analytics from 'analytics-node';
import { Express, Request, Response } from 'express';
import { loggerService } from '@server/common';
import { ANALYTICS_ROUTES } from '@server/analytics';

const { SEGMENT_KEY } = process.env;

const controller = 'AnalyticsController';
class AnalyticsController {
  private _analytics: Analytics | undefined;

  constructor() {
    if (SEGMENT_KEY) {
      this._analytics = new Analytics(SEGMENT_KEY);
    }
  }

  init = (app: Express) => {
    app.post(ANALYTICS_ROUTES.alias, this.alias);
    app.post(ANALYTICS_ROUTES.identify, this.identify);
    app.post(ANALYTICS_ROUTES.page, this.page);
    app.post(ANALYTICS_ROUTES.track, this.track);
  };

  handleAnalyticsRequest = (request: Request, response: Response, callback: () => void) => {
    // Only send the event if an id is present, otherwise we will get an error.
    if (!request.body.anonymousId && !request.body.userId) {
      response.set('Cache-Control', 'no-cache').type('json').send({ result: 'aborted' });
      return;
    }

    try {
      callback();
    } catch ({ message }) {
      loggerService.error(message);
    } finally {
      response.set('Cache-Control', 'no-cache').type('json').send({ result: 'success' });
    }
  };

  alias = async (request: Request, response: Response) => {
    loggerService.info('Alias event', { controller, method: 'alias', ...request.body });

    this.handleAnalyticsRequest(request, response, () => this._analytics && this._analytics.alias(request.body));
  };

  identify = async (request: Request, response: Response) => {
    loggerService.info('Identifying user', { controller, method: 'identify', ...request.body });

    this.handleAnalyticsRequest(request, response, () => this._analytics && this._analytics.identify(request.body));
  };

  page = async (request: Request, response: Response) => {
    loggerService.info('Tracking page', { controller, method: 'page', ...request.body });

    this.handleAnalyticsRequest(request, response, () => this._analytics && this._analytics.page(request.body));
  };

  track = async (request: Request, response: Response) => {
    loggerService.info('Tracking event', { controller, method: 'track', ...request.body });

    this.handleAnalyticsRequest(request, response, () => this._analytics && this._analytics.track(request.body));
  };
}

export const analyticsController = new AnalyticsController();
