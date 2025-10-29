/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {

  return knex.schema.alterTable('org_entitlements', table => {
    // These columns are not defined in the TypeScript model and are not used in the codebase
    table.dropColumn('entitlementType');
    table.dropColumn('entitlementValue');
  })
  .then(() => {
    return knex.schema.alterTable('crm_entitlements', table => {
      // These columns are not defined in any TypeScript model and are not used in the codebase
      table.dropColumn('entitlementType');
      table.dropColumn('entitlementValue');
    });
  })
  .then(() => {
    return knex.schema.alterTable('crm_entitlement_item', table => {
      // These columns are not defined in any TypeScript model and are not used in the codebase
      table.dropColumn('itemType');
      table.dropColumn('itemValue');
    });
  })
  .then(() => {
    return knex.schema.alterTable('crm_entries', table => {
      // This column is not defined in any TypeScript model and is not used in the codebase
      table.dropColumn('entryType');
    });
  })
  .then(() => {
    return knex.schema.alterTable('crm_feedback', table => {
      // This column is not defined in any TypeScript model and is not used in the codebase
      table.dropColumn('feedbackType');
    });
  })
  .then(() => {
    return knex.schema.alterTable('financial_products', table => {
      // This column is not defined in the TypeScript model and is not used in the codebase
      table.dropColumn('category');
    });
  })
  .then(() => {
    return knex.schema.alterTable('import_logs', table => {
      // This column is not defined in the TypeScript model and is not used in the codebase
      table.dropColumn('importType');
    });
  })
  .then(() => {
    return knex.schema.alterTable('crm_import_logs', table => {
      // This column is not defined in any TypeScript model and is not used in the codebase
      table.dropColumn('importType');
    });
  })
  .then(() => {
    return knex.schema.alterTable('buying_schedule', table => {
      // These columns are not defined in the TypeScript model and are not used in the codebase
      table.dropColumn('scheduleName');
      table.dropColumn('currencyPair');
    });
  })
  .then(() => {
    return knex.schema.alterTable('recurring_plan', table => {
      // These columns are not defined in the TypeScript model and are not used in the codebase
      table.dropColumn('planName');
      table.dropColumn('planType');
    });
  })
  // .then(()=>{
  //   return knex.schema.alterTable('hedge_invoice')
  // });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('org_entitlements', table => {
    table.string('entitlementType').notNullable();
    table.string('entitlementValue').notNullable();
  })
  .then(() => {
    return knex.schema.alterTable('crm_entitlements', table => {
      table.string('entitlementType').notNullable();
      table.string('entitlementValue').notNullable();
    });
  })
  .then(() => {
    return knex.schema.alterTable('crm_entitlement_item', table => {
      table.string('itemType').notNullable();
      table.string('itemValue').notNullable();
    });
  })
  .then(() => {
    return knex.schema.alterTable('crm_entries', table => {
      table.string('entryType').notNullable();
    });
  })
  .then(() => {
    return knex.schema.alterTable('crm_feedback', table => {
      table.string('feedbackType').notNullable();
    });
  })
  .then(() => {
    return knex.schema.alterTable('financial_products', table => {
      table.string('category').notNullable();
    });
  })
  .then(() => {
    return knex.schema.alterTable('import_logs', table => {
      table.string('importType').notNullable();
    });
  })
  .then(() => {
    return knex.schema.alterTable('crm_import_logs', table => {
      table.string('importType').notNullable();
    });
  })
  .then(() => {
    return knex.schema.alterTable('buying_schedule', table => {
      table.string('scheduleName').notNullable();
      table.string('currencyPair').notNullable();
    });
  })
  .then(() => {
    return knex.schema.alterTable('recurring_plan', table => {
      table.string('planName').notNullable();
      table.string('planType').notNullable();
    });
  });
};
