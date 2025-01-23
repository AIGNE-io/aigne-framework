import { type ReactNode, createContext, useContext, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { CustomError } from "../error";

export interface EntryAgentContext {
  aid: string;
  working?: boolean;
}

const activeAgentContext = createContext<EntryAgentContext | undefined>(
  undefined,
);

export function useEntryAgent(args?: { optional?: false }): EntryAgentContext;
export function useEntryAgent(args: { optional: true }):
  | EntryAgentContext
  | undefined;
export function useEntryAgent({ optional }: { optional?: boolean } = {}) {
  const context = useContext(activeAgentContext);
  if (!context && !optional) {
    throw new Error(
      "No such entryAgentContext. You should use `useEntryAgent` within the `EntryAgentProvider`",
    );
  }

  return context;
}

export const EntryAgentProvider = ({
  aid,
  working,
  children,
}: {
  aid: string;
  working?: boolean;
  children?: ReactNode;
}) => {
  const state = useMemo(() => ({ aid, working }), [aid, working]);

  return (
    <activeAgentContext.Provider value={state}>
      {children}
    </activeAgentContext.Provider>
  );
};

export function EntryAgentProviderFromUrl({
  children,
}: { children?: ReactNode }) {
  const [query] = useSearchParams();
  const aid = query.get("aid");
  if (!aid)
    throw new CustomError(404, "Missing required query parameters `aid`");

  return (
    <EntryAgentProvider aid={aid} working={query.get("working") === "true"}>
      {children}
    </EntryAgentProvider>
  );
}
