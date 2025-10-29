exports.up = (knex) => {
  return knex.schema.alterTable('hedge_payment', (t) => {
    // Add missing columns based on db operations
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
  return knex.schema.alterTable('hedge_payment', (t) => {
    t.dropColumn('encryptedTotal');
    t.dropColumn('import_log_id');
    t.dropColumn('manage_type');
    t.dropColumn('overriden');
    t.dropColumn('homeCurrencyCode');
    t.dropColumn('mode');
    t.dropColumn('isAddedToBucket');
  });
};
