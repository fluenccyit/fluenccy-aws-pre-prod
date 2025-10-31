exports.up = (knex) => {
  return knex.schema.createTable('recurring_plan', (t) => {
    t.string('id').primary().unique();
    t.string('orgId').notNullable();
    t.foreign('orgId').references('organisation.id');
    t.string('planName').notNullable();
    t.string('planType').notNullable();
    t.decimal('amount', 17, 5).notNullable();
    t.string('currency').notNullable();
    t.string('frequency').notNullable();
    t.date('startDate').notNullable();
    t.date('endDate');
    t.boolean('isActive').notNullable().defaultTo(true);
    t.jsonb('planConfig');
    t.timestamps(false, true);
  });
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('recurring_plan');
};
