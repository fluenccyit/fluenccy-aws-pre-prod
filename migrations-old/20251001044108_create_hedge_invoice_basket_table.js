exports.up = (knex) => {
  return knex.schema.createTable('hedge_invoice_basket', (t) => {
    t.string('id').primary().unique();
    t.string('orgId').notNullable();
    t.foreign('orgId').references('organisation.id');
    t.string('basketName').notNullable();
    t.jsonb('invoiceIds').notNullable();
    t.decimal('totalAmount', 17, 5).notNullable();
    t.string('currency').notNullable();
    t.string('status').notNullable();
    t.date('createdDate').notNullable();
    t.date('hedgeDate');
    t.timestamps(false, true);
  });
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('hedge_invoice_basket');
};
