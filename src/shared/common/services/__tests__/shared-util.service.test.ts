import { sharedUtilService } from '@shared/common';

describe('@shared/common | sharedUtilService', () => {
  describe('#generateUid', () => {
    it('should return a uid with the passed prefix', () => {
      const [prefix, uid] = sharedUtilService.generateUid('usr_').split('_');

      expect(prefix).toEqual('usr');
      expect(uid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
  });
});
