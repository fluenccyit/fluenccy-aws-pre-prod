import React, { memo, useEffect, useState, useMemo, useRef } from 'react';
import { Button, Page, localStorageService, useToast, FluenccyLoader } from '@client/common';
import { useQueryLocalOrganisation } from '@client/organisation';
import { PlanUploadCSVPageContent } from '@client/plan';
import { PlanPage } from '@client/plan';
import { UploadCSVPage } from '@client/upload-csv';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { Header, CurrencyReserves, UnmanagedEntries } from '@client/currency-management';
import { AUTH_ROUTES } from '@client/auth';
import { ManagedEntries } from '../components/managed.component';
import { Archives, Dashboard, PricingContainer, Transactions, PayableReceivable } from '../components';
import moment from 'moment';
import { tradeCurrencies } from '../../utils/constants';
import { mean, meanBy, orderBy, sortBy } from 'lodash';

const MONTHS = ['two', 'two', 'four', 'four', 'six', 'six', 'eight', 'eight', 'ten', 'ten', 'twelve', 'twelve'];

export const CMPageContainer = memo(() => {
  const history = useHistory();
  const [isOpen, setOpen] = useState(history.location.state ? history.location.state.from === 'import' : false);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState();
  const [selectedTab, setSelectedTab] = useState({ id: history.location.state?.tab || 'dashboard' });
  const [entitlements, setEntitlements] = useState([]);
  const { addToast } = useToast();
  const { organisation } = useQueryLocalOrganisation();
  const [managedList, setManagedList] = useState([]);
  const [fetchingLiveRate, setFetchingLiveRate] = useState(false);
  const [liveData, setLiveData] = useState({});
  const [marginPercentageVal, setMarginPercentage] = useState([]);
  const [forwardPoints, setForwardPoints] = useState([]);
  const [managedForwardPoints, setManagedForwardPoints] = useState([]);
  const [avgRates, setAvgRates] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [fetchingCurrencies, setFetchingCurrencies] = useState(true);

  useEffect(() => {
    setFetchingCurrencies(true);
    getMxMarketData();
    getAvgOrderRates();
    setCurrency();
  }, [organisation]);

  useEffect(() => {
    if (currency && !fetchingCurrencies) {
      getEntries('unmanaged');
      getEntries('managed');
    }
  }, [currency, organisation, fetchingCurrencies]);

  const toggleView = () => {
    setOpen(!isOpen);
  };

  const openNotificationWithIcon = (type = 'success', title = '', description = 'Success', style = {}) => {
    addToast(description, type, 'fixed');
  };

  const onChangeReserve = (id, r, v) => {
    updateInvoice(
      '',
      'unmanaged',
      {
        ...r,
        reserveEditableMin: parseInt(v, 10),
        reservedAmount: 0,
      },
      false
    );
  };

  const getMxMarketData = async () => {
    setFetchingLiveRate(true);
    try {
      const url = '/api/cms/get-rates';
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        authorization: token,
      };
      axios
        .post(
          url,
          {
            baseCurrency: organisation?.currency,
          },
          {
            headers: headers,
          }
        )
        .then((res) => {
          setLiveData(res.data.data.rates);
          setFetchingLiveRate(false);
        })
        .catch((e) => {
          console.log(e);
          openNotificationWithIcon('danger', 'Error', 'Error in fetching current rate.');
        });
    } catch (e) {
      console.error(e);
      openNotificationWithIcon('danger', 'Error', 'Error in fetching current rate.');
    }
  };

  const getAvgOrderRates = async () => {
    try {
      const url = '/api/cms/get-avg-order-rate-by-date';
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        authorization: token,
      };
      axios
        .post(
          url,
          { orgId: organisation?.id },
          {
            headers,
          }
        )
        .then((res) => {
          setAvgRates(res.data.data.rates);
        })
        .catch((e) => {
          console.log(e);
          openNotificationWithIcon('danger', 'Error', 'Error in fetching current rate.');
        });
    } catch (e) {
      console.error(e);
      openNotificationWithIcon('danger', 'Error', 'Error in fetching current rate.');
    }
  };

  const getEntries = async (type = 'unmanaged') => {
    try {
      try {
        setLoading(true);
        let url = `/api/cms/get-entries`;
        const token = localStorageService.getItem('firebase-token');
        const headers = {
          authorization: token,
        };

        const orgId = organisation?.id;
        axios
          .post(
            url,
            {
              orgId: orgId,
              currencyCode: currency?.value,
              orgCurrency: organisation?.currency,
              type,
            },
            {
              headers: headers,
            }
          )
          .then((res) => {
            if (type === 'unmanaged') {
              setList(res.data.data.entries);
              setForwardPoints(res.data.data.forwardPoints);
            } else {
              setManagedList(res.data.data.entries);
              setManagedForwardPoints(res.data.data.forwardPoints);
            }
            setMarginPercentage(res.data.data.marginPercentage?.[0]?.marginPercentage);
            setLoading(false);
          })
          .catch((e) => setLoading(false));
      } catch ({ message }) {
        if (message === APOLLO_ERROR_MESSAGE.authenticationFailed) {
          history.push(AUTH_ROUTES.login);
        } else {
          // setIsError(true);
          setLoading(false);
        }
      }
    } catch (e) {
      setLoading(false);
    }
  };

  const updateInvoice = async (manageType: string, type: string = 'managed', invoice: object, refresh: boolean = true) => {
    try {
      try {
        setSubmitting(invoice.id);
        let url = `/api/cms/update-entry`;
        const token = localStorageService.getItem('firebase-token');
        const headers = {
          authorization: token,
        };

        const orgId = organisation?.id;
        const payload = {
          orgId,
          type,
          id: invoice.id,
          params: {
            manage_type: manageType,
            reservedMin: invoice.reserveMin,
            reservedMax: invoice.reserveMax,
            reservedAmount: Number(invoice.reservedAmount) || Number(invoice.reserveEditableMin),
            reservedRate: invoice.reserveRate,
            currentRate: invoice.currentRate,
            isManaged: type === 'managed',
            isApproved: invoice.isApproved,
            totalReservedAmount: invoice.isApproved
              ? Number(invoice.totalReservedAmount) + (Number(invoice.reservedAmount) || Number(invoice.reserveEditableMin))
              : Number(invoice.totalReservedAmount),
          },
        };

        axios.post(url, payload, { headers: headers }).then((res) => {
          if (refresh) {
            getEntries('unmanaged');
            getEntries('managed');
          } else {
            const amount = invoice.reservedAmount || invoice.reserveEditableMin;
            const modifiedList = list.map((o) => (o.id === invoice.id ? { ...o, reserveEditableMin: amount, reservedAmount: amount } : o));
            setList(modifiedList);
            openNotificationWithIcon('success', 'Success', 'Amount updated successfully.');
          }
          setSubmitting(false);
        });
      } catch ({ message }) {
        setSubmitting(false);
        if (message === APOLLO_ERROR_MESSAGE.authenticationFailed) {
          history.push(AUTH_ROUTES.login);
        } else {
        }
      }
    } catch (e) {
      addToast('Exception occurred... Kindly try again by reloading page.', 'danger');
    }
  };

  const onAction = (invoice, value) => {
    switch (value) {
      case 'Plan':
      case 'Forward':
        updateInvoice(value, 'managed', invoice);
        return;
      case 'remove':
        updateInvoice('', 'unmanaged', {
          id: invoice.id,
          reserveMin: 0,
          reserveMax: 0,
          reserveEditableMin: 0,
          reserveRate: 0,
          currentRate: 0,
          reservedAmount: 0,
          totalReservedAmount: invoice.totalReservedAmount,
        });
        return;
      case 'manage':
        setSelectedTab({ id: 'plan' });
        return;
      case 'approve':
        updateInvoice('', 'unmanaged', { ...invoice, isApproved: true });
        return;
      case 'dashboard':
        setSelectedTab({ id: 'dashboard' });
        return;
    }
  };

  const formatedList = (list, addTotal = false) => {
    if (list.length && currency) {
      const entitlementsObj = entitlements.reduce((acc, o) => {
        acc[o.currencyCode] = o;
        return acc;
      }, {});
      const lastRecord = {
        month: 'Totals',
        id: 'total',
        currencyCode: currency.value,
        amountToMin: 0,
        amountToMax: 0,
        totalReservedAmount: 0,
        forecaseAmount: 0,
        reserveMax: 0,
        reserveMin: 0,
        budgetRate: 0,
        maxGainLoss: 0,
        minGainLoss: 0,
        reserveEditableMin: 0,
      };
      const frwPoints = [...managedForwardPoints, ...forwardPoints];
      const modifiedList = list.map((o) => {
        const selectedEntitlement = entitlementsObj[o.currencyCode];
        const hideContent = o.isApproved && selectedTab.id === 'dashboard';
        const forwardPoint = frwPoints.find(
          (r) => r.year === o.year && r.month === o.month && r.tradeCurrency === o.currencyCode && r.baseCurrency === currency.value
        );
        const currentRate =
          Number(liveData[`${organisation?.currency}${o.currencyCode}`] || 0) +
          Number(marginPercentageVal) / 100 +
          (forwardPoint?.forwardPoints || 0);

        // const month = moment(`01/${o.month}/${o.year}`).endOf('month').diff(moment(), 'months');
        let month;
        if (moment(`01-${o.month}-${o.year}`).valueOf() < 0) {
          month = moment(`01/${o.month}/${o.year}`).endOf('month').diff(moment(), 'months');
        } else {
          month = moment(`01-${o.month}-${o.year}`).endOf('month').diff(moment(), 'months');
        }
        let entitlementItem;
        orderBy(selectedEntitlement?.orgEntitlementItems || [], (r) => parseInt(r.name), 'asc').forEach((element) => {
          if (!entitlementItem && parseInt(element.name, 10) >= month) {
            entitlementItem = element;
          }
        });

        const remainingAmount = Number(o.forecaseAmount) - Number(o.totalReservedAmount);

        // const month = moment(`01-${o.month}-${o.year}`).endOf('month').diff(moment(), 'months');
        let reserveMax =
          Number(o.reservedMax) ||
          (selectedEntitlement ? Number(remainingAmount) * (Number(entitlementItem?.max || 0) / 100) : Number(remainingAmount));
        let reserveMin = Number(o.reservedMin) || (selectedEntitlement ? Number(remainingAmount) * (Number(entitlementItem?.min || 0) / 100) : 0);
        let amountToMax = o.isManaged ? (hideContent ? 0 : Number(remainingAmount) - Number(o.reservedAmount || reserveMax)) : reserveMax;
        let amountToMin = o.isManaged ? (hideContent ? 0 : Number(o.reservedMin) - Number(o.reservedAmount || o.reservedMin)) : reserveMin;
        // amountToMin = amountToMin > 0 ? amountToMin : 0;

        reserveMax = reserveMax > 0 ? reserveMax : 0;
        reserveMin = reserveMin > 0 ? reserveMin : 0;
        amountToMax = amountToMax > 0 ? amountToMax : 0;
        amountToMin = amountToMin > 0 ? amountToMin : 0;
        const rate = avgRates[o.currencyCode];
        const record = {
          ...o,
          reserveMax,
          reserveMin,
          reserveEditableMin: o.reserveEditableMin || Number(o.reservedAmount) || reserveMin,
          currentRate: Number(o.currentRate) || currentRate,
          maxGainLoss: amountToMax * ((Number(o.currentRate) || currentRate) - o.budgetRate),
          minGainLoss: amountToMin * ((Number(o.currentRate) || currentRate) - o.budgetRate),
          amountToMax,
          amountToMin,
          reserveRate: rate && rate.ids.includes(o.id) ? 1 / (rate.home / rate.reserved) : 0,
          remainingAmount,
        };
        lastRecord.forecaseAmount = lastRecord.forecaseAmount + Number(record.forecaseAmount);
        lastRecord.reserveEditableMin = lastRecord.reserveEditableMin + record.reserveEditableMin;
        lastRecord.reserveMax = lastRecord.reserveMax + record.reserveMax;
        lastRecord.reserveMin = lastRecord.reserveMin + record.reserveMin;
        lastRecord.budgetRate = lastRecord.budgetRate + Number(record.budgetRate);
        lastRecord.amountToMax = lastRecord.amountToMax + record.amountToMax;
        lastRecord.amountToMin = lastRecord.amountToMin + record.amountToMin;
        lastRecord.maxGainLoss = lastRecord.maxGainLoss + record.maxGainLoss;
        lastRecord.minGainLoss = lastRecord.minGainLoss + record.minGainLoss;
        lastRecord.totalReservedAmount = Number(lastRecord.totalReservedAmount) + Number(record.totalReservedAmount);
        return record;
      });
      lastRecord.budgetRate = (lastRecord.budgetRate / modifiedList.length).toFixed(5);
      if (addTotal) {
        modifiedList.push(lastRecord);
      }
      return modifiedList;
    }
    return list;
  };

  const memorizedList = useMemo(() => {
    return sortBy(formatedList(list, true), (o) => {
      if (moment(`01-${o.month}-${o.year}`).valueOf() < 0) {
        return moment(`01/${o.month}/${o.year}`);
      } else {
        return moment(`01-${o.month}-${o.year}`);
      }
      // moment(`01/${o.month}/${o.year}`)
    });
  }, [entitlements, currency, list, forwardPoints, marginPercentageVal, avgRates]);

  const memorizedManagedList = useMemo(() => {
    return sortBy(formatedList(managedList, false), (o) => {
      if (moment(`01-${o.month}-${o.year}`).valueOf() < 0) {
        return moment(`01/${o.month}/${o.year}`);
      } else {
        return moment(`01-${o.month}-${o.year}`);
      }
      // moment(`01/${o.month}/${o.year}`)
    });
  }, [entitlements, currency, managedList, managedForwardPoints, marginPercentageVal, avgRates]);

  const renderSection = () => {
    switch (selectedTab?.id) {
      case 'plan':
        return (
          <>
            <UnmanagedEntries
              loading={loading}
              list={memorizedList}
              organisation={organisation}
              onAction={onAction}
              onChangeReserve={onChangeReserve}
              submittingId={submitting}
            />
            <ManagedEntries
              loading={loading}
              list={memorizedManagedList}
              organisation={organisation}
              onAction={onAction}
              showTotal={false}
              submittingId={submitting}
            />
          </>
        );
      case 'dashboard':
        let data;
        data = sortBy(formatedList([...managedList, ...list], true), (o) => {
          if (moment(`01-${o.month}-${o.year}`).valueOf() < 0) {
            return moment(`01/${o.month}/${o.year}`);
          } else {
            return moment(`01-${o.month}-${o.year}`);
          }
        });
        // const data = sortBy(formatedList([...managedList, ...list], true), o => moment(`${o.month}-${o.year}`));
        return <Dashboard organisation={organisation} data={data} chartBarClickable onAction={onAction} loading={loading} />;
      case 'trans':
        return <Transactions organisation={organisation} />;
      case 'archives':
        return <Archives formatedList={formatedList} changeTab={setSelectedTab} />;
      case 'pricing':
        return <PricingContainer currency={currency?.value} />;
      default:
        return null;
    }
  };

  const isMainSections = ['plan', 'dashboard'].includes(selectedTab.id);

  const renderContent = () => {
    if (isOpen) {
      return (
        <>
          <div className="pt-1 absolute w-full flex justify-end pr-16 top-0 pb-4 z-50" style={{ zIndex: 99 }}>
            <Button onClick={toggleView}>Back</Button>
          </div>
          <UploadCSVPage showModeOptions={false} />
        </>
      );
    }
    if (list.length === 0 && !loading && isMainSections) {
      return <PlanPage btnText="Import" onClick={toggleView} />;
    }

    return (
      <>
        {isMainSections && (
          <div className="pt-1 w-full flex justify-center top-0 pb-4 z-50">
            <Button variant="success" isRounded onClick={toggleView}>
              Import
            </Button>
          </div>
        )}
        {renderSection()}
      </>
    );
  };

  return (
    <Page variant="light" className="bg-white">
      <PlanUploadCSVPageContent className={['align-items', 'bg-white', 'flex-col']}>
        {!isOpen && (
          <>
            <Header onChangeTab={setSelectedTab} selected={selectedTab.id} />
            {isMainSections && (
              <CurrencyReserves
                onChange={setCurrency}
                setData={setEntitlements}
                fetchingCurrencies={fetchingCurrencies}
                setFetchingCurrencies={setFetchingCurrencies}
                selected={currency}
                fetchEntryCount
                organisation={organisation}
                className={list.length === 0 ? 'mb-20' : ''}
              />
            )}
          </>
        )}
        <div className="relative flex justify-center w-full flex-col" style={{ minHeight: '200px' }}>
          <FluenccyLoader loop={fetchingLiveRate} className="absolute z-1 w-12" style={{ position: 'absolute', zIndex: 1, top: 30, left: '50%' }} />
          {renderContent()}
        </div>
      </PlanUploadCSVPageContent>
    </Page>
  );
});
