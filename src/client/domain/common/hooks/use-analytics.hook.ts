import { sharedUtilService } from '@shared/common';
import { useQueryLocalAccount } from '@client/account';
import { useQueryLocalChart } from '@client/chart';
import { useQueryLocalOrganisation } from '@client/organisation';
import { AnalyticsEventName, analyticsService, useCookies, utilService } from '@client/common';

export const useAnalytics = () => {
  const { account } = useQueryLocalAccount();
  const { getCookie, setCookie } = useCookies();
  const { organisation } = useQueryLocalOrganisation();
  const { chartCurrency } = useQueryLocalChart();

  const init = async () => {
    // Persist the fsid coming through as a search param, if set. Otherwise generate a new fsid for the session.
    const fsid = utilService.getUrlSearchParamByKey('fsid') || getCookie('fsid') || sharedUtilService.generateUid();

    setCookie('fsid', fsid);
    await analyticsService.init(fsid);
  };

  const track = async (event: AnalyticsEventName, additionalProperties?: Dictionary<any>) => {
    const properties: Dictionary<any> = { ...additionalProperties };

    if (organisation) {
      properties.orgCurrency = organisation.currency;
      properties.orgName = organisation.name;

      properties.companyName = account?.name || '-';
      properties.accountType = account?.type || '-';
    }

    if (chartCurrency) {
      properties.selectedCurrency = chartCurrency;
    }

    await analyticsService.track(event, properties);
  };

  return {
    init,
    alias: analyticsService.alias,
    page: analyticsService.page,
    identify: analyticsService.identify,
    track,
  };
};
