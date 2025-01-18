import { call as originalCall } from "@blocklet/sdk/lib/component";
import isNil from "lodash/isNil";

export const call: typeof originalCall = (options: any) => {
  return originalCall({
    ...(options as any),
    params: Object.fromEntries(
      Object.entries(options.params ?? {}).map(([key, value]) => [
        key,
        isNil(value) ? "" : String(value),
      ]),
    ),
  });
};
