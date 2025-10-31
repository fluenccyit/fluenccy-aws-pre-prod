exports.up = (knex) => {
  return knex.schema.createTable('config', (t) => {
    t.string('key').primary().unique();
    t.text('value').notNullable();
    t.text('description');
    t.timestamps(false, true);
  });
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('config');
};
