exports.up = (knex) => {
  return knex.schema.createTable('forward_point', (t) => {
    t.date('date').notNullable();
    t.string('baseCurrency').notNullable();
    t.string('tradeCurrency').notNullable();
    t.string('month').notNullable();
    t.string('year').notNullable();
    t.decimal('forwardPoints', 17, 5).notNullable();
    t.primary(['date', 'month', 'year', 'baseCurrency', 'tradeCurrency']);
    t.timestamps(false, true);
  });
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('forward_point');
};
