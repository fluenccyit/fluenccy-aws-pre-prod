exports.up = (knex) => {
  return knex.schema.createTable('buying_schedule', (t) => {
    t.string('id').primary().unique();
    t.string('orgId').notNullable();
    t.foreign('orgId').references('organisation.id');
    t.string('scheduleName').notNullable();
    t.string('currencyPair').notNullable();
    t.decimal('amount', 17, 5).notNullable();
    t.string('frequency').notNullable();
    t.date('startDate').notNullable();
    t.date('endDate');
    t.boolean('isActive').notNullable().defaultTo(true);
    t.jsonb('scheduleConfig');
    t.timestamps(false, true);
  });
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('buying_schedule');
};
