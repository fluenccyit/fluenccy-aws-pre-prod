exports.up = (knex) => {
  return knex.schema.alterTable('quote_invoice', (t) => {
    // Add missing columns based on db operations (invoiceId already exists)
    t.string('tenantId');
    t.string('provider');
    t.string('invoiceNumber');
    t.string('invoiceStatus');
    t.string('invoiceType');
    t.string('contactName');
    t.date('date');
    t.date('dateDue');
    t.decimal('total', 17, 5);
    t.string('currencyCode');
    t.decimal('currencyRate', 17, 5);
    t.decimal('amountDue', 17, 5);
    t.decimal('amountPaid', 17, 5);
    t.decimal('amountCredited', 17, 5);
    t.boolean('isAddedToBucket').defaultTo(false);
    t.string('homeCurrencyCode');
    t.string('mode');
    t.string('movedToId').nullable();
    t.string('createdBy').nullable();
    t.string('updatedBy').nullable();
  });
};

exports.down = (knex) => {
  return knex.schema.alterTable('quote_invoice', (t) => {
    t.dropColumn('tenantId');
    t.dropColumn('provider');
    t.dropColumn('invoiceNumber');
    t.dropColumn('invoiceStatus');
    t.dropColumn('invoiceType');
    t.dropColumn('contactName');
    t.dropColumn('date');
    t.dropColumn('dateDue');
    t.dropColumn('total');
    t.dropColumn('currencyCode');
    t.dropColumn('currencyRate');
    t.dropColumn('amountDue');
    t.dropColumn('amountPaid');
    t.dropColumn('amountCredited');
    t.dropColumn('isAddedToBucket');
    t.dropColumn('homeCurrencyCode');
    t.dropColumn('mode');
    t.dropColumn('movedToId');
    t.dropColumn('createdBy');
    t.dropColumn('updatedBy');
  });
};

