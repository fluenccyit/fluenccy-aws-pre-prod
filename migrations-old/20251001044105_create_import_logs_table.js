exports.up = (knex) => {
  return knex.schema.createTable('import_logs', (t) => {
    t.string('id').primary().unique();
    t.string('orgId').notNullable();
    t.foreign('orgId').references('organisation.id');
    t.string('importType').notNullable();
    t.string('status').notNullable();
    t.integer('totalRecords');
    t.integer('processedRecords');
    t.integer('errorCount');
    t.text('errorMessage');
    t.jsonb('metadata');
    t.timestamp('startedAt');
    t.timestamp('completedAt');
    t.timestamps(false, true);
  });
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('import_logs');
};
