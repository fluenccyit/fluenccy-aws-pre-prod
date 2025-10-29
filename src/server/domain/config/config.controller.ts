import { Express, Request, Response } from 'express';
import { CONFIG_ROUTES } from '@server/config';

class ConfigController {
  init = (app: Express) => {
    app.get(CONFIG_ROUTES.config, this.config);
  };

  config = async (request: Request, response: Response) => {
    response.set('Cache-Control', 'no-cache').type('js').send(`window.__FLUENCCY_APP_CONFIG__ = {
  FIREBASE_API_KEY: '${process.env.FIREBASE_API_KEY}',
  FIREBASE_APP_ID: '${process.env.FIREBASE_APP_ID}',
  FIREBASE_AUTH_DOMAIN: '${process.env.FIREBASE_AUTH_DOMAIN}',
  FIREBASE_MESSAGING_SENDER_ID: ${process.env.FIREBASE_MESSAGING_SENDER_ID},
  FIREBASE_PROJECT_ID: '${process.env.FIREBASE_PROJECT_ID}',
  FIREBASE_STORAGE_BUCKET: '${process.env.FIREBASE_STORAGE_BUCKET}',
  INTERCOM_APP_ID: '${process.env.INTERCOM_APP_ID}',
  SEGMENT_KEY: '${process.env.SEGMENT_KEY}',
}`);
  };
}

export const configController = new ConfigController();
