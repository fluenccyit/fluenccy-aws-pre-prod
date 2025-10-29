exports.up = (knex) => {
  return knex.schema.createTable('tenant', (t) => {
    t.string('id').primary().unique();
    t.string('provider').notNullable();
    t.timestamp('lastSynced');
    t.timestamps(false, true);
  });
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('tenant');
};
