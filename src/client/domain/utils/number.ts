export const format = function(number, n, x) {
  if (isNaN(number)) return '-';
  var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
  return number?.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,') || 0.00;
};