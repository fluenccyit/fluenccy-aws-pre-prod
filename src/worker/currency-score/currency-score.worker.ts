import { Job } from 'bull';
import numeral from 'numeral';
import { format } from 'date-fns';
import { clamp, forEach, round } from 'lodash';
import { rateResource } from '@server/rate';
import { tenantResource } from '@server/tenant';
import { sharedRateService } from '@shared/rate';
import { paymentResource } from '@server/payment';
import { invoiceResource } from '@server/invoice';
import { organisationResource } from '@server/organisation';
import { CurrencyScoreJobDataType } from '@server/currency-score';
import { dbService, loggerService, queueService } from '@server/common';
import { CURRENCY_SCORE_ALLOCATION, sharedCurrencyScoreService } from '@shared/currency-score';
import { sharedDateTimeService, sharedUtilService, SHARED_DATE_TIME_FORMAT } from '@shared/common';
import { GqlMonth, GqlCurrencyScoreBreakdown, GqlCurrencyScoreBreakdownByCurrency, GqlSupportedCurrency } from '@graphql';

type CurrencyScoreBreakdownMapType = Dictionary<Dictionary<GqlCurrencyScoreBreakdownByCurrency>>;

const MAX_JOBS_PER_WORKER = 2;
const CURRENCY_SCORE_MONTH_COUNT = 12;

