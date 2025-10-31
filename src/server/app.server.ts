/* eslint no-console: 0 */
// This has to be included before anything else, so we can gather APM metrics correctly.
// if (process.env.ENVIRONMENT !== 'local' && process.env.NEW_RELIC_APP_NAME && process.env.NEW_RELIC_LICENCE_KEY) {
//  console.log(`Connecting to the <${process.env.NEW_RELIC_APP_NAME}> New Relic service.`);
//  require('newrelic');
// }

import cors from 'cors';
import { includes, map } from 'lodash';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import cookiesMiddleware from 'universal-cookie-express';
// import newRelicApolloServerPlugin from '@newrelic/apollo-server-plugin';
import { configController } from '@server/config';
import { typeDefs, resolvers } from './app.schema';
import { analyticsController } from '@server/analytics';
import { xeroController, xeroQueue } from '@server/xero';
import { currencyScoreQueue } from '@server/currency-score';
import { uploadCSVQueue } from '@server/upload-csv';
import { healthCheckController } from '@server/health-check';
import { authService, dbService, envService, loggerService } from '@server/common';
import { runRateSync } from '../scheduler/rate-sync/rate-sync.scheduler';
import apiRouter from './modules/routes'

const { PORT } = process.env;

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  // Pass Authorization request header to the resolver.
  context: ({ req }) => ({ token: req.headers.authorization }),
  plugins: [
    // @TODO: Move this custom plugin to another file?
    {
      requestDidStart: ({ request: { query, operationName } }) => {
        if (query && operationName) {
          loggerService.info(`[${operationName}]`, { query: query });
        }

        return {
          didEncounterErrors({ operationName, errors }) {
            map(errors, (error) => {
              // Filter out any errors we don't want to get woken up by.
              if (!includes(['BAD_USER_INPUT', 'UNAUTHENTICATED'], error?.extensions?.code)) {
                loggerService.error(`${operationName ? '[' + operationName + '] ' : ''}${error.message}`);
              }
            });
          },
        };
      },
    },
    // newRelicApolloServerPlugin,
  ],
});

const app = express();


// const nodemailer = require('nodemailer');
// const accessToken = await oAuth2Client.getAccessToken();
// const transport = nodemailer.createTransport({
//     service: 'Gmail',
//     auth: {
//       type: 'OAuth2',
//         user: 'sanketwaje1219@gmail.com',
//         clientId: CLIENT_ID,
//         clientSecret: CLEINT_SECRET,
//         refreshToken: REFRESH_TOKEN,
//         accessToken: accessToken,
//     },
// });
// const mailOptions = {
//     from: 'sanketwaje1219@gmail.com',
//     to: 'sanketwaje1219@gmail.com',
//     subject: 'hello world!',
//     body: 'string'
// };
// transport.sendMail(mailOptions, (error, info) => {
//     if (error) {
//         console.log(error);
//     }else
//     console.log(`email has been sent: ${info.response}`);
// });






app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

app.use('/api/', apiRouter);

app.use(cookiesMiddleware());
app.use(express.static('web'));

analyticsController.init(app);
configController.init(app);
healthCheckController.init(app);
xeroController.init(app);

authService.init();

// Initialize database and run migrations on startup
(async () => {
  try {
    await dbService.init();
    await dbService.runMigrations();
    
    // Run rate sync scheduler on server startup
    runRateSync(false).catch((error: unknown) => {
      loggerService.error('Rate sync scheduler failed on startup', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
    });
  } catch (error) {
    loggerService.error('Failed to initialize database or run migrations on startup', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
})();

xeroQueue.init();
currencyScoreQueue.init();

apolloServer.applyMiddleware({ app });

// If we get to this point, we were not able to resolve the request, so we will override it to serve the `index.html` file, and re-serve it from the
// static web source.
app.get('*', (request, response, next) => {
  request.url = '/index.html';

  next();
});
app.use(express.static('web'));

app.listen({ port: PORT }, () => {
  if (envService.isLocal()) {
    loggerService.info(`Listening on http://localhost:${PORT}`);
  } else if (envService.isStaging()) {
    loggerService.info('Listening on https://fluenccy-staging.herokuapp.com');
  } else if (envService.isPreProd()) {
    loggerService.info('Listening on https://fluenccy-qa.herokuapp.com');
  } else if (envService.isProduction()) {
    loggerService.info('Listening on https://app.fluenccy.com');
  }
});
