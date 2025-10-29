exports.up = (knex) => {
  return knex.schema.createTable('payment', (t) => {
    t.string('provider').notNullable();
    t.string('paymentId').notNullable();
    t.string('tenantId').notNullable();
    t.string('paymentStatus').notNullable();
    t.string('paymentType').notNullable();
    t.string('invoiceId').notNullable();
    t.date('date').notNullable();
    t.decimal('amount', 17, 5).notNullable();
    t.string('currencyCode').notNullable();
    t.decimal('currencyRate', 17, 5).notNullable();
    t.decimal('minCost', 17, 5).notNullable();
    t.decimal('minRate', 17, 5).notNullable();
    t.decimal('maxCost', 17, 5).notNullable();
    t.decimal('maxRate', 17, 5).notNullable();
    t.decimal('actualCost', 17, 5).notNullable();
    t.primary(['tenantId', 'paymentId', 'provider']);
    t.timestamps(false, true);
  });
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('payment');
};
