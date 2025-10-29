import { map, mean, sortBy } from 'lodash';

class SharedNumberService {
  stdDev = (collection: number[]) => {
    const collectionMean = mean(collection);
    const stdDevNumeratorMean = mean(map(collection, (value) => Math.pow(value - collectionMean, 2)));

    return Math.sqrt(stdDevNumeratorMean) || 0;
  };

  stdDevBy<T extends { [key: string]: any }, K extends keyof T>(collection: T[], key: K) {
    const mappedCollection = map(collection, (item) => item[key]);
    const collectionMean = mean(mappedCollection);
    const stdDevNumeratorMean = mean(map(mappedCollection, (value) => Math.pow(value - collectionMean, 2)));

    return Math.sqrt(stdDevNumeratorMean) || 0;
  }

  median = (collection: number[]) => {
    if (!collection.length) {
      return 0;
    }

    const sortedCollection = sortBy(collection);
    const half = Math.floor(sortedCollection.length / 2);

    if (sortedCollection.length % 2) {
      return sortedCollection[half];
    }

    return (sortedCollection[half - 1] + sortedCollection[half]) / 2;
  };
}

export const sharedNumberService = new SharedNumberService();
