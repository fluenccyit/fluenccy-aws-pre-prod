import React, { memo, useEffect, useState, useMemo, useRef } from 'react';
import { isEmpty, differenceBy, orderBy, max, groupBy, isUndefined } from 'lodash';
import { localStorageService, useToast, useModal, FlagIcon, Badge } from '@client/common';
import { PlanTable, ActionTooltipContent } from '@client/plan/IMS/components';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { PlanTableSkeleton } from '@client/plan';
import moment from 'moment';
import { jStat } from 'jstat';
import { ScheduleModal } from '../components/schedule.component';
import { Dashboard } from '@client/plan/IMS/components';
import { format } from '@client/utils/number';
import { getVariableProbability } from '@client/utils/helper';

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

export const PlanPayablePageContainer = memo(
  ({
    currency,
    duration,
    entitlements,
    showDashboard,
    liveData,
    organisation,
    currencies,
    setCurrencies,
    isOpen,
    onModalClose,
    setLiveData,
    togglePage,
    setHasInvoices,
    loading,
    setLoading,
    mode,
    setHomeCurrencies,
    onChangeMode,
    initialLoads,
    initialManagedLoads,
    setInitialLoads,
    setInitialManagedLoads,
  }) => {
    const intervalRef = useRef(null);
    const history = useHistory();
    const [payable, setPayable] = useState();
    const [marginPercentageFromAPI, setMarginPercentage] = useState([]);
    const { addToast } = useToast();
    const [stdDev, setStdDev] = useState({});
    const [managedInvoices, setManagedInvoices] = useState();
    const [optimisedRates, setOptimisedRates] = useState({});
    const [fosPercents, setFOSPercents] = useState({});
    const [detailsheight, setDetailsHeight] = useState(40.5);
    const [impactHeight, setImpactHeight] = useState(40.5);
    const [optimiseHeight, setOptimiseHeight] = useState(40.5);
    const [sortBy, setSortBy] = useState('date');
    const [sortDir, setSortDir] = useState('asc');
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
      if (payable?.length || managedInvoices?.length) {
        setHasInvoices(true);
        setLoading(false);
      } else if (!isUndefined(payable) && payable?.length === 0 && !isUndefined(managedInvoices) && managedInvoices?.length === 0) {
        setHasInvoices(false);
        setLoading(false);
      }
    }, [payable, managedInvoices]);

    useEffect(() => {
      if (marginPercentageFromAPI.length) {
        marginPercentageVal = marginPercentageFromAPI[0].marginPercentage;
      }
    }, [marginPercentageFromAPI]);

    useEffect(() => {
      if (currencies.length) {
        const data = currencies.reduce((acc, c) => {
          acc[c.currencyCode] = calculateFOSPercentages(c);
          return acc;
        }, {});
        setFOSPercents(data);
        calculateStddev();
      }
    }, [currencies, liveData, entitlements]);

    // to set default mode if anyone have records
    useEffect(() => {
      const { payables, receivables, payablesCount } = initialLoads;
      const { payablesManaged, receivablesManaged, payablesManagedCount } = initialManagedLoads;
      if (payables && payablesManaged && payablesManagedCount === 0 && payablesCount === 0 && !receivables && !receivablesManaged) {
        onChangeMode('receivables');
      }
    }, [initialLoads, initialManagedLoads]);

    useEffect(() => {
      getInvoice();
      getInvoice('managed');
    }, [currency, duration, organisation?.id, mode]);

    useEffect(() => {
      if (!isOpen) {
        getInvoice('managed');
        getInvoice('unmanaged');
      }
    }, [isOpen]);

    useEffect(() => {
      if (!isUndefined(managedInvoices)) {
        setManagedInvoices(getImpactInvoices(managedInvoices));
      }
    }, [liveData, optimisedRates]);

    useEffect(() => {
      if (!isEmpty(stdDev) && !isEmpty(currencies)) {
        const optimisedRates = payable?.reduce((acc, invoice) => ({ ...acc, [`${invoice.invoiceId}`]: getOptimisedPayableRate(invoice) }), {});
        setOptimisedRates(optimisedRates || []);
      }
    }, [stdDev, currencies, liveData, payable, organisation?.variableProbability]);

    const leftInvoices = useMemo(() => differenceBy(payable || [], managedInvoices || [], 'invoiceId'), [payable, managedInvoices]);

    useEffect(() => {
      const isAnyUnapprovedInvoices = managedInvoices?.some((o) => o.isApproved === 'false');
      if (!isAnyUnapprovedInvoices && leftInvoices.length === 0) {
        clearInterval(intervalRef.current);
      }
    }, [leftInvoices, managedInvoices]);

    const openNotificationWithIcon = (type = 'success', title = '', description = 'Success', style = {}) => {
      addToast(description, type, 'fixed');
    };

    const getOptimisedPayableRate = (invoice, rates = null) => {
      let diff = moment(invoice.dateDue).diff(moment(), 'days');

      if (diff > 0) {
        const currencyPair = `${organisation?.currency}${invoice.currencyCode}`;
        const prob = 1 - Number(entitlements[getVariableProbability(organisation)]) / 100;
        const gammaInv = Math.sqrt(jStat.gamma.inv(prob, 0.5, 1.0));
        const annualAdj = Math.sqrt(DAYS_FOR_CALCULATIONS) * stdDev[currencyPair];
        const interinCal = gammaInv * Math.sqrt(Math.PI);
        const daysToPay = diff;
        var payable = 0.0;
        payable =
          Math.pow(1.0 + annualAdj, interinCal * Math.sqrt(daysToPay / DAYS_FOR_CALCULATIONS)) *
          (rates ? rates[currencyPair] : liveData[currencyPair]);

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
        return payable;
      } else {
        return 0;
      }
    };

    const calculateStddev = () => {
      const stdDevByCurrency = currencies.reduce((acc, c) => {
        const logs = [];
        const currencyPair = `${organisation?.currency}${c.currencyCode}`;
        const d = [...c.rates.map((r) => r.last), liveData[currencyPair]];
        for (let i = 0; i < d.length - 1; i++) {
          logs.push(Math.log(d[i + 1] / d[i]));
        }
        acc[currencyPair] = getStdDev(logs);
        return acc;
      }, {});
      setStdDev(stdDevByCurrency);
    };

    const getImpactInvoices = (data = []) => {
      const records = data.map((r) => {
        const calcMarginPercentage = parseFloat(forwardMarginPercentage) / 100;
        const currencyPair = `${organisation?.currency}${r.currencyCode}`;
        console.log('Live Rate: ', liveData[currencyPair]);
        const spotRate = liveData[currencyPair];

        const forwardPoint = forwardPoints.current[r.currencyCode]?.find(
          (rec) => moment(r.dateDue).format('MMM') === rec.month && moment(r.dateDue).format('YYYY') === rec.year
        );
        const clientSpotRate = spotRate * (1 - calcMarginPercentage) + Number(forwardPoint?.forwardPoints || 0);
        const currentCost = Number(r.total || 0) / clientSpotRate;
        const lossOrGain = Number(r.total || 0) / Number(r.currencyRate || 0) - Number(currentCost || 0);
        const daysToPay = Math.abs(moment(r.dateDue).diff(moment(), 'days'));
        const potentialLoss = lossOrGain - 1 * Math.sqrt(daysToPay) * Number(stdDev[currencyPair] || 0) * Number(currentCost || 0);
        return {
          ...r,
          currentCost,
          lossOrGain,
          potentialLoss,
          currentRate: clientSpotRate,
        };
      });
      return records;
    };
    const calculateCurrencyImpact = useMemo(() => {
      return getImpactInvoices(leftInvoices);
    }, [liveData, leftInvoices, forwardPoints]);

    const calculateFOSPercentages = (currency) => {
      const currencyPair = `${organisation?.currency}${currency.currencyCode}`;
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

    const getOptimisedInvoices = (data = []) => {
      const calculateCurrencyImpact = getImpactInvoices(data);
      const records = data.map((r) => {
        const currencyPair = `${organisation?.currency}${r.currencyCode}`;
        const spotRate = liveData[currencyPair];
        const orderPer = 0.5;
        const marginPer = parseFloat(limitOrderMarginPercentage) / 100;
        const orderProb = parseFloat(entitlements[getVariableProbability(organisation)]) / 100;
        const forwardPer = 0.25;
        let optimisedRate = optimisedRates[r.invoiceId];
        const clientSpotRate = optimisedRate == 0 ? spotRate : spotRate * (1 - marginPer);
        const fosPercent = fosPercents[r.currencyCode] || {};
        let optimisedRateForCalc = 0;
        if (optimisedRate == 0) {
          optimisedRateForCalc = spotRate;
        } else if (!optimisedRate) {
          optimisedRateForCalc = r.buyingSchedule?.optimizedRate;
        } else {
          optimisedRateForCalc = optimisedRate;
        }

        var impactRecord = calculateCurrencyImpact.find((cr) => cr.invoiceId === r.invoiceId);
        var potentialLoss = impactRecord?.potentialLoss || 0.0;
        var saving = 0;
        var lossRed = 0;
        var targetCost = 0;
        if (optimisedRate != 0) {
          targetCost =
            Number(r.total || 0) /
            (clientSpotRate * (fosPercent.forwardPercent / 100) +
              (fosPercent.orderPercent / 100 + fosPercent.spotPercent / 100) * optimisedRateForCalc);
          saving = impactRecord.currentCost - targetCost;
          lossRed = potentialLoss - (orderProb * (1 - orderPer - forwardPer) * potentialLoss + (1 - orderProb) * (1 - forwardPer) * potentialLoss);
        } else {
          targetCost = impactRecord.currentCost;
        }

        return {
          ...r,
          targetCost,
          saving,
          lossRed,
          optimisedRate,
        };
      });
      return records;
    };
    const calculateOptimisedInvoices = useMemo(() => {
      return getOptimisedInvoices(leftInvoices);
    }, [liveData, leftInvoices, optimisedRates]);

    const getInvoice = (type = 'unmanaged') => {
      setLoading(true);
      const { payables, receivables } = initialLoads;
      const { payablesManaged, receivablesManaged } = initialManagedLoads;
      try {
        try {
          const data = new FormData();

          let url = `/api/hedge/get-invoices`;
          const token = localStorageService.getItem('firebase-token');
          const headers = {
            authorization: token,
          };

          const orgId = organisation?.id;
          const tenantId = organisation?.tenant.id;
          axios
            .post(
              url,
              {
                tenantId: tenantId,
                orgId: orgId,
                currency: currency,
                filter: parseInt(duration, 10),
                type,
                baseCurrency: organisation?.currency,
                mode,
              },
              {
                headers: headers,
              }
            )
            .then((res) => {
              forwardPoints.current = groupBy(
                [...Object.values(forwardPoints.current).flat(), ...res.data.data.forwardPoints],
                ({ tradeCurrency }) => tradeCurrency
              );
              if (type === 'unmanaged') {
                setPayable([...res.data.data.invoices]);
                setCurrencies(res.data.data.currencies);
                setHomeCurrencies(res.data.data.homeCurrencies);
                if (!payables) {
                  //to track both mode loaded and tracking count
                  setInitialLoads({ ...initialLoads, payablesCount: res.data.data.invoices.length, payables: true });
                }
              } else {
                setManagedInvoices([...res.data.data.invoices]);
                if (!payablesManaged) {
                  setInitialManagedLoads({ ...initialManagedLoads, payablesManagedCount: res.data.data.invoices.length, payablesManaged: true });
                }
              }

              setMarginPercentage(res.data.data.marginPercentage);
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
          const currencyPair = `${organisation?.currency}${invoice.currencyCode}`;
          const payload = {
            orgId,
            tenantId,
            type,
            manageType,
            invoiceId: invoice.invoiceId,
            forwardRate: liveData[currencyPair],
            optimizedRate: optimisedRates[invoice.invoiceId],
          };

          axios.post(url, payload, { headers: headers }).then((res) => {
            getInvoice('unmanaged');
            getInvoice('managed');
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

    const onApprove = async (invoiceId: string, rest: object) => {
      try {
        try {
          let url = `/api/hedge/approve-invoice`;
          const token = localStorageService.getItem('firebase-token');
          const headers = {
            authorization: token,
          };

          const orgId = organisation?.id;
          const tenantId = organisation?.tenant.id;

          const payload = {
            orgId,
            tenantId,
            invoiceId,
            mode,
            ...rest,
          };

          axios.post(url, payload, { headers: headers }).then((res) => {
            const updatedInvoices = managedInvoices?.map((minv) => {
              if (minv.invoiceId === invoiceId) {
                return res.data.data.invoiceDetails;
              }
              return minv;
            });
            setManagedInvoices(updatedInvoices || []);
          });
          ``;
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

    const onByingSchedule = (payload, cb = () => {}) => {
      const url = '/api/hedge/update-buying-schedule';
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        authorization: token,
      };
      axios
        .post(url, payload, {
          headers: headers,
        })
        .then((res) => {
          const updatedInvoices = managedInvoices?.map((minv) => {
            if (minv.invoiceId === payload.invoiceId) {
              return res.data.data;
            }
            return minv;
          });
          setManagedInvoices(updatedInvoices || []);
          handleOptimisedInvoiceSelect(res.data.data, 'review');
        })
        .catch((e) => {
          console.log(e);
        })
        .finally(cb);
    };

    const onToggleHedgeEverything = (payload = {}) => {
      setHedgingEverything(true);
      try {
        onByingSchedule(payload, () => setHedgingEverything(false));
      } catch (e) {
        setHedgingEverything(false);
        console.error(e);
      }
    };

    const handleOptimisedInvoiceSelect = (invoice, value) => {
      clearInterval(intervalRef.current);
      switch (value) {
        case 'review':
          setWidth('40%');
          openModal(
            <ScheduleModal
              title="Buying Schedule"
              fosPercents={fosPercents}
              marginPerc={marginPercentageFromAPI[0]}
              liveRates={liveData}
              getOptimisedPayableRate={getOptimisedPayableRate}
              showFooter
              onApprove={onApprove}
              invoice={invoice}
              organisation={organisation}
              onToggleHedgeEverything={onToggleHedgeEverything}
              isHedgingEverything={hedgingEverything}
              currencies={currencies}
              onClose={onModalClose}
              setRates={setLiveData}
              onUpdateBuyingSchedule={onByingSchedule}
              entitlements={entitlements}
            />
          );
          return;
        case 'monitor':
          setWidth('40%');
          openModal(
            <ScheduleModal
              title="Monitoring"
              fosPercents={fosPercents}
              marginPerc={marginPercentageFromAPI[0]}
              liveRates={liveData}
              getOptimisedPayableRate={getOptimisedPayableRate}
              onApprove={onApprove}
              invoice={invoice}
              organisation={organisation}
              isHedgingEverything={hedgingEverything}
              currencies={currencies}
              onClose={onModalClose}
              setRates={setLiveData}
              entitlements={entitlements}
            />
          );
          return;
        case 'Plan':
        case 'Forward':
          updateInvoice(value, 'managed', invoice);
          return;
        case 'remove':
          updateInvoice('', 'unmanaged', invoice);
          return;
        case 'managedInCMS':
          history.push('/currency-management', { tab: 'pricing', mode });
          return;
      }
    };

    const renderBadge = (value) => {
      if (isNaN(value)) return '-';
      return (
        <Badge variant={value > 0 ? 'success' : 'danger'}>
          {value > 0 ? '+' : ''}
          {format(value, 2, 3)}
        </Badge>
      );
    };

    const renderOptimisedColumn = (r, column) => {
      if (column === 'actions') {
        const data = {
          ...r,
          currentCost: calculateCurrencyImpact.find((record) => record.invoiceId === r.invoiceId).currentCost,
          optimisedRate: calculateOptimisedInvoices.find((record) => record.invoiceId === r.invoiceId).optimisedRate,
        };
        return (
          <ActionTooltipContent data={data} onSelect={handleOptimisedInvoiceSelect.bind(this, r)} currency={organisation?.currency} width="415px" />
        );
      }

      if (column === 'targetCost') {
        return (
          <span className="flex items-center " style={{ color: '#706A7A', fontWeight: 'bold' }}>
            {isNaN(r[column]) ? (
              '-'
            ) : (
              <>
                <FlagIcon currency={organisation.currency} style={cuurencyFlagStyle} /> {format(r[column], 2, 3)}
              </>
            )}
          </span>
        );
      }

      if (column === 'saving') {
        return renderBadge(r[column]);
      }

      if (column === 'lossRed') {
        return <Badge variant={r[column] > 0 ? 'gray' : 'gray'}>{format(Math.abs(r[column]), 2, 3)}</Badge>;
      }

      if (column === 'optimisedRate') {
        let rt = format(r[column], 5, 3);
        return rt == 0 ? '-' : rt;
      }

      if (column === 'inversedRate') {
        let rt = format(r['optimisedRate'], 5, 3);
        return rt == 0 ? '-' : format(1 / Number(r['optimisedRate']), 5, 3);
      }

      return r ? `${format(r[column], 2, 3)}` : null;
    };
    const renderImpactColumn = (r, column) => {
      if (r) {
        if (column === 'currentCost') {
          return (
            <span className="flex items-center " style={{ color: '#706A7A', fontWeight: 'bold' }}>
              {isNaN(r[column]) ? (
                '-'
              ) : (
                <>
                  <FlagIcon currency={organisation.currency} style={cuurencyFlagStyle} /> {format(r[column], 2, 3)}
                </>
              )}
            </span>
          );
        }
        if (column === 'currentRate') {
          return format(Number(r[column] || 0), 5, 3);
        }

        if (column === 'inverseRate') {
          return r.currentRate ? format(1 / Number(r.currentRate), 5, 3) : 0;
        }
        return renderBadge(r[column]);
      }
      return null;
    };
    const renderUnmanagedColumn = (r, column) => {
      switch (column) {
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
          if (r.isPricing) {
            options.push({ label: 'Managed in CMS', value: 'managedInCMS' });
          } else if (r.isApproved === 'true') {
            options.push({ label: 'Monitor', value: 'monitor' });
          } else if (r.manage_type === 'Plan' || r.manage_type === 'Forward') {
            options.push({ label: 'Review', value: 'review' });
            options.push({ label: 'Remove', value: 'remove' });
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
        if (colName === 'dateDue') {
          value = moment().diff(moment(d.dateDue), 'days');
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
      {
        key: 'currentCost',
        label: 'Current Cost',
        onRender: renderImpactColumn,
        isNumber: true,
        tooltip: 'Cost In Home Currency as per Forward Rate',
      },
      { key: 'currentRate', label: 'Forward Rate', onRender: renderImpactColumn, isNumber: true, tooltip: 'Forward Rate for Due Date' },
      { key: 'inverseRate', label: 'Inversed Rate', onRender: renderImpactColumn, isNumber: true, hide: !entitlements.showInversedRate },
      { key: 'lossOrGain', label: 'Gain / Loss', onRender: renderImpactColumn, isNumber: true, tooltip: 'Gain/Loss as per market rate' },
      {
        key: 'potentialLoss',
        label: 'Potential Loss',
        onRender: renderImpactColumn,
        isNumber: true,
        tooltip: 'Potential loss for the current cost as per market rate',
      },
    ];

    const unmanagedInvoiceColumns = [
      { key: 'date', label: 'Invoice Date', onRender: renderUnmanagedColumn, sortable: true, tooltip: 'Click to sort' },
      { key: 'total', label: 'Amount', onRender: renderUnmanagedColumn, isNumber: true, sortable: true, tooltip: 'Click to sort' },
      { key: 'invoiceNumber', label: 'Invoice #', onRender: renderUnmanagedColumn },
      { key: 'contactName', label: 'Company', onRender: renderUnmanagedColumn },
      { key: 'dateDue', label: 'Due Date', onRender: renderUnmanagedColumn, sortable: true, tooltip: 'Click to sort' },
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
      { key: 'inversedRate', label: 'Inversed Rate', isNumber: true, onRender: renderOptimisedColumn, hide: !entitlements.showInversedRate },
      {
        key: 'saving',
        label: 'Saving',
        onRender: renderOptimisedColumn,
        isNumber: true,
        tooltip: 'Difference between Current cost and Targeted cost',
      },
      {
        key: 'lossRed',
        label: 'Loss Reduction',
        onRender: renderOptimisedColumn,
        isNumber: true,
        tooltip: 'Loss reduction with Fluenccy Optimise Plan',
      },
      { key: 'actions', label: 'Actions', onRender: renderOptimisedColumn, align: 'center' },
    ];

    const managedInvoiceColumns = [
      ...unmanagedInvoiceColumns,
      { key: 'status', label: 'Status', onRender: renderUnmanagedColumn },
      { key: 'actions', label: 'Actions', onRender: renderUnmanagedColumn, align: 'center' },
    ];

    const maxHeight = useMemo(() => {
      return max([optimiseHeight, detailsheight, impactHeight]);
    }, [optimiseHeight, detailsheight, impactHeight]);

    const renderPayableContent = () => {
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
                rows={leftInvoices}
                columns={unmanagedInvoiceColumns}
                sortColumns={(col, format) => onSort(leftInvoices, col, format)}
                title="DETAILS"
                onTableHeaderHeightChange={setDetailsHeight}
                height={maxHeight}
                sortBy={sortBy}
                sortDir={sortDir}
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
                rows={calculateCurrencyImpact}
                columns={currencyImpactColumns}
                draggable={false}
                title="Current Impact"
                onTableHeaderHeightChange={setImpactHeight}
                height={maxHeight}
                sortColumns={(col, format) => onSort(calculateCurrencyImpact, col, format)}
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
                rows={calculateOptimisedInvoices}
                columns={optimisedInvoiceColumns}
                bodyRowClass="bg-blue-200"
                title="SAVINGS PLAN"
                onTableHeaderHeightChange={setOptimiseHeight}
                height={maxHeight}
                sortColumns={(col, format) => onSort(calculateOptimisedInvoices, col, format)}
                sortBy={sortBy}
                sortDir={sortDir}
              />
            )}
          </div>
        </>
      );
    };

    return (
      <>
        {showDashboard ? (
          <Dashboard
            onBack={togglePage}
            onApprove={onApprove}
            organisation={organisation}
            managedInvoices={managedInvoices?.filter((i) => !i.isPricing) || []}
            currencyImpactInvoices={calculateCurrencyImpact}
            unmanagedInvoices={leftInvoices.filter((i) => !i.isPricing)}
            optimisedInvoices={[...calculateOptimisedInvoices, ...(managedInvoices || [])].filter((i) => !i.isPricing)}
            currencies={currencies}
            getOptimisedPayableRate={getOptimisedPayableRate}
            marginPercentageVal={marginPercentageFromAPI[0]}
            liveData={liveData}
            fosPercents={fosPercents}
            handleOptimisedInvoiceSelect={handleOptimisedInvoiceSelect}
            getOptimisedInvoices={getOptimisedInvoices}
            setRates={setLiveData}
            mode={mode || ''}
            onChangeMode={onChangeMode}
            entitlements={entitlements}
          />
        ) : (
          <div className="w-full flex flex-col pt-10">
            <div className="w-full flex flex-col px-8 pb-8 pt-14">
              <div className="flex justify-around w-full bg-white rounded-lg overflow-auto" style={{ maxHeight: '500px' }}>
                {renderPayableContent()}
              </div>
            </div>
            {managedInvoices?.length > 0 && (
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
                      <PlanTable draggable={false} rows={managedInvoices} columns={managedInvoiceColumns} title="MANAGED INVOICES" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </>
    );
  }
);
