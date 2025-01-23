import { type ReactNode, createContext, useContext, useMemo } from "react";

import type { OutputVariable } from "@aigne/agent-v1";
import type { MessageItem } from "./Session";

export interface CurrentMessageContextValue {
  message: MessageItem;
}

const currentMessageContext = createContext<
  CurrentMessageContextValue | undefined
>(undefined);

export function CurrentMessageProvider({
  message,
  children,
}: { message: MessageItem; children?: ReactNode }) {
  const state = useMemo(() => ({ message }), [message]);

  return (
    <currentMessageContext.Provider value={state}>
      {children}
    </currentMessageContext.Provider>
  );
}

export function useCurrentMessage(args?: {
  optional?: false;
}): CurrentMessageContextValue;
export function useCurrentMessage(args: { optional: true }):
  | CurrentMessageContextValue
  | undefined;
export function useCurrentMessage({ optional }: { optional?: boolean } = {}) {
  const ctx = useContext(currentMessageContext);
  if (!optional && !ctx) {
    throw new Error(
      "No such message state. You should use `useCurrentMessage` within the `CurrentMessageProvider`",
    );
  }

  return ctx;
}

export interface CurrentMessageOutputContextValue<T = any> {
  output: OutputVariable;
  outputValue: T;
}

const currentMessageOutputContext = createContext<
  CurrentMessageOutputContextValue | undefined
>(undefined);

export function CurrentMessageOutputProvider({
  output,
  outputValue,
  children,
}: {
  output: OutputVariable;
  outputValue: any;
  children?: ReactNode;
}) {
  const state = useMemo(() => ({ output, outputValue }), [output, outputValue]);

  return (
    <currentMessageOutputContext.Provider value={state}>
      {children}
    </currentMessageOutputContext.Provider>
  );
}

export function useCurrentMessageOutput<T = any>(args?: {
  optional?: false;
}): CurrentMessageOutputContextValue<T>;
export function useCurrentMessageOutput<T = any>(args: {
  optional: true;
}): CurrentMessageOutputContextValue<T> | undefined;
export function useCurrentMessageOutput({
  optional,
}: { optional?: boolean } = {}) {
  const ctx = useContext(currentMessageOutputContext);
  if (!optional && !ctx) {
    throw new Error(
      "No such message output state. You should use `useCurrentMessageOutput` within the `CurrentMessageOutputProvider`",
    );
  }

  return ctx;
}
