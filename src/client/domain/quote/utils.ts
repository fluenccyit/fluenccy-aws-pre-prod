export const EDITABLE_COLUMNS = ['invoiceNumber',  'currencyCode', 'total', 'date', 'dateDue', 'contactName', 'currencyRate'];
export const RECEIVABLE_EDITABLE_COLUMNS = ['invoiceNumber',  'currencyCode', 'homeCurrencyCode', 'total', 'date', 'dateDue', 'contactName', 'currencyRate'];
export const DAYS_FOR_CALCULATIONS = 365;

export const getStdDev = (logs) => {
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

export const newInvoice = { isNew: true };

export const FILTER_OPTIONS = [
  {value: "", label: 'All'},
  {value: "ims_managed", label: 'IMS/CMS Managed'},
  // {value: "cms_managed", label: 'CMS Managed'},
  {value: "_unmanaged", label: 'Unmanaged'},
  {value: "ims_archieved", label: 'Archieves'}
];