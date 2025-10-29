exports.up = (knex) => {
  return knex.schema.createTable('crm_entries', (t) => {
    t.string('id').primary().unique();
    t.string('orgId').notNullable();
    t.foreign('orgId').references('organisation.id');
    t.string('entryType').notNullable();
    t.string('entryId').notNullable();
    t.string('provider').notNullable();
    t.jsonb('entryData').notNullable();
    t.string('status').notNullable();
    t.timestamp('processedAt');
    t.timestamps(false, true);
  });
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('crm_entries');
};
