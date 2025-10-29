exports.up = (knex) => {
  return knex.schema.createTable('crm_entry_logs', (t) => {
    t.string('id').primary().unique();
    t.string('entryId').notNullable();
    t.foreign('entryId').references('crm_entries.id');
    t.string('action').notNullable();
    t.string('status').notNullable();
    t.text('message');
    t.jsonb('metadata');
    t.timestamp('actionAt').notNullable();
    t.timestamps(false, true);
  });
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('crm_entry_logs');
};
