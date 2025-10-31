exports.up = (knex) => {
  return knex.schema.createTable('user', (t) => {
    t.string('id').primary().unique();

    t.string('accountId').unique();
    t.foreign('accountId').references('account.id');

    t.string('firebaseUid').notNullable().unique();
    t.string('firstName').notNullable();
    t.string('lastName').notNullable();
    t.string('role').notNullable();
    t.jsonb('tokenSet');
    t.timestamps(false, true);
  });
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('user');
};
