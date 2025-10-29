exports.seed = async (knex) => {
  await knex('payment').del();
  await knex('invoice').del();
  await knex('organisation_user').del();
  await knex('organisation').del();
  await knex('tenant').del();
  await knex('user').del();
  await knex('account').del();

  await knex('account').insert([
    {
      id: 'acc_295b1bb4-90c4-11eb-a8b3-0242ac130003',
      name: 'Jones BBQ and Foot Massage',
      type: 'accountant'
    },
  ]);

  await knex('user').insert([
    {
      id: 'usr_6c526926-cf6b-4244-9faf-6ad426e797f6',
      firebaseUid: 'B6qyOaIJWTUxNXcnSHavkmaZuX42',  // this refers to a user that has been created in firebase manually for 
      firstName: 'Super',
      lastName: 'Dealer',
      role: 'superdealer',
      tokenSet: null,
    },
    {
      id: 'usr_fdbb420c-0d31-4c2e-91a6-90022c664928',
      firebaseUid: 'FJPEG0anjdbdxx58WO8CLN9BZPe2',  // this refers to a user that has been created in firebase manually for 
      firstName: 'Super',
      lastName: 'User',
      role: 'superuser',
      tokenSet: null,
    },

    {
      id: 'usr_3a91afec-90c4-11eb-a8b3-0242ac130003',
      accountId: 'acc_295b1bb4-90c4-11eb-a8b3-0242ac130003',
      firebaseUid: '0xSL46ro5khLBE8eT8UkN22Aj6G2',  // this refers to a user that has been created in firebase manually for 
      firstName: 'Naseer',
      lastName: 'Mohammad',
      role: 'accountowner',
      tokenSet: null,
    },
    {
      id: 'usr_406f249e-90c4-11eb-a8b3-0242ac130003',
      firebaseUid: '99SIoYQLImZtxq5NvgHnqG2xE4v2',
      firstName: 'Saif',
      lastName: 'Rehman',
      role: 'superuser',
      tokenSet: null,
    },
  ]);

  await knex('tenant').insert([
    {
      id: '462ceb28-90c4-11eb-a8b3-0242ac130003',
      provider: 'xero',
      lastSynced: new Date()
    }
  ])

  await knex('organisation').insert([
    {
      id: 'org_502a415c-90c4-11eb-a8b3-0242ac130003',
      accountId: 'acc_295b1bb4-90c4-11eb-a8b3-0242ac130003',
      tenantId: '462ceb28-90c4-11eb-a8b3-0242ac130003',
      tokenUserId: null,
      name: 'Massage & BBQ',
      currency: 'NZD',
      syncStatus: 'synced',
      buildPlanScore: 28,
      hedgeMargin: 0.0035,
      intentRegistered: true,
      onboardingComplete: true,
      initialSyncComplete: true,
      buildPlanAnswers: JSON.stringify([{"answerId": "everyCoupleOfMonths", "questionId": "salesCosts"}, {"answerId": "tenToThirtyPercent", "questionId": "profitMargin"}, {"answerId": "fifteenPercent", "questionId": "sensitivity"}, {"answerId": "certainty", "questionId": "strategy"}]),
      currencyScores: JSON.stringify([{"date": "2020-06-29T12:00:00.000Z", "year": "2020", "month": "Jun", "totalActualCost": 0, "fxCost": 0, "currencyScore": 0, "totalProfitImpact": 0, "performTotalBudgetGainLoss": 0}, {"date": "2020-07-30T12:00:00.000Z", "year": "2020", "month": "Jul", "totalActualCost": 0, "fxCost": 0, "currencyScore": 0, "totalProfitImpact": 0, "performTotalBudgetGainLoss": 0}, {"date": "2020-08-30T12:00:00.000Z", "year": "2020", "month": "Aug", "totalActualCost": 0, "fxCost": 0, "currencyScore": 0, "totalProfitImpact": 0, "performTotalBudgetGainLoss": 0}, {"date": "2020-09-29T11:00:00.000Z", "year": "2020", "month": "Sep", "totalActualCost": 0, "fxCost": 0, "currencyScore": 0, "totalProfitImpact": 0, "performTotalBudgetGainLoss": 0}, {"date": "2020-10-30T11:00:00.000Z", "year": "2020", "month": "Oct", "totalActualCost": 0, "fxCost": 0, "currencyScore": 0, "totalProfitImpact": 0, "performTotalBudgetGainLoss": 0}, {"date": "2020-11-29T11:00:00.000Z", "year": "2020", "month": "Nov", "totalActualCost": 0, "fxCost": 0, "currencyScore": 0, "totalProfitImpact": 0, "performTotalBudgetGainLoss": 0}, {"date": "2020-12-30T11:00:00.000Z", "year": "2020", "month": "Dec", "totalActualCost": 0, "fxCost": 0, "currencyScore": 0, "totalProfitImpact": 0, "performTotalBudgetGainLoss": 0}, {"date": "2021-01-30T11:00:00.000Z", "year": "2021", "month": "Jan", "totalActualCost": 0, "fxCost": 0, "currencyScore": 0, "totalProfitImpact": 0, "performTotalBudgetGainLoss": 0}, {"date": "2021-02-27T11:00:00.000Z", "year": "2021", "month": "Feb", "totalActualCost": 0, "fxCost": 0, "currencyScore": 0, "totalProfitImpact": 0, "performTotalBudgetGainLoss": 0}, {"date": "2021-03-30T11:00:00.000Z", "year": "2021", "month": "Mar", "totalActualCost": 0, "fxCost": 0, "currencyScore": 0, "totalProfitImpact": 0, "performTotalBudgetGainLoss": 0}, {"date": "2021-04-29T12:00:00.000Z", "year": "2021", "month": "Apr", "totalActualCost": 0, "fxCost": 0, "currencyScore": 0, "totalProfitImpact": 0, "performTotalBudgetGainLoss": 0}, {"date": "2021-05-30T12:00:00.000Z", "year": "2021", "month": "May", "totalActualCost": 0, "fxCost": 0, "currencyScore": 0, "totalProfitImpact": 0, "performTotalBudgetGainLoss": 0}]),
    }
  ])

  await knex('organisation_user').insert([
    {
      orgId: 'org_502a415c-90c4-11eb-a8b3-0242ac130003',
      userId: 'usr_3a91afec-90c4-11eb-a8b3-0242ac130003'
    }
  ])
}
