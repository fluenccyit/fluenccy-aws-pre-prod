exports.up = (knex) => {
    return knex.schema.alterTable('crm_entries', (t) => {
      // Add missing columns based on db operations
      t.boolean('isManaged');
    });
  };
  
  exports.down = (knex) => {
    return knex.schema.alterTable('crm_entries', (t) => {
      t.dropColumn('isManaged');      
    });
  };
  