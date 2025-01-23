import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import type { Agent } from "../api/agent";
import { createCachedStore } from "../utils/zustand";
import { useAIGNEApi } from "./Api";

export interface AgentState {
  loading?: boolean;
  agent?: Agent;
  error?: Error;
  load: () => Promise<void>;
}

const createAgentState = ({
  apiUniqueKey,
  aid,
  getAgent,
}: {
  apiUniqueKey?: string;
  aid: string;
  getAgent: (options: { aid: string }) => Promise<Agent>;
}) => {
  return createCachedStore(`agent-state-${apiUniqueKey}-${aid}`, () => {
    return create<AgentState>()((set) => ({
      load: async () => {
        set((state) => ({ ...state, loading: true }));
        try {
          const agent = await getAgent({ aid });
          agent.observe?.((agent) => set((state) => ({ ...state, agent })));
          set((state) => ({ ...state, agent }));
        } catch (error) {
          console.error(error);
          set((state) => ({ ...state, error }));
        } finally {
          set((state) => ({ ...state, loading: false }));
        }
      },
    }));
  });
};

const LOADING_TASKS: { [id: string]: Promise<void> } = {};

export function useAgent<U>(
  options: { aid: string },
  selector: (state: AgentState) => U,
): U;
export function useAgent(options: { aid: string }, selector?: undefined): Agent;
export function useAgent<U>(
  { aid }: { aid: string },
  selector?: (state: AgentState) => U,
): Agent | U {
  const { getAgent, apiUniqueKey } = useAIGNEApi();
  const state = createAgentState({ aid, apiUniqueKey, getAgent });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  if (selector) return state(useShallow(selector));

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { agent, error } = state(
    useShallow((s) => ({ agent: s.agent, error: s.error })),
  );

  if (!agent) {
    if (error) throw error;

    const key = `agent-loading-${apiUniqueKey}-${aid}`;
    LOADING_TASKS[key] ??= state.getState().load();
    throw LOADING_TASKS[key]!;
  }

  return agent;
}
