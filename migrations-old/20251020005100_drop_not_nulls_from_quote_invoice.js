/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
    return knex.schema.alterTable('quote_invoice', (t) => {
      t.string('orgId').nullable().alter();
      t.string('quoteNumber').nullable().alter();
      t.string('status').nullable().alter();
      t.decimal('amount', 17, 5).nullable().alter();
      t.string('currency').nullable().alter();
      t.date('quoteDate').nullable().alter();
    })
};

exports.down = (knex) => {
    return knex.schema.alterTable('quote_invoice', (t) => {
      t.string('orgId').notNullable().alter();
      t.string('quoteNumber').notNullable().alter();
      t.string('status').notNullable().alter();
      t.decimal('amount', 17, 5).notNullable().alter();
      t.string('currency').notNullable().alter();
      t.date('quoteDate').notNullable().alter();
    })
};
  