class EnvService {
  get = () => window.__FLUENCCY_APP_CONFIG__.ENVIRONMENT;
  isLocal = () => this.get() === 'local';
  isProduction = () => this.get() === 'production';
  isStaging = () => this.get() === 'staging';
  isPreProd = () => this.get() === 'qa';
  isJest = () => this.get() === 'jest';
}

export const envService = new EnvService();
