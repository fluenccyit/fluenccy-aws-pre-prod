/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
    return knex.schema.alterTable('crm_import_logs', (t) => {
      t.string('status').nullable().alter();      
    })
};

exports.down = (knex) => {
    return knex.schema.alterTable('crm_import_logs', (t) => {
      t.string('status').notNullable().alter();      
    })
};
  