import { add, toDate } from 'date-fns';

type UidPrefix = 'acc_' | 'org_' | 'usr_' | 'log_' | 'tenant_' | '';

class SharedUtilService {
  generateUid = (prefix?: UidPrefix) => {
    let date = new Date().getTime();

    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
      const random = (date + Math.random() * 16) % 16 | 0;

      date = Math.floor(date / 16);

      return (char === 'x' ? random : (random & 0x3) | 0x8).toString(16);
    });

    return `${prefix || ''}${uuid}`;
  };

  async asyncForEach<T>(collection: T[], callback: (item: T, index: number, collection: T[]) => Promise<any>) {
    for (let index = 0; index < collection.length; index += 1) {
      await callback(collection[index], index, collection);
    }
  }

  async asyncForEachMonth(initialDateFrom: Date, monthCount: number, callback: (dateFrom: Date, dateTo: Date) => Promise<any>) {
    let dateFrom = toDate(initialDateFrom);
    let dateTo = add(dateFrom, { months: monthCount });
    for (let i = 0; i < monthCount; i += 1) {
      await callback(dateFrom, dateTo);

      dateFrom = add(dateFrom, { months: 1 });
      dateTo = add(dateFrom, { months: monthCount });
    }
  }
}

export const sharedUtilService = new SharedUtilService();
