exports.up = (knex) => {
  return knex.schema.createTable('invoice', (t) => {
    t.string('provider').notNullable();
    t.string('invoiceId').notNullable();
    t.string('tenantId').notNullable();
    t.string('invoiceType').notNullable();
    t.string('invoiceNumber').notNullable();
    t.string('invoiceStatus').notNullable();
    t.string('contactName').notNullable();
    t.date('date').notNullable();
    t.date('dateDue').notNullable();
    t.decimal('total', 17, 5).notNullable();
    t.string('currencyCode').notNullable();
    t.decimal('currencyRate', 17, 5).notNullable();
    t.decimal('amountDue', 17, 5).notNullable();
    t.decimal('amountPaid', 17, 5).notNullable();
    t.decimal('amountCredited', 17, 5).notNullable();
    t.primary(['tenantId', 'invoiceId', 'provider']);
    t.timestamps(false, true);
  });
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('invoice');
};
