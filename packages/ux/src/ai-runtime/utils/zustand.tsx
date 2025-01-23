import type { StoreApi, UseBoundStore } from "zustand";

const STATES: { [key: string]: UseBoundStore<StoreApi<any>> } = {};

export function createCachedStore<T>(
  key: string,
  creator: () => UseBoundStore<StoreApi<T>>,
): ReturnType<typeof creator> {
  STATES[key] ??= creator();

  return STATES[key]!;
}
