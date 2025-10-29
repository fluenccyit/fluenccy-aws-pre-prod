exports.up = (knex) => {
  return knex.schema.createTable('crm_entitlements', (t) => {
    t.string('id').primary().unique();
    t.string('orgId').notNullable();
    t.foreign('orgId').references('organisation.id');
    t.string('entitlementType').notNullable();
    t.string('entitlementValue').notNullable();
    t.date('expiresAt');
    t.boolean('isActive').notNullable().defaultTo(true);
    t.jsonb('metadata');
    t.timestamps(false, true);
  });
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('crm_entitlements');
};
