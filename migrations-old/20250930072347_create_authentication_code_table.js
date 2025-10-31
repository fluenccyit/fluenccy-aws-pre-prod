exports.up = (knex) => {
    return knex.schema.createTable('authentication_code', (t) => {
      t.string('email').notNullable();
      t.string('code').notNullable();
      t.string('username').notNullable();
      t.date('created_at');
      t.date('updated_at');
    });
  };
  
  exports.down = (knex) => {
    return knex.schema.dropTableIfExists('authentication_code');
  };
  