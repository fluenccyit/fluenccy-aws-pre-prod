exports.up = (knex) => {
  return knex.schema.createTable('financial_products', (t) => {
    t.string('id').primary().unique();
    t.string('name').notNullable();
    t.text('description');
    t.string('category').notNullable();
    t.decimal('minAmount', 17, 5);
    t.decimal('maxAmount', 17, 5);
    t.string('currency').notNullable();
    t.boolean('isActive').notNullable().defaultTo(true);
    t.jsonb('metadata');
    t.timestamps(false, true);
  });
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('financial_products');
};
