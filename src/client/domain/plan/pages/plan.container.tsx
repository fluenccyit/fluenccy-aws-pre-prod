import React, { memo, useEffect, useState, useMemo, useRef } from 'react';
import { filter, map, isEmpty, find, differenceBy, orderBy, sortBy } from 'lodash';
import { Button, Page, PageContent, Text, localStorageService, useToast, TabModel, Input, TextSkeleton } from '@client/common';
import { useIntercom } from 'react-use-intercom';
import { useIsOrganisationTokenInactive, queryOrganisationsByToken, useQueryLocalOrganisation } from '@client/organisation';
import { PlanUploadCSVBreakdown, PlanUploadCSVPageContent, PayableContent, PlanTable } from '@client/plan';
import { PlanPage } from '@client/plan';
import { UploadCSVPage } from '@client/upload-csv';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { PlanTableSkeleton } from "@client/plan";
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import moment from "moment";

const renderImpactColumn = v => v.toString().match(/^-?\d+(?:\.\d{0,4})?/)[0];

const invoicesExtraColumns = [];
const basketExtraColumns = [{ key: 'amount', label: 'Amount' }, { key: 'probability', label: 'Probability' }, { key: 'pSaving', label: 'Potential saving' }];
const currencyImpactColumns = [
  { key: 'daysToPay', label: 'Days to Pay' },
  { key: 'currentCost', label: 'Current Cost', onRender: renderImpactColumn },
  { key: 'lossOrGain', label: 'Gain / Loss', onRender: renderImpactColumn },
  { key: 'potentialLoss', label: 'Potential Loss', onRender: renderImpactColumn }
]

const getStdDev = logs => {
  // Creating the mean with Array.reduce
  const mean = logs.reduce((acc, curr) => {
    return acc + curr
  }, 0) / logs.length;

  // Assigning (value - mean) ^ 2 to every array item
  const arr = logs.map((k) => {
    return (k - mean) ** 2
  })

  // Calculating the sum of updated array
  const sum = arr.reduce((acc, curr) => acc + curr, 0);

  // Calculating the variance
  const variance = sum / arr.length

  // Returning the Standered deviation
  return Math.sqrt(variance)
}

