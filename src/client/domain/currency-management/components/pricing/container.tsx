import React, { memo, useEffect, useState, useMemo, useRef } from 'react';
import { filter, map, isEmpty, find, differenceBy, orderBy, sortBy, max, groupBy } from 'lodash';
import {
  Button,
  Page,
  PageContent,
  Text,
  localStorageService,
  useToast,
  TabModel,
  Input,
  TextSkeleton,
  Select,
  useModal,
  FluenccyLoader,
  FlagIcon,
  Badge,
  Icon,
  Checkbox,
} from '@client/common';
import { useQueryLocalOrganisation } from '@client/organisation';
import { UploadCSVPage } from '@client/upload-csv';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { PlanTableSkeleton, PlanPage, PlanUploadCSVPageContent, PayableContent } from '@client/plan';
import moment from 'moment';
import { jStat } from 'jstat';
import { Dashboard, ScheduleModal, PlanTable, ActionTooltipContent } from '@client/plan/IMS/components';
import { format } from '@client/utils/number';
import { getVariableProbability } from '@client/utils/helper';
import { calculateImpactOptions, calculateOptimisedRate } from './utils/helper';
const options = [
  {
    value: '',
    label: 'Payables',
  },
  {
    value: 'receivables',
    label: 'Receivables',
  },
];

const DAYS_FOR_CALCULATIONS = 365;

