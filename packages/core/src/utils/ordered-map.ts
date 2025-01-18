export type OrderedRecord<T extends { id: string }> = Record<string, T> & {
  $indexes: string[];
};

export namespace OrderedRecord {
  export function iterator<T extends { id: string }>(
    record?: OrderedRecord<T>,
  ): IterableIterator<T> {
    return (function* () {
      if (!record) return;

      for (const id of record.$indexes) {
        yield record[id]!;
      }
    })();
  }

  export function map<O, T extends { id: string }>(
    record: OrderedRecord<T> | undefined,
    fn: (value: T, index: number) => O,
  ): O[] {
    if (!record) return [];

    const result: O[] = new Array(record.$indexes.length);

    for (let i = 0; i < record.$indexes.length; i++) {
      result[i] = fn(record[record.$indexes[i]!]!, i);
    }

    return result;
  }

  export function toArray<T extends { id: string }>(
    record: OrderedRecord<T> | undefined,
  ): T[] {
    return OrderedRecord.map(record, (value) => value);
  }

  export function fromArray<T extends { id: string }>(
    array?: T[],
  ): OrderedRecord<T> {
    const record: OrderedRecord<T> = { $indexes: [] as any };

    for (const value of array ?? []) {
      record[value.id] = value;
      record.$indexes.push(value.id);
    }

    return record;
  }

  export function find<T extends { id: string }>(
    record: OrderedRecord<T> | undefined,
    predicate: (value: T, index: number) => boolean,
  ): T | undefined {
    if (!record) return undefined;

    for (let i = 0; i < record.$indexes.length; i++) {
      const id = record.$indexes[i]!;
      const value = record[id]!;
      if (predicate(value, i)) return value;
    }

    return undefined;
  }

  export function filter<T extends { id: string }>(
    record: OrderedRecord<T> | undefined,
    predicate: (value: T, index: number) => boolean,
  ): T[] {
    if (!record) return [];

    const result: T[] = [];

    for (let i = 0; i < record.$indexes.length; i++) {
      const id = record.$indexes[i]!;
      const value = record[id]!;
      if (predicate(value, i)) result.push(value);
    }

    return result;
  }

  export function at<T extends { id: string }>(
    record: OrderedRecord<T> | undefined,
    index: number,
  ): T | undefined {
    if (!record?.$indexes.length) return undefined;

    const id = record.$indexes.at(index);
    return record[id!];
  }

  export function push<T extends { id: string }>(
    record: OrderedRecord<T>,
    ...items: T[]
  ) {
    for (const item of items) {
      if (record[item.id])
        throw new Error(`Item with id ${item.id} already exists`);

      record.$indexes.push(item.id);
      record[item.id] = item;
    }

    return record;
  }

  export function merge<T extends { id: string }>(
    ...records: OrderedRecord<T>[]
  ) {
    const result: OrderedRecord<T> = { $indexes: [] as any };

    for (const record of records) {
      for (const id of record.$indexes) {
        if (!result[id]) result.$indexes.push(id);
        result[id] = record[id]!;
      }
    }

    return result;
  }

  export function pushOrUpdate<T extends { id: string }>(
    record: OrderedRecord<T>,
    ...items: T[]
  ) {
    for (const item of items) {
      if (!record[item.id]) {
        record.$indexes.push(item.id);
      }
      record[item.id] = item;
    }

    return record;
  }
}
