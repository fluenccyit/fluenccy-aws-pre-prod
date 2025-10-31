/**
 * @param { import("knex").Knex } knex
 */
exports.up = async function (knex) {
    await knex.schema.alterTable('quote_invoice', (table) => {
      table.unique(['tenantId', 'invoiceId', 'provider'], 'quote_invoice_unique_idx');
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   */
  exports.down = async function (knex) {
    await knex.schema.alterTable('quote_invoice', (table) => {
      table.dropUnique(['tenantId', 'invoiceId', 'provider'], 'quote_invoice_unique_idx');
    });
  };
  