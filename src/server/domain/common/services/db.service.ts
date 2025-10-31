import Knex, { Config as KnexConfig } from 'knex';
import { types as postgresTypes } from 'pg';
import { envService } from './env.service';
import { loggerService } from './logger.service';
const seedLocal = require('../../../../../seeds/01_local');
const seedStaging = require('../../../../../seeds/02_staging');
const seedProduction = require('../../../../../seeds/03_production');

type KnexInstance = Knex<any, unknown[]>;
type Table =
  | 'account'
  | 'config'
  | 'forward_point'
  | 'financial_products'
  | 'invoice'
  | 'organisation_user'
  | 'organisation'
  | 'org_entitlements'
  | 'payment'
  | 'rate'
  | 'recurring_plan'
  | 'tenant'
  | 'user'
  | 'xero_token_set'
  | 'import_logs'
  | 'hedge_invoice'
  | 'hedge_payment'
  | 'hedge_invoice_basket'
  | 'buying_schedule'
  | 'authentication_code'
  | 'crm_import_logs'
  | 'crm_entitlements'
  | 'crm_entries'
  | 'crm_feedback'
  | 'crm_entitlement_item'
  | 'crm_entry_logs'
  | 'quote_invoice';

const { POSTGRES_HOST, POSTGRES_DATABASE, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_PORT } = process.env;

// @NOTE: This configuration must match the configuration used in the knexfile.js at the root of this project.
const DEFAULT_CONFIG = {
  client: 'pg',
  connection: {
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    database: POSTGRES_DATABASE,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    // This is required due to a breaking change in pg@8: https://node-postgres.com/announcements#2020-02-25. This is the easiest workaround until we
    // figure out how to get a signed certificate to connect to our DB instance.
    ssl: envService.isLocal() ? false : { rejectUnauthorized: false },
  },
};

class DbService {
  _knex: KnexInstance | undefined;

  init = async (config: KnexConfig = DEFAULT_CONFIG) => {
    if (!this._knex) {
      loggerService.info('Connecting to the database.', {
        service: 'DbService',
        env: envService.get(),
      });

      try {
        // Setting the date parser to just return the raw value, rather than parsing it to an ISO string.
        postgresTypes.setTypeParser(1082, (value) => value);

        this._knex = Knex(config);

        // If debug setting is ON, then log these
        // if (process.env.DEBUG_LEVEL === 'Info') {
        //   // Check which tables are in the database
        //   if (this._knex) {
        //     // this._knex('information_schema.tables')
        //     //   .select('table_schema', 'table_name')
        //     //   .where('table_type', 'BASE TABLE')
        //     //   .whereNotIn('table_schema', ['pg_catalog', 'information_schema'])
        //     //   .orderBy('table_schema', 'table_name')
        //     //   .then((result) => {
        //     //     console.log('Tables:', result);
        //     //   });

            // this._knex('public.user')
            //   .select('*')
            //   .then((result) => {
            //     console.log('user table data:', result);
            //   });

            
        //   }
        // }

        loggerService.info('Database connected successfully.');
        
        // Check if user table is empty and run seeding if needed
        // await this.checkAndSeedDatabase();
      } catch (error) {
        loggerService.error('Failed to connect to the database.', {
          service: 'DbService',
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        });
        throw error;
      }
    }
  };

  healthCheck = async () => {
    let isHealthy = false;

    try {
      if (this._knex) {
        await this._knex.raw('select 1+1 as result');

        isHealthy = true;
      }
    } catch {
      isHealthy = false;
    }

    loggerService.info(`<healthCheck>`, {
      service: 'DbService',
      healthCheck: isHealthy ? 'healthy' : 'unhealthy',
    });

    return isHealthy;
  };

  runMigrations = async () => {
    if (!this._knex) {
      throw new Error('Database connection not initialized. Call init() first.');
    }

    try {
      loggerService.info('Running database migrations...', {
        service: 'DbService',
        env: envService.get(),
      });

      const [batchNo, log] = await this._knex.migrate.latest();

      if (log.length === 0) {
        loggerService.info('Database is up to date. No migrations to run.', {
          service: 'DbService',
        });
      } else {
        loggerService.info(`Successfully ran ${log.length} migration(s)`, {
          service: 'DbService',
          batchNo,
          migrations: log,
        });
      }

      return { batchNo, log };
    } catch (error) {
      loggerService.error('Failed to run database migrations', {
        service: 'DbService',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  };

  dropAllTables = async () => {
    if (!this._knex) {
      throw new Error('Database connection not initialized. Call init() first.');
    }

    console.log('Proceeding with dropping all tables.');

    this._knex.schema
      .dropTableIfExists('sendemail')
      .dropTableIfExists('crm_import_logs')
      .dropTableIfExists('crm_entry_logs')
      .dropTableIfExists('crm_entitlement_item')
      .dropTableIfExists('crm_feedback')
      .dropTableIfExists('crm_entries')
      .dropTableIfExists('crm_entitlements')
      .dropTableIfExists('quote_invoice')
      .dropTableIfExists('recurring_plan')
      .dropTableIfExists('buying_schedule')
      .dropTableIfExists('hedge_invoice_basket')
      .dropTableIfExists('hedge_payment')
      .dropTableIfExists('hedge_invoice')
      .dropTableIfExists('import_logs')
      .dropTableIfExists('import_files')
      .dropTableIfExists('xero_token_set')
      .dropTableIfExists('org_entitlements')
      .dropTableIfExists('financial_products')
      .dropTableIfExists('config')
      .dropTableIfExists('authentication_code')
      .dropTableIfExists('payment')
      .dropTableIfExists('invoice')
      .dropTableIfExists('forward_point')
      .dropTableIfExists('rate')
      .dropTableIfExists('organisation_user')
      .dropTableIfExists('organisation')
      .dropTableIfExists('tenant')
      .dropTableIfExists('user')
      .dropTableIfExists('account')
      .then(() => {
        console.log('Dropped all specified tables for debug purposes.');
      });
  };

  checkAndSeedDatabase = async () => {
    if (!this._knex) {
      throw new Error('Database connection not initialized. Call init() first.');
    }

    try {
      // Check if user table has any data
      const userCount = await this._knex('user').count('* as count').first();
      const hasUsers = userCount && parseInt(userCount.count as string) > 0;

      if (!hasUsers) {
        loggerService.info('User table is empty. Running database seeding...', {
          service: 'DbService',
        });
        console.log('envService.isLocal()', envService.isLocal());
        // Run the seed function
        if (envService.isLocal()) {
          await seedLocal.seed(this._knex);
        } else if (envService.isStaging()) {
          await seedStaging.seed(this._knex);
        } else if (envService.isProduction()) {
          await seedProduction.seed(this._knex);
        }

        loggerService.info('Database seeding completed successfully.', {
          service: 'DbService',
        });
      } else {
        loggerService.info('User table contains data. Skipping seeding.', {
          service: 'DbService',
        });
      }
    } catch (error) {
      loggerService.error('Failed to check and seed database', {
        service: 'DbService',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  };

  table = (table: Table) => {
    return (this._knex as KnexInstance)(table);
  };

  distinctFrom = (table: Table) => {
    // Casting this to `any`, as distinct will incorrectly cast the return type to an empty object. Because we are always casting in our DB
    // interfaces, we should still have type safety.
    return (this._knex as KnexInstance).distinct().from(table) as any;
  };
}

export const dbService = new DbService();
