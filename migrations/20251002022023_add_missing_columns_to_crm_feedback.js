exports.up = (knex) => {
  return knex.schema.alterTable('crm_feedback', (t) => {
    // Add missing columns based on db operations
    t.string('crm_entry_id');
    t.foreign('crm_entry_id').references('crm_entries.id');
    t.decimal('reservedAmount', 17, 5);
    t.decimal('reservedRate', 17, 5);
    t.date('reservedDate');
    t.string('createdBy').nullable();
    t.string('updatedBy').nullable();
  });
};

exports.down = (knex) => {
  return knex.schema.alterTable('crm_feedback', (t) => {
    t.dropColumn('crm_entry_id');
    t.dropColumn('reservedAmount');
    t.dropColumn('reservedRate');
    t.dropColumn('reservedDate');
    t.dropColumn('createdBy');
    t.dropColumn('updatedBy');
  });
};

