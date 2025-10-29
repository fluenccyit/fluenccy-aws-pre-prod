import { parse, isValid } from 'date-fns';

class DateService {
  parseDate(date: string, formatStr: string, allowNull?: false): Date;
  parseDate(date: string | null | undefined, formatStr: string, allowNull: true): Date | null;
  parseDate(date: string | null | undefined, formatStr: string, allowNull = false) {
    if (!date) {
      if (!allowNull) {
        throw new Error('Date undefined.');
      }

      return null;
    }

    const parsedDate = parse(date, formatStr, new Date());

    if (!isValid(parsedDate)) {
      if (!allowNull) {
        throw new Error('Parsed date invalid.');
      }

      return null;
    }

    return parsedDate;
  }
}

export const dateService = new DateService();
