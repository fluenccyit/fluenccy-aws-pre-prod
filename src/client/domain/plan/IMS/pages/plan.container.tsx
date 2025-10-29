import React, { memo, useEffect, useState, useMemo, useRef } from 'react';
import { Button, Page, localStorageService, useToast, TextSkeleton, FluenccyLoader } from '@client/common';
import { useQueryLocalOrganisation } from '@client/organisation';
import { PlanUploadCSVPageContent, PayableContent } from '@client/plan';
import { PlanPage } from '@client/plan';
import { UploadCSVPage } from '@client/upload-csv';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { PlanReceivablePageContainer } from './receivable.container';
import { PlanPayablePageContainer } from './payable.container';

export const PlanPageContainer = memo(() => {
  const intervalRef = useRef(null);
  const history = useHistory();
  const [isOpen, setOpen] = useState(history.location.state ? history.location.state.from === 'import' : false);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('ALL');
  const [duration, setDuration] = useState('12months');
  const [receivableTab, setReceivableTab] = useState(history.location.state?.mode || 'payables');
  const { organisation } = useQueryLocalOrganisation();
  const [liveData, setLiveData] = useState({});
  const [fetchingLiveRate, setFetchingLiveRate] = useState(false);
  const [entitlements, setEntitlements] = useState({});
  const [showDashboard, setShowDashboard] = useState(!!history.location?.state?.showDashboard);
  const [currencies, setCurrencies] = useState([]);
  const [homeCurrencies, setHomeCurrencies] = useState([]);
  const [homeCurrency, setHomeCurrency] = useState('ALL');
  const forwardPoints = useRef({});
  const { addToast } = useToast();

  const [hasInvoices, setHasInvoices] = useState(false);
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
  const [tabClicked, setTabClicked] = useState(false);

  const mode = receivableTab === 'receivables' ? receivableTab : null;

  // to set default mode if anyone have records
  useEffect(() => {
    const { payables, receivables, payablesCount, receivablesCount } = initialLoads;
    const { payablesManaged, receivablesManaged, payablesManagedCount, receivablesManagedCount } = initialManagedLoads;
    if (payables && payablesManaged && receivablesManaged && receivables && !tabClicked && !showDashboard) {
      // check to show receivales selected
      if (payablesCount === 0 && payablesManagedCount === 0 && (receivablesCount !== 0 || receivablesManagedCount !== 0)) {
        setReceivableTab('receivables');
      } else {
        setReceivableTab('');
      }
    }
  }, [initialLoads, initialManagedLoads]);

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
    getEntitlements();
  }, [receivableTab]);

  const onModalClose = () => {
    intervalRef.current = setInterval(() => {
      getMxMarketLiveData();
    }, 3000);
  };

  const togglePage = () => {
    setCurrency('ALL');
    setDuration('12months');
    setShowDashboard(!showDashboard);
  };

  const openNotificationWithIcon = (type = 'success', title = '', description = 'Success', style = {}) => {
    addToast(description, type, 'fixed');
  };

  const getMxMarketLiveData = async () => {
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

  const getEntitlements = () => {
    try {
      let url = `/api/orgEntitlement/get-OrgEntitlements`;
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        authorization: token,
      };

      const payload = {
        orgId: organisation?.id,
        mode,
      };

      axios.post(url, payload, { headers: headers }).then((res) => {
        setEntitlements(res.data.data.OrgEntitlements[0] || {});
      });
    } catch (e) {
      addToast('Exception occurred... Kindly try again by reloading page.', 'danger');
    }
  };

  const toggleView = () => {
    setOpen(!isOpen);
  };

  const onChangeTab = (v: any) => {
    setReceivableTab(v.id);
    if (v.id !== receivableTab) {
      setCurrency('ALL');
      setHomeCurrency('ALL');
      setHasInvoices(true);
      setLoading(true);
      setTabClicked(true);
    }
  };

  const onChangeMode = (v) => {
    setReceivableTab(v);
    if (v !== receivableTab) {
      setCurrency('ALL');
      setHomeCurrency('ALL');
      setHasInvoices(false);
      setLoading(true);
    }
  };

  const isFilterMode = duration !== '12months' || currency !== 'ALL';
  const { payables, receivables, payablesCount, receivablesCount } = initialLoads;
  const { payablesManaged, receivablesManaged, payablesManagedCount, receivablesManagedCount } = initialManagedLoads;
  const showImportSection =
    ((payables &&
      receivables &&
      payablesManaged &&
      receivablesManaged &&
      payablesCount === 0 &&
      payablesManagedCount === 0 &&
      receivablesCount === 0 &&
      receivablesManagedCount === 0 &&
      !tabClicked) ||
      (tabClicked && !hasInvoices && !loading)) &&
    !isOpen &&
    !isFilterMode;

  const props = {
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
    homeCurrency,
    onChangeMode,
    initialLoads,
    initialManagedLoads,
    setInitialLoads,
    setInitialManagedLoads,
    homeCurrencies,
  };

  return (
    <Page variant="light" className="bg-white">
      <PlanUploadCSVPageContent className={['justify-center', 'align-items', 'bg-white']}>
        <FluenccyLoader loop={fetchingLiveRate} className="absolute z-1 w-12" style={{ position: 'absolute', zIndex: 1 }} />
        {showImportSection && <PlanPage btnText="Import" onClick={toggleView} />}
        {isOpen && (
          <>
            <div className="pt-1 absolute w-full flex justify-end pr-16 top-0 pb-4 z-50" style={{ zIndex: 99 }}>
              <Button onClick={toggleView}>Back</Button>
            </div>
            <UploadCSVPage mode={mode} showModeOptions={true} />
          </>
        )}
        {!isOpen && !showDashboard && (
          <>
            <PayableContent
              currencies={currencies}
              onChangeCurrency={setCurrency}
              month={duration}
              onChangeMonth={(v: any) => setDuration(v.id)}
              loading={loading}
              receivable={receivableTab}
              onChangeReceivable={onChangeTab}
              showPayableTab={false}
              orderProbability={entitlements.orderProbability}
              minimumProbability={entitlements.minimumProbability}
              maximumProbability={entitlements.maximumProbability}
              isSetOptimised={entitlements.setOptimised}
              homeCurrencies={homeCurrencies}
              onChangeHomeCurrency={setHomeCurrency}
              currency={currency}
              homeCurrency={homeCurrency}
              showImport={showImportSection}
            />
            <div className="pt-2 absolute flex justify-end pr-16 pb-4" style={{ right: '15px' }}>
              {loading ? (
                <TextSkeleton className="my-0.5 h-10 w-32 mr-4" />
              ) : (
                !showImportSection && (
                  <Button className="mr-4" onClick={togglePage}>
                    Dashboard
                  </Button>
                )
              )}
              {loading ? <TextSkeleton className="my-0.5 h-10 w-32" /> : !showImportSection && <Button onClick={toggleView}>Import</Button>}
            </div>
          </>
        )}

        {!showImportSection &&
          !isOpen &&
          (receivableTab === 'payables' ? <PlanPayablePageContainer {...props} /> : <PlanReceivablePageContainer {...props} />)}
      </PlanUploadCSVPageContent>
    </Page>
  );
});
