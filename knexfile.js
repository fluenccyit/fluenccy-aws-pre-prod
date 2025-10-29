let { ENVIRONMENT } = process.env;

if (!ENVIRONMENT) {
  require('dotenv-json')();

  ENVIRONMENT = process.env.ENVIRONMENT;
}

const { POSTGRES_DATABASE, POSTGRES_HOST, POSTGRES_PASSWORD, POSTGRES_USER, POSTGRES_PORT } = process.env;

console.info(`Connecting to the <${ENVIRONMENT}> database.`);

// @NOTE: This configuration must match the configuration used in the @server/.../db.service.ts file.
module.exports = {
  client: 'pg',
  connection: {
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    database: POSTGRES_DATABASE,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    // This is required due to a breaking change in pg@8: https://node-postgres.com/announcements#2020-02-25. This is the easiest workaround until we
    // figure out how to get a signed certificate to connect to our DB instance.
    ssl: ENVIRONMENT === 'local' ? false : { rejectUnauthorized: false },
  },
};
