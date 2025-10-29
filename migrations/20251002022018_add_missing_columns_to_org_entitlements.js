exports.up = (knex) => {
  return knex.schema.alterTable('org_entitlements', (t) => {
    // Add all the missing columns based on the model and db operations
    t.decimal('spotPercentage', 17, 5);
    t.decimal('forwardPercentage', 17, 5);
    t.decimal('orderPercentage', 17, 5);
    t.decimal('marginPercentage', 17, 5);
    t.decimal('avgOrder', 17, 5);
    t.decimal('budgetDiscount', 17, 5);
    t.decimal('hedgePercentage', 17, 5);
    t.decimal('hedgeAdjustment', 17, 5);
    t.decimal('EFTAdjustment', 17, 5);
    t.decimal('volAdjustment', 17, 5);
    t.decimal('orderAdjustmentPlus', 17, 5);
    t.decimal('orderAdjustmentMinus', 17, 5);
    t.decimal('orderProbability', 17, 5);
    t.decimal('minimumProbability', 17, 5);
    t.decimal('maximumProbability', 17, 5);
    t.decimal('minPercentAboveSpot', 17, 5);
    t.decimal('maxPercentOnOrder', 17, 5);
    t.string('fi_name');
    t.string('fi_email');
    t.string('plan_approval_email');
    t.decimal('maxForwardPercent', 17, 5);
    t.decimal('minForwardPercent', 17, 5);
    t.string('createdBy').nullable();
    t.string('updatedBy').nullable();
    t.decimal('forwardMarginPercentage', 17, 5);
    t.decimal('limitOrderMarginPercentage', 17, 5);
    t.decimal('spotMarginPercentage', 17, 5);
    t.boolean('setOptimised').defaultTo(false);
    t.boolean('showInversedRate').defaultTo(false);
    t.string('mode').notNullable();
  });
};

exports.down = (knex) => {
  return knex.schema.alterTable('org_entitlements', (t) => {
    // Remove the added columns
    t.dropColumn('spotPercentage');
    t.dropColumn('forwardPercentage');
    t.dropColumn('orderPercentage');
    t.dropColumn('marginPercentage');
    t.dropColumn('avgOrder');
    t.dropColumn('budgetDiscount');
    t.dropColumn('hedgePercentage');
    t.dropColumn('hedgeAdjustment');
    t.dropColumn('EFTAdjustment');
    t.dropColumn('volAdjustment');
    t.dropColumn('orderAdjustmentPlus');
    t.dropColumn('orderAdjustmentMinus');
    t.dropColumn('orderProbability');
    t.dropColumn('minimumProbability');
    t.dropColumn('maximumProbability');
    t.dropColumn('minPercentAboveSpot');
    t.dropColumn('maxPercentOnOrder');
    t.dropColumn('fi_name');
    t.dropColumn('fi_email');
    t.dropColumn('plan_approval_email');
    t.dropColumn('maxForwardPercent');
    t.dropColumn('minForwardPercent');
    t.dropColumn('createdBy');
    t.dropColumn('updatedBy');
    t.dropColumn('forwardMarginPercentage');
    t.dropColumn('limitOrderMarginPercentage');
    t.dropColumn('spotMarginPercentage');
    t.dropColumn('setOptimised');
    t.dropColumn('showInversedRate');
    t.dropColumn('mode');
  });
};

