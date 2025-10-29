exports.up = (knex) => {
  return knex.schema.createTable('crm_feedback', (t) => {
    t.string('id').primary().unique();
    t.string('orgId').notNullable();
    t.foreign('orgId').references('organisation.id');
    t.string('userId').notNullable();
    t.foreign('userId').references('user.id');
    t.string('feedbackType').notNullable();
    t.text('feedbackText').notNullable();
    t.integer('rating');
    t.string('status').notNullable();
    t.timestamp('submittedAt').notNullable();
    t.timestamps(false, true);
  });
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('crm_feedback');
};
