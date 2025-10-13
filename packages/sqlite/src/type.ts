import { customType } from "drizzle-orm/sqlite-core";

export const json = <T>(dbName: string) =>
  customType<{
    data: T;
    driverData: string;
  }>({
    dataType: () => "json",
    fromDriver: (value) => JSON.parse(value),
    toDriver: (value) => JSON.stringify(value),
  })(dbName);

export const datetime = customType<{
  data: Date;
  driverData: string;
}>({
  dataType: () => "datetime",
  fromDriver: (value) => new Date(value),
  toDriver: (value) => value.toISOString(),
});