export const PlanPageContainer = memo(() => {
  const { show: showIntercom } = useIntercom();
  const history = useHistory();
  const isTokenInactive = useIsOrganisationTokenInactive();
  const [right, setRight] = useState([])
  const [isOpen, setOpen] = useState(history.location.state ? history.location.state.from === 'import' : false)
  const [payable, setPayable] = useState([]);
  const [currentPayableTab, setCurrentPayableTab] = useState('optimised');
  const [selectedFromBasket, setSelectedFromBasket] = useState([]);
  const [isOptimised, setIsOptimised] = useState(false);
  const [editableInvoice, setEditableInvoice] = useState('');
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('ALL');
  const [duration, setDuration] = useState('12months');
  const [currencies, setCurrencies] = useState([]);
  const [receivableTab, setReceivableTab] = useState('payables');
  const { addToast } = useToast();
  const { organisation } = useQueryLocalOrganisation();
  const [order, setOrder] = useState([{ colName: 'contactName', orderBy: 'asc' }, { colName: 'total', orderBy: 'asc' }, { colName: 'date', orderBy: 'asc' }, { colName: 'dateDue', orderBy: 'asc' }]);
  const [stdDev, setStdDev] = useState({});
  const [currencyImpacts, setCurrencyImpacts] = useState([]);
  const [liveData, setLiveData] = useState({});
  const today = useRef(null);

  const onSelect = (invoiceId: string, type: number) => {
    const selected = map(payable, (row, index) => {
      if (row.invoiceId == invoiceId) {
        return {
          ...row,
          isAddedToBucket: !row.isAddedToBucket
        }
      } else {
        return {
          ...row
        }
      }
    });
    setPayable(selected)
  }

  useEffect(() => {
    if (currencies.length) {
      getMxMarketLiveData();
      const liveSpotRate = setInterval(() => {
        getMxMarketLiveData();
      }, 3000);
      if (today.current !== moment().format('YYYY-MM-DD')) {
        getMxMarketHistoricalRate();
      }
      const historicalRate = setInterval(() => {
        if (today.current !== moment().format('YYYY-MM-DD')) {
          getMxMarketHistoricalRate();
        }
      }, 3000);
      return () => {
        clearInterval(historicalRate);
        clearInterval(liveSpotRate);
      }
    }
  }, [currencies]);

  useEffect(() => {
    calculateCurrencyImpact();
  }, [liveData, right]);

  useEffect(() => {
    getInvoice();
  }, [currency, duration, organisation])

  useEffect(() => {
    setRight([]);
    setIsOptimised(false);
    setEditableInvoice('');
  }, [organisation]);

  useEffect(() => {
    const data: any = right.map((r: object) => {
      const afterConvt = Number(r.total) / Number(r.currencyRate)
      return {
        ...r,
        pSaving: (afterConvt) * 10 / 100,
        probability: 50
      }
    });
    setRight(data);
    setIsOptimised(false);
    setEditableInvoice('');
  }, [currentPayableTab]);

  const addBasket = (e: any) => {
    const filterRow = filter(differenceBy(payable, right, 'invoiceId'), (row, index) => {
      return row.isAddedToBucket
    }).map(r => {
      const afterConvt = Number(r.total) / Number(r.currencyRate)
      return {
        ...r,
        pSaving: (afterConvt) * 10 / 100,
        probability: 50
      }
    });

    setRight([...filterRow, ...right]);
  }

  const onSelectFromBasket = (invoiceId: string, type: number) => {
    if (selectedFromBasket.find(o => o.invoiceId === invoiceId)) {
      setSelectedFromBasket(selectedFromBasket.filter(invoice => invoice.invoiceId !== invoiceId));
    } else {
      setSelectedFromBasket([...selectedFromBasket, right.find(o => o.invoiceId === invoiceId)]);
    }
  }

  const onRemoveFromBasket = () => {
    const records = differenceBy(right, selectedFromBasket, 'invoiceId');
    const selectedIds = selectedFromBasket.map(s => s.invoiceId);
    const payableRecords = payable.map(r => {
      if (selectedIds.includes(r.invoiceId)) {
        const tmpR = {
          ...r,
          isAddedToBucket: false
        };
        delete tmpR.probability;
        delete tmpR.pSaving;
        return tmpR;
      }
      return r;
    })
    setRight(records);
    setPayable(payableRecords);
    setSelectedFromBasket([]);
    if (isEmpty(records)) {
      setIsOptimised(false);
      setCurrentPayableTab('optimised');
    }
  }

  const onEditSaving = (value: Number, id: string) => {
    const data = map(right, r => {
      if (r.invoiceId === id) {
        return {
          ...r,
          pSaving: value,
          probability: value > r.pSaving ? 40 : 50
        }
      }
      return r;
    });
    setRight(data);
  }

  const onBlurSaving = (e: any, id: string, prevValue: string) => {
    setEditableInvoice('');
    onEditSaving(Number(e.target.value || prevValue), id);
  }

  const toggleView = () => {
    setOpen(!isOpen)
  }

  const calculateStddev = prices => {
    const groupByCurrency = Object.values(prices).reduce((acc, p) => {
      Object.keys(p).forEach(k => {
        if (acc[k]) {
          acc[k].push(p[k]);
        } else {
          acc[k] = [p[k]];
        }
      });
      return acc;
    }, {});

    const stdDevByCurrency = Object.keys(groupByCurrency).reduce((acc, c) => {
      const logs = [];
      const d = groupByCurrency[c];
      for (let i = 0; i < d.length - 1; i++) {
        logs.push(Math.log(d[i + 1] / d[i]));
      }
      acc[c] = getStdDev(logs);
      return acc;
    }, {});
    console.log(stdDevByCurrency);
    setStdDev(stdDevByCurrency);
  }

  const calculateCurrencyImpact = () => {
    const records = right.map(r => {
      const currencyPair = `${organisation?.currency}${r.currencyCode}`;
      const spotRate = liveData[currencyPair];
      const daysToPay = -1 * moment(r.dateDue).diff(moment(), 'days');
      const currentCost = Number(r.total) / (spotRate * (1 - 0.6));
      const lossOrGain = Number(r.total) / Number(r.currencyRate) - currentCost;
      const potentialLoss = lossOrGain - (1 * Math.sqrt(daysToPay) * stdDev[currencyPair] * currentCost);
      return {
        id: r.invoiceId,
        daysToPay,
        currentCost,
        lossOrGain,
        potentialLoss
      }
    });

    setCurrencyImpacts(records);
  }

  const getMxMarketHistoricalRate = async () => {
    try {
      const url = "/api/hedge/mxmarket/monthly-history";
      const currencyPairs = currencies.map(c => `${organisation.currency}${c.currencyCode}`);
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        'authorization': token,
      }
      axios
        .post(url, {
          currencyPairs: currencyPairs.join(',')
        }, {
          headers: headers
        })
        .then((res) => {
          calculateStddev(res.data.data.price);
        }).catch(e => {
          console.log(e);
        });
    } catch (e) {
      console.error(e.data);
    }
  }

  const getMxMarketLiveData = async () => {
    try {
      const url = "/api/hedge/mxmarket/live-spot-rate";
      const currencyPairs = currencies.map(c => `${organisation.currency}${c.currencyCode}`);
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        'authorization': token,
      }
      axios
        .post(url, {
          currencyPairs: currencyPairs.join(',')
        }, {
          headers: headers
        })
        .then((res) => {
          setLiveData(res.data.data.price);
          // setLiveData({
          //   "AUDUSD": 0.65571
          // })
        }).catch(e => {
          console.log(e);
        });
    } catch (e) {
      console.error(e);
    }
  }

  const getInvoice = async () => {
    try {
      try {
        const data = new FormData();

        let url = `/api/hedge/invoices`;
        const token = localStorageService.getItem('firebase-token');
        const headers = {
          'authorization': token,
        }

        const orgId = organisation?.id;
        const tenantId = organisation?.tenant.id;
        // const isHedging = history.location.pathname == '/plan' ? true : false
        axios
          .post(url, {
            tenantId: tenantId,
            orgId: orgId,
            currency: currency,
            filter: parseInt(duration, 10)
          }, {
            headers: headers
          })
          .then((res) => {
            setPayable(res.data.data.invoices.filter(r => !r.isAddedToBucket));
            setCurrencies(res.data.data.currencies);
            setLoading(false);
          });
      } catch ({ message }) {
        if (message === APOLLO_ERROR_MESSAGE.authenticationFailed) {
          history.push(AUTH_ROUTES.login);
        } else {
          // setIsError(true);
          setLoading(false);
        }
      }
    } catch (e) {

    }
  }

  const updateInvoices = async (hedgingType = "") => {
    try {
      try {
        const confirmBox = window.confirm(
          "Do you really want to hedge these invoices with option - " + hedgingType + " and notify user via email?"
        )
        if (confirmBox === false) {
          return;
        }
        const data = new FormData();
        setLoading(true);

        let url = `/api/hedge/update-invoices`;
        const token = localStorageService.getItem('firebase-token');
        const headers = {
          'authorization': token,
        }

        const orgId = organisation?.id;
        const tenantId = organisation?.tenant.id;
        const bucketInvoices = right.map(r => {
          const data = { ...r };
          delete data.probability;
          delete data.pSaving;
          return data;
        });

        const { totalAmount, totalSaving, avgProbability } = addToBasketAmountDetails;
        const hedgingData = {
          invoices: right,
          summary: {
            totalAmount,
            totalSaving,
            avgProbability,
            'orgCurrency': organisation?.currency
          }
        };

        axios
          .post(url, {
            tenantId,
            orgId,
            invoices: [],
            bucketInvoices,
            hedgingType,
            hedgingData
          }, {
            headers: headers
          })
          .then((res) => {
            getInvoice();
            setRight([]);
            setIsOptimised(false);
            setLoading(false);
            addToast('Invoices hedged successfully');
          });

      } catch ({ message }) {
        if (message === APOLLO_ERROR_MESSAGE.authenticationFailed) {
          history.push(AUTH_ROUTES.login);
        } else {
          // setIsError(true);
          // setIsLoading(false);
          addToast(message, 'danger');
        }
      }
    } catch (e) {
      addToast('Exception occurred... Kindly try again by reloading page.', 'danger');
    }
  }

  const onChangePayableTab = (activeTab: TabModel<string>) => {
    setCurrentPayableTab(activeTab.id);
  };

  const addToBasketAmountDetails = useMemo(() => {
    const totalAmount = right.reduce((sum, r) => sum + (Number(r.total) / Number(r.currencyRate)), 0.0).toFixed(2);
    return {
      totalAmount,
      avgProbability: isOptimised || currentPayableTab === 'customised' ? (right.reduce((sum, r) => sum + Number(r.probability), 0.0) / right.length).toFixed(2) : 0.0,
      totalSaving: isOptimised || currentPayableTab === 'customised' ? (right.reduce((sum, r) => sum + Number(r.pSaving), 0.0)).toFixed(2) : 0.0
    }
  }, [right, isOptimised, currentPayableTab]);

  const leftInvoices = useMemo(() => differenceBy(payable, right, 'invoiceId'), [payable, right]);

  const onClickSavingEditCell = (invoiceId: string) => {
    setTimeout(() => document.getElementById(`input-basket-${invoiceId}`).focus(), 100);
    setEditableInvoice(invoiceId);
  }

  const handleOnDragEndItem = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const rightCopy = [...right];

    if (source.droppableId === 'invoices-basket-list' && destination.droppableId === 'invoices-basket-list') return;

    if (source.droppableId === 'invoices-list' && destination.droppableId === 'invoices-basket-list') {
      let [reorderedItem] = [...leftInvoices].splice(result.source.index, 1);
      const afterConvt = Number(reorderedItem.total) / Number(reorderedItem.currencyRate);
      reorderedItem = {
        ...reorderedItem,
        pSaving: (afterConvt) * 10 / 100,
        probability: 50
      }
      rightCopy.splice(result.destination.index, 0, reorderedItem);
    } else {
      let [reorderedItem] = rightCopy.splice(result.source.index, 1);
      const payableRecords = payable.map(r => {
        if (reorderedItem.invoiceId === r.invoiceId) {
          const tmpR = {
            ...reorderedItem,
            isAddedToBucket: false
          };
          delete tmpR.probability;
          delete tmpR.pSaving;
          return tmpR;
        }
        return r;
      })
      setPayable(payableRecords);
    }
    setRight(rightCopy);
  }

  const renderExtraColumns = (record: object, column: string) => {
    switch (column) {
      case 'variance':
        return <td key={column} className="whitespace-nowrap text-xs py-4 flex-grow-0 md:flex-grow px-6 text-gray-500">
          + ${(((record.variance || record.amountDue) * 100) / 100).toFixed(2)}%
        </td>;
      case 'amount':
        return <td key={column} className="whitespace-nowrap text-xs py-4 flex-grow-0 md:flex-grow px-6 text-gray-500">${(Number(record.total) / Number(record.currencyRate)).toFixed(2)} {organisation.currency}</td>;
      case 'probability':
        return <td key={column} className="whitespace-nowrap text-xs py-4 flex-grow-0 md:flex-grow px-6 text-gray-500">{isOptimised || currentPayableTab === 'customised' ? `${record.probability}%` : '0%'}</td>;
      case 'pSaving':
        return (
          <td key={column} className="whitespace-nowrap text-xs py-4 flex-grow-0 md:flex-grow px-6 text-gray-500">
            {editableInvoice === record.invoiceId ?
              <span className="bg-red-400 rounded-full p-1 block">
                <Input className='p-0.5' id={`input-basket-${record.invoiceId}`} style={{ width: '5rem' }} onBlur={e => onBlurSaving(e, record.invoiceId, record.pSaving)} defaultValue={record.pSaving.toFixed(2)} />
              </span>
              : <span style={{ cursor: 'cell' }} className="bg-red-400 rounded-full p-1 cursor-cell" onClick={currentPayableTab !== 'optimised' ? (e) => onClickSavingEditCell(record.invoiceId) : null}>${isOptimised || currentPayableTab === 'customised' ? record.pSaving.toFixed(2) : 0} {organisation.currency}</span>
            }
          </td>
        );
      default:
        return <td key={column} className="whitespace-nowrap text-xs py-4 flex-grow-0 md:flex-grow px-6 text-gray-500"></td>;
    }
  }

  const renderPayableContent = () => {
    return (
      <>
        <div className="w-1/2 p-2">
          <div className="flex justify-end p-4">  {loading ? <TextSkeleton className="my-0.5 h-10 w-32" /> : <Button className="rounded-full p-2" onClick={addBasket}>Add to basket</Button>}</div>
          <div>
            {loading ? <PlanTableSkeleton rows={5} columns={4} /> :
              isEmpty(leftInvoices) && !loading ? (
                <Droppable droppableId="invoices-list">
                  {(provided) => (
                    <div className="flex justify-center text-gray-600 py-6 border-2 border-dashed items-center h-48 mt-20" {...provided.droppableProps} ref={provided.innerRef}>
                      <div>
                        No invoices
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              ) : <PlanTable droppableId="invoices-list" rows={leftInvoices} onSelect={onSelect} name="Add to basket" renderExtraColumns={renderExtraColumns} extraColumns={invoicesExtraColumns} sortColumns={onSort} />}
          </div>
        </div>
        <div className="w-1/2 p-2">
          <div className="flex justify-end p-4">
            {(isOptimised || currentPayableTab === 'customised') ? <>
              <Button className="rounded-full p-2 mr-2 bg-green-400" variant="success" onClick={() => updateInvoices('SPOT')} isDisabled={isEmpty(right)}>Spot</Button>
              <Button className="rounded-full p-2 mr-3 bg-blue-600" style={{ backgroundColor: "##0000ff" }} onClick={() => updateInvoices('FORWARD')} isDisabled={isEmpty(right)}>Forward</Button>
              <Button className="rounded-full p-2 mr-4 bg-gray-500" style={{ backgroundColor: "#808080" }} onClick={() => updateInvoices('LIMIT')} isDisabled={isEmpty(right)}>Limit</Button>
            </> : (loading ? <TextSkeleton className="my-0.5 h-10 w-32 p-2 mr-2" /> : <Button className="rounded-full p-2 mr-4 bg-green-600" style={{ backgroundColor: "##0000ff" }} onClick={() => { setIsOptimised(true); addToast('Invoices\' hedging is optimized now...', 'success'); }} isDisabled={isEmpty(right)}>Optimize Now</Button>)}
            {/* <Button className="rounded-full p-2 mr-4" onClick={updateInvoices}>Save</Button> */}
            {loading ? <TextSkeleton className="my-0.5 h-10 w-32 p-2 mr-2" /> : <Button className="rounded-full p-2" onClick={onRemoveFromBasket} isDisabled={isEmpty(selectedFromBasket)}>Remove from basket</Button>}
          </div>
          {
            isEmpty(right) && !loading ? (
              <Droppable droppableId="invoices-basket-list">
                {(provided) => (
                  <div className="flex justify-center text-gray-600 py-6 border-2 border-dashed items-center h-48 mt-20" {...provided.droppableProps} ref={provided.innerRef}>
                    <div>
                      No invoices in basket
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>)
              : <>
                {loading ? <PlanTableSkeleton rows={5} columns={4} /> : <PlanTable droppableId="invoices-basket-list" rows={right} onSelect={onSelectFromBasket} extraColumns={basketExtraColumns} renderExtraColumns={renderExtraColumns} onEditSaving={currentPayableTab === 'customised' ? onEditSaving : null} sortColumns={null} />}
                {!loading ? <div className="flex flex-col justify-between  py-6">
                  <div className="flex justify-between  py-6">
                    <div className="text-sm w-1/3 p-6 border-r">
                      Cost in <span className="font-bold"> {organisation.currency}: </span>
                      <span className="text-gray-500"> With </span>
                      <span className="text-green-600 font-bold"> Fluenccy </span><br />
                      <span className="font-bold">${addToBasketAmountDetails.totalAmount} {organisation.currency}</span>
                    </div>
                    <div className="text-sm w-1/3 p-6 border-r">
                      <div className="text-center"> <span>Total Probability</span>
                        <br />
                        <span className="text-green-600  rounded-full bg-green-200">+ {addToBasketAmountDetails.avgProbability}%</span>
                      </div>
                    </div>
                    <div className="text-sm  w-1/3 p-6">
                      <span>Savings</span><br />
                      <span className="font-bold">${addToBasketAmountDetails.totalSaving} {organisation.currency}</span>
                    </div>
                  </div>
                  <PlanTable
                    rows={currencyImpacts}
                    columns={currencyImpactColumns}
                    draggable={false}
                  />
                </div> :
                  <div className="flex justify-between  py-6">
                    <div className="text-sm w-1/3 p-6 border-r">
                      <span className="font-bold"> <TextSkeleton className="my-0.5 h-3 w-32" /></span>
                      <span className="text-gray-500"> <TextSkeleton className="my-0.5 h-3 w-32" /> </span>
                      <span className="text-green-600 font-bold"> <TextSkeleton className="my-0.5 h-3 w-32" /> </span><br />
                      <span className="font-bold"><TextSkeleton className="my-0.5 h-3 w-32" /></span>
                    </div>
                    <div className="text-sm w-1/3 p-6 border-r">
                      <div className="text-center"> <span><TextSkeleton className="my-0.5 h-3 w-32" /></span>
                        <br />
                        <span className="text-green-600  rounded-full bg-green-200"><TextSkeleton className="my-0.5 h-3 w-32" /></span>
                      </div>
                    </div>
                    <div className="text-sm  w-1/3 p-6">
                      <span><TextSkeleton className="my-0.5 h-3 w-32" /></span><br />
                      <span className="font-bold"><TextSkeleton className="my-0.5 h-3 w-32" /></span>
                    </div>
                  </div>
                }
              </>
          }
        </div>
      </>
    )
  }

  const renderReceivableContent = () => {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <span className="text-3xl">Comming soon</span>
      </div>
    )
  }

  const isFilterMode = duration !== '12months' || currency !== 'ALL';


  const onSort = (colName: string) => {
    const filteredCol = filter(order, { "colName": colName })

    const sortedRecords = orderBy(payable, [colName], [filteredCol.length > 0 ? filteredCol[0].orderBy : 'asc'])
    setPayable(sortedRecords)
    if (filteredCol.length > 0) {
      filteredCol[0].orderBy = filteredCol[0].orderBy === 'asc' ? 'desc' : 'asc'

      const newOrder = [{
        colName: filteredCol[3].colName,
        orderBy: filteredCol[3].orderBy

      }]
      setOrder(newOrder)
    }
  }

  return (
    <Page variant="light">
      <PlanUploadCSVPageContent className={["justify-center", "align-items"]}>
        {payable.length === 0 && !isOpen && !isFilterMode && !loading ? <PlanPage btnText="Import" onClick={toggleView} /> :
          <>{
            isOpen && <>
              <div className="pt-1 absolute w-full flex justify-end pr-16  pb-4 z-50" style={{ zIndex: 99 }}>
                <Button onClick={toggleView}>Back</Button>
              </div>
              <UploadCSVPage />
            </>
          }
            {
              !isOpen && <>
                <div>
                  <PayableContent
                    currencies={currencies}
                    onChangePayableTab={onChangePayableTab}
                    onChangeCurrency={setCurrency}
                    tab={currentPayableTab}
                    month={duration}
                    onChangeMonth={(v: any) => setDuration(v.id)}
                    loading={loading}
                    receivable={receivableTab}
                    onChangeReceivable={(v: any) => setReceivableTab(v.id)}
                  />
                </div>
                <div className="pt-2 absolute flex justify-end pr-16 pb-4" style={{ right: "15px" }} >
                  {loading ? <TextSkeleton className="my-0.5 h-10 w-32" /> : <Button onClick={toggleView}>Import</Button>}
                </div></>
            }

            <div className="flex justify-around h-full w-full bg-white pt-20 px-6">
              <DragDropContext onDragEnd={handleOnDragEndItem}>
                <div className={true ? "w-auto" : "w-1/2"}>
                  {/* <PlanUploadCSVBreakdown /> */}
                </div>
                {
                  !isOpen && (receivableTab === 'payables' ? renderPayableContent() : renderReceivableContent())
                }
              </DragDropContext>
            </div>
          </>}
      </PlanUploadCSVPageContent>
    </Page>
  );
});
Button