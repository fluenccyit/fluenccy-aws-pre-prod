import React, { memo, useEffect, useState, useMemo, useRef } from 'react';
import { isEmpty, differenceBy, orderBy, max, groupBy, isUndefined } from 'lodash';
import { localStorageService, useToast, useModal, FlagIcon, Badge, APOLLO_ERROR_MESSAGE, Select } from '@client/common';
import { PlanTable, ActionTooltipContent } from '@client/plan/IMS/components';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { PlanTableSkeleton } from '@client/plan';
import moment from 'moment';
import { jStat } from 'jstat';
import { format } from '@client/utils/number';
import { getVariableProbability } from '@client/utils/helper';
import { DAYS_FOR_CALCULATIONS, RECEIVABLE_EDITABLE_COLUMNS, getStdDev, newInvoice } from '../utils';
import DatePicker from 'react-datepicker';
import { AUTH_ROUTES } from '@client/auth';
import { EmptyContainer } from '../components/empty.component';
import { SUPPORTED_CURRENCIES } from '@shared/rate';

var marginPercentageVal = 0.0;

const cuurencyFlagStyle = { width: '22px', height: '22px', style: { marginRight: '5px' } };

export const QuoteReceivablePageContainer = memo(
  ({
    currency,
    duration,
    entitlements,
    liveData,
    organisation,
    currencies,
    setCurrencies,
    onModalClose,
    setLiveData,
    loading,
    setLoading,
    mode,
    setHomeCurrencies,
    homeCurrency,
    homeCurrencies,
    addNew,
    clearMode,
    editMode,
    generateQuote,
    deleteMode,
    onGenerateQuoteSuccess,
    showManaged = false,
    toggleClear,
    filterBy,
    onDeleteNewRecord,
    onAddNew,
    showImpactAndSavings = false,
  }) => {
    const intervalRef = useRef(null);
    const history = useHistory();
    const [payable, setPayable] = useState([]);
    const [marginPercentageFromAPI, setMarginPercentage] = useState([]);
    const { addToast } = useToast();
    const [optimisedRates, setOptimisedRates] = useState({});
    const [fosPercents, setFOSPercents] = useState({});

    const [detailsheight, setDetailsHeight] = useState(40.5);
    const [impactHeight, setImpactHeight] = useState(40.5);
    const [optimiseHeight, setOptimiseHeight] = useState(40.5);
    const forwardPoints = useRef({});
    const lastProcessedAddNew = useRef(0);

    const { forwardMarginPercentage = 0.0, limitOrderMarginPercentage = 0.0 } = marginPercentageFromAPI[0] || {};

    const openNotificationWithIcon = (type = 'success', title = '', description = 'Success', style = {}) => {
      addToast(description, type, 'fixed');
    };

    useEffect(() => {
      getInvoice();
    }, [currency, duration, organisation?.id, mode, showManaged, filterBy]);

    useEffect(() => {
      if (generateQuote) {
        const invalidEntry = payable.some((r) => {
          let isAllFieldBlank = RECEIVABLE_EDITABLE_COLUMNS.every((field) => !r[field]);
          if (isAllFieldBlank) return false;
          return RECEIVABLE_EDITABLE_COLUMNS.some((field) => !r[field]);
        });

        if (invalidEntry) {
          openNotificationWithIcon('danger', 'Error', 'Please enter in all fields.');
        }
        updateInvoices();
        return onGenerateQuoteSuccess(!invalidEntry);
      }
    }, [generateQuote]);

    useEffect(() => {
      // Reset ref when addNew is reset to 0
      if (addNew === 0) {
        lastProcessedAddNew.current = 0;
        return;
      }
      
      // Only process if addNew has changed and is a valid value
      if (addNew && addNew !== lastProcessedAddNew.current) {
        setPayable((prevPayable) => {
          // Check if invoice with this addNew value already exists
          const isAdded = prevPayable.find((r) => r.id === addNew);
          if (!isAdded) {
            const lastInvoice = prevPayable[prevPayable.length - 1] || {};
            const newId = (lastInvoice.id || 0) + 1;
            lastProcessedAddNew.current = addNew;
            return [...prevPayable, { ...newInvoice, id: newId }];
          }
          return prevPayable;
        });
      }
    }, [addNew]);

    useEffect(() => {
      if (deleteMode) {
        const payables = payable.filter((p) => !p.isNew);
        setPayable(payables);
        lastProcessedAddNew.current = 0; // Reset ref when deleting
      }
    }, [deleteMode]);

    useEffect(() => {
      if (!editMode) {
        const payables = payable.map((r) => ({ ...r, isNew: false }));
        setPayable(payables);
      }
    }, [editMode]);

    useEffect(() => {
      if (clearMode) {
        bulkDelete();
        lastProcessedAddNew.current = 0; // Reset ref when clearing
      }
    }, [clearMode]);

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
      }
    }, [currencies, liveData, entitlements]);

    useEffect(() => {
      if (!isEmpty(currencies)) {
        const optimisedRates =
          payable?.reduce((acc, invoice) => ({ ...acc, [`${invoice.invoiceId || invoice.id}`]: getOptimisedPayableRate(invoice) }), {}) || [];
        setOptimisedRates(optimisedRates);
      }
    }, [currencies, liveData, payable, organisation?.variableProbability]);

    const getOptimisedPayableRate = (invoice, rates = null) => {
      let diff = moment(invoice.dateDue).diff(moment(), 'days');

      if (diff > 0) {
        const currencyPair = `${invoice.homeCurrencyCode}${invoice.currencyCode}`;
        const prob = 1 - Number(entitlements[getVariableProbability(organisation)]) / 100;
        const gammaInv = Math.sqrt(jStat.gamma.inv(prob, 0.5, 1.0));
        const annualAdj = Math.sqrt(DAYS_FOR_CALCULATIONS) * calculateStddev(invoice);
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
        var retPayable = parseFloat(payable).toFixed(5);
        if (!isNaN(payable) && payable > 0.0) {
          payable = format(Number(retPayable), 5, 3);
        }

        const clientSpotRate = getClientSpotRate(invoice);
        var newPayableRate = format(Number(-(format(Number(payable), 5, 3) - format(Number(clientSpotRate), 5, 3)) + Number(clientSpotRate)), 5, 3);

        return newPayableRate;
      } else {
        return 0;
      }
    };

    const getSpotRate = (r) => {
      const currencyPair = `${r.homeCurrencyCode}${r.currencyCode}`;
      console.log('Live Rate: ', liveData[currencyPair]);
      return format(Number(liveData[currencyPair]), 5, 3);
    };

    const getClientSpotRate = (r) => {
      const calcMarginPercentage = parseFloat(forwardMarginPercentage) / 100;
      const spotRate = getSpotRate(r);

      const forwardPoint = forwardPoints.current[r.currencyCode]?.find(
        (rec) => moment(r.dateDue).format('MMM') === rec.month && moment(r.dateDue).format('YYYY') === rec.year
      );
      const value = format(Number(spotRate * (1 + calcMarginPercentage) + Number(forwardPoint?.forwardPoints || 0)), 5, 3);
      return isNaN(value) ? 0 : value;
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

    const getImpactInvoices = (data = []) => {
      const records = data.map((r) => {
        const calcMarginPercentage = parseFloat(forwardMarginPercentage) / 100;
        const currencyPair = `${r.homeCurrencyCode}${r.currencyCode}`;

        const spotRate = format(Number(liveData[currencyPair]), 5, 3);

        const forwardPoint = forwardPoints.current[r.currencyCode]?.find(
          (rec) => moment(r.dateDue).format('MMM') === rec.month && moment(r.dateDue).format('YYYY') === rec.year
        );
        const clientSpotRate = Number(spotRate * (1 + calcMarginPercentage) + Number(forwardPoint?.forwardPoints || 0));
        const currentCost = Number(r.total || 0) / clientSpotRate;
        // const lossOrGain = Number(r.total || 0) / Number(r.currencyRate || 0) - Number(currentCost || 0);
        const lossOrGain = Number(currentCost || 0) - Number(r.total || 0) / r.currencyRate;
        const daysToPay = Math.abs(moment(r.dateDue).diff(moment(), 'days'));
        const potentialLoss = lossOrGain - 1 * Math.sqrt(daysToPay) * Number(calculateStddev(r) || 0) * Number(currentCost || 0);
        // r.currentRate = clientSpotRate;
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

    const getOptimisedInvoices = (data = []) => {
      const calculateCurrencyImpact = getImpactInvoices(data);
      const records = data.map((r) => {
        const currencyPair = `${r.homeCurrencyCode}${r.currencyCode}`;
        const spotRate = liveData[currencyPair];
        const orderPer = 0.5;
        const marginPer = parseFloat(limitOrderMarginPercentage) / 100;
        const orderProb = parseFloat(entitlements[getVariableProbability(organisation)]) / 100;
        const forwardPer = 0.25;
        let optimisedRate = optimisedRates[r.invoiceId || r.id];
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

        var impactRecord = calculateCurrencyImpact.find((cr) => (cr.invoiceId && r.invoiceId ? cr.invoiceId === r.invoiceId : cr.id === r.id));
        var potentialLoss = impactRecord?.potentialLoss || 0.0;
        var saving = 0;
        var lossRed = 0;
        var targetCost = 0;
        if (optimisedRate != 0) {
          targetCost =
            Number(r.total || 0) /
            (clientSpotRate * (fosPercent.forwardPercent / 100) +
              (fosPercent.orderPercent / 100 + fosPercent.spotPercent / 100) * optimisedRateForCalc);
          // saving = Number(r.total) / optimisedRate - Number(r.total) / r.currencyRate;
          let currentRateforOpt = getClientSpotRate(r);
          saving = Number(r.total) / optimisedRate - Number(r.total) / currentRateforOpt;
          lossRed = potentialLoss - (orderProb * (1 - orderPer - forwardPer) * potentialLoss + (1 - orderProb) * (1 - forwardPer) * potentialLoss);
        } else {
          targetCost = impactRecord.currentCost;
        }

        return {
          ...r,
          ...impactRecord,
          targetCost,
          saving,
          lossRed,
          optimisedRate,
          bgColor: r.type === 'managed' && 'lightgrey',
        };
      });
      return records;
    };
    const calculatedInvoices = useMemo(() => {
      return getOptimisedInvoices(payable);
    }, [liveData, payable, optimisedRates]);

    const getInvoice = () => {
      setLoading(true);
      try {
        try {
          let url = `/api/quotes/get-invoices`;
          const token = localStorageService.getItem('firebase-token');
          const headers = {
            authorization: token,
          };

          const orgId = organisation?.id;
          const tenantId = organisation?.tenant.id;
          const [movedTo, type] = filterBy.split('_');
          axios
            .post(
              url,
              {
                tenantId: tenantId,
                orgId: orgId,
                currency: currency,
                filter: parseInt(duration, 10),
                type,
                baseCurrency: homeCurrency,
                homeCurrencyCode: homeCurrency,
                mode,
                movedTo,
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
              setPayable([...res.data.data.invoices]);
              setCurrencies(res.data.data.currencies);
              setHomeCurrencies(res.data.data.homeCurrencies);
              setMarginPercentage(res.data.data.marginPercentage);
            })
            .finally(() => setLoading(false));
        } catch ({ message }) {
          if (message === APOLLO_ERROR_MESSAGE.authenticationFailed) {
            history.push(AUTH_ROUTES.login);
          } else {
            setLoading(false);
          }
        }
      } catch (e) {}
    };

    const updateInvoices = async () => {
      try {
        try {
          let url = `/api/quotes/update-invoices`;
          const token = localStorageService.getItem('firebase-token');
          const headers = {
            authorization: token,
          };

          const orgId = organisation?.id;
          const tenantId = organisation?.tenant.id;
          const unmanagedInvoices = payable.filter((r) => r.type != 'managed' && r.invoiceNumber);
          const payload = {
            orgId,
            tenantId,
            type: 'unmanaged',
          };
          payload.records = unmanagedInvoices.map((invoice) => {
            return {
              date: invoice.date,
              dateDue: invoice.dateDue,
              contactName: invoice.contactName,
              tenantId,
              invoiceNumber: invoice.invoiceNumber,
              total: invoice.total,
              currencyCode: invoice.currencyCode,
              currencyRate: invoice.currencyRate,
              invoiceId: invoice.invoiceId,
              homeCurrencyCode: invoice.homeCurrencyCode,
              mode,
            };
          });

          axios.post(url, payload, { headers: headers }).then((res) => {
            getInvoice();
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

    const updateInvoice = async (invoice: object, movedTo: string) => {
      try {
        try {
          let url = `/api/quotes/mark-as-managed`;
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
            record: {
              type: 'managed',
              movedTo,
            },
          };

          axios.post(url, payload, { headers: headers }).then((res) => {
            getInvoice();
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

    const deleteInvoices = async (invoices: object[]) => {
      try {
        try {
          let url = `/api/quotes/delete`;
          const token = localStorageService.getItem('firebase-token');
          const headers = {
            authorization: token,
          };

          const orgId = organisation?.id;
          const tenantId = organisation?.tenant.id;
          const payload = {
            orgId,
            tenantId,
            ids: invoices.map((i) => i.invoiceId),
          };

          axios.post(url, payload, { headers: headers }).then((res) => {
            openNotificationWithIcon('success', 'Successfully deleted');
            getInvoice();
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

    const bulkDelete = async () => {
      deleteInvoices(payable);
    };

    const handleOnAction = (invoice, value) => {
      clearInterval(intervalRef.current);
      switch (value) {
        case 'ims':
        case 'cms':
          updateInvoice(invoice, value);
          return;
        case 'delete':
          const confirmBox = window.confirm(`Do you really want to delete ?`);
          if (confirmBox === false) {
            return;
          }
          deleteInvoices([invoice]);
          return;
      }
    };

    const handleOnActionForNewRecord = (invoice, value) => {
      switch (value) {
        case 'delete':
          const confirmBox = window.confirm(`Do you really want to delete ?`);
          if (confirmBox === false) {
            return;
          }
          onDeleteNewRecord();
          const payables = payable.filter((r) => r.id !== invoice.id);
          setPayable(payables);
          return;
        default:
          return;
      }
    };

    const onChangeField = (r, field) => {
      return (e) => {
        console.log(r, payable);
        const payables = payable.map((p) => {
          if (p.id === r.id || p.invoiceId === r.id) {
            return {
              ...r,
              [field]: e.target.value,
            };
          }
          return p;
        });
        setPayable(payables);
      };
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

    const renderDateColumn = (r, column) => {
      if (r.type !== 'managed' && (r.isNew || editMode)) {
        let max, min;
        if (column === 'date') {
          max = new Date();
        } else {
          min = new Date();
        }
        return (
          <div style={{ width: '100px' }}>
            <DatePicker
              selected={r[column] && typeof r[column] === 'string' ? new Date(r[column]) : r[column]}
              onChange={(date) => onChangeField(r, column)({ target: { value: date } })}
              dateFormat="yyyy/MM/dd"
              showIcon
              maxDate={max}
              minDate={min}
            />
          </div>
        );
      }
      return moment(r[column]).format('DD-MMM-YY');
    };

    const renderSelectColumn = (r, column) => {
      if (r.type !== 'managed' && (r.isNew || editMode)) {
        const currencies = column === 'currencyCode' ? SUPPORTED_CURRENCIES.filter((c) => c != organisation.currency) : SUPPORTED_CURRENCIES;
        return (
          <Select
            className="mt-2 px-1"
            options={[{ value: '', label: 'Select' }, ...currencies.map((c) => ({ value: c, label: c }))]}
            value={r[column]}
            onChange={(currencyCode) => {
              onChangeField(r, column)({ target: { value: currencyCode } });
            }}
            isRequired
          />
        );
      }
      return r[column];
    };

    // Add handlers for IMS and Delete actions
    const handleIMSAction = (record) => {
      // Use the existing handleOnAction function for IMS/CMS
      handleOnAction(record, 'ims');
    };

    const handleDeleteAction = (record) => {
      // Use the existing handleOnAction function for Delete
      handleOnAction(record, 'delete');
    };

    const renderColumn = (r, column) => {
      // Add + button column for the last row
      if (column === 'addButton') {
        const isLastRow = calculatedInvoices.indexOf(r) === calculatedInvoices.length - 1;
        if (isLastRow && editMode) {
          return (
            <button
              onClick={() => {
                if (onAddNew && typeof onAddNew === 'function') {
                  onAddNew();
                }
              }}
              className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full hover:bg-blue-50 transition-colors duration-200"
              title="Add new row"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          );
        }
        return null; // Empty cell for non-last rows
      }

      // IMS/CMS actions - only show when showImpactAndSavings is false
      if (column === 'imsActions' && !showImpactAndSavings) {
        // Don't show actions for managed records or if record doesn't exist in the API
        if (r.type === 'managed' || r.isNew) {
          return '-';
        }

        const isBeingEdited = editMode && RECEIVABLE_EDITABLE_COLUMNS.some(field => 
          document.querySelector(`input[data-record-id="${r.invoiceId || r.id}"][data-field="${field}"]`)
        );

        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleIMSAction(r)}
              disabled={isBeingEdited}
              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded focus:outline-none focus:ring-2 ${
                isBeingEdited 
                  ? 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
                  : 'text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 focus:ring-blue-500'
              }`}
              title={isBeingEdited ? "Save changes before using IMS/CMS" : "IMS/CMS Action"}
            >
              IMS/CMS
            </button>
            <button
              onClick={() => handleDeleteAction(r)}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              title="Delete"
            >
              Delete
            </button>
          </div>
        );
      }

      if (r.type !== 'managed' && (r.isNew || editMode) && RECEIVABLE_EDITABLE_COLUMNS.includes(column)) {
        let defaultValue = r[column];
        if (column === 'total' && r[column]) {
          defaultValue = Number(r[column]).toPrecision(2);
        }
        return (
          <input
            className="block form-input placeholder-gray-300 relative rounded-md shadow-sm sm:leading-5 sm:text-sm w-full"
            defaultValue={defaultValue}
            onBlur={onChangeField(r, column)}
            data-record-id={r.invoiceId || r.id}
            data-field={column}
            style={{ boxShadow: 'inset 0 2px 2px #e9e9e9', border: '1px solid #aeaeaa' }}
          />
        );
      }
      if (r.type !== 'managed' && (r.isNew || editMode)) {
        if (column === 'newRecordActions' && r.isNew) {
          let options = [{ label: 'Delete', value: 'delete' }];

          return <ActionTooltipContent options={options} onSelect={handleOnActionForNewRecord.bind(this, r)} currency={organisation?.currency} />;
        }
        return '-';
      }
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
          // This is the original actions column from the savings table
          let options = [{ label: 'Delete', value: 'delete' }];
          if (r.type !== 'managed') {
            options = [{ label: 'IMS/CMS', value: 'ims' }, ...options];
          }
          return <ActionTooltipContent options={options} onSelect={handleOnAction.bind(this, r)} currency={organisation?.currency} />;
        case 'status':
          const manageType = r.manage_type === 'Plan' ? 'Planned' : 'Forward';
          if (r.isApproved === 'true') {
            return <span className="text-green-500 font-medium">Approved ({manageType})</span>;
          }
          return <span className="text-red-500 font-medium">Awaiting approval ({manageType})</span>;
        case 'daysToPay':
          const dtp = moment(r.dateDue).diff(moment(), 'days');
          return dtp > 0 ? dtp : 0;
        case 'targetCost':
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

        case 'saving':
          return renderBadge(r[column]);

        case 'lossRed':
          return <Badge variant={r[column] > 0 ? 'gray' : 'gray'}>{format(Math.abs(r[column]), 2, 3)}</Badge>;

        case 'optimisedRate': {
          let rt = format(Number(r[column]), 5, 3);
          return rt == 0 ? '-' : rt;
        }
        case 'inversedRate':
          let rt = format(r['optimisedRate'], 5, 3);
          return rt == 0 ? '-' : format(1 / Number(r['optimisedRate']), 5, 3);
        case 'currentCost':
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

        case 'currentRate':
          return format(Number(r[column] || 0), 5, 3);

        case 'inverseRate':
          return r.currentRate ? format(1 / Number(r.currentRate), 5, 3) : 0;
        case 'lossOrGain':
        case 'potentialLoss':
          return renderBadge(r[column]);
        default:
          return r[column];
      }
    };

    // Update editableColumns to include add button column at the beginning
    let editableColumns = [
      // Add button column at the beginning - only show in edit mode
      ...(editMode ? [{ key: 'addButton', label: '', onRender: renderColumn, width: '50px' }] : []),
      { key: 'date', label: 'Invoice Date', onRender: renderDateColumn },
      { key: 'currencyCode', label: 'Currency', onRender: renderSelectColumn },
      { key: 'homeCurrencyCode', label: 'Home Currency', onRender: renderSelectColumn },
      { key: 'total', label: 'Amount', onRender: renderColumn, isNumber: true, format: (v: Number) => v.toPrecision(2) },
      { key: 'dateDue', label: 'Expected Date', onRender: renderDateColumn },
      { key: 'currencyRate', label: 'Budget rate', onRender: renderColumn },
      { key: 'invoiceNumber', label: 'Invoice No', onRender: renderColumn },
      { key: 'contactName', label: 'Company', onRender: renderColumn },
      { key: 'daysToPay', label: 'Days to Receive', isNumber: true, onRender: renderColumn },

      // Add IMS/CMS actions column when showImpactAndSavings is false
      ...(!showImpactAndSavings ? [{ key: 'actions', label: 'Actions', onRender: renderColumn, align: 'center' }] : []),
    ];

    const isAnyNewRecord = payable.some((r) => r.isNew);
    if (isAnyNewRecord) {
      editableColumns = [...editableColumns, { key: 'newRecordActions', label: 'Actions', onRender: renderColumn }];
    }

    const currencyImpactColumns = [
      {
        key: 'currentCost',
        label: 'Current Value',
        onRender: renderColumn,
        isNumber: true,
      },
      { key: 'currentRate', label: 'Forward Rate', onRender: renderColumn, isNumber: true },
      { key: 'inverseRate', label: 'Inversed Rate', onRender: renderColumn, isNumber: true, hide: !entitlements.showInversedRate },
      { key: 'lossOrGain', label: 'Gain / Loss', onRender: renderColumn, isNumber: true },
      {
        key: 'potentialLoss',
        label: 'Potential Loss',
        onRender: renderColumn,
        isNumber: true,
      },
    ];

    const optimisedInvoiceColumns = [
      {
        key: 'targetCost',
        label: 'Target Cost',
        onRender: renderColumn,
        isNumber: true,
      },
      { key: 'optimisedRate', label: 'Savings Rate', isNumber: true, onRender: renderColumn },
      { key: 'inversedRate', label: 'Inversed Rate', isNumber: true, onRender: renderColumn, hide: !entitlements.showInversedRate },
      {
        key: 'saving',
        label: 'Saving',
        onRender: renderColumn,
        isNumber: true,
      },
      {
        key: 'lossRed',
        label: 'Loss Reduction',
        onRender: renderColumn,
        isNumber: true,
      },
      // Only show actions column in savings table when showImpactAndSavings is true
      ...(showImpactAndSavings ? [{ key: 'actions', label: 'Actions', onRender: renderColumn, align: 'center' }] : []),
    ];

    const maxHeight = useMemo(() => {
      return max([optimiseHeight, detailsheight, impactHeight]);
    }, [optimiseHeight, detailsheight, impactHeight]);

    const renderEmptyState = () => {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10,9 9,9 8,9"></polyline>
            </svg>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Receivable Records Available</h3>

          <p className="text-gray-500 mb-8 max-w-md">
            Get started by adding your first receivable invoice to begin managing your incoming payments and currency optimization.
          </p>

          <button
            onClick={() => {
              // Call the same function that the "+" button in header uses
              if (onAddNew && typeof onAddNew === 'function') {
                onAddNew();
              }
            }}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add New Receivable
          </button>
        </div>
      );
    };

    const renderPayableContent = () => {
      // If no invoices and not loading, show empty state
      if (isEmpty(calculatedInvoices) && !loading) {
        return renderEmptyState();
      }

      return (
        <div className="flex">
          {/* Details table - adjust width based on showImpactAndSavings */}
          <div
            className={`${editMode ? (showImpactAndSavings ? 'w-1/2' : 'w-full') : (showImpactAndSavings ? 'w-1/3' : 'w-full')} p-2`}
            style={{ width: editMode ? (showImpactAndSavings ? '50%' : '100%') : (showImpactAndSavings ? '45%' : '100%') }}
          >
            {loading ? (
              <PlanTableSkeleton rows={5} columns={4} />
            ) : (
              <PlanTable
                draggable={false}
                rows={calculatedInvoices}
                columns={editableColumns}
                title="DETAILS"
                onTableHeaderHeightChange={setDetailsHeight}
                height={maxHeight}
                showEmpty={false}
                emptyTitle="No entries"
                forceCalculate={editMode && !!addNew}
              />
            )}
          </div>

          {/* Current Impact table - only show if showImpactAndSavings is true */}
          {showImpactAndSavings && (
            <div className={`${editMode ? 'w-1/4' : 'w-1/3'} p-2`} style={{ width: editMode ? '25%' : '25%' }}>
              {loading ? (
                <PlanTableSkeleton rows={5} columns={4} />
              ) : (
                <PlanTable
                  rows={calculatedInvoices}
                  columns={currencyImpactColumns}
                  draggable={false}
                  title="Current Impact"
                  onTableHeaderHeightChange={setImpactHeight}
                  height={maxHeight}
                  showEmpty={false}
                />
              )}
            </div>
          )}

          {/* Savings Plan table - only show if showImpactAndSavings is true */}
          {showImpactAndSavings && (
            <div className={`${editMode ? 'w-1/4' : 'w-1/3'} p-2`} style={{ width: editMode ? '25%' : '30%' }}>
              {loading ? (
                <PlanTableSkeleton rows={5} columns={4} />
              ) : (
                <PlanTable
                  draggable={false}
                  rows={calculatedInvoices}
                  columns={optimisedInvoiceColumns}
                  bodyRowClass="bg-blue-200"
                  title="SAVINGS PLAN"
                  onTableHeaderHeightChange={setOptimiseHeight}
                  height={maxHeight}
                  showEmpty={false}
                />
              )}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="w-full flex flex-col pt-20">
        <div className="w-full flex flex-col px-8 pb-8 pt-14">
          <div className="flex justify-around flex-col w-full bg-white rounded-lg overflow-auto" style={{ maxHeight: '500px' }}>
            {renderPayableContent()}
          </div>
        </div>
      </div>
    );
  }
);
