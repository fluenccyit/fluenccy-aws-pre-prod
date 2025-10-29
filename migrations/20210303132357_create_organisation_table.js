exports.up = (knex) => {
  return knex.schema.createTable('organisation', (t) => {
    t.string('id').primary().unique();

    t.string('accountId').notNullable();
    t.foreign('accountId').references('account.id');

    t.string('tenantId').notNullable();
    t.foreign('tenantId').references('tenant.id');

    t.string('tokenUserId');
    t.foreign('tokenUserId').references('user.id');

    t.string('name').notNullable();
    t.string('currency').notNullable();
    t.decimal('hedgeMargin', 17, 5).notNullable().defaultTo(0.0035);
    t.integer('buildPlanScore').notNullable().defaultTo(0);
    t.jsonb('buildPlanAnswers').notNullable().defaultsTo([]);
    t.jsonb('currencyScores').notNullable().defaultsTo([]);
    t.boolean('initialSyncComplete').notNullable().defaultsTo(false);
    t.boolean('onboardingComplete').notNullable().defaultsTo(false);
    t.boolean('intentRegistered').notNullable().defaultsTo(false);
    t.string('syncStatus');
    t.timestamps(false, true);
  });
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('organisation');
};
