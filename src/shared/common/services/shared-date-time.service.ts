import { zonedTimeToUtc } from 'date-fns-tz';
import { GqlMonth } from '@graphql';
import { SHARED_DATE_TIME_FORMAT, GroupedByMonthYearType } from '@shared/common';
import {
  startOfMonth,
  startOfDay,
  sub,
  add,
  differenceInCalendarMonths,
  format,
  toDate,
  isSameDay,
  isAfter,
  isBefore,
  lastDayOfMonth,
} from 'date-fns';

type GetCollectionGroupedByMonthYearParam = {
  dateFrom: Date;
  dateTo: Date;
};

class SharedDateTimeService {
  getDateFromDaysAgo = (days: number) => {
    return startOfDay(sub(new Date(), { days }));
  };

  getUtcDateFromDaysAgo = (days: number) => {
    return this.getUtcDate(this.getDateFromDaysAgo(days));
  };

  getDateFromMonthsAgo = (months: number) => {
    return startOfMonth(startOfDay(sub(new Date(), { months })));
  };

  getUtcDateFromMonthsAgo = (months: number) => {
    return this.getUtcDate(this.getDateFromMonthsAgo(months));
  };

  getUtcDate = (date: Date) => {
    return zonedTimeToUtc(date, Intl.DateTimeFormat().resolvedOptions().timeZone);
  };

  getUtcDateAsIsoString = (date: Date) => {
    return this.getUtcDate(date).toISOString();
  };

  getCollectionGroupedByMonthYear = ({ dateFrom, dateTo }: GetCollectionGroupedByMonthYearParam) => {
    const collection: GroupedByMonthYearType[] = [];
    let date = toDate(dateFrom);
    for (let i = differenceInCalendarMonths(dateTo, dateFrom); i >= 0; i -= 1) {
      collection.push({
        dateFrom: startOfMonth(date),
        dateTo: lastDayOfMonth(date),
        month: format(date, SHARED_DATE_TIME_FORMAT.month) as GqlMonth,
        year: Number(format(date, SHARED_DATE_TIME_FORMAT.year)),
        monthYear: format(date, SHARED_DATE_TIME_FORMAT.monthYear),
      });

      date = add(date, { months: 1 });
    }

    return collection;
  };

  isDateBetween = (date: Date, { dateFrom, dateTo }: DateRangeParam) => {
    return isSameDay(date, dateFrom) || isSameDay(date, dateFrom) || (isAfter(date, dateFrom) && isBefore(date, dateTo));
  };
}

export const sharedDateTimeService = new SharedDateTimeService();
