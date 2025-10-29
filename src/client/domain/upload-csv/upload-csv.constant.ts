export type UploadCSVFactorType = 'foreign-currency' | 'rate' | 'risk' | 'credit' | 'forecast';
export const UPLOAD_CSV_TABLE_SKELETON = {
  numRows: 5,
  numCols: 7,
};

export const CURRENCY_SCORE_CHART_STYLE = {
  domainPaddingLeft: 20,
  minWidth: 600,
  paddingBottom: 50,
  paddingRight: 20,
  paddingLeft: 50,
  paddingTop: 50,
};

export const UPLOAD_CSV_TABLE_CHART = {
  chartHeight: 150,
  domainPadding: 2,
  chartPadding: { top: 10, bottom: 20, right: 20, left: 41 },
  xAxisFontSize: 10,
  xAxisFontWeight: 400,
  xAxisPadding: 4,
  numCols: 8,
};