const worker = 'CurrencyScoreWorker';
const runCurrencyScoreWorker = async () => {
  loggerService.info('Initialising currency score worker.', { worker });
  await dbService.init();

  const currencyScoreQueue = queueService.getQueue('currency-score');

  currencyScoreQueue.process(MAX_JOBS_PER_WORKER, async ({ id: jobId, data }: Job<CurrencyScoreJobDataType>) => {
    const logParam = { worker, jobId, ...data };
    loggerService.info('Currency score job received', logParam);

    const { orgId, paymentType = "" } = data;

    try {
      const organisationDbo = await organisationResource.getOrganisationDboById(orgId);

      const { tenantId, buildPlanAnswers, hedgeMargin, currency: baseCurrency, buildPlanScore } = organisationDbo;
      console.log('org baseCurrency ', baseCurrency);

      if (!buildPlanScore) {
        return { skipReason: 'No build plan score. Cannot calculate currency score without it', orgId };
      }

      if (!sharedRateService.isCurrencySupported(baseCurrency)) {
        return { skipReason: 'Organisation currency not supported', orgId };
      }

      loggerService.info('Updating sync status of organisation to <calculatingCurrencyScores>.', logParam);
      await organisationResource.updateOrganisation({ orgId, syncStatus: 'calculatingCurrencyScores' });

      loggerService.info('Fetching currencies supported by organisation.', logParam);
      const currencies = await tenantResource.queryCurrencyByTenantId(tenantId, paymentType);
      console.log('currencies found for tenant ', currencies);

      const dateFrom = sharedDateTimeService.getUtcDateFromMonthsAgo(CURRENCY_SCORE_MONTH_COUNT * 2);
      console.log('evaluated dateFrom ', dateFrom);
      const breakdownMap: CurrencyScoreBreakdownMapType = {};

      await sharedUtilService.asyncForEach(currencies, async (currency) => {
        breakdownMap[currency] = {};
        console.log('executing for currency ', currency);
        loggerService.info('Fetching rates for currency.', { ...logParam, currency });
        const [rates, forwardPoints] = await Promise.all([
          rateResource.queryRate({ baseCurrency: baseCurrency as GqlSupportedCurrency, tradeCurrency: currency }),
          rateResource.queryForwardPoint({ baseCurrency: baseCurrency as GqlSupportedCurrency, tradeCurrency: currency }),
        ]);

        loggerService.info('Generating rate maps.', { ...logParam, currency });
        const rateMap = sharedRateService.generateRateMap(rates);
        const forwardPointMap = sharedRateService.generateForwardPointMap(forwardPoints);

        await sharedUtilService.asyncForEachMonth(dateFrom, CURRENCY_SCORE_MONTH_COUNT, async (dateFrom, dateTo) => {
          loggerService.info('Calculating currency score between dates.', {
            ...logParam,
            currency,
            dateFrom: dateFrom.toUTCString(),
            dateTo: dateTo.toUTCString(),
          });
          console.log('query dateFrom > ', dateFrom);
          console.log('query dateTo > ', dateTo);
          const [invoices, payments] = await Promise.all([
            invoiceResource.queryInvoice({ tenantId, dateTo, currency }),
            paymentResource.queryPayment({ tenantId, dateTo, dateFrom, currency }),
          ]);
          console.log('invoices count ', invoices.length);
          console.log('payments count ', payments.length);

          if(invoices.length > 0) {
            const breakdown = sharedCurrencyScoreService.getCurrencyScoreByCurrency({
              currency,
              hedgeMargin,
              buildPlanAnswers,
              payments,
              invoices,
              rateMap,
              forwardPointMap,
              dateFrom,
              dateTo,
            });
  
            const monthYearKey = `${breakdown.month}-${breakdown.year}`;
            breakdownMap[currency][monthYearKey] = breakdown;
            console.log('monthYearKey ', monthYearKey);
          }
        });
      });

      const currencyScores: GqlCurrencyScoreBreakdown[] = [];
      await sharedUtilService.asyncForEachMonth(dateFrom, CURRENCY_SCORE_MONTH_COUNT, async (dateFrom, dateTo) => {
        loggerService.info('Scaling currency scores between dates.', {
          ...logParam,
          dateFrom: dateFrom.toUTCString(),
          dateTo: dateTo.toUTCString(),
        });

        const month = format(dateTo, SHARED_DATE_TIME_FORMAT.month) as GqlMonth;
        const year = format(dateTo, SHARED_DATE_TIME_FORMAT.year);
        const monthYearKey = `${month}-${year}`;
        const currencyScoreByCurrency: GqlCurrencyScoreBreakdownByCurrency[] = [];
        let deliveryProfitImpact = 0;
        let fxCost = 0;
        let hedgedFxCost = 0;
        let deliveryCost = 0;
        let deliveryGainLoss = 0;
        let marketProfitImpact = 0;
        let performDeliveryProfitImpact = 0;
        let performMarketProfitImpact = 0;
        let performDeliveryGainLoss = 0;
        console.log("Breakdown Map >>> ", breakdownMap);
        forEach(currencies, (currency) => {
          console.log( "monthYearKey >> ", monthYearKey, "Currency >> ", currency );
          const breakdown = breakdownMap[currency][monthYearKey];
          console.log("Breakdown >>> ", breakdown);

          if (breakdown) {
            deliveryProfitImpact = numeral(deliveryProfitImpact).add(breakdown.deliveryProfitImpact).value();
            fxCost = numeral(fxCost).add(breakdown.fxCost).value();
            hedgedFxCost = numeral(hedgedFxCost).add(breakdown.hedgedFxCost).value();
            deliveryCost = numeral(deliveryCost).add(breakdown.deliveryCost).value();
            deliveryGainLoss = numeral(deliveryGainLoss).add(breakdown.deliveryGainLoss).value();
            marketProfitImpact = numeral(marketProfitImpact).add(breakdown.marketProfitImpact).value();
            performDeliveryProfitImpact = numeral(performDeliveryProfitImpact).add(breakdown.performDeliveryProfitImpact).value();
            performMarketProfitImpact = numeral(performMarketProfitImpact).add(breakdown.performMarketProfitImpact).value();
            performDeliveryGainLoss = numeral(performDeliveryGainLoss).add(breakdown.performDeliveryGainLoss).value();

            currencyScoreByCurrency.push(breakdown);

          }

          
        });

        // Scale the currency scores of each currency pair by the percentage of the currency pair cost against the total cost.
        let currencyScore = 0;
        let costPlanScore = 0;
        let gainLossScore = 0;
        let marginScore = 0;
        let presentScore = 0;
        let targetScore = 0;
        let benchmarkCurrencyScore = 0;
        let benchmarkCostPlanScore = 0;
        let benchmarkGainLossScore = 0;
        let benchmarkMarginScore = 0;
        let benchmarkPresentScore = 0;
        let benchmarkTargetScore = 0;
        forEach(currencies, (currency) => {
          const breakdown = breakdownMap[currency][monthYearKey];
          if (breakdown) {
            const ratio = numeral(breakdown.deliveryCost).divide(deliveryCost).value() || 0;

            const currencyScorePartial = numeral(breakdown.currencyScore).multiply(ratio).value() || 0;
            const costPlanScorePartial = numeral(breakdown.costPlanScore).multiply(ratio).value() || 0;
            const gainLossScorePartial = numeral(breakdown.gainLossScore).multiply(ratio).value() || 0;
            const marginScorePartial = numeral(breakdown.marginScore).multiply(ratio).value() || 0;
            const presentScorePartial = numeral(breakdown.presentScore).multiply(ratio).value() || 0;
            const targetScorePartial = numeral(breakdown.targetScore).multiply(ratio).value() || 0;

            const benchmarkCurrencyScorePartial = numeral(breakdown.benchmarkCurrencyScore).multiply(ratio).value() || 0;
            const benchmarkCostPlanScorePartial = numeral(breakdown.benchmarkCostPlanScore).multiply(ratio).value() || 0;
            const benchmarkGainLossScorePartial = numeral(breakdown.benchmarkGainLossScore).multiply(ratio).value() || 0;
            const benchmarkMarginScorePartial = numeral(breakdown.benchmarkMarginScore).multiply(ratio).value() || 0;
            const benchmarkPresentScorePartial = numeral(breakdown.benchmarkPresentScore).multiply(ratio).value() || 0;
            const benchmarkTargetScorePartial = numeral(breakdown.benchmarkTargetScore).multiply(ratio).value() || 0;

            currencyScore = numeral(currencyScore).add(currencyScorePartial).value() || 0;
            costPlanScore = numeral(costPlanScore).add(costPlanScorePartial).value() || 0;
            gainLossScore = numeral(gainLossScore).add(gainLossScorePartial).value() || 0;
            marginScore = numeral(marginScore).add(marginScorePartial).value() || 0;
            presentScore = numeral(presentScore).add(presentScorePartial).value() || 0;
            targetScore = numeral(targetScore).add(targetScorePartial).value() || 0;

            benchmarkCurrencyScore = numeral(benchmarkCurrencyScore).add(benchmarkCurrencyScorePartial).value() || 0;
            benchmarkCostPlanScore = numeral(benchmarkCostPlanScore).add(benchmarkCostPlanScorePartial).value() || 0;
            benchmarkGainLossScore = numeral(benchmarkGainLossScore).add(benchmarkGainLossScorePartial).value() || 0;
            benchmarkMarginScore = numeral(benchmarkMarginScore).add(benchmarkMarginScorePartial).value() || 0;
            benchmarkPresentScore = numeral(benchmarkPresentScore).add(benchmarkPresentScorePartial).value() || 0;
            benchmarkTargetScore = numeral(benchmarkTargetScore).add(benchmarkTargetScorePartial).value() || 0;
          }
        });

        currencyScores.push({
          date: dateTo,
          month,
          year,
          currencyScore: round(clamp(currencyScore, 0, CURRENCY_SCORE_ALLOCATION.total)),
          costPlanScore: round(clamp(costPlanScore, 0, CURRENCY_SCORE_ALLOCATION.costPlan)),
          gainLossScore: round(clamp(gainLossScore, 0, CURRENCY_SCORE_ALLOCATION.gainLoss)),
          marginScore: round(clamp(marginScore, 0, CURRENCY_SCORE_ALLOCATION.margin)),
          presentScore: round(clamp(presentScore, 0, CURRENCY_SCORE_ALLOCATION.present)),
          targetScore: round(clamp(targetScore, 0, CURRENCY_SCORE_ALLOCATION.target)),

          benchmarkCurrencyScore: round(clamp(benchmarkCurrencyScore, 0, CURRENCY_SCORE_ALLOCATION.total)),
          benchmarkCostPlanScore: round(clamp(benchmarkCostPlanScore, 0, CURRENCY_SCORE_ALLOCATION.costPlan)),
          benchmarkGainLossScore: round(clamp(benchmarkGainLossScore, 0, CURRENCY_SCORE_ALLOCATION.gainLoss)),
          benchmarkMarginScore: round(clamp(benchmarkMarginScore, 0, CURRENCY_SCORE_ALLOCATION.margin)),
          benchmarkPresentScore: round(clamp(benchmarkPresentScore, 0, CURRENCY_SCORE_ALLOCATION.present)),
          benchmarkTargetScore: round(clamp(benchmarkTargetScore, 0, CURRENCY_SCORE_ALLOCATION.target)),

          fxCost,
          hedgedFxCost,
          deliveryCost,
          deliveryGainLoss,
          marketProfitImpact,
          deliveryProfitImpact,
          performDeliveryProfitImpact,
          performMarketProfitImpact,
          performDeliveryGainLoss,
          currencyScoreByCurrency,
        });
      });

      loggerService.info('Updating organisation with currency scores', logParam);
      await organisationResource.updateOrganisation({
        orgId,
        currencyScores,
        initialSyncComplete: true,
        syncStatus: 'synced',
      });

      return true;
    } catch (error) {
      console.log(error);
      loggerService.error('Failed to calculate currency score', { ...logParam, message: error.message });
      await organisationResource.updateOrganisation({ orgId, syncStatus: 'calculatingCurrencyScoresError' });
      throw error;
    }
  });

  loggerService.info('Currency score worker ready!', { worker });
};

runCurrencyScoreWorker();
