import React, { memo, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Page, localStorageService, useToast, FluenccyLoader } from '@client/common';
import { useQueryLocalOrganisation } from '@client/organisation';
import { PlanUploadCSVPageContent } from '@client/plan';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { QuoteReceivablePageContainer } from './receivable.container';
import { QuotePayablePageContainer } from './payable.container';
import { QuoteHeader } from '../components/header.component';

export const QuotePageContainer = memo(() => {
  const intervalRef = useRef(null);
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState('ALL');
  const [duration, setDuration] = useState('12months');
  const [receivableTab, setReceivableTab] = useState('payables');
  const { organisation } = useQueryLocalOrganisation();
  const [liveData, setLiveData] = useState({});
  const [fetchingLiveRate, setFetchingLiveRate] = useState(false);
  const [entitlements, setEntitlements] = useState({});
  const [currencies, setCurrencies] = useState([]);
  const [homeCurrencies, setHomeCurrencies] = useState([]);
  const [homeCurrency, setHomeCurrency] = useState('ALL');
  const [addNew, setAddNew] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [clearMode, setClearMode] = useState(false);
  const [generateQuote, setGenerateQuote] = useState(false);
  const [showManaged, setShowManaged] = useState(false);
  const [filterBy, setFilterBy] = useState('_unmanaged');
  const [showImpactAndSavings, setShowImpactAndSavings] = useState(false); // Default to false (Hide)
  const forwardPoints = useRef({});
  const { addToast } = useToast();
  const counterRef = useRef(0);

  const mode = receivableTab === 'receivables' ? receivableTab : null;

  useEffect(() => {
    if (currencies.length) {
      getMxMarketLiveData();
      intervalRef.current = setInterval(() => {
        // getMxMarketLiveData();
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

  const onChangeTab = useCallback(
    (v: any) => {
      if (editMode || addNew) {
        const confirmBox = window.confirm(`Do you want to discard your changes ?`);
        if (confirmBox === false) {
          return false;
        }
      }
      setFilterBy('_unmanaged');
      setEditMode(false);
      onDeleteNew();
      setReceivableTab(v.id);
      if (v.id !== receivableTab) {
        setCurrency('ALL');
        setHomeCurrency('ALL');
        // setLoading(true);
      }
    },
    [editMode, receivableTab, addNew]
  );

  const onChangeMode = (v) => {
    onDeleteNew();
    setReceivableTab(v);
    if (v !== receivableTab) {
      setCurrency('ALL');
      setHomeCurrency('ALL');
      // setLoading(true);
    }
  };

  const onAddNew = () => {
    counterRef.current = counterRef.current + 1;
    setAddNew(counterRef.current);
  };
  const onDeleteNew = () => {
    counterRef.current = 0;
    setAddNew(counterRef.current);
    setDeleteMode(true);
  };
  const onEdit = () => setEditMode(true);
  const toggleClear = () => {
    if (!clearMode) {
      const confirmBox = window.confirm(`Do you really want to delete all records ?`);
      if (confirmBox === false) {
        return;
      }
    }
    setClearMode(!clearMode);
  };
  const onGenerateQuote = () => {
    setGenerateQuote(true);
  };
  const onGenerateQuoteSuccess = (isSuccess) => {
    setGenerateQuote(false);
    onDeleteNew();
    if (isSuccess) {
      setEditMode(false);
    }
  };
  const onDeleteNewRecord = () => {
    counterRef.current = 0;
    setAddNew(counterRef.current);
  };

  const onToggleShowManaged = () => setShowManaged(!showManaged);
  const handleToggleImpactAndSavings = () => {
    setShowImpactAndSavings(!showImpactAndSavings);
  };
  const onActions = (key: string) => {
    switch (key) {
      case 'edit':
        onEdit();
        break;
      case 'clear':
        toggleClear();
        break;
      default:
        onGenerateQuote();
    }
  };

  // Calculate hasRows based on the current tab and data
  const hasRows = useMemo(() => {
    // You'll need to get this information from your data
    // This is a placeholder - you may need to lift this state up from the child components
    // or pass it as a prop to determine if there are rows
    return false; // Replace with actual logic to check if there are rows
  }, [/* dependencies based on your data */]);

  const props = {
    currency,
    duration,
    entitlements,
    liveData,
    organisation,
    currencies,
    setCurrencies,
    onModalClose,
    setLiveData,
    togglePage,
    loading,
    setLoading,
    mode,
    setHomeCurrencies,
    homeCurrency,
    onChangeMode,
    homeCurrencies,
    addNew,
    clearMode,
    editMode,
    generateQuote,
    deleteMode,
    onGenerateQuoteSuccess,
    showManaged,
    toggleClear,
    filterBy,
    onDeleteNewRecord,
    onAddNew,
    showImpactAndSavings, // Add this prop
  };

  return (
    <Page variant="light" className="bg-white">
      <PlanUploadCSVPageContent className={['justify-center', 'align-items', 'bg-white']}>
        <FluenccyLoader loop={fetchingLiveRate} className="absolute z-1 w-12" style={{ position: 'absolute', zIndex: 1 }} />
        <QuoteHeader
          currencies={currencies}
          onChangeCurrency={setCurrency}
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
          onAddNew={onAddNew}
          onDeleteNew={onDeleteNew}
          editMode={editMode}
          onClickAction={onActions}
          onChangeManaged={onToggleShowManaged}
          showManaged={showManaged}
          month={duration}
          onChangeMonth={(v: any) => setDuration(v.id)}
          filterBy={filterBy}
          onFilter={setFilterBy}
          addNew={addNew}
          showImpactAndSavings={showImpactAndSavings}
          onToggleImpactAndSavings={handleToggleImpactAndSavings}
          hasRows={hasRows} // Add this prop
        />

        {receivableTab === 'payables' ? <QuotePayablePageContainer {...props} /> : <QuoteReceivablePageContainer {...props} />}
      </PlanUploadCSVPageContent>
    </Page>
  );
});
