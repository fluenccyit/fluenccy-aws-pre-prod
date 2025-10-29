class EnvService {
  get = () => process.env.ENVIRONMENT;
  isLocal = () => this.get() === 'local';
  isPreProd = () => this.get() === 'qa';
  isProduction = () => this.get() === 'production';
  isStaging = () => this.get() === 'staging';
  isJest = () => this.get() === 'jest';
}

export const envService = new EnvService();
