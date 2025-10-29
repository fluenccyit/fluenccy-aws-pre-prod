import numeral from 'numeral';
import { sharedNumberService } from '@shared/common';

describe('@shared/common | sharedNumberService', () => {
  describe('#calculateStdDev', () => {
    const { stdDev } = sharedNumberService;

    it('should calculate the standard deviation when passed a collection of numbers', () => {
      const simpleCollection = [2, 1, 2, 3, 4];
      expect(numeral(stdDev(simpleCollection)).format('0.00')).toEqual('1.02');

      const complexCollection = [85, 86, 100, 76, 81, 93, 84, 99, 71, 69, 93, 85, 81, 87, 89];
      expect(numeral(stdDev(complexCollection)).format('0.00')).toEqual('8.70');
    });
  });
});
