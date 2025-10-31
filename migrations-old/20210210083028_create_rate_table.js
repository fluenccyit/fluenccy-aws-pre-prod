exports.up = (knex) => {
  return knex.schema.createTable('rate', (t) => {
    t.date('date').notNullable();
    t.string('baseCurrency').notNullable();
    t.string('tradeCurrency').notNullable();
    t.decimal('open', 17, 5).notNullable();
    t.decimal('high', 17, 5).notNullable();
    t.decimal('low', 17, 5).notNullable();
    t.decimal('last', 17, 5).notNullable();
    t.primary(['date', 'baseCurrency', 'tradeCurrency']);
    t.timestamps(false, true);
  });
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('rate');
};
