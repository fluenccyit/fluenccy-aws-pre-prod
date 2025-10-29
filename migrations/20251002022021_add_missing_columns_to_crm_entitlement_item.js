exports.up = (knex) => {
  return knex.schema.alterTable('crm_entitlement_item', (t) => {
    // Add missing columns based on db operations
    t.string('name');
    t.decimal('max', 17, 5);
    t.decimal('min', 17, 5);
    t.string('text');
    t.string('createdBy').nullable();
    t.string('updatedBy').nullable();
  });
};

exports.down = (knex) => {
  return knex.schema.alterTable('crm_entitlement_item', (t) => {
    t.dropColumn('name');
    t.dropColumn('max');
    t.dropColumn('min');
    t.dropColumn('text');
    t.dropColumn('createdBy');
    t.dropColumn('updatedBy');
  });
};

