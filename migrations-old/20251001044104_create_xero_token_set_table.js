exports.up = (knex) => {
  return knex.schema.createTable('xero_token_set', (t) => {
    t.string('id').primary().unique();
    t.string('orgId').notNullable();
    t.foreign('orgId').references('organisation.id');
    t.jsonb('tokenSet').notNullable();
    t.timestamp('expiresAt');
    t.boolean('isActive').notNullable().defaultTo(true);
    t.timestamps(false, true);
  });
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('xero_token_set');
};
