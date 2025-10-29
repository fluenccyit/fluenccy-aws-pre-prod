
export const calculateImpactOptions= (record, entitlements, spotRate) => {
  const entitlement = entitlements[record.currencyCode];
  console.log("entitlement",entitlement)
  if(!entitlement) {
    return []
  }
  const {orgEntitlementItems = []} = entitlement?.[0] || {};
  const counterParties = {};
  const groupByIndex = orgEntitlementItems.reduce((results, entitlement) => {
    const index = entitlement.name.replace(/\D/g, '');
    if (index && entitlement.min) {
      return {...results, [index]: [...(results[index] || []), entitlement]}
    }
    if (entitlement.name.includes('counterParty')) {
      counterParties[index] = entitlement.id;
    }
    return results;
  }, {});
    
  const filterItems = Object.values(groupByIndex).filter((records) => records.length >= 2);
  let prevOptimisedRate = record.optimisedRate;
  return filterItems.map((items, i) => {
    const strikeRate = items.find(item => item.name.includes("strike"));
    const deltaRate = items.find(item => item.name.includes("delta"));
    const clientSpotRate = spotRate * strikeRate.min;
    const currentCost = Number(record.total || 0) / clientSpotRate;
    const lossOrGain = Number(record.total || 0) / Number(record.currencyRate || 0) - Number(currentCost || 0);
    const optimisedRate = clientSpotRate + ((prevOptimisedRate - record.currentRate) * deltaRate.min);
    prevOptimisedRate = optimisedRate;
    const targetCost = Number(record.total || 0) / optimisedRate;
    const saving = lossOrGain + (currentCost - targetCost);
    return {
      ...record,
      currentCost,
      lossOrGain,
      currentRate: clientSpotRate,
      id: record.invoiceId + `_${i+1}`,
      optimisedRate,
      strikeRate: strikeRate.min,
      deltaRate: deltaRate.min,
      targetCost,
      saving,
      counterPartyEntitlementItemId: counterParties[i+1]
    };
  })
}

export const calculateOptimisedRate = (invoice) => {
  console.log("calculateOptimisedRate", invoice)
  return 0;
}