const getStdDev = (logs) => {
  // Creating the mean with Array.reduce
  const mean =
    logs.reduce((acc, curr) => {
      return parseFloat(acc) + parseFloat(curr);
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

const cuurencyFlagStyle = { width: '22px', height: '22px', style: { marginRight: '5px' } };

export const PricingContainer = memo(({ currency = 'ALL' }) => {
  const intervalRef = useRef(null);
  const history = useHistory();
  const [payable, setPayable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState('12months');
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
  const [detailsheight, setDetailsHeight] = useState(40.5);
  const [impactHeight, setImpactHeight] = useState(40.5);
  const [optimiseHeight, setOptimiseHeight] = useState(40.5);
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('asc');
  const [cmsEntitlementsByCurrency, setCmsEntitlementsByCurrency] = useState({});
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [mode, setMode] = useState(history.location.state?.mode || 'receivables');
  const forwardPoints = useRef({});

  const [hedgingEverything, setHedgingEverything] = useState(false);
  const { openModal, setWidth } = useModal();
  const {
    forwardMarginPercentage = 0.0,
    limitOrderMarginPercentage = 0.0,
    orderProbability = 0.0,
    spotMarginPercentage = 0.0,
  } = marginPercentageFromAPI[0] || {};

  useEffect(() => {
    if (currencies.length) {
      getMxMarketLiveData();
      intervalRef.current = setInterval(() => {
        getMxMarketLiveData();
      }, 3000);
      return () => {
        clearInterval(intervalRef.current);
      };
    }
  }, [currencies]);

  useEffect(() => {
    if (marginPercentageFromAPI.length) {
      marginPercentageVal = marginPercentageFromAPI[0].marginPercentage;
    }
  }, [marginPercentageFromAPI]);

  useEffect(() => {
    if (currencies.length && (payable?.length || managedInvoices?.length)) {
      const data = currencies.reduce((acc, c) => {
        acc[c.currencyCode] = calculateFOSPercentages(c);
        return acc;
      }, {});
      setFOSPercents(data);
    }
  }, [currencies, liveData, entitlements, payable, managedInvoices]);

  useEffect(() => {
    getEntitlements();
    getCmsEntitlements();
  }, [mode]);

  useEffect(() => {
    getInvoice();
    getInvoice('managed');
  }, [currency, duration, organisation?.id, mode]);

  useEffect(() => {
    if (!isEmpty(currencies)) {
      const optimisedRates = payable.reduce((acc, invoice) => ({ ...acc, [`${invoice.invoiceId}`]: getOptimisedPayableRate(invoice) }), {});
      setOptimisedRates(optimisedRates);
    }
  }, [currencies, liveData, payable, organisation?.variableProbability, mode]);

  const leftInvoices = useMemo(() => differenceBy(payable, managedInvoices, 'invoiceId'), [payable, managedInvoices, mode]);

  useEffect(() => {
    const isAnyUnapprovedInvoices = managedInvoices.some((o) => o.isApproved === 'false');
    if (!isAnyUnapprovedInvoices && leftInvoices.length === 0) {
      clearInterval(intervalRef.current);
    }
  }, [leftInvoices, managedInvoices, mode]);

  const openNotificationWithIcon = (type = 'success', title = '', description = 'Success', style = {}) => {
    addToast(description, type, 'fixed');
  };

  const getOptimisedPayableRate = (invoice, rates = null) => {
    let diff = moment(invoice.dateDue).diff(moment(), 'days');

    if (diff > 0) {
      const currencyPair =
        invoice.mode == 'receivables' ? `${invoice.homeCurrencyCode}${invoice.currencyCode}` : `${organisation?.currency}${invoice.currencyCode}`;
      const prob = 1 - Number(entitlements[getVariableProbability(organisation)]) / 100;
      const gammaInv = Math.sqrt(jStat.gamma.inv(prob, 0.5, 1.0));
      const annualAdj = Math.sqrt(DAYS_FOR_CALCULATIONS) * calculateStddev(invoice);
      const interinCal = gammaInv * Math.sqrt(Math.PI);
      const daysToPay = diff;
      var payable = 0.0;
      payable =
        Math.pow(1.0 + annualAdj, interinCal * Math.sqrt(daysToPay / DAYS_FOR_CALCULATIONS)) * (rates ? rates[currencyPair] : liveData[currencyPair]);

      const F91 = (rates ? rates[currencyPair] : liveData[currencyPair]) * (1 - entitlements.limitOrderMarginPercentage / 100);
      const H91 = fosPercents[invoice.currencyCode]?.EFT;
      const BacktestD10 = Number(entitlements.minPercentAboveSpot || 0);
      const BacktestC15 = Number(entitlements.orderAdjustmentMinus || 0) / 100;
      const K91 = annualAdj;
      const BacktestDataB4 = interinCal;
      const E95 = daysToPay;
      const BacktestC14 = Number(entitlements.orderAdjustmentPlus || 0) / 100;

      // Client spot rate
      const orderAdjustment = H91 < 0 ? BacktestC15 : BacktestC14;
      const pow = Math.pow(1 + K91, BacktestDataB4 * Math.sqrt(E95 / DAYS_FOR_CALCULATIONS));
      const conditionalRate = (1 + H91 * orderAdjustment) * F91 * pow;

      const maxFirst = F91 * Number(BacktestD10 || 0);

      payable = maxFirst > conditionalRate ? maxFirst : conditionalRate;
      var retPayable = parseFloat(payable).toFixed(5);
      if (!isNaN(payable) && payable > 0.0) {
        payable = format(Number(retPayable), 5, 3);
      }

      var newPayableRate = payable;

      if (mode == 'receivables') {
        const clientSpotRate = getClientSpotRate(invoice);
        newPayableRate = format(Number(-(format(Number(payable), 5, 3) - format(Number(clientSpotRate), 5, 3)) + Number(clientSpotRate)), 5, 3);
      }
      // return payable;
      return newPayableRate;
    } else {
      return 0;
    }
  };

  const getSpotRate = (r) => {
    var currencyPair = `${organisation?.currency}${r.currencyCode}`;
    if (mode == 'receivables') {
      currencyPair = `${r.homeCurrencyCode}${r.currencyCode}`;
    }
    console.log('Live Rate: ', liveData[currencyPair]);
    return format(Number(liveData[currencyPair]), 5, 3);
  };

  const getClientSpotRate = (r) => {
    const calcMarginPercentage = parseFloat(forwardMarginPercentage) / 100;
    const spotRate = getSpotRate(r);

    const forwardPoint = forwardPoints.current[r.currencyCode]?.find(
      (rec) => moment(r.dateDue).format('MMM') === rec.month && moment(r.dateDue).format('YYYY') === rec.year
    );
    // const clientSpotRate = spotRate * (1 - calcMarginPercentage) + Number(forwardPoint?.forwardPoints || 0);
    const value = format(Number(spotRate * (1 + calcMarginPercentage) + Number(forwardPoint?.forwardPoints || 0)), 5, 3);
    return isNaN(value) ? 0 : value;
  };

  const calculateStddev = (rec) => {
    const currencyRate = currencies.find((c) => c.currencyCode === rec.currencyCode);
    if (currencyRate) {
      const logs = [];
      const currencyPair = currencyRate.currencyPair;
      const d = [...currencyRate.rates.map((r) => r.last), liveData[currencyPair]];
      for (let i = 0; i < d.length - 1; i++) {
        logs.push(Math.log(d[i + 1] / d[i]));
      }
      return getStdDev(logs);
    }
  };

  const getImpactInvoices = (data = [], optimisedRatesForOption = null) => {
    const records = data.reduce((results, r, i) => {
      const spotRate = getSpotRate(r);
      const clientSpotRate = getClientSpotRate(r);
      const currentCost = Number(r.total || 0) / clientSpotRate;

      var lossOrGain = 0.0;
      if (mode == 'receivables') {
        lossOrGain = Number(r.total || 0) / clientSpotRate - Number(r.total || 0) / r.currencyRate;
      } else {
        lossOrGain = Number(r.total || 0) / Number(r.currencyRate || 0) - Number(currentCost || 0);
      }

      const daysToPay = Math.abs(moment(r.dateDue).diff(moment(), 'days'));
      const potentialLoss = lossOrGain - 1 * Math.sqrt(daysToPay) * Number(calculateStddev(r) || 0) * Number(currentCost || 0);

      // calculation for ptimised records
      const marginPer = parseFloat(limitOrderMarginPercentage) / 100;
      let optimisedRate = format(Number((optimisedRatesForOption || optimisedRates)[r.invoiceId]), 5, 3);

      const optimisedClientSpotRate = optimisedRate == 0 ? spotRate : spotRate * (1 - marginPer);
      const fosPercent = fosPercents[r.currencyCode] || {};
      let optimisedRateForCalc = 0;
      if (optimisedRate == 0) {
        optimisedRateForCalc = spotRate;
      } else if (!optimisedRate) {
        optimisedRateForCalc = r.buyingSchedule?.optimizedRate;
      } else {
        optimisedRateForCalc = optimisedRate;
      }

      let saving = 0;
      var targetCost = 0;
      if (optimisedRate != 0) {
        targetCost = Number(r.total || 0) / optimisedRateForCalc;
        if (mode == 'receivables') {
          saving = Number(r.total) / optimisedRate - Number(r.total) / clientSpotRate;
        } else {
          saving = currentCost - targetCost;
        }
        // saving = lossOrGain + (currentCost - targetCost);
      } else {
        targetCost = currentCost;
      }
      const bgColor = '#e8e5e5';
      let mainRecord = {
        ...r,
        currentCost,
        lossOrGain,
        potentialLoss,
        currentRate: clientSpotRate,
        bgColor: selectedInvoiceId === r.invoiceId ? bgColor : '',
        targetCost,
        saving,
        optimisedRate,
      };

      const options = calculateImpactOptions(mainRecord, cmsEntitlementsByCurrency, spotRate);
      mainRecord = {
        ...mainRecord,
        height: selectedInvoiceId === r.invoiceId ? 3.5 * (options.length + 1) + 'rem' : '3.5rem',
        isParent: true,
        id: r.invoiceId + `_0`,
        optionsCount: options.length,
        counterPartyEntitlementItemId: null,
      };

      // to show records if options is available
      if (options.length) {
        return [...results, mainRecord, ...options];
      }
      return [...results, mainRecord];
    }, []);
    return records;
  };
  const calculateCurrencyImpact = useMemo(() => {
    return getImpactInvoices(leftInvoices);
  }, [liveData, leftInvoices, forwardPoints.current, optimisedRates, selectedInvoiceId, mode]);

  const calculateFOSPercentages = (currency) => {
    const currencyPair = currency.currencyPair;
    const marketSpotRate = liveData[currencyPair];
    const rates = [...currency.rates];
    rates.push({ last: marketSpotRate });
    const sum = rates.reduce((acc, r) => acc + Number(r.last || 0), 0);
    let avg90 = sum / rates.length;
    let EFT = (marketSpotRate - avg90) / avg90;
    const tempForward = parseFloat(entitlements.forwardPercentage) / 100 + parseFloat(entitlements.hedgeAdjustment * EFT);
    let forwardPercent;
    if (tempForward * 100 < entitlements.minForwardPercent) {
      forwardPercent = entitlements.minForwardPercent;
    } else {
      forwardPercent = Math.min(entitlements.maxForwardPercent, tempForward * 100);
    }
    var orderPercent = Math.min(entitlements.maxPercentOnOrder, 100 - entitlements.spotPercentage - EFT * 100 - forwardPercent);

    EFT = isNaN(EFT) ? 0.0 : EFT;
    avg90 = isNaN(avg90) ? 0.0 : avg90;
    const spotPercent = 100.0 - parseFloat(parseFloat(forwardPercent) + parseFloat(orderPercent));
    return {
      forwardPercent,
      orderPercent,
      spotPercent,
      EFT,
      avg90,
    };
  };

  const getMxMarketLiveData = async () => {
    // setFetchingLiveRate(true);
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
          // setLiveData({
          //   "AUDUSD": 0.65571
          // })
          setFetchingLiveRate(false);
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

  const getInvoice = async (type = 'unmanaged') => {
    try {
      try {
        let url = `/api/hedge/get-invoices`;
        const token = localStorageService.getItem('firebase-token');
        const headers = {
          authorization: token,
        };

        const orgId = organisation?.id;
        const tenantId = organisation?.tenant.id;

        var payload = {
          tenantId: tenantId,
          orgId: orgId,
          currency: 'ALL',
          filter: parseInt(duration, 10),
          type,
          baseCurrency: 'ALL',
          isPricing: type !== 'unmanaged',
          mode: mode || null,
        };
        if (mode == 'receivables') {
          payload.homeCurrencyCode = 'ALL';
        }

        axios
          .post(url, payload, {
            headers: headers,
          })
          .then((res) => {
            forwardPoints.current = groupBy(
              [...Object.values(forwardPoints.current).flat(), ...res.data.data.forwardPoints],
              ({ tradeCurrency }) => tradeCurrency
            );
            if (type === 'unmanaged') {
              setPayable(res.data.data.invoices);
              setCurrencies(res.data.data.currencies);
            } else {
              setManagedInvoices(res.data.data.invoices);
            }

            setMarginPercentage(res.data.data.marginPercentage);

            setLoading(false);
          })
          .catch((e) => setLoading(false));
      } catch ({ message }) {
        if (message === APOLLO_ERROR_MESSAGE.authenticationFailed) {
          history.push(AUTH_ROUTES.login);
        } else {
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
        mode: mode || null,
      };

      axios.post(url, payload, { headers: headers }).then((res) => {
        setEntitlements(res.data.data.OrgEntitlements[0] || {});
      });
    } catch (e) {
      addToast('Exception occurred... Kindly try again by reloading page.', 'danger');
      setLoading(false);
    }
  };

  const getCmsEntitlements = () => {
    try {
      let url = `/api/orgEntitlement/get-cms-entitlements`;
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        authorization: token,
      };

      axios.post(url, { orgId: organisation?.id, isPricing: true, mode: mode || null }, { headers: headers }).then((res) => {
        const results = groupBy(res.data.data.cmsEntitlements, 'currencyCode');
        setCmsEntitlementsByCurrency(results);
      });
    } catch (e) {
      addToast('Exception occurred... Kindly try again by reloading page.', 'danger');
    }
  };

  const updateInvoice = async (manageType: string, type: string = 'managed', invoice: object) => {
    try {
      try {
        let url = `/api/hedge/update-invoice`;
        const token = localStorageService.getItem('firebase-token');
        const headers = {
          authorization: token,
        };

        const orgId = organisation?.id;
        const tenantId = organisation?.tenant.id;
        const payload = {
          orgId,
          tenantId,
          type,
          manageType,
          invoiceId: invoice.invoiceId,
          forwardRate: invoice.currentRate,
          optimizedRate: invoice.optimisedRate,
          isPricing: type === 'managed',
          strikeRate: invoice.strikeRate,
          deltaRate: invoice.deltaRate,
          pricingLabelField: invoice.id ? invoice.id.split('_')[1] : '',
          counterPartyEntitlementItemId: invoice.counterPartyEntitlementItemId,
        };

        axios.post(url, payload, { headers: headers }).then((res) => {
          getInvoice('unmanaged');
          getInvoice('managed');
          setSelectedInvoiceId('');
        });
      } catch ({ message }) {
        if (message === APOLLO_ERROR_MESSAGE.authenticationFailed) {
          history.push(AUTH_ROUTES.login);
        } else {
        }
      }
    } catch (e) {
      addToast('Exception occurred... Kindly try again by reloading page.', 'danger');
    }
  };

  const calculateCurrenctTargetCost = (invoiceId) => {
    const invoice = managedInvoices.find((invoice) => invoice.invoiceId === invoiceId);
    const { forwardValue, orderValue, forwardRate, optimizedRate, strikeRate, deltaRate } = invoice.buyingSchedule || {};
    let calcMarginPercentage = 0;
    const currencyPair =
      invoice.mode == 'receivables' ? `${invoice.homeCurrencyCode}${invoice.currencyCode}` : `${organisation?.currency}${invoice.currencyCode}`;
    const spotRate = liveData[currencyPair];
    //for first record
    if (!strikeRate) {
      calcMarginPercentage = parseFloat(forwardMarginPercentage) / 100;
      const currentCost = Number(forwardValue) / (spotRate * (1 + calcMarginPercentage) || 1);
      calcMarginPercentage = 0;
      const optimizedRate = optimisedRates[invoice.invoiceId];
      const targetCost = Number(orderValue) / (optimizedRate * (1 + calcMarginPercentage) || 1);
      return {
        currentCost,
        targetCost,
        optimizedRate,
        forwardRate: spotRate,
      };
    } else {
      const clientSpotRate = spotRate * strikeRate;
      const currentCost = Number(invoice.total || 0) / clientSpotRate;
      const optimisedRate = clientSpotRate + (optimizedRate - forwardRate) * deltaRate;
      const targetCost = Number(invoice.total || 0) / optimisedRate;
      return {
        currentCost,
        targetCost,
        optimizedRate: optimisedRate,
        forwardRate: clientSpotRate,
      };
    }
  };

  const onApprove = async (invoiceId) => {
    try {
      try {
        let url = `/api/hedge/approve-invoice`;
        const token = localStorageService.getItem('firebase-token');
        const headers = {
          authorization: token,
        };

        console.log('Invoice: ', invoiceId);
        console.log(calculateCurrenctTargetCost(invoiceId));
        const orgId = organisation?.id;
        const tenantId = organisation?.tenant.id;
        const payload = {
          orgId,
          tenantId,
          invoiceId: invoiceId,
          isPricing: true,
          ...calculateCurrenctTargetCost(invoiceId),
        };

        axios
          .post(url, payload, { headers: headers })
          .then((res) => {
            const updatedInvoices = managedInvoices.map((minv) => {
              if (minv.invoiceId === invoiceId) {
                return res.data.data.invoiceDetails;
              }
              return minv;
            });
            setManagedInvoices(updatedInvoices);
            addToast('Schedule approved.');
          })
          .catch((e) => {
            addToast('Failed to approve', 'danger');
          });
      } catch ({ message }) {
        if (message === APOLLO_ERROR_MESSAGE.authenticationFailed) {
          history.push(AUTH_ROUTES.login);
        } else {
        }
      }
    } catch (e) {
      addToast('Exception occurred... Kindly try again by reloading page.', 'danger');
    }
  };

  const onModalClose = () => {
    intervalRef.current = setInterval(() => {
      getMxMarketLiveData();
    }, 3000);
  };

  const generateTermSheet = (invoice) => {
    try {
      try {
        let url = `/api/hedge/generate-term-sheet`;
        const token = localStorageService.getItem('firebase-token');
        const headers = {
          authorization: token,
        };

        const orgId = organisation?.id;
        const tenantId = organisation?.tenant.id;
        const payload = {
          orgId,
          tenantId,
          invoiceId: invoice.invoiceId,
          mode: mode || null,
        };

        axios
          .post(url, payload, { headers: headers })
          .then(() => {
            addToast('Term sheet generated.');
          })
          .catch((e) => {
            addToast('Failed to generate term sheet', 'danger');
          });
      } catch ({ message }) {
        if (message === APOLLO_ERROR_MESSAGE.authenticationFailed) {
          history.push(AUTH_ROUTES.login);
        } else {
        }
      }
    } catch (e) {
      addToast('Exception occurred... Kindly try again by reloading page.', 'danger');
    }
  };

  const handleOptimisedInvoiceSelect = (invoice, value) => {
    clearInterval(intervalRef.current);
    switch (value) {
      case 'review':
        setWidth('40%');
        var optimisedRateForOption = 0.0;
        if (invoice.pricingLabelField) {
          var optimisedRates = { [invoice.invoiceId]: getOptimisedPayableRate(invoice) };
          console.log('optimised rates >> ', optimisedRates);
          var options = getImpactInvoices([invoice], optimisedRates);
          optimisedRateForOption = options[parseInt(invoice.pricingLabelField, 10)].optimisedRate;
        }
        openModal(
          <ScheduleModal
            title="Review"
            fosPercents={fosPercents}
            marginPerc={marginPercentageFromAPI[0]}
            liveRates={liveData}
            onApprove={onApprove}
            invoice={invoice}
            organisation={organisation}
            isHedgingEverything={hedgingEverything}
            currencies={currencies}
            onClose={onModalClose}
            setRates={setLiveData}
            showHedgingEverything={false}
            onGenerateTermSheet={generateTermSheet}
            // getOptimisedPayableRate={getOptimisedPayableRate}
            optimisedRateForOption={optimisedRateForOption}
            entitlements={entitlements}
          />
        );
        return;
      case 'approve':
        onApprove(invoice);
        return;
      case 'Plan':
      case 'Forward':
        updateInvoice(value, 'managed', invoice);
        return;
      case 'remove':
        updateInvoice('', 'unmanaged', invoice);
        return;
      case 'genTermSheet':
        generateTermSheet(invoice);
        return;
      case 'managedInIMS':
        history.push('/plan', { mode });
        return;
    }
  };

  const renderBadge = (value) => {
    return (
      <Badge variant={value > 0 ? 'success' : 'danger'}>
        {value > 0 ? '+' : ''}
        {format(value, 2, 3)}
      </Badge>
    );
  };

  const hasPendingStatusInvoice = useMemo(() => !!managedInvoices.find((inv) => inv.isApproved !== 'true' && inv.isPricing), [managedInvoices]);

  const renderOptimisedColumn = (r, column) => {
    if (column === 'actions') {
      return (
        <ActionTooltipContent
          isDisabled={(!!selectedInvoiceId && selectedInvoiceId !== r.invoiceId) || hasPendingStatusInvoice}
          data={r}
          onSelect={handleOptimisedInvoiceSelect.bind(this, r)}
          currency={organisation?.currency}
          width="415px"
        />
      );
    }

    if (column === 'targetCost') {
      return (
        <span className="flex items-center " style={{ color: '#706A7A', fontWeight: 'bold' }}>
          <FlagIcon currency={mode == 'receivables' ? r.homeCurrencyCode : organisation.currency} style={cuurencyFlagStyle} />{' '}
          {format(r[column], 2, 3)}
        </span>
      );
    }

    if (column === 'saving') {
      return renderBadge(r[column]);
    }

    if (column === 'optimisedRate') {
      let rt = format(Number(r[column] || 0), 5, 3);
      return rt == 0 ? '-' : rt;
    }

    return r ? `${format(r[column], 2, 3)}` : null;
  };
  const renderImpactColumn = (r, column) => {
    if (r) {
      if (column === 'currentCost') {
        return (
          <span className="flex items-center " style={{ color: '#706A7A', fontWeight: 'bold' }}>
            <FlagIcon currency={mode == 'receivables' ? r.homeCurrencyCode : organisation.currency} style={cuurencyFlagStyle} />{' '}
            {format(r[column], 2, 3)}
          </span>
        );
      }
      if (column === 'currentRate') {
        return format(Number(r[column] || 0), 5, 3);
      }

      return renderBadge(r[column]);
    }
    return null;
  };

  const handleInvoiceSelect = (id) => {
    setSelectedInvoiceId(id === selectedInvoiceId ? '' : id);
  };

  const renderUnmanagedColumn = (r, column) => {
    switch (column) {
      case 'select':
        return (
          <Checkbox
            isChecked={r.invoiceId === selectedInvoiceId}
            isDisabled={(!!selectedInvoiceId && selectedInvoiceId !== r.invoiceId) || hasPendingStatusInvoice}
            onChange={() => handleInvoiceSelect(r.invoiceId)}
          />
        );
      case 'date':
      case 'dateDue':
        return moment(r[column]).format('DD-MMM-YY');
      case 'total':
        return (
          <span className="flex items-center " style={{ color: '#1C1336', fontWeight: 500 }}>
            <FlagIcon currency={r.currencyCode} style={cuurencyFlagStyle} /> {format(Number(r[column] || 0), 2, 3)}
          </span>
        );
      case 'actions':
        const options = [];
        if (!r.isPricing) {
          options.push({ label: 'Managed in IMS', value: 'managedInIMS' });
        } else if (r.manage_type === 'Plan' || r.manage_type === 'Forward') {
          options.push({ label: 'Review', value: 'review' });
          if (r.isApproved !== 'true') {
            options.push({ label: 'Remove', value: 'remove' });
          }
        }

        return <ActionTooltipContent options={options} onSelect={handleOptimisedInvoiceSelect.bind(this, r)} currency={organisation?.currency} />;
      case 'status':
        const manageType = r.manage_type === 'Plan' ? 'Planned' : 'Forward';
        if (r.isApproved === 'true') {
          return <span className="text-green-500 font-medium">Approved ({manageType})</span>;
        }
        return <span className="text-red-500 font-medium">Awaiting approval ({manageType})</span>;
      case 'daysToPay':
        const dtp = moment(r.dateDue).diff(moment(), 'days');
        return dtp > 0 ? dtp : 0;
      case 'counterParty':
        const { orgEntitlementItems = [] } = cmsEntitlementsByCurrency[r.currencyCode]?.[0] || {};
        const item = r.counterPartyEntitlementItemId && orgEntitlementItems.find((i) => i.id === parseInt(r.counterPartyEntitlementItemId, 10));
        return item?.text || '-';
      default:
        return r[column];
    }
  };

  const onSort = (data: Array<object>, colName: string, isNumber: Boolean | undefined) => {
    setSortBy(colName);
    let dir = 'asc';
    if (colName === sortBy) {
      dir = sortDir === 'asc' ? 'desc' : 'asc';
    }
    setSortDir(dir);

    const format = (d) => {
      let value = d[colName];
      if (colName === 'daysToPay') {
        value = moment(d.dateDue).diff(moment(), 'days');
        value = value > 0 ? value : 0;
      }
      if (isNumber) {
        value = Number(value);
      }
      return value;
    };
    const sortedRecords = orderBy(data, format, dir);
    setPayable(sortedRecords);
  };

  const currencyImpactColumns = [
    { key: 'currentCost', label: 'Current Cost', onRender: renderImpactColumn, isNumber: true, tooltip: 'Cost In Home Currency as per Forward Rate' },
    { key: 'currentRate', label: 'Forward Rate', onRender: renderImpactColumn, isNumber: true, tooltip: 'Forward Rate for Due Date' },
    { key: 'lossOrGain', label: 'Gain / Loss', onRender: renderImpactColumn, isNumber: true, tooltip: 'Gain/Loss as per market rate' },
    { key: 'counterParty', label: 'Provider', onRender: renderUnmanagedColumn },
  ];

  const unmanagedInvoiceColumns = [
    { key: 'select', label: 'Select', onRender: renderUnmanagedColumn },
    { key: 'total', label: 'Amount', onRender: renderUnmanagedColumn, isNumber: true, sortable: true, tooltip: 'Click to sort' },
    { key: 'dateDue', label: 'Due Date', onRender: renderUnmanagedColumn, isNumber: true, sortable: true, tooltip: 'Click to sort' },
    { key: 'daysToPay', label: 'Days to Pay', isNumber: true, onRender: renderUnmanagedColumn, sortable: true, tooltip: 'Click to sort' },
  ];

  const optimisedInvoiceColumns = [
    {
      key: 'targetCost',
      label: 'Target Cost',
      onRender: renderOptimisedColumn,
      isNumber: true,
      tooltip: 'Cost That Can be Targeted with Fluenccy Savings Plan',
    },
    { key: 'optimisedRate', label: 'Savings Rate', isNumber: true, onRender: renderOptimisedColumn, tooltip: 'Target Forward Rate for Due Date' },
    { key: 'saving', label: 'Saving', onRender: renderOptimisedColumn, isNumber: true, tooltip: 'Difference between Current cost and Targeted cost' },
    { key: 'actions', label: 'Actions', onRender: renderOptimisedColumn, align: 'center' },
  ];

  const managedInvoiceColumns = [
    { key: 'date', label: 'Invoice Date', onRender: renderUnmanagedColumn, sortable: true, tooltip: 'Click to sort' },
    { key: 'total', label: 'Amount', onRender: renderUnmanagedColumn, isNumber: true, sortable: true, tooltip: 'Click to sort' },
    { key: 'invoiceNumber', label: 'Invoice #', onRender: renderUnmanagedColumn },
    { key: 'contactName', label: 'Company', onRender: renderUnmanagedColumn },
    { key: 'dateDue', label: 'Due Date', onRender: renderUnmanagedColumn, isNumber: true, sortable: true, tooltip: 'Click to sort' },
    { key: 'daysToPay', label: 'Days to Pay', isNumber: true, onRender: renderUnmanagedColumn, sortable: true, tooltip: 'Click to sort' },
    { key: 'status', label: 'Status', onRender: renderUnmanagedColumn },
    { key: 'counterParty', label: 'Provider', onRender: renderUnmanagedColumn },
    { key: 'actions', label: 'Actions', onRender: renderUnmanagedColumn, align: 'center' },
  ];

  const recCurrencyImpactColumns = [
    {
      key: 'currentCost',
      label: 'Current Value',
      onRender: renderImpactColumn,
      isNumber: true,
      tooltip: 'Cost In Home Currency as per Forward Rate',
    },
    { key: 'currentRate', label: 'Forward Rate', onRender: renderImpactColumn, isNumber: true, tooltip: 'Forward Rate for Due Date' },
    { key: 'lossOrGain', label: 'Gain / Loss', onRender: renderImpactColumn, isNumber: true, tooltip: 'Gain/Loss as per market rate' },
    { key: 'counterParty', label: 'Provider', onRender: renderUnmanagedColumn },
  ];

  const recUnmanagedInvoiceColumns = [
    { key: 'select', label: 'Select', onRender: renderUnmanagedColumn },
    { key: 'total', label: 'Amount', onRender: renderUnmanagedColumn, isNumber: true, sortable: true, tooltip: 'Click to sort' },
    { key: 'dateDue', label: 'Expected Date', onRender: renderUnmanagedColumn, isNumber: true, sortable: true, tooltip: 'Click to sort' },
    { key: 'daysToPay', label: 'Days to Receive', isNumber: true, onRender: renderUnmanagedColumn, sortable: true, tooltip: 'Click to sort' },
  ];

  const recOptimisedInvoiceColumns = [
    {
      key: 'targetCost',
      label: 'Target Value',
      onRender: renderOptimisedColumn,
      isNumber: true,
      tooltip: 'Cost That Can be Targeted with Fluenccy Savings Plan',
    },
    {
      key: 'optimisedRate',
      label: 'Savings Rate',
      isNumber: true,
      onRender: renderOptimisedColumn,
      tooltip: 'Target Forward Rate for Expected Date',
    },
    { key: 'saving', label: 'Saving', onRender: renderOptimisedColumn, isNumber: true, tooltip: 'Difference between Current cost and Targeted cost' },
    { key: 'actions', label: 'Actions', onRender: renderOptimisedColumn, align: 'center' },
  ];

  const recManagedInvoiceColumns = [
    { key: 'date', label: 'Invoice Date', onRender: renderUnmanagedColumn, sortable: true, tooltip: 'Click to sort' },
    { key: 'total', label: 'Amount', onRender: renderUnmanagedColumn, isNumber: true, sortable: true, tooltip: 'Click to sort' },
    { key: 'invoiceNumber', label: 'Invoice #', onRender: renderUnmanagedColumn },
    { key: 'contactName', label: 'Company', onRender: renderUnmanagedColumn },
    { key: 'dateDue', label: 'Expected Date', onRender: renderUnmanagedColumn, isNumber: true, sortable: true, tooltip: 'Click to sort' },
    { key: 'daysToPay', label: 'Days to Receive', isNumber: true, onRender: renderUnmanagedColumn, sortable: true, tooltip: 'Click to sort' },
    { key: 'status', label: 'Status', onRender: renderUnmanagedColumn },
    { key: 'counterParty', label: 'Provider', onRender: renderUnmanagedColumn },
    { key: 'actions', label: 'Actions', onRender: renderUnmanagedColumn, align: 'center' },
  ];

  const maxHeight = useMemo(() => {
    return max([optimiseHeight, detailsheight, impactHeight]);
  }, [optimiseHeight, detailsheight, impactHeight]);

  const detailsRecords = useMemo(
    () =>
      selectedInvoiceId
        ? calculateCurrencyImpact.filter((r) => r.isParent && r.invoiceId === selectedInvoiceId)
        : calculateCurrencyImpact.filter((r) => r.isParent),
    [calculateCurrencyImpact, selectedInvoiceId]
  );
  const recordsWithOptions = useMemo(
    () =>
      selectedInvoiceId
        ? calculateCurrencyImpact.filter((r) => r.invoiceId === selectedInvoiceId)
        : calculateCurrencyImpact.filter((r) => r.isParent),
    [calculateCurrencyImpact, selectedInvoiceId]
  );

  const renderContent = () => {
    return (
      <>
        <div className="w-1/3 p-2" style={{ width: '35%' }}>
          {loading ? (
            <PlanTableSkeleton rows={5} columns={4} />
          ) : isEmpty(payable) && !loading ? (
            <div className="flex justify-center text-gray-600 py-6 border-2 border-dashed items-center h-48 mt-20">
              <div>No invoices</div>
            </div>
          ) : (
            <PlanTable
              draggable={false}
              rows={detailsRecords}
              columns={mode === 'receivables' ? recUnmanagedInvoiceColumns : unmanagedInvoiceColumns}
              sortColumns={(col, format) => onSort(leftInvoices, col, format)}
              title="DETAILS"
              onTableHeaderHeightChange={setDetailsHeight}
              height={maxHeight}
              sortBy={sortBy}
              sortDir={sortDir}
              useRecordHeight
            />
          )}
        </div>
        <div className="w-1/3 p-2" style={{ width: '30%' }}>
          {loading ? (
            <PlanTableSkeleton rows={5} columns={4} />
          ) : isEmpty(payable) && !loading ? (
            <div className="flex justify-center text-gray-600 py-6 border-2 border-dashed items-center h-48 mt-20">
              <div>No invoices</div>
            </div>
          ) : (
            <PlanTable
              rows={recordsWithOptions}
              columns={mode === 'receivables' ? recCurrencyImpactColumns : currencyImpactColumns}
              draggable={false}
              title="Current Impact"
              onTableHeaderHeightChange={setImpactHeight}
              height={maxHeight}
              sortColumns={(col, format) => onSort(recordsWithOptions, col, format)}
              sortBy={sortBy}
              sortDir={sortDir}
            />
          )}
        </div>
        <div className="w-1/3 p-2" style={{ width: '35%' }}>
          {loading ? (
            <PlanTableSkeleton rows={5} columns={4} />
          ) : isEmpty(payable) && !loading ? (
            <div className="flex justify-center text-gray-600 py-6 border-2 border-dashed items-center h-48 mt-20">
              <div>No invoices</div>
            </div>
          ) : (
            <PlanTable
              draggable={false}
              rows={recordsWithOptions}
              columns={mode === 'receivables' ? recOptimisedInvoiceColumns : optimisedInvoiceColumns}
              bodyRowClass="bg-blue-200"
              title="SAVINGS PLAN"
              onTableHeaderHeightChange={setOptimiseHeight}
              height={maxHeight}
              sortColumns={(col, format) => onSort(recordsWithOptions, col, format)}
              sortBy={sortBy}
              sortDir={sortDir}
            />
          )}
        </div>
      </>
    );
  };

  return (
    <div className="bg-white">
      <div className="flex justify-center">
        <Select options={options} value={mode} onChange={setMode} isDisabled={false} style={{ width: '200px' }} />
      </div>
      <FluenccyLoader loop={fetchingLiveRate} className="absolute z-1 w-12" style={{ position: 'absolute', zIndex: 1 }} />

      <div className="w-full flex flex-col pt-10">
        <div className="w-full flex flex-col px-8">
          <div className="flex justify-around w-full bg-white rounded-lg overflow-auto" style={{ maxHeight: '500px' }}>
            {renderContent()}
          </div>
        </div>
        {managedInvoices.length > 0 && (
          <div className="w-full flex flex-col px-8 py-6">
            <div className="flex h-full w-full bg-white px-2 rounded-lg">
              <div className="w-full">
                {loading ? (
                  <PlanTableSkeleton rows={5} columns={4} />
                ) : isEmpty(managedInvoices) && !loading ? (
                  <div className="flex justify-center text-gray-600 py-6 border-2 border-dashed items-center h-48 mt-20">
                    <div>No invoices</div>
                  </div>
                ) : (
                  <PlanTable
                    draggable={false}
                    rows={managedInvoices}
                    columns={mode === 'receivables' ? recManagedInvoiceColumns : managedInvoiceColumns}
                    title="MANAGED INVOICES"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
