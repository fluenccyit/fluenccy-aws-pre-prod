exports.up = (knex) => {
    return knex.schema.alterTable('hedge_invoice', (t) => {
      // Add missing columns based on db operations
      t.boolean('isPricing');
    });
  };
  
  exports.down = (knex) => {
    return knex.schema.alterTable('hedge_invoice', (t) => {
      t.dropColumn('isPricing');      
    });
  };
  