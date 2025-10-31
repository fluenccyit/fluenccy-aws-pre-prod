exports.up = (knex) => {
  return knex.schema.alterTable('import_logs', (t) => {
    // Add missing columns based on db operations
    t.string('tenantId');
    t.string('fileType');
    t.text('content');
    t.jsonb('field_mapping');
    t.string('review_status');
    t.string('filename');
    t.boolean('is_hedging').defaultTo(false);
    t.string('createdBy').nullable();
    t.string('updatedBy').nullable();
    t.string('mode').nullable();
  });
};

exports.down = (knex) => {
  return knex.schema.alterTable('import_logs', (t) => {
    t.dropColumn('tenantId');
    t.dropColumn('fileType');
    t.dropColumn('content');
    t.dropColumn('field_mapping');
    t.dropColumn('review_status');
    t.dropColumn('filename');
    t.dropColumn('is_hedging');
    t.dropColumn('createdBy');
    t.dropColumn('updatedBy');
    t.dropColumn('mode');
  });
};

