/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('account', (table) => {
      table.string('id').primary().unique();
      table.string('type').notNullable();
      table.string('name');
      table.timestamps(false, true);
    })
    .createTable('user', (table) => {
      table.string('id').primary().unique();
      table.string('accountId');
      table.foreign('accountId').references('account.id');
      table.string('firebaseUid').notNullable().unique();
      table.string('firstName').notNullable();
      table.string('lastName').notNullable();
      table.string('role').notNullable();
      table.jsonb('tokenSet');
      table.timestamps(false, true);
    })
    .createTable('tenant', (table) => {
      table.string('id').primary().unique();
      table.string('provider').notNullable();
      table.timestamp('lastSynced');
      table.timestamps(false, true);
    })
    .createTable('organisation', (table) => {
      table.string('id').primary().unique();
      table.string('accountId').notNullable();
      table.foreign('accountId').references('account.id');
      table.string('tenantId').notNullable();
      table.foreign('tenantId').references('tenant.id');
      table.string('tokenUserId');
      table.foreign('tokenUserId').references('user.id');
      table.string('name').notNullable();
      table.string('currency').notNullable();
      table.decimal('hedgeMargin', 17, 5).notNullable().defaultTo(0.0035);
      table.integer('buildPlanScore').notNullable().defaultTo(0);
      table.jsonb('buildPlanAnswers').notNullable().defaultTo('[]');
      table.jsonb('currencyScores').notNullable().defaultTo('[]');
      table.boolean('initialSyncComplete').notNullable().defaultTo(false);
      table.boolean('onboardingComplete').notNullable().defaultTo(false);
      table.boolean('intentRegistered').notNullable().defaultTo(false);
      table.string('syncStatus');
      table.timestamps(false, true);
    })
    .createTable('organisation_user', (table) => {
      table.string('orgId').notNullable();
      table.foreign('orgId').references('organisation.id');
      table.string('userId').notNullable();
      table.foreign('userId').references('user.id');
      table.primary(['orgId', 'userId']);
      table.timestamps(false, true);
    })
    .createTable('rate', (table) => {
      table.date('date').notNullable();
      table.string('baseCurrency').notNullable();
      table.string('tradeCurrency').notNullable();
      table.decimal('open', 17, 5).notNullable();
      table.decimal('high', 17, 5).notNullable();
      table.decimal('low', 17, 5).notNullable();
      table.decimal('last', 17, 5).notNullable();
      table.primary(['date', 'baseCurrency', 'tradeCurrency']);
      table.timestamps(false, true);
    })
    .createTable('forward_point', (table) => {
      table.date('date').notNullable();
      table.string('baseCurrency').notNullable();
      table.string('tradeCurrency').notNullable();
      table.string('month').notNullable();
      table.string('year').notNullable();
      table.decimal('forwardPoints', 17, 5).notNullable();
      table.primary(['date', 'month', 'year', 'baseCurrency', 'tradeCurrency']);
      table.timestamps(false, true);
    })
    .createTable('invoice', (table) => {
      table.string('provider').notNullable();
      table.string('invoiceId').notNullable();
      table.string('tenantId').notNullable();
      table.string('invoiceType').notNullable();
      table.string('invoiceNumber').notNullable();
      table.string('invoiceStatus').notNullable();
      table.string('contactName').notNullable();
      table.date('date').notNullable();
      table.date('dateDue').notNullable();
      table.decimal('total', 17, 5).notNullable();
      table.string('currencyCode').notNullable();
      table.decimal('currencyRate', 17, 5).notNullable();
      table.decimal('amountDue', 17, 5).notNullable();
      table.decimal('amountPaid', 17, 5).notNullable();
      table.decimal('amountCredited', 17, 5).notNullable();
      table.boolean('isAddedToBucket').notNullable().defaultTo(false);
      table.string('homeCurrencyCode');
      table.string('mode');
      table.string('import_log_id');
      table.primary(['tenantId', 'invoiceId', 'provider']);
      table.timestamps(false, true);
    })
    .createTable('payment', (table) => {
      table.string('provider').notNullable();
      table.string('paymentId').notNullable();
      table.string('tenantId').notNullable();
      table.string('paymentStatus').notNullable();
      table.string('paymentType').notNullable();
      table.string('invoiceId').notNullable();
      table.date('date').notNullable();
      table.decimal('amount', 17, 5).notNullable();
      table.string('currencyCode').notNullable();
      table.decimal('currencyRate', 17, 5).notNullable();
      table.decimal('minCost', 17, 5).notNullable();
      table.decimal('minRate', 17, 5).notNullable();
      table.decimal('maxCost', 17, 5).notNullable();
      table.decimal('maxRate', 17, 5).notNullable();
      table.decimal('actualCost', 17, 5).notNullable();
      table.string('import_log_id');
      table.primary(['tenantId', 'paymentId', 'provider']);
      table.timestamps(false, true);
    })
    .createTable('authentication_code', (table) => {
      table.string('email').notNullable();
      table.string('code').notNullable();
      table.string('username').notNullable();
      table.date('created_at');
      table.date('updated_at');
    })
    .createTable('config', (table) => {
      table.string('key').primary().unique();
      table.text('value').notNullable();
      table.text('description');
      table.timestamps(false, true);
    })
    .createTable('financial_products', (table) => {
      table.string('id').primary().unique();
      table.string('orgId').notNullable();
      table.foreign('orgId').references('organisation.id');
      table.string('name');
      table.string('title');
      table.text('description');
      table.string('category');
      table.decimal('minAmount', 17, 5);
      table.decimal('maxAmount', 17, 5);
      table.string('currency');
      table.string('mode');
      table.boolean('isActive').notNullable().defaultTo(true);
      table.jsonb('metadata');
      table.timestamps(false, true);
    })
    .createTable('import_files', (table) => {
      table.string('id').primary().unique();
      table.string('orgId').notNullable();
      table.foreign('orgId').references('organisation.id');
      table.string('tenantId').notNullable();
      table.string('fileType').notNullable();
      table.jsonb('content');
      table.jsonb('field_mapping');
      table.string('review_status').notNullable();
      table.string('filename').notNullable();
      table.boolean('is_hedging').notNullable().defaultTo(false);
      table.string('createdBy');
      table.string('updatedBy');
      table.string('mode');
      table.timestamps(false, true);
    })
    .createTable('org_entitlements', (table) => {
      table.string('id').primary().unique();
      table.string('orgId').notNullable();
      table.foreign('orgId').references('organisation.id');
      table.date('expiresAt');
      table.boolean('isActive').notNullable().defaultTo(true);
      
      // Additional org entitlement fields from the TypeScript model
      table.decimal('spotPercentage', 17, 5).notNullable().defaultTo(0);
      table.decimal('forwardPercentage', 17, 5).notNullable().defaultTo(0);
      table.decimal('orderPercentage', 17, 5).notNullable().defaultTo(0);
      table.decimal('marginPercentage', 17, 5).notNullable().defaultTo(0);
      table.decimal('avgOrder', 17, 5).notNullable().defaultTo(0);
      table.decimal('budgetDiscount', 17, 5).notNullable().defaultTo(0);
      table.decimal('hedgePercentage', 17, 5).notNullable().defaultTo(0);
      table.decimal('hedgeAdjustment', 17, 5).notNullable().defaultTo(0);
      table.decimal('EFTAdjustment', 17, 5).notNullable().defaultTo(0);
      table.decimal('volAdjustment', 17, 5).notNullable().defaultTo(0);
      table.decimal('orderAdjustmentPlus', 17, 5).notNullable().defaultTo(0);
      table.decimal('orderAdjustmentMinus', 17, 5).notNullable().defaultTo(0);
      table.decimal('orderProbability', 17, 5).notNullable().defaultTo(0);
      table.decimal('minimumProbability', 17, 5).notNullable().defaultTo(0);
      table.decimal('maximumProbability', 17, 5).notNullable().defaultTo(0);
      table.decimal('minPercentAboveSpot', 17, 5).notNullable().defaultTo(0);
      table.decimal('maxPercentOnOrder', 17, 5).notNullable().defaultTo(0);
      table.string('fi_name').notNullable().defaultTo('');
      table.string('fi_email').notNullable().defaultTo('');
      table.string('plan_approval_email').notNullable().defaultTo('');
      table.decimal('maxForwardPercent', 17, 5).notNullable().defaultTo(0);
      table.decimal('minForwardPercent', 17, 5).notNullable().defaultTo(0);
      table.decimal('forwardMarginPercentage', 17, 5).notNullable().defaultTo(0);
      table.decimal('limitOrderMarginPercentage', 17, 5).notNullable().defaultTo(0);
      table.decimal('spotMarginPercentage', 17, 5).notNullable().defaultTo(0);
      table.boolean('setOptimised').notNullable().defaultTo(false);
      table.string('createdBy');
      table.string('updatedBy');
      table.string('mode'); //.notNullable().defaultTo('default');
      table.boolean('showInversedRate').notNullable().defaultTo(false);
      
      table.timestamps(false, true);
    })
    .createTable('xero_token_set', (table) => {
      table.string('id').primary().unique();
      table.string('orgId').notNullable();
      table.foreign('orgId').references('organisation.id');
      table.jsonb('tokenSet').notNullable();
      table.timestamp('expiresAt');
      table.boolean('isActive').notNullable().defaultTo(true);
      table.timestamps(false, true);
    })
    .createTable('import_logs', (table) => {
      table.string('id').primary().unique();
      table.string('orgId').notNullable();
      table.foreign('orgId').references('organisation.id');
      table.string('tenantId').notNullable();
      table.string('importType');
      table.string('fileType').notNullable();
      table.string('filename').notNullable();
      table.string('review_status').notNullable();
      table.jsonb('content');
      table.jsonb('field_mapping');
      table.boolean('is_hedging').notNullable().defaultTo(false);
      table.string('createdBy');
      table.string('updatedBy');
      table.string('mode');
      table.string('status');
      table.integer('totalRecords');
      table.integer('processedRecords');
      table.integer('errorCount');
      table.text('errorMessage');
      table.jsonb('metadata');
      table.timestamp('startedAt');
      table.timestamp('completedAt');
      table.timestamps(false, true);
    })
    .createTable('hedge_invoice', (table) => {
      table.string('provider').notNullable();
      table.string('invoiceId').notNullable();
      table.string('tenantId').notNullable();
      table.string('invoiceType').notNullable();
      table.string('invoiceNumber').notNullable();
      table.string('invoiceStatus').notNullable();
      table.string('contactName').notNullable();
      table.date('date').notNullable();
      table.date('dateDue').notNullable();
      table.decimal('total', 17, 5).notNullable();
      table.string('currencyCode').notNullable();
      table.decimal('currencyRate', 17, 5).notNullable();
      table.decimal('amountDue', 17, 5).notNullable();
      table.decimal('amountPaid', 17, 5).notNullable();
      table.decimal('amountCredited', 17, 5).notNullable();
      table.string('encryptedTotal');
      table.string('import_log_id');
      // Additional columns used in hedge-invoice.db-getters.ts
      table.boolean('isAddedToBucket').notNullable().defaultTo(false);
      table.string('homeCurrencyCode');
      table.boolean('isMarkedAsReceived').notNullable().defaultTo(false);
      table.boolean('isMarkedAsPaid').notNullable().defaultTo(false);
      table.string('type');
      table.string('mode');
      table.boolean('isApproved').notNullable().defaultTo(false);
      table.boolean('isPricing').notNullable().defaultTo(false);
      table.string('movedTo');
      table.string('movedToId');
      
      table.primary(['tenantId', 'invoiceId', 'provider']);
      table.timestamps(false, true);
    })
    .createTable('hedge_payment', (table) => {
      table.string('provider').notNullable();
      table.string('paymentId').notNullable();
      table.string('tenantId').notNullable();
      table.string('paymentStatus').notNullable();
      table.string('paymentType').notNullable();
      table.string('invoiceId').notNullable();
      table.date('date').notNullable();
      table.decimal('amount', 17, 5).notNullable();
      table.string('currencyCode').notNullable();
      table.decimal('currencyRate', 17, 5).notNullable();
      table.decimal('minCost', 17, 5).notNullable();
      table.decimal('minRate', 17, 5).notNullable();
      table.decimal('maxCost', 17, 5).notNullable();
      table.decimal('maxRate', 17, 5).notNullable();
      table.decimal('actualCost', 17, 5).notNullable();
      table.primary(['tenantId', 'paymentId', 'provider']);
      table.timestamps(false, true);
    })
    .createTable('hedge_invoice_basket', (table) => {
      table.string('id').primary().unique();
      table.string('orgId').notNullable();
      table.foreign('orgId').references('organisation.id');
      table.string('basketName').notNullable();
      table.jsonb('invoiceIds').notNullable();
      table.decimal('totalAmount', 17, 5).notNullable();
      table.string('currency').notNullable();
      table.string('status').notNullable();
      table.date('createdDate').notNullable();
      table.date('hedgeDate');
      table.timestamps(false, true);
    })
    .createTable('buying_schedule', (table) => {
      table.string('id').primary().unique();
      table.string('orgId').notNullable();
      table.foreign('orgId').references('organisation.id');
      table.string('invoiceId');
      table.string('scheduleName').notNullable();
      table.string('currencyPair').notNullable();
      table.decimal('amount', 17, 5).notNullable();
      table.string('frequency').notNullable();
      table.date('startDate').notNullable();
      table.date('endDate');
      table.boolean('isActive').notNullable().defaultTo(true);
      table.jsonb('scheduleConfig');
      
      // Additional fields from BuyingScheduleDbo
      table.decimal('forwardPercentage', 17, 5).notNullable().defaultTo(0);
      table.decimal('forwardValue', 17, 5).notNullable().defaultTo(0);
      table.string('forwardDate');
      table.decimal('orderPercentage', 17, 5).notNullable().defaultTo(0);
      table.decimal('orderValue', 17, 5).notNullable().defaultTo(0);
      table.string('orderDate');
      table.decimal('spotPercentage', 17, 5).notNullable().defaultTo(0);
      table.decimal('spotValue', 17, 5).notNullable().defaultTo(0);
      table.string('spotDate');
      table.timestamp('executedForwardDate');
      table.decimal('executedForwardRate', 17, 5);
      table.decimal('executedForwardValue', 17, 5);
      table.timestamp('executedOrderDate');
      table.decimal('executedOrderRate', 17, 5);
      table.decimal('executedOrderValue', 17, 5);
      table.timestamp('executedSpotDate');
      table.decimal('executedSpotRate', 17, 5);
      table.decimal('executedSpotValue', 17, 5);
      table.decimal('optimizedRate', 17, 5);
      table.decimal('forwardMarginPercentage', 17, 5).notNullable().defaultTo(0);
      table.decimal('limitOrderMarginPercentage', 17, 5).notNullable().defaultTo(0);
      table.decimal('spotMarginPercentage', 17, 5).notNullable().defaultTo(0);
      table.boolean('isHedgedEverything').notNullable().defaultTo(false);
      table.decimal('optimaisedValue', 17, 5);
      table.decimal('forwardRate', 17, 5);
      table.decimal('optimaisedPer', 17, 5);
      
      table.timestamps(false, true);
    })
    .createTable('recurring_plan', (table) => {
      table.string('id').primary().unique();
      table.string('orgId').notNullable();
      table.foreign('orgId').references('organisation.id');
      table.string('planName').notNullable();
      table.string('planType').notNullable();
      table.decimal('amount', 17, 5).notNullable();
      table.string('currency').notNullable();
      table.string('frequency').notNullable();
      table.date('startDate').notNullable();
      table.date('endDate');
      table.decimal('capVolume', 17, 5);
      table.string('manageType');
      table.string('approvalMethod');
      table.string('company');
      table.string('mode');
      table.boolean('isActive').notNullable().defaultTo(true);
      table.jsonb('planConfig');
      table.timestamps(false, true);
    })
    .createTable('crm_import_logs', (table) => {
      table.string('id').primary().unique();
      table.string('orgId').notNullable();
      table.foreign('orgId').references('organisation.id');
      table.string('tenantId').notNullable();
      table.string('importType');
      table.string('fileType').notNullable();
      table.string('filename').notNullable();
      table.string('review_status').notNullable();
      table.jsonb('content');
      table.jsonb('field_mapping');
      table.boolean('is_hedging').notNullable().defaultTo(false);
      table.string('createdBy');
      table.string('updatedBy');
      table.string('mode');
      table.string('status');
      table.integer('totalRecords');
      table.integer('processedRecords');
      table.integer('errorCount');
      table.text('errorMessage');
      table.jsonb('metadata');
      table.timestamp('startedAt');
      table.timestamp('completedAt');
      table.timestamps(false, true);
    })
    .createTable('crm_entitlements', (table) => {
      table.string('id').primary().unique();
      table.string('orgId').notNullable();
      table.string('currencyCode');
      table.string('createdBy');
      table.string('updatedBy');
      table.string('pricingOption1Label');
      table.string('pricingOption2Label');
      table.string('pricingOption3Label');
      table.foreign('orgId').references('organisation.id');
      table.boolean('isPricing').notNullable().defaultTo(false);
      table.string('mode');
      table.date('expiresAt');
      table.boolean('isActive').notNullable().defaultTo(true);
      table.jsonb('metadata');
      table.timestamps(false, true);
    })
    .createTable('crm_entries', (table) => {
      table.string('id').primary().unique();
      table.string('orgId').notNullable();
      table.foreign('orgId').references('organisation.id');
      table.string('entryType');
      table.string('entryId');
      table.string('provider');
      table.jsonb('entryData');
      table.string('status');
      table.string('month');
      table.string('year');
      table.string('currencyCode');
      table.boolean('isManaged').notNullable().defaultTo(false);
      table.boolean('isApproved');
      table.decimal('currentRate', 17, 5);
      table.decimal('reservedRate', 17, 5);
      table.decimal('forecaseAmount', 17, 5);
      table.decimal('reservedAmount', 17, 5);
      table.decimal('reservedMin', 17, 5);
      table.decimal('reservedMax', 17, 5);
      table.decimal('totalReservedAmount', 17, 5);      
      table.string('crm_import_log_id');
      table.decimal('budgetRate', 17, 5);
      table.timestamp('processedAt');
      table.string('createdBy');
      table.string('updatedBy');
      table.string('mode');
      table.string('manage_type');
      table.timestamps(false, true);
    })
    .createTable('crm_feedback', (table) => {
      table.string('id').primary().unique();
      table.string('orgId').notNullable();
      table.foreign('orgId').references('organisation.id');
      table.string('userId').notNullable();
      table.foreign('userId').references('user.id');
      table.string('crm_entry_id');
      table.foreign('crm_entry_id').references('crm_entries.id');
      table.string('feedbackType').notNullable();
      table.text('feedbackText').notNullable();
      table.integer('rating');
      table.string('status').notNullable();
      table.decimal('reservedRate', 17, 5);
      table.date('reservedDate');
      table.decimal('reservedAmount', 17, 5);
      table.timestamp('submittedAt').notNullable();
      table.string('createdBy');
      table.string('updatedBy');
      table.string('crm_import_log_id');
      table.timestamps(false, true);
    })
    .createTable('crm_entitlement_item', (table) => {
      table.string('id').primary().unique();
      table.string('entitlementId');
      table.foreign('entitlementId').references('crm_entitlements.id');
      table.string('crm_entitlements_id');
      table.foreign('crm_entitlements_id').references('crm_entitlements.id');
      table.string('itemType');
      table.string('itemValue');
      table.string('name');
      table.decimal('max', 17, 5);
      table.decimal('min', 17, 5);
      table.text('text');
      table.decimal('quantity', 17, 5);
      table.decimal('unitPrice', 17, 5);
      table.string('currency');
      table.boolean('isActive').notNullable().defaultTo(true);
      table.timestamps(false, true);
    })
    .createTable('crm_entry_logs', (table) => {
      table.string('id').primary().unique();
      table.string('entryId').notNullable();
      table.foreign('entryId').references('crm_entries.id');
      table.string('action').notNullable();
      table.string('status').notNullable();
      table.text('message');
      table.jsonb('metadata');
      table.timestamp('actionAt').notNullable();
      table.timestamps(false, true);
    })
    .createTable('quote_invoice', (table) => {
      table.string('id').primary().unique();
      table.string('orgId');
      table.foreign('orgId').references('organisation.id');
      table.string('tenantId').notNullable();
      table.string('quoteNumber');
      table.string('invoiceId');
      table.string('status');
      table.decimal('amount', 17, 5);
      table.decimal('total', 17, 5);
      table.decimal('currencyRate', 17, 5);
      table.string('currency');
      table.string('currencyCode');
      table.string('contactName');
      table.string('invoiceNumber');
      table.string('invoiceStatus');
      table.string('invoiceType');
      table.string('provider');
      table.string('homeCurrencyCode');
      table.date('quoteDate');
      table.date('dateDue');
      table.date('expiryDate');
      table.date('invoiceDate');
      table.date('date');
      table.string('movedTo');
      table.string('movedToId');
      table.string('type');
      table.string('mode');
      table.jsonb('quoteData');
      table.timestamps(false, true);
      table.unique(['tenantId', 'invoiceId', 'provider'], 'quote_invoice_unique_idx');
    })
    .createTable('sendemail', (table) => {
      table.string('id').primary().unique();
      table.string('tenantId').notNullable();
      table.string('to').notNullable();
      table.string('from').notNullable();
      table.string('subject');
      table.text('body');
      table.string('status').notNullable().defaultTo('pending');
      table.timestamp('sentAt');
      table.timestamps(false, true);
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('sendemail')
    .dropTableIfExists('crm_import_logs')
    .dropTableIfExists('crm_entry_logs')
    .dropTableIfExists('crm_entitlement_item')
    .dropTableIfExists('crm_feedback')
    .dropTableIfExists('crm_entries')
    .dropTableIfExists('crm_entitlements')
    .dropTableIfExists('quote_invoice')
    .dropTableIfExists('recurring_plan')
    .dropTableIfExists('buying_schedule')
    .dropTableIfExists('hedge_invoice_basket')
    .dropTableIfExists('hedge_payment')
    .dropTableIfExists('hedge_invoice')
    .dropTableIfExists('import_logs')
    .dropTableIfExists('import_files')
    .dropTableIfExists('xero_token_set')
    .dropTableIfExists('org_entitlements')
    .dropTableIfExists('financial_products')
    .dropTableIfExists('config')
    .dropTableIfExists('authentication_code')
    .dropTableIfExists('payment')
    .dropTableIfExists('invoice')
    .dropTableIfExists('forward_point')
    .dropTableIfExists('rate')
    .dropTableIfExists('organisation_user')
    .dropTableIfExists('organisation')
    .dropTableIfExists('tenant')
    .dropTableIfExists('user')
    .dropTableIfExists('account');
};
