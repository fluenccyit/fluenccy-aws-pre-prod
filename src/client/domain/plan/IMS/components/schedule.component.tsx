import {
  useModal,
  uiVar,
  Button,
  FlagIcon,
  loggerService,
  Text,
  useToast,
  useQueryLocalCommon,
  Icon,
  Checkbox,
  Toggle,
  FluenccyLoader,
  localStorageService,
  Input,
} from '@client/common';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import moment from 'moment';
import { VictoryPie } from 'victory';
import { format } from '@client/utils/number';
import styled from 'styled-components';
import { Recurring, ScheduleForm } from '@client/plan/IMS/components';
import { ActionTooltipContent } from './action-tooltip-content.component';
import axios from 'axios';
import { queryUser, useQueryLocalUser } from '@client/user';

const fields = ['Forward', 'Order', 'Spot'];

type Props = {
  title: string;
  showFooter?: Boolean;
  onApprove: Function;
  invoice: object;
  organisation: object;
  marginPerc: object | undefined;
  liveRates: object;
  optimisedRate: number;
  fosPercents: object;
  editable: boolean;
  cb: Function;
};

export const ScheduleModal = ({
  onClose,
  currencies = [],
  onToggleHedgeEverything,
  isHedgingEverything,
  showMarkAsPaidBtn = false,
  onMarkAsPaid,
  editable,
  onApprove,
  invoice,
  organisation,
  optimisedRateForOption,
  marginPerc = {},
  getOptimisedPayableRate,
  fosPercents = {},
  setRates,
  onUpdateBuyingSchedule,
  cb,
  showHedgingEverything = true,
  onGenerateTermSheet,
  entitlements,
}: Props) => {
  const [showRecurring, setShowRecurring] = useState(false);
  const [recurrData, setRecurrData] = useState({ type: 'company', approvalMethod: 'Notification only' });
  const { closeModal } = useModal();
  const { addToast } = useToast();
  const { ui } = useQueryLocalCommon();
  const [liveRates, setLiveRates] = useState({});
  const [optimisedRate, setOptimisedRate] = useState(getOptimisedPayableRate ? getOptimisedPayableRate(invoice) : optimisedRateForOption || 0);
  const intervalRef = useRef();
  const { user } = useQueryLocalUser();
  const [rateEditable, setRateEditable] = useState(false);
  const [forwardEditValue, setForwardEditValue] = useState();
  const [orderEditValue, setOrderEditValue] = useState();
  const [error, setError] = useState({ forward: false, order: false });

  const {
    currentCost,
    targetCost,
    dateDue,
    forwardPercentage,
    forwardValue,
    orderDate,
    orderPercentage,
    orderValue,
    spotDate,
    spotPercentage,
    spotValue,
    forwardRate,
    optimizedRate,
    executedForwardDate,
    executedForwardRate,
    executedForwardValue,
    executedOrderDate,
    executedOrderRate,
    executedOrderValue,
    executedSpotDate,
    executedSpotRate,
    executedSpotValue,
    optimaisedValue,
    optimaisedPer,
    isHedgedEverything,
    overriden,
  } = invoice.buyingSchedule || {};
  const { forwardMarginPercentage = 0.0, limitOrderMarginPercentage = 0.0, orderProbability = 0.0, spotMarginPercentage = 0.0 } = marginPerc;

  useEffect(() => {
    if (currencies.length && !editable) {
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
    if (!editable && !invoice.isPricing) {
      setRates(liveRates);
      setOptimisedRate(getOptimisedPayableRate ? getOptimisedPayableRate(invoice, liveRates) : optimisedRateForOption || optimizedRate);
    }
  }, [liveRates]);

  const calculateCurrenctCost = (value, type) => {
    let calcMarginPercentage = 0;
    let spotRate = 0;

    const currencyPair =
      invoice.mode == 'receivables' ? `${invoice.homeCurrencyCode}${invoice.currencyCode}` : `${organisation?.currency}${invoice.currencyCode}`;
    if (type === 'forward') {
      calcMarginPercentage = parseFloat(forwardMarginPercentage) / 100;
      spotRate = invoice.isApproved === 'true' || overriden ? Number(forwardRate) : liveRates[currencyPair];
    } else if (type === 'order') {
      // calcMarginPercentage = parseFloat(limitOrderMarginPercentage) / 100;
      calcMarginPercentage = 0;
      spotRate = invoice.isApproved === 'true' || overriden ? Number(optimizedRate) : optimisedRate;
    } else {
      calcMarginPercentage = parseFloat(spotMarginPercentage) / 100;
      spotRate = executedSpotRate != 0.0 ? executedSpotRate : Number(forwardRate);
    }

    return Number(value) / (spotRate * (1 - calcMarginPercentage) || 1);
  };

  const onRecurringChange = (field, v) => {
    setRecurrData((prev) => ({ ...prev, [field]: v }));
  };

  const handleApprove = async () => {
    try {
      uiVar('saving');
      const payload = {
        currentCost: calculateCurrenctCost(forwardValue, 'forward'),
        targetCost: calculateCurrenctCost(orderValue, 'order'),
        optimizedRate: overriden ? orderEditValue : optimisedRate,
        forwardRate: overriden
          ? forwardEditValue
          : invoice.mode == 'receivables'
          ? liveRates[`${invoice.homeCurrencyCode}${invoice.currencyCode}`]
          : liveRates[`${organisation?.currency}${invoice.currencyCode}`],
      };

      if (showRecurring) {
        const { contactName, manage_type, currencyCode } = invoice;
        const { endDate, capVolume, approvalMethod, type } = recurrData;
        if (endDate) {
          payload.endDate = endDate;
        }
        if (capVolume) {
          payload.capVolume = Number(capVolume);
        }
        if (approvalMethod) {
          payload.approvalMethod = approvalMethod;
        }
        if (type) {
          if (type === 'company') {
            payload.company = contactName;
          } else {
            payload.currency = currencyCode;
          }
        }
        payload.manageType = manage_type;
      }
      await onApprove(invoice.invoiceId, payload);
      uiVar('ready');
      closeModal();
      addToast('Schedule approved.');
    } catch (error) {
      loggerService.error(error);
      addToast("Couldn't approve.", 'danger');
      uiVar('ready');
    }
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
          setLiveRates(res.data.data.price);
        })
        .catch((e) => {
          console.log(e);
        });
    } catch (e) {
      console.error(e);
    }
  };

  const onToggleHedge = (isChecked) => {
    const payload = {
      optimaisedValue: 0,
      optimaisedPer: 0,
      isHedgedEverything: false,
      optimizedRate: 0,
    };
    if (isChecked) {
      payload.optimaisedValue = calculateCurrenctCost(invoice.total, 'order');
      payload.optimaisedPer = 100;
      payload.isHedgedEverything = true;
      payload.optimizedRate = invoice.isApproved === 'true' || overriden ? Number(optimizedRate) : optimisedRate;
    }
    payload.invoiceId = invoice.invoiceId;
    onToggleHedgeEverything(payload);
  };

  const toggleRecurring = () => setShowRecurring(!showRecurring);

  const onModalClose = () => {
    clearInterval(intervalRef.current);
    if (onClose) {
      onClose();
    }
    closeModal();
  };

  const calculateRate = (rate, type) => {
    if (type === 'forward') {
      let formattedRate = format(Number(rate), 5, 3);
      // return isHedgedEverything ? formattedRate : formattedRate - formattedRate * (forwardMarginPercentage / 100);
      return formattedRate;
    } else if (type === 'order') {
      // return rate - (rate * (limitOrderMarginPercentage/100));
      return rate;
    }
    return rate - rate * (spotMarginPercentage / 100);
  };

  const updateBuying = (payload, cb) => {
    try {
      onUpdateBuyingSchedule({ ...payload, invoiceId: invoice.invoiceId }, cb);
    } catch (e) {
      addToast('Exception occurred... Kindly try again by reloading page.', 'danger');
    }
  };
  const onOverride = () => {
    const updatedError = { forward: false, order: false };
    if (!forwardEditValue) {
      updatedError.forward = true;
    }
    if (!isHedgedEverything && invoice.manage_type === 'Plan' && !orderEditValue) {
      updatedError.order = true;
    }
    if (updatedError.forward || updatedError.order) {
      setError(updatedError);
      addToast('Please enter rate.', 'danger');
      return;
    }
    setError(updatedError);
    const payload = {
      optimizedRate: Number(isHedgedEverything ? forwardEditValue : orderEditValue) || 0,
      forwardRate: Number(forwardEditValue),
      overriden: true,
    };
    updateBuying(payload, () => setRateEditable(!rateEditable));
  };
  const onRevert = () => {
    const payload = { optimizedRate: 0, forwardRate: 0, overriden: false };
    updateBuying(payload);
  };
  const onCancelOverride = () => {
    setRateEditable(!rateEditable);
    setForwardEditValue('');
    setOrderEditValue('');
  };

  const memoBuyingScedules = useMemo(() => {
    let data = [
      {
        id: 1,
        percantage: invoice.isPricing && !editable ? 100 : Number(isHedgedEverything ? optimaisedPer : forwardPercentage).toFixed(2),
        value: Number(executedForwardValue) || Number(isHedgedEverything ? invoice.total : forwardValue),

        homeValue:
          invoice.isApproved === 'true'
            ? isHedgedEverything
              ? calculateCurrenctCost(invoice.total, 'order')
              : Number(currentCost) || calculateCurrenctCost(forwardValue, 'forward')
            : isHedgedEverything
            ? calculateCurrenctCost(invoice.total, 'order')
            : calculateCurrenctCost(forwardValue, 'forward'),
        executedValue: executedForwardValue && executedForwardRate ? Number(executedForwardValue) / Number(executedForwardRate) : 0,
        executedRate: calculateRate(executedForwardRate, 'forward'),
        date: executedForwardDate || moment(),
        editable: user.role === 'superdealer' && invoice.isApproved !== 'true',
        rate: overriden
          ? isHedgedEverything
            ? optimizedRate
            : forwardRate
          : calculateRate(
              isHedgedEverything
                ? invoice.isApproved === 'true'
                  ? optimizedRate
                  : invoice.isPricing
                  ? invoice.mode == 'receivables'
                    ? liveRates[`${invoice.homeCurrencyCode}${invoice.currencyCode}`]
                    : liveRates[`${organisation?.currency}${invoice.currencyCode}`]
                  : optimisedRate
                : invoice.isApproved === 'true'
                ? Number(forwardRate)
                : invoice.mode == 'receivables'
                ? liveRates[`${invoice.homeCurrencyCode}${invoice.currencyCode}`]
                : liveRates[`${organisation?.currency}${invoice.currencyCode}`],
              'forward'
            ),
        pieData: {
          data:
            invoice.isPricing && !editable
              ? [{ y: 100 }]
              : [
                  {
                    y: Number(isHedgedEverything ? optimaisedPer : forwardPercentage),
                  },
                  {
                    y: 100 - Number(isHedgedEverything ? optimaisedPer : forwardPercentage),
                  },
                ],
          colorScale:
            invoice.isPricing && !editable
              ? ['#10BC6A', '#10BC6A']
              : executedForwardValue
              ? ['#10BC6A', '#F0F1F8']
              : invoice.manage_type === 'Plan'
              ? ['rgba(16, 188, 106, 0.5)', '#F0F1F8']
              : ['#10BC6A', '#F0F1F8'],
        },
      },
    ];
    if (invoice.manage_type === 'Plan' && !isHedgedEverything) {
      data = [
        ...data,
        {
          id: 2,
          percantage: Number(orderPercentage) + Number(forwardPercentage),
          date: executedOrderDate || orderDate,
          value: Number(executedOrderValue) || Number(orderValue),

          homeValue:
            invoice.isApproved === 'true'
              ? Number(targetCost) || calculateCurrenctCost(orderValue, 'order')
              : calculateCurrenctCost(orderValue, 'order'),
          executedValue: executedOrderValue && executedOrderRate ? Number(executedOrderValue) / Number(executedOrderRate) : 0,
          executedRate: calculateRate(executedOrderRate, 'order'),
          rate: overriden ? optimizedRate : calculateRate(invoice.isApproved === 'true' ? optimizedRate : optimisedRate, 'order'),
          editable: user.role === 'superdealer' && invoice.isApproved !== 'true',
          pieData: {
            data: [
              {
                y: Number(forwardPercentage),
              },
              {
                y: Number(orderPercentage),
              },
              {
                y: 100 - (Number(orderPercentage) + Number(forwardPercentage)),
              },
            ],
            colorScale:
              executedForwardValue && executedOrderValue
                ? ['#10BC6A', '#10BC6A', '#F0F1F8']
                : [executedForwardValue ? '#10BC6A' : '#10BC6A', 'rgba(16, 188, 106, 0.5)', '#F0F1F8'],
          },
        },
        {
          id: 3,
          percantage: Number(spotPercentage) + Number(orderPercentage) + Number(forwardPercentage),
          date: executedSpotDate || moment(invoice.dateDue),
          value: Number(spotValue),
          homeValue: executedSpotValue,
          executedRate: calculateRate(executedSpotRate, 'spot'),
          pieData: {
            data: [
              {
                y: Number(orderPercentage) + Number(forwardPercentage),
              },
              {
                y: 100 - (Number(orderPercentage) + Number(forwardPercentage)),
              },
            ],
            colorScale:
              executedOrderValue && executedForwardValue && executedSpotValue
                ? ['#10BC6A', '#10BC6A']
                : [executedOrderValue && executedForwardValue ? '#10BC6A' : '#10BC6A', 'rgba(16, 188, 106, 0.5)'],
          },
        },
      ];
    }
    return data;
  }, [invoice, liveRates, optimisedRate, invoice.buyingSchedule]);

  const renderForm = (type, closePopup) => {
    return <ScheduleForm type={type} invoiceId={invoice.invoiceId} invoice={invoice} cb={cb} onClose={closePopup} />;
  };

  return (
    <div className="flex">
      {isHedgingEverything && <FluenccyLoader />}
      <div className="flex flex-col align-center w-full">
        <StyledHeader className="flex flex-col py-2 px-4 relative">
          <span className="header-title">Currency Plan</span>
          <div className="flex items-center">
            <span>{invoice.invoiceNumber}</span>
            <span className="mx-1">|</span>
            <span>{invoice.contactName}</span>
          </div>
          <Icon
            icon="close"
            className="absolute cursor-pointer"
            style={{
              top: '40%',
              right: '20px',
            }}
            onClick={onModalClose}
          />
        </StyledHeader>
        <div className="w-full p-4">
          <span className="flex justify-start items-center font-medium my-4 text-base" style={{ color: '#1C1336' }}>
            Your Currency Plan for {invoice.contactName} - Invoice {invoice.invoiceNumber}
          </span>
          <div className={`flex w-full justify-around mb-2`}>
            {memoBuyingScedules.map((r, i) => (
              <div key={r.id} className="flex flex-col items-center py-4 relative">
                {editable && !invoice.isMarkedAsPaid && !invoice.isMarkedAsReceived && (
                  <ActionTooltipContent renderContent={renderForm.bind(null, fields[i])} iconContainerClass="float-right" icon="edit" />
                )}
                <div>
                  <svg width={150} height={150}>
                    <text x={50} y={80}>
                      {parseFloat(r.percantage).toFixed(2)}%
                    </text>
                    <VictoryPie innerRadius={60} {...r.pieData} radius={70} width={150} height={150} labels={() => null} standalone={false} />
                  </svg>
                </div>
                <div className="flex flex-col">
                  {r.date && (
                    <span className="text-sm flex my-3 justify-center" style={{ color: '#1C1336' }}>
                      {invoice.manage_type === 'Plan' ? moment(r.date).format('DD MMMM YYYY') : `Today (${moment(r.date).format('DD MMMM YYYY')})`}
                      {r.id == 1 ? (
                        <span className="flex">
                          (Rate:{' '}
                          {rateEditable ? (
                            <Input
                              onChange={(v) => setForwardEditValue(v.target.value)}
                              value={forwardEditValue}
                              className="right"
                              style={{ width: '80px', padding: '2px 4px', border: error.forward ? '1px solid red' : 'auto' }}
                              autoFocus
                              type="number"
                            />
                          ) : (
                            Number(r.rate).toFixed(5)
                          )}{' '}
                          )
                        </span>
                      ) : (
                        ``
                      )}
                    </span>
                  )}
                  {!!r.rate && r.id == 2 && (
                    <span className="flex text-sm my-3 justify-center" style={{ color: '#1C1336' }}>
                      Rate:{' '}
                      {rateEditable ? (
                        <Input
                          onChange={(v) => setOrderEditValue(v.target.value)}
                          value={orderEditValue}
                          className="right"
                          style={{ width: '80px', padding: '2px 4px', border: error.order ? '1px solid red' : 'auto' }}
                          type="number"
                        />
                      ) : (
                        `(${Number(r.rate).toFixed(5)})`
                      )}{' '}
                    </span>
                  )}
                  {/* {!r.date && (
                    <span className="flex text-sm my-3 justify-center" style={{ color: '#1C1336' }}>
                      Order
                    </span>
                  )} */}
                  <div className="flex justify-center">
                    <FlagIcon currency={invoice.currencyCode} style={{ width: '22px' }} />
                    <Text className="ml-2 text-sm font-bold">{format(Number(r.value), 2, 3)}</Text>
                  </div>
                  {!!r.homeValue && (
                    <div className="flex justify-center">
                      <FlagIcon
                        currency={invoice.mode === 'receivables' ? invoice.homeCurrencyCode : organisation.currency}
                        style={{ width: '22px' }}
                      />
                      <Text className="ml-2 text-sm font-bold">{format(Number(r.homeValue), 2, 3)}</Text>
                    </div>
                  )}
                  {!!r.executedValue && (
                    <div className="flex justify-center">
                      <FlagIcon
                        currency={invoice.mode === 'receivables' ? invoice.homeCurrencyCode : organisation.currency}
                        style={{ width: '22px' }}
                      />
                      <Text className="ml-2 text-sm font-bold">
                        {format(Number(r.executedValue), 2, 3)} ({r.executedRate})
                      </Text>
                    </div>
                  )}
                  {!!r.rate && entitlements?.showInversedRate && (
                    <span className="flex text-sm my-3 justify-center" style={{ color: '#1C1336' }}>
                      Inversed Rate: {(1 / Number(r.rate)).toFixed(5)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {user?.role === 'superdealer' && invoice.isApproved !== 'true' && !invoice.isPricing && (
            <div className={`flex w-full justify-center mb-2`}>
              {!rateEditable && (
                <Button onClick={() => setRateEditable(!rateEditable)} variant="info" className="rounded-full font-bold mr-2" isDisabled={overriden}>
                  Override
                </Button>
              )}
              {rateEditable && (
                <>
                  <Button onClick={onOverride} variant="success" className="rounded-full font-bold" isDisabled={ui === 'saving'}>
                    Save
                  </Button>
                  <Button onClick={onCancelOverride} variant="cancel" className="rounded-full font-bold" isDisabled={ui === 'saving'}>
                    Cancel
                  </Button>
                </>
              )}
              <Button onClick={onRevert} variant="success" className="rounded-full font-bold" isDisabled={rateEditable || !overriden}>
                Optimise
              </Button>
            </div>
          )}
          {((invoice.isApproved === 'false' && !invoice.isAutoManaged) || invoice.manage_type === 'Plan') && (
            <>
              <StyledRecurring className="flex flex-col">
                {showHedgingEverything && invoice.manage_type === 'Plan' && (
                  <div className="flex py-2">
                    <span>Hedge Everything</span>
                    <Toggle className="ml-2" isDisabled={invoice.isApproved === 'true'} isChecked={isHedgedEverything} onChange={onToggleHedge} />
                  </div>
                )}

                {invoice.isApproved === 'false' && !invoice.isAutoManaged && !invoice.isPricing && (
                  <>
                    {' '}
                    <div className="flex items-center py-3">
                      <span className="mr-1">
                        Do you want to set up a recurring {invoice.manage_type === 'Plan' ? 'currency' : '"Buy Now"'} plan?
                      </span>
                      <Checkbox onChange={toggleRecurring} isChecked={showRecurring} />
                    </div>
                    {showRecurring && <Recurring invoice={invoice} onChange={onRecurringChange} data={recurrData} />}
                  </>
                )}
              </StyledRecurring>
              <StyledTc className="flex items-center py-3">By starting this plan, you agree to Fluenccy’s Terms and Conditions.</StyledTc>
            </>
          )}
        </div>
        <div className="flex mb-8 ml-4">
          <Button onClick={onModalClose} variant="danger" state="filled" className="rounded-full font-bold mr-2" isDisabled={ui === 'saving'}>
            Cancel
          </Button>
          {showMarkAsPaidBtn && !invoice.isMarkedAsPaid && !invoice.isMarkedAsReceived && (
            <Button onClick={onMarkAsPaid} variant="info" state="filled" className="rounded-full font-bold mr-2" isDisabled={ui === 'saving'}>
              Mark as {invoice.mode ? 'Received' : 'Paid'}
            </Button>
          )}
          {invoice.isApproved === 'false' && !invoice.isAutoApproved && (
            <Button onClick={handleApprove} variant="success" className="rounded-full font-bold" isDisabled={ui === 'saving'}>
              Approve Plan
            </Button>
          )}
          {onGenerateTermSheet && (
            <Button
              onClick={() => onGenerateTermSheet(invoice)}
              variant="xero-blue"
              className="rounded-full font-bold ml-2"
              isDisabled={ui === 'saving'}
            >
              Generate Term Sheet
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const StyledHeader = styled.div`
  background: #1c1336;
  color: #ffffff;
  font-size: 12px;
  .header-title {
    font-size: 16px;
    font-weight: bold;
  }
`;

const StyledRecurring = styled.div`
  border-top: 1px solid #e8e9f3;
  border-bottom: 1px solid #e8e9f3;
  color: #1c1336;
  font-size: 14px;
  font-weight: 500;
`;

const StyledTc = styled.div`
  color: #545565;
  font-size: 12px;
`;
