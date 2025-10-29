exports.up = (knex) => {
  return knex.schema.alterTable('crm_entries', (t) => {
    // Add missing columns based on db operations
    t.string('currencyCode');
    t.string('month');
    t.string('year');
    t.decimal('currentRate', 17, 5);
    t.string('crm_import_log_id');
    t.boolean('isApproved').defaultTo(false);
    t.string('mode');
    t.string('createdBy').nullable();
    t.string('updatedBy').nullable();
  });
};

exports.down = (knex) => {
  return knex.schema.alterTable('crm_entries', (t) => {
    t.dropColumn('currencyCode');
    t.dropColumn('month');
    t.dropColumn('year');
    t.dropColumn('currentRate');
    t.dropColumn('crm_import_log_id');
    t.dropColumn('isApproved');
    t.dropColumn('mode');
    t.dropColumn('createdBy');
    t.dropColumn('updatedBy');
  });
};

