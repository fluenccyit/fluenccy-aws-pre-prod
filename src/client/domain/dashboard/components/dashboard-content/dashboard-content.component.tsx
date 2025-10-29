import React, { memo, useEffect, useState, useMemo } from 'react';
import { isEmpty, differenceBy, find, max } from 'lodash';
import { Page, localStorageService, useToast, FluenccyLoader, useQueryLocalCommon, Card, CardContent, Text, Button, Select } from '@client/common';
import { LocalOrganisationType, organisationsVar, organisationVar, queryOrganisationsByToken, useQueryLocalOrganisation } from '@client/organisation';
import { PlanUploadCSVPageContent, UPLOAD_CSV_ROUTES } from '@client/plan';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import moment from 'moment';
import { jStat } from 'jstat';
import { Dashboard } from '@client/plan/IMS/components';
import { DashboardCoachingCard, DashboardCoachingCardSkeleton } from '@client/dashboard';
import { PerformanceDashboard } from '@client/performance';
import cn from 'classnames';
import { ChartControls } from '@client/chart';
import { getVariableProbability } from '@client/utils/helper';
import { subMonths, parseISO, isValid } from 'date-fns';
import { queryInvoices } from '@client/invoice';
import { sharedDateTimeService } from '@shared/common';

const modeOptions = [
  { label: 'Payables', value: '' },
  { label: 'Receivables', value: 'receivables' },
];

const DAYS_FOR_CALCULATIONS = 365;

const getStdDev = (logs) => {
  // Creating the mean with Array.reduce
  const mean =
    logs.reduce((acc, curr) => {
      return acc + curr;
    }, 0) / logs.length;

  // Assigning (value - mean) ^ 2 to every array item
  const arr = logs.map((k) => {
    return (k - mean) ** 2;
  });

  // Calculating the sum of updated array
  const sum = arr.reduce((acc, curr) => acc + curr, 0);

  // Calculating the variance
  const variance = sum / arr.length;

  // Returning the Standered deviation
  return Math.sqrt(variance);
};

var marginPercentageVal = 0.0;
const BASE_CLASSES = ['flex', 'w-full', 'mx-auto', 'pb-2', 'items-center', 'justify-between'];
const RESPONSIVE_CLASSES = ['md:pb-6', 'lg:px-12', 'lg:py-0', 'md:flex-row', 'md:items-start'];

