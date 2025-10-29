/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
  return knex.schema.alterTable('account', (t) => {
    // account.name is optional in GraphQL schema and can be null
    t.string('name').nullable().alter();
  })
  .then(() => {
    return knex.schema.alterTable('authentication_code', (t) => {
      // created_at and updated_at are optional in the model
      t.date('created_at').nullable().alter();
      t.date('updated_at').nullable().alter();
    });
  })
  .then(() => {
    return knex.schema.alterTable('crm_entitlement_item', (t) => {
      // quantity and unitPrice are optional in the model
      t.integer('quantity').nullable().alter();
      t.integer('unitPrice').nullable().alter();
      t.string('currency').nullable().alter();
    });
  })
  .then(() => {
    return knex.schema.alterTable('crm_entitlements', (t) => {
      // expiresAt is optional - entitlements can be permanent
      t.date('expiresAt').nullable().alter();
    });
  })
  .then(() => {
    return knex.schema.alterTable('crm_entries', (t) => {
      // processedAt is optional - entries might not be processed yet
      t.date('processedAt').nullable().alter();
    });
  })
  .then(() => {
    return knex.schema.alterTable('crm_feedback', (t) => {
      // rating is optional in the model
      t.integer('rating').nullable().alter();
    });
  })
  .then(() => {
    return knex.schema.alterTable('crm_import_logs', (t) => {
      // Various fields are optional and can be null during processing
      t.integer('totalRecords').nullable().alter();
      t.integer('processedRecords').nullable().alter();
      t.integer('errorCount').nullable().alter();
      t.string('errorMessage').nullable().alter();
      t.date('startedAt').nullable().alter();
      t.date('completedAt').nullable().alter();
    });
  })
  .then(() => {
    return knex.schema.alterTable('financial_products', (t) => {
      // minAmount and maxAmount are optional
      t.decimal('minAmount', 17, 5).nullable().alter();
      t.decimal('maxAmount', 17, 5).nullable().alter();
    });
  })
  .then(() => {
    return knex.schema.alterTable('hedge_invoice_basket', (t) => {
      // hedgeDate is optional - baskets might not be hedged yet
      t.date('hedgeDate').nullable().alter();
    });
  })
  .then(() => {
    return knex.schema.alterTable('import_logs', (t) => {
      // Various fields are optional and can be null during processing
      t.integer('totalRecords').nullable().alter();
      t.integer('processedRecords').nullable().alter();
      t.integer('errorCount').nullable().alter();
      t.string('errorMessage').nullable().alter();
      t.date('startedAt').nullable().alter();
      t.date('completedAt').nullable().alter();
    });
  })
  .then(() => {
    return knex.schema.alterTable('organisation', (t) => {
      // syncStatus is optional - might not be synced yet
      t.string('syncStatus').nullable().alter();
    });
  })
  .then(() => {
    return knex.schema.alterTable('quote_invoice', (t) => {
      // invoiceId is optional - quotes might not be converted to invoices yet
      t.string('invoiceId').nullable().alter();
      // expiryDate and invoiceDate are optional
      t.date('expiryDate').nullable().alter();
      t.date('invoiceDate').nullable().alter();
    });
  })
  .then(() => {
    return knex.schema.alterTable('tenant', (t) => {
      // lastSynced is optional - tenants might not be synced yet
      t.date('lastSynced').nullable().alter();
    });
  })
  .then(() => {
    return knex.schema.alterTable('xero_token_set', (t) => {
      // expiresAt is optional - tokens might not have expiration
      t.date('expiresAt').nullable().alter();
    });
  })
  .then(()=>{
    return knex.schema.alterTable('org_entitlements', (t)=>{
      t.string('mode').nullable().alter();
    });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
  return knex.schema.alterTable('account', (t) => {
    t.string('name').notNullable().alter();
  })
  .then(() => {
    return knex.schema.alterTable('authentication_code', (t) => {
      t.date('created_at').notNullable().alter();
      t.date('updated_at').notNullable().alter();
    });
  })
  .then(() => {
    return knex.schema.alterTable('crm_entitlement_item', (t) => {
      t.integer('quantity').notNullable().alter();
      t.integer('unitPrice').notNullable().alter();
      t.string('currency').notNullable().alter();
    });
  })
  .then(() => {
    return knex.schema.alterTable('crm_entitlements', (t) => {
      t.date('expiresAt').notNullable().alter();
    });
  })
  .then(() => {
    return knex.schema.alterTable('crm_entries', (t) => {
      t.date('processedAt').notNullable().alter();
    });
  })
  .then(() => {
    return knex.schema.alterTable('crm_feedback', (t) => {
      t.integer('rating').notNullable().alter();
    });
  })
  .then(() => {
    return knex.schema.alterTable('crm_import_logs', (t) => {
      t.integer('totalRecords').notNullable().alter();
      t.integer('processedRecords').notNullable().alter();
      t.integer('errorCount').notNullable().alter();
      t.string('errorMessage').notNullable().alter();
      t.date('startedAt').notNullable().alter();
      t.date('completedAt').notNullable().alter();
    });
  })
  .then(() => {
    return knex.schema.alterTable('financial_products', (t) => {
      t.decimal('minAmount', 17, 5).notNullable().alter();
      t.decimal('maxAmount', 17, 5).notNullable().alter();
    });
  })
  .then(() => {
    return knex.schema.alterTable('hedge_invoice_basket', (t) => {
      t.date('hedgeDate').notNullable().alter();
    });
  })
  .then(() => {
    return knex.schema.alterTable('import_logs', (t) => {
      t.integer('totalRecords').notNullable().alter();
      t.integer('processedRecords').notNullable().alter();
      t.integer('errorCount').notNullable().alter();
      t.string('errorMessage').notNullable().alter();
      t.date('startedAt').notNullable().alter();
      t.date('completedAt').notNullable().alter();
    });
  })
  .then(() => {
    return knex.schema.alterTable('organisation', (t) => {
      t.string('syncStatus').notNullable().alter();
    });
  })
  .then(() => {
    return knex.schema.alterTable('quote_invoice', (t) => {
      t.string('invoiceId').notNullable().alter();
      t.date('expiryDate').notNullable().alter();
      t.date('invoiceDate').notNullable().alter();
    });
  })
  .then(() => {
    return knex.schema.alterTable('tenant', (t) => {
      t.date('lastSynced').notNullable().alter();
    });
  })
  .then(() => {
    return knex.schema.alterTable('xero_token_set', (t) => {
      t.date('expiresAt').notNullable().alter();
    });
  })
  .then(()=>{
    return knex.schema.alterTable('org_entitlements', (t)=>{
      t.string('mode').notNullable().alter();
    });
  });
};
