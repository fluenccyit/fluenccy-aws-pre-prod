exports.up = (knex) => {
  return knex.schema.alterTable('crm_entitlements', (t) => {
    // Add missing columns based on db operations
    t.string('currencyCode');
    t.boolean('isPricing').defaultTo(false);
    t.string('mode');
    t.string('pricingOption1Label');
    t.string('pricingOption2Label');
    t.string('pricingOption3Label');
    t.string('createdBy').nullable();
    t.string('updatedBy').nullable();
  });
};

exports.down = (knex) => {
  return knex.schema.alterTable('crm_entitlements', (t) => {
    t.dropColumn('currencyCode');
    t.dropColumn('isPricing');
    t.dropColumn('mode');
    t.dropColumn('pricingOption1Label');
    t.dropColumn('pricingOption2Label');
    t.dropColumn('pricingOption3Label');
    t.dropColumn('createdBy');
    t.dropColumn('updatedBy');
  });
};

