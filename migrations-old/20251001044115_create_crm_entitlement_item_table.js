exports.up = (knex) => {
  return knex.schema.createTable('crm_entitlement_item', (t) => {
    t.string('id').primary().unique();
    t.string('entitlementId').notNullable();
    t.foreign('entitlementId').references('crm_entitlements.id');
    t.string('itemType').notNullable();
    t.string('itemValue').notNullable();
    t.decimal('quantity', 17, 5);
    t.decimal('unitPrice', 17, 5);
    t.string('currency');
    t.boolean('isActive').notNullable().defaultTo(true);
    t.timestamps(false, true);
  });
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('crm_entitlement_item');
};
