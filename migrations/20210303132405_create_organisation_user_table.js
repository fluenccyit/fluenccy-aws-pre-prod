exports.up = (knex) => {
  return knex.schema.createTable('organisation_user', (t) => {
    t.string('orgId').notNullable();
    t.foreign('orgId').references('organisation.id');

    t.string('userId').notNullable();
    t.foreign('userId').references('user.id');

    t.primary(['orgId', 'userId']);
    t.timestamps(false, true);
  });
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('organisation_user');
};
