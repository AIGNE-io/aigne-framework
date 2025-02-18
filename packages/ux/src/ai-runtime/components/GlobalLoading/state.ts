import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface GlobalLoadingState {
  loading: boolean;
  count: number;
  run: <T>(fn: Promise<T> | (() => Promise<T>)) => Promise<T>;
  start: () => void;
  end: () => void;
}

export const globalLoadingState = create<GlobalLoadingState>()(
  immer((set, get) => ({
    loading: false,
    count: 0,
    run: async (fn: Promise<any> | (() => any)) => {
      try {
        get().start();
        return (await (typeof fn === "function" ? fn() : fn)) as any;
      } finally {
        get().end();
      }
    },
    start: () => {
      set((state) => {
        state.count += 1;
        state.loading = true;
      });
    },
    end: () => {
      set((state) => {
        state.count = Math.max(0, state.count - 1);
        state.loading = state.count > 0;
      });
    },
  })),
);
