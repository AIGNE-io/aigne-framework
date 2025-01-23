import { createContext, useContext, useState } from "react";
import { type StoreApi, type UseBoundStore, create } from "zustand";
import { immer } from "zustand/middleware/immer";

import type { RuntimeOutputVariable } from "@aigne/agent-v1";

export interface DebugContextValue {
  agentId?: string;
  outputId?: string;
  hoverOutputId?: string;
  tabId?: string;
  autoFocus?: boolean;
  setTabId?: (id: string) => void;
  setHoverOutputId: (id: string) => void;
  open:
    | ((options: {
        agentId?: string;
        output?: { id: string } | { name: RuntimeOutputVariable };
      }) => void)
    | undefined;
  close: () => void;
}

const debugContext = createContext<UseBoundStore<
  StoreApi<DebugContextValue>
> | null>(null);

export function DebugProvider({
  children,
  openSettings,
  agentId: defaultAgentId,
  autoFocus = false,
}: {
  children?: React.ReactNode;
  openSettings?: (options: {
    agentId: string;
    output: { id: string } | { name: RuntimeOutputVariable };
  }) => {
    agentId?: string;
    outputId?: string;
  };
  agentId?: string;
  autoFocus?: boolean;
}) {
  const [state] = useState(() =>
    create(
      immer<DebugContextValue>((set, get) => ({
        agentId: defaultAgentId,
        autoFocus,
        open: openSettings
          ? ({ output, ...options }) => {
              const agentId = options.agentId || get().agentId;
              if (!agentId || !output) return;

              const { outputId } = openSettings({ agentId, output });
              set((state) => {
                state.agentId = agentId;
                state.outputId = outputId;
              });
            }
          : undefined,
        close: () => {
          set((state) => {
            state.agentId = defaultAgentId;
            state.outputId = undefined;
            state.hoverOutputId = undefined;
          });
        },
        // hover Tab Show Output Component
        setHoverOutputId: (id: string) => {
          set((state) => {
            state.hoverOutputId = id;
          });
        },
        // hover Output Component Show Tab
        setTabId: (id: string) => {
          set((state) => {
            state.tabId = id;
          });
        },
      })),
    ),
  );

  return (
    <debugContext.Provider value={state}>{children}</debugContext.Provider>
  );
}

export function useDebug():
  | UseBoundStore<StoreApi<DebugContextValue>>
  | undefined;
export function useDebug<U>(
  selector: (state: DebugContextValue) => U,
): U | undefined;
export function useDebug<U>(selector?: (state: DebugContextValue) => U) {
  const ctx = useContext(debugContext);
  if (!ctx) return undefined;
  if (selector) return ctx(selector);
  return ctx;
}

export interface DebugDialogContextValue {
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

const debugDialogContext = createContext<UseBoundStore<
  StoreApi<DebugDialogContextValue>
> | null>(null);

export function DebugDialogProvider({
  children,
}: { children?: React.ReactNode }) {
  const [state] = useState(() =>
    create(
      immer<DebugDialogContextValue>((set) => ({
        setOpen: (open) => {
          set((state) => {
            state.open = open;
          });
        },
      })),
    ),
  );

  return (
    <debugDialogContext.Provider value={state}>
      {children}
    </debugDialogContext.Provider>
  );
}

export function useDebugDialog<U>(
  selector: (state: DebugDialogContextValue) => U,
): U | undefined {
  const ctx = useContext(debugDialogContext);
  if (!ctx) return undefined;

  return ctx(selector);
}
