exports.up = (knex) => {
  return knex.schema.alterTable('hedge_invoice', (t) => {
    // Add missing columns based on the model and db operations
    t.jsonb('buyingSchedule');
    t.string('encryptedTotal');
    t.string('import_log_id');
    t.string('manage_type');
    t.boolean('overriden').defaultTo(false);
    t.string('homeCurrencyCode');
    t.string('mode');
    t.boolean('isAddedToBucket').defaultTo(false);
  });
};

exports.down = (knex) => {
  return knex.schema.alterTable('hedge_invoice', (t) => {
    t.dropColumn('buyingSchedule');
    t.dropColumn('encryptedTotal');
    t.dropColumn('import_log_id');
    t.dropColumn('manage_type');
    t.dropColumn('overriden');
    t.dropColumn('homeCurrencyCode');
    t.dropColumn('mode');
    t.dropColumn('isAddedToBucket');
  });
};

