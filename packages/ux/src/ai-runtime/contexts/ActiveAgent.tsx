import { RuntimeOutputVariable } from "@aigne/agent-v1/types";
import { type ReactNode, createContext, useContext, useMemo } from "react";
import { parseIdentity, stringifyIdentity } from "../aid";
import { getOutputVariableInitialValue } from "../utils/runtime-output-schema";
import { useAutoUpdateState } from "../utils/use-auto-update-state";
import { useAgent } from "./Agent";
import { useEntryAgent } from "./EntryAgent";

export interface ActiveAgentContext {
  aid: string;
  setActiveAid: (aid: string) => void;
}

const activeAgentContext = createContext<ActiveAgentContext | undefined>(
  undefined,
);

export function useActiveAgent() {
  const context = useContext(activeAgentContext);
  if (!context) {
    throw new Error(
      "No such activeAgentContext. You should use `useActiveAgent` within the `ActiveAgentProvider`",
    );
  }

  return context;
}

export function ActiveAgentProvider({ children }: { children?: ReactNode }) {
  const { aid: entryAid } = useEntryAgent();
  const agent = useAgent({ aid: entryAid });

  const childAid = useMemo(() => {
    const agentId =
      getOutputVariableInitialValue(agent, RuntimeOutputVariable.children)
        ?.agents?.[0]?.id ?? agent.id;
    return stringifyIdentity({
      ...parseIdentity(entryAid, { rejectWhenError: true }),
      agentId,
    });
  }, [entryAid, agent]);

  const [activeAid, setActiveAid] = useAutoUpdateState(childAid, [childAid]);
  const context = useMemo(
    () => ({ aid: activeAid, setActiveAid }),
    [activeAid, setActiveAid],
  );

  return (
    <activeAgentContext.Provider value={context}>
      {children}
    </activeAgentContext.Provider>
  );
}
