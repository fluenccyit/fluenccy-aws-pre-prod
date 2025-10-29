exports.up = (knex) => {
  return knex.schema.createTable('quote_invoice', (t) => {
    t.string('id').primary().unique();
    t.string('orgId').notNullable();
    t.foreign('orgId').references('organisation.id');
    t.string('quoteNumber').notNullable();
    t.string('invoiceId');
    t.string('status').notNullable();
    t.decimal('amount', 17, 5).notNullable();
    t.string('currency').notNullable();
    t.date('quoteDate').notNullable();
    t.date('expiryDate');
    t.date('invoiceDate');
    t.jsonb('quoteData');
    t.timestamps(false, true);
  });
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('quote_invoice');
};
