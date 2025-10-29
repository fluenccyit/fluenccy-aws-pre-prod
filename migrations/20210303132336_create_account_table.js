exports.up = (knex) => {
  return knex.schema.createTable('account', (t) => {
    t.string('id').primary().unique();
    t.string('type').notNullable();
    t.string('name');
    t.timestamps(false, true);
  });
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('account');
};