export const DashboardContent = memo(({ showCurrencyScoreBreakdown = true }) => {
  const history = useHistory();
  const [payable, setPayable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [marginPercentageFromAPI, setMarginPercentage] = useState([]);
  const { addToast } = useToast();
  const { organisation } = useQueryLocalOrganisation();
  const [liveData, setLiveData] = useState({});
  const [managedInvoices, setManagedInvoices] = useState([]);
  const [optimisedRates, setOptimisedRates] = useState({});
  const [fetchingLiveRate, setFetchingLiveRate] = useState(false);
  const [entitlements, setEntitlements] = useState({});
  const [fosPercents, setFOSPercents] = useState({});
  const [modeType, setModeType] = useState(modeOptions[0].value);
  const [initialLoads, setInitialLoads] = useState({
    payables: false,
    receivables: false,
    payablesCount: 0,
    receivablesCount: 0,
  });
  const [initialManagedLoads, setInitialManagedLoads] = useState({
    payablesManaged: false,
    receivablesManaged: false,
    payablesManagedCount: 0,
    receivablesManagedCount: 0,
  });
  const [homeCurrencies, setHomeCurrencies] = useState([]);

  // Add new state for performance dashboard date range
  const [performanceDateRange, setPerformanceDateRange] = useState({ from: null, to: null });

  useEffect(() => {
    if (currencies.length) {
      getMxMarketLiveData();
      const liveSpotRate = setInterval(() => {
        getMxMarketLiveData();
      }, 3000);
      return () => {
        clearInterval(liveSpotRate);
      };
    }
  }, [currencies]);

  useEffect(() => {
    if (marginPercentageFromAPI.length) {
      marginPercentageVal = marginPercentageFromAPI[0].marginPercentage;
    }
  }, [marginPercentageFromAPI]);

  useEffect(() => {
    if (currencies.length && (payable.length || managedInvoices.length)) {
      const data = currencies.reduce((acc, c) => {
        acc[c.currencyCode] = calculateFOSPercentages(c);
        return acc;
      }, {});
      setFOSPercents(data);
    }
  }, [currencies, liveData, entitlements, payable, managedInvoices]);

  useEffect(() => {
    getEntitlements();
  }, []);

  useEffect(() => {
    getInvoice(modeType || null);
    getInvoice(modeType || null, 'managed');
  }, [organisation, modeType]);

  useEffect(() => {
    getInvoice(modeType || null, 'managed');
  }, []);

  useEffect(async () => {
    const organisations = await queryOrganisationsByToken({ paymentType: modeType === 'receivables' ? 'ACCRECPAYMENT' : 'ACCPAYPAYMENT' });
    organisationsVar(organisations as LocalOrganisationType[]);

    if (!organisations.length) {
      organisationVar(null);
      return;
    }
    const currentOrganisation = organisations.length ? find(organisations, ({ id }) => organisation.id === id) : null;

    organisationVar(currentOrganisation as LocalOrganisationType);
  }, [modeType]);

  // to set default mode if anyone have records
  useEffect(() => {
    const { payables, receivables, payablesCount, receivablesCount } = initialLoads;
    const { payablesManaged, receivablesManaged, payablesManagedCount, receivablesManagedCount } = initialManagedLoads;
    if (payables && payablesManaged && payablesManagedCount === 0 && payablesCount === 0 && !receivables && !receivablesManaged) {
      getInvoice('receivables');
      getInvoice('receivables', 'managed');
    } else if (payables && payablesManaged && receivablesManaged && receivables) {
      // check to show receivales selected
      if (payablesCount === 0 && payablesManagedCount === 0 && (receivablesCount !== 0 || receivablesManagedCount !== 0)) {
        setModeType('receivables');
      }
    }
  }, [initialLoads, initialManagedLoads]);

  useEffect(() => {
    setManagedInvoices(getImpactInvoices(managedInvoices));
  }, [liveData, optimisedRates]);

  useEffect(() => {
    if (!isEmpty(currencies)) {
      const optimisedRates = payable.reduce((acc, invoice) => ({ ...acc, [`${invoice.invoiceId}`]: getOptimisedPayableRate(invoice) }), {});
      setOptimisedRates(optimisedRates);
    }
  }, [currencies, liveData, payable, organisation?.variableProbability]);

  // Add useEffect to calculate date range for performance dashboard
  useEffect(() => {
    const calculatePerformanceDateRange = async () => {
      if (!organisation) return;

      const { tenant } = organisation;
      const tenantId = tenant.id;

      try {
        // Get all invoices to find the latest invoice date
        const allInvoices = await queryInvoices({ 
          tenantId, 
          currency: 'ALL', // Get invoices for all currencies
          dateTo: sharedDateTimeService.getUtcDateAsIsoString(new Date())
        });

        let dateFrom: Date;
        let dateTo: Date;

        if (allInvoices.length > 0) {
          // Find the latest invoice date
          const invoiceDates = allInvoices
            .map(invoice => invoice.invoiceDate)
            .filter(date => date && isValid(parseISO(date)))
            .map(date => parseISO(date));

          if (invoiceDates.length > 0) {
            const latestInvoiceDate = max(invoiceDates);
            
            // Set dateTo to the latest invoice date or today, whichever is earlier
            dateTo = latestInvoiceDate > new Date() ? new Date() : latestInvoiceDate;
            
            // Set dateFrom to 12 months before the latest invoice date
            const idealDateFrom = subMonths(dateTo, 12);
            
            // Ensure dateFrom is not more than 36 months ago from today
            const minAllowedDate = subMonths(new Date(), 36);
            dateFrom = idealDateFrom > minAllowedDate ? idealDateFrom : minAllowedDate;
          } else {
            // Fallback: use current date logic if no valid invoice dates
            dateTo = new Date();
            dateFrom = subMonths(new Date(), 12);
          }
        } else {
          // Fallback: use current date logic if no invoices
          dateTo = new Date();
          dateFrom = subMonths(new Date(), 12);
        }

        // Ensure dateFrom is not more than 36 months ago (additional safety check)
        const absoluteMinDate = subMonths(new Date(), 36);
        if (dateFrom < absoluteMinDate) {
          dateFrom = absoluteMinDate;
        }

        setPerformanceDateRange({ from: dateFrom, to: dateTo });

        console.log('Performance dashboard date range calculated:', {
          from: sharedDateTimeService.getUtcDateAsIsoString(dateFrom),
          to: sharedDateTimeService.getUtcDateAsIsoString(dateTo),
          monthsRange: Math.round((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24 * 30))
        });

      } catch (error) {
        console.error('Error calculating performance date range:', error);
        // Fallback to default 12 months
        const fallbackTo = new Date();
        const fallbackFrom = subMonths(fallbackTo, 12);
        setPerformanceDateRange({ from: fallbackFrom, to: fallbackTo });
      }
    };

    calculatePerformanceDateRange();
  }, [organisation, modeType]);

  const openNotificationWithIcon = (type = 'success', title = '', description = 'Success', style = {}) => {
    addToast(description, type);
  };
  const navigateToImsDashbpard = () => history.push({ pathname: '/plan', state: { showDashboard: true } });

  const getOptimisedPayableRate = (invoice) => {
    let currencyPair = `${organisation?.currency}${invoice.currencyCode}`;
    if (modeType === 'receivables') {
      currencyPair = `${invoice?.homeCurrencyCode}${invoice.currencyCode}`;
    }
    const prob = 1 - Number(entitlements[getVariableProbability(organisation)]) / 100;
    const gammaInv = Math.sqrt(jStat.gamma.inv(prob, 0.5, 1.0));
    const annualAdj = Math.sqrt(DAYS_FOR_CALCULATIONS) * calculateStddev(invoice);
    const interinCal = gammaInv * Math.sqrt(Math.PI);
    const daysToPay = Math.abs(moment(invoice.dateDue).diff(moment(), 'days'));
    var payable = 0.0;
    payable = Math.pow(1.0 + annualAdj, interinCal * Math.sqrt(daysToPay / DAYS_FOR_CALCULATIONS)) * liveData[currencyPair];

    const F91 = liveData[currencyPair] * (1 - entitlements.marginPercentage / 100);
    const H91 = fosPercents[invoice.currencyCode]?.EFT;
    const BacktestD10 = Number(entitlements.minPercentAboveSpot) / 100;
    const BacktestC15 = Number(entitlements.orderAdjustmentMinus) / 100;
    const K91 = annualAdj;
    const BacktestDataB4 = interinCal;
    const E95 = daysToPay;
    const BacktestC14 = Number(entitlements.orderAdjustmentPlus) / 100;

    // Client spot rate
    const orderAdjustment = H91 < 0 ? BacktestC15 : BacktestC14;
    const pow = Math.pow(1 + K91, BacktestDataB4 * Math.sqrt(E95 / DAYS_FOR_CALCULATIONS));
    const conditionalRate = (1 + H91 * orderAdjustment) * F91 * pow;

    const maxFirst = F91 * Number(BacktestD10);

    payable = maxFirst > conditionalRate ? maxFirst : conditionalRate;
    return payable;
  };

  const calculateStddev = (rec) => {
    const currencyRate = currencies.find((c) => c.currencyCode === rec.currencyCode);
    if (currencyRate) {
      const logs = [];
      const currencyPair = `${rec?.homeCurrencyCode}${currencyRate.currencyCode}`;
      const d = [...currencyRate.rates.map((r) => r.last), liveData[currencyPair]];
      for (let i = 0; i < d.length - 1; i++) {
        logs.push(Math.log(d[i + 1] / d[i]));
      }
      return getStdDev(logs);
    }
  };

  const leftInvoices = useMemo(() => differenceBy(payable, managedInvoices, 'invoiceId'), [payable, managedInvoices]);
  const getImpactInvoices = (data = []) => {
    const records = data.map((r) => {
      const calcMarginPercentage = parseFloat(marginPercentageVal) / 100;
      const baseCurrency = modeType === 'receivables' ? r.homeCurrencyCode : organisation?.currency;
      const currencyPair = `${baseCurrency}${r.currencyCode}`;
      const spotRate = liveData[currencyPair];
      const clientSpotRate = spotRate * (1 - calcMarginPercentage);
      const currentCost = Number(r.total) / clientSpotRate;
      const lossOrGain = Number(r.total) / Number(r.currencyRate) - currentCost;
      const daysToPay = Math.abs(moment(r.dateDue).diff(moment(), 'days'));
      const potentialLoss = lossOrGain - 1 * Math.sqrt(daysToPay) * Number(calculateStddev(r) || 0) * Number(currentCost || 0);
      return {
        ...r,
        currentCost,
        lossOrGain,
        potentialLoss,
      };
    });
    return records;
  };
  const calculateCurrencyImpact = useMemo(() => {
    return getImpactInvoices(leftInvoices);
  }, [liveData, leftInvoices]);

  const calculateFOSPercentages = (currency) => {
    const currencyPair = currency.currencyPair;
    const marketSpotRate = liveData[currencyPair];
    const rates = [...currency.rates];
    rates.push({ last: marketSpotRate });
    const sum = rates.reduce((acc, r) => acc + Number(r.last), 0);
    const avg90 = sum / rates.length;
    const EFT = (marketSpotRate - avg90) / avg90;
    const tempForward = parseFloat(entitlements.forwardPercentage) + parseFloat(entitlements.hedgeAdjustment * EFT);
    let forwardPercent;
    if (tempForward < entitlements.minForwardPercent) {
      forwardPercent = entitlements.minForwardPercent;
    } else {
      forwardPercent = Math.min(entitlements.maxForwardPercent, tempForward);
    }
    const orderPercent = Math.min(entitlements.maxPercentOnOrder, 100 - entitlements.spotPercentage - EFT - forwardPercent);
    const spotPercent = 100.0 - parseFloat(parseFloat(forwardPercent) + parseFloat(orderPercent));
    return {
      forwardPercent,
      orderPercent,
      spotPercent,
      EFT,
      avg90,
    };
  };

  const getOptimisedInvoices = (data = []) => {
    const calculateCurrencyImpact = getImpactInvoices(data);
    const records = data.map((r) => {
      const currencyPair = `${organisation?.currency}${r.currencyCode}`;
      const spotRate = liveData[currencyPair];
      const orderPer = 0.5;
      const marginPer = parseFloat(marginPercentageVal) / 100;
      const orderProb = parseFloat(entitlements[getVariableProbability(organisation)]) / 100;
      const forwardPer = 0.25;
      const clientSpotRate = spotRate * (1 - marginPer);
      const fosPercent = fosPercents[r.currencyCode] || {};
      const targetCost =
        Number(r.total) /
        (clientSpotRate * (fosPercent.forwardPercent / 100) +
          (fosPercent.orderPercent / 100 + fosPercent.spotPercent / 100) * optimisedRates[r.invoiceId]);
      const impactRecord = calculateCurrencyImpact.find((cr) => cr.invoiceId === r.invoiceId);
      const potentialLoss = impactRecord?.potentialLoss || 0.0;
      const saving = impactRecord.currentCost - targetCost;
      const lossRed = potentialLoss - (orderProb * (1 - orderPer - forwardPer) * potentialLoss + (1 - orderProb) * (1 - forwardPer) * potentialLoss);
      return {
        ...r,
        targetCost,
        saving,
        lossRed,
      };
    });
    return records;
  };
  const calculateOptimisedInvoices = useMemo(() => {
    return getOptimisedInvoices(leftInvoices);
  }, [liveData, leftInvoices, optimisedRates]);

  const getMxMarketLiveData = async () => {
    setFetchingLiveRate(false);
    try {
      const url = '/api/hedge/mxmarket/live-spot-rate';
      const currencyPairs = currencies.map((c) => c.currencyPair);
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        authorization: token,
      };
      axios
        .post(
          url,
          {
            currencyPairs: currencyPairs.join(','),
          },
          {
            headers: headers,
          }
        )
        .then((res) => {
          setLiveData(res.data.data.price);
        })
        .catch((e) => {
          console.log(e);
          openNotificationWithIcon('danger', 'Error', 'Error in fetching current rate.');
        })
        .finally(() => setFetchingLiveRate(false));
    } catch (e) {
      console.error(e);
      openNotificationWithIcon('danger', 'Error', 'Error in fetching current rate.');
    }
  };

  const getInvoice = async (mode, type = 'unmanaged') => {
    const { payables, receivables } = initialLoads;
    const { payablesManaged, receivablesManaged } = initialManagedLoads;
    try {
      try {
        let url = `/api/hedge/get-invoices`;
        const token = localStorageService.getItem('firebase-token');
        const headers = {
          authorization: token,
        };

        const orgId = organisation?.id;
        const tenantId = organisation?.tenant.id;
        // const isHedging = history.location.pathname == '/plan' ? true : false
        axios
          .post(
            url,
            {
              tenantId: tenantId,
              orgId: orgId,
              currency: 'ALL',
              filter: 12,
              type,
              mode,
            },
            {
              headers: headers,
            }
          )
          .then((res) => {
            if (type === 'unmanaged') {
              setPayable(res.data.data.invoices);
              if (!receivables || !payables) {
                //to track both mode loaded and tracking count
                if (mode === 'receivables') {
                  setInitialLoads({ ...initialLoads, receivablesCount: res.data.data.invoices.length, receivables: true });
                } else {
                  setInitialLoads({ ...initialLoads, payablesCount: res.data.data.invoices.length, payables: true });
                }
              }
              setCurrencies(res.data.data.currencies);
              setHomeCurrencies(res.data.data.homeCurrencies);
              setMarginPercentage(res.data.data.marginPercentage);
            } else {
              setManagedInvoices(res.data.data.invoices);
              setMarginPercentage(res.data.data.marginPercentage);
              if (!receivablesManaged || !payablesManaged) {
                if (mode === 'receivables') {
                  setInitialManagedLoads({
                    ...initialManagedLoads,
                    receivablesManagedCount: res.data.data.invoices.length,
                    receivablesManaged: true,
                  });
                } else {
                  setInitialManagedLoads({ ...initialManagedLoads, payablesManagedCount: res.data.data.invoices.length, payablesManaged: true });
                }
              }
            }
            setLoading(false);
          })
          .catch(() => setLoading(false));
      } catch ({ message }) {
        if (message === APOLLO_ERROR_MESSAGE.authenticationFailed) {
          history.push(AUTH_ROUTES.login);
        } else {
          // setIsError(true);
          setLoading(false);
        }
      }
    } catch (e) {}
  };

  const getEntitlements = () => {
    try {
      let url = `/api/orgEntitlement/get-OrgEntitlements`;
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        authorization: token,
      };

      const payload = {
        orgId: organisation?.id,
        mode: modeType || null,
      };

      axios.post(url, payload, { headers: headers }).then((res) => {
        setEntitlements(res.data.data.OrgEntitlements[0] || {});
      });
    } catch (e) {
      addToast('Exception occurred... Kindly try again by reloading page.', 'danger');
      setLoading(false);
    }
  };

  const onClickImport = () => history.push({ pathname: UPLOAD_CSV_ROUTES.root, state: { mode: modeType } });

  const { ui } = useQueryLocalCommon();
  const ctaClasses = cn('w-full mt-10');

  return (
    <PlanUploadCSVPageContent className={['justify-center', 'align-items', 'bg-white', 'flex flex-col', 'mt-10', 'pb-10']}>
      <FluenccyLoader loop={fetchingLiveRate} className="absolute z-1 w-12" style={{ position: 'absolute', zIndex: 1, top: '5rem', left: '50%' }} />
      <div className="w-full">
        <Select
          defaultValue={modeType}
          options={modeOptions}
          isDisabled={false}
          onChange={setModeType}
          value={modeType}
          style={{ width: '200px', margin: '0 40px 20px' }}
        />
        <Dashboard
          organisation={organisation}
          managedInvoices={managedInvoices}
          currencyImpactInvoices={calculateCurrencyImpact}
          unmanagedInvoices={leftInvoices}
          optimisedInvoices={[...calculateOptimisedInvoices, ...managedInvoices]}
          currencies={currencies}
          getOptimisedPayableRate={getOptimisedPayableRate}
          marginPercentageVal={marginPercentageVal}
          liveData={liveData}
          fosPercents={fosPercents}
          showBack={false}
          showList={false}
          isFullWidth={true}
          chartBarClickable={false}
          title="Invoice Management"
          hideChart={payable.length === 0 && managedInvoices.length === 0 && !loading}
          showCurrencyScoreTitle
          mode={modeType}
          homeCurrencies={homeCurrencies}
          showCurrencyScoreBreakdown={showCurrencyScoreBreakdown}
          showModeSelection={false}
        />
      </div>

      <div className={cn(BASE_CLASSES, RESPONSIVE_CLASSES, ['flex'])}>
        {false && (
          <div style={{ width: '25%' }}>
            <Card className="mt-20 w-full pb-6">
              <CardContent className="p-6 h-full">
                <div className="flex justify-between flex-col h-full">
                  <Text className="font-helvetica text-base mb-3 mt-2 font-bold" variant="dark" isBlock>
                    Invoice Manager
                  </Text>
                  <div className="flex">
                    <Text className="text-2xl font-serif">Need help with invoice costs?</Text>
                  </div>
                  <Text className="font-helvetica text-base font-bold mt-3" variant="gray" isBlock>
                    Invoice Manager helps you see the impact of currency movement on your invoices and take action.
                  </Text>
                  <Button className={ctaClasses} onClick={navigateToImsDashbpard} isDisabled={ui === 'saving'} isRounded>
                    See live costs
                  </Button>
                </div>
              </CardContent>
            </Card>
            {ui === 'loading' && <DashboardCoachingCardSkeleton className="mt-20 pb-6" />}
            {ui !== 'loading' && <DashboardCoachingCard className="mt-20" />}
          </div>
        )}
        <div style={{ width: showCurrencyScoreBreakdown ? '73%' : '100%' }}>
          <div className="font-medium text-lg mb-2 mt-4 flex items-center">
            <span className="mr-3">Currency Performance</span>
            <ChartControls showLeft={false} showTabs={false} absolute={false} border={false} fullWidth={false} />
          </div>
          
          {/* Add conditional rendering for performance dashboard */}
          {(payable.length > 0 || managedInvoices.length > 0) ? (
            <PerformanceDashboard
              showTable={false}
              showOnlyRates={true}
              showBanner={false}
              numberOfMonths={12}
              hideFilter
              showBorder
              endWithNonEmpty
              mode={modeType}
              onClickImport={onClickImport}
              newDateFrom={performanceDateRange.from}
              newDateTo={performanceDateRange.to}
              isDateChanged={true}
              organisation={organisation} // Pass organisation for empty state checks
              currencies={currencies} // Pass currencies for validation
            />
          ) : (
            // Show empty state when no invoices
            <div className="border border-gray-200 rounded-lg p-8">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-6">
                  <svg 
                    width="80" 
                    height="80" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#9CA3AF" 
                    strokeWidth="1" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="mx-auto mb-4"
                  >
                    <path d="M3 3v18h18V3z"></path>
                    <path d="M8 12h8"></path>
                    <path d="M8 16h8"></path>
                    <path d="M8 8h8"></path>
                  </svg>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Performance Data Available
                </h3>
                
                <p className="text-gray-500 mb-8 max-w-md">
                  Oh no, your Xero account is empty, upload an invoice and resync your account to see your currency performance
                </p>
                
                <button
                  onClick={onClickImport}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Upload Invoice
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PlanUploadCSVPageContent>
  );
});
