// This file should only ever be used in the development environment, and must be the first file to execute before the application so we can setup the
// local environment variables.

/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv-json')();
require('./xero-sync.worker');
