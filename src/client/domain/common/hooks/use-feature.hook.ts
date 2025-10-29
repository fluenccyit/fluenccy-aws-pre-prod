import { featureService } from '@client/common';

export const useFeature = () => {
  return {
    init: featureService.init,
    isEnabled: featureService.isEnabled,
    isEnabledByEmail: featureService.isEnabledByEmail,
  };
};
