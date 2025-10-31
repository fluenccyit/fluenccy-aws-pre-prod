exports.up = (knex) => {
    return knex.schema.alterTable('hedge_invoice', (t) => {
      // Add missing columns based on db operations
      t.boolean('isMarkedAsPaid');  
      t.boolean('isMarkedAsReceived');  
      t.string('type');  
    });
  };
  
  exports.down = (knex) => {
    return knex.schema.alterTable('hedge_invoice', (t) => {
      t.dropColumn('isMarkedAsPaid');
      t.dropColumn('isMarkedAsReceived');
      t.dropColumn('type');
    });
  };
  