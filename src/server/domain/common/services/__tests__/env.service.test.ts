import { envService } from '@server/common';

describe('@server/common | envService', () => {
  afterEach(() => {
    process.env.ENVIRONMENT = 'local';
  });

  describe('#get', () => {
    it('should return the `ENVIRONMENT` value', () => {
      expect(envService.get()).toEqual(process.env.ENVIRONMENT);
    });
  });

  describe('#isLocal', () => {
    it('should return `false` if the ENVIRONMENT is not `local`', () => {
      process.env.ENVIRONMENT = 'production';

      expect(envService.isLocal()).toBe(false);
    });

    it('should return `true` if the ENVIRONMENT is `local`', () => {
      expect(envService.isLocal()).toBe(true);
    });
  });

  describe('#isProduction', () => {
    it('should return `false` if the ENVIRONMENT is not `production`', () => {
      expect(envService.isProduction()).toBe(false);
    });

    it('should return `true` if the ENVIRONMENT is `production`', () => {
      process.env.ENVIRONMENT = 'production';

      expect(envService.isProduction()).toBe(true);
    });
  });

  describe('#isStaging', () => {
    it('should return `false` if the ENVIRONMENT is not `staging`', () => {
      expect(envService.isStaging()).toBe(false);
    });

    it('should return `true` if the ENVIRONMENT is `staging`', () => {
      process.env.ENVIRONMENT = 'staging';

      expect(envService.isStaging()).toBe(true);
    });
  });
});
