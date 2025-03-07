import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { type StoreApi, type UseBoundStore, create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { useShallow } from "zustand/react/shallow";

import { parseIdentity } from "../aid";
import type { Message } from "../api/message";
import type { Session } from "../api/session";
import { useSessionContext } from "../utils/session";
import { useAgent } from "./Agent";
import { type AIGNEApiContextValue, useAIGNEApi } from "./Api";
import { useCurrentAgent } from "./CurrentAgent";
import { useEntryAgent } from "./EntryAgent";

const GET_MESSAGES_LIMIT = 100;
const GET_MESSAGES_ORDER_DIRECTION = "desc";

export interface MessageItem extends Message {
  loading?: boolean;
}

export interface SessionContextValue {
  sessionId?: string;
  session?: Session;
  loading?: boolean;
  loaded?: boolean;
  running?: boolean;
  messages?: MessageItem[];
  noMoreMessage?: boolean;
  messageLoading?: boolean;
  error?: Error;
  runAgent: (options: {
    aid: string;
    debug?: boolean;
    inputs: any;
    onResponseStart?: () => void;
  }) => Promise<void>;
  reload: () => Promise<void>;
  loadMoreMessages: (args?: { limit?: number }) => Promise<void>;
  clearSession: () => Promise<void>;
}

const sessionContext = createContext<UseBoundStore<StoreApi<SessionContextValue>> | null>(null);

const LOADING_TASKS: { [id: string]: Promise<void> } = {};

export const SessionProvider = ({
  sessionId,
  onChange,
  children,
}: {
  sessionId?: string;
  onChange?: (sessionId: string) => void;
  children?: ReactNode;
}) => {
  const { aid: entryAid } = useEntryAgent();
  const { runAgent, getSession, getMessages, clearSession } = useAIGNEApi();

  const state = useMemo(
    () =>
      createSessionState({
        entryAid,
        sessionId,
        runAgent,
        getSession,
        getMessages,
        clearSession,
      }),
    [sessionId],
  );

  const loaded = state((s) => s.loaded);
  const error = state((s) => s.error);
  const sid = state((s) => s.sessionId);

  useEffect(() => {
    if (sid && sid !== sessionId) onChange?.(sid);
  }, [sid]);

  if (sessionId && !loaded) {
    if (error) throw error;

    LOADING_TASKS[sessionId] ??= state.getState().reload();
    throw LOADING_TASKS[sessionId]!;
  }

  return <sessionContext.Provider value={state}>{children}</sessionContext.Provider>;
};

const STATE_CACHE: {
  [sessionId: string]: UseBoundStore<StoreApi<SessionContextValue>>;
} = {};

function createSessionState(
  options: {
    entryAid: string;
    sessionId?: string;
  } & Pick<AIGNEApiContextValue, "runAgent" | "getSession" | "getMessages" | "clearSession">,
) {
  if (options.sessionId) {
    const state = STATE_CACHE[options.sessionId];
    if (state) return state;
  }

  const state = create(
    immer<SessionContextValue>((set, get) => {
      return {
        sessionId: options.sessionId,
        runAgent: async ({ aid, inputs, onResponseStart }) => {
          const identity = parseIdentity(aid, { rejectWhenError: true });

          let responseStarted = false;
          let mainTaskId: string | undefined;
          let message: MessageItem | undefined;
          let { sessionId } = get();

          set((state) => {
            state.running = true;
            state.error = undefined;
          });

          try {
            const res = await options.runAgent({
              entryAid: options.entryAid,
              aid,
              sessionId,
              inputs: { ...inputs, $clientTime: new Date().toISOString() },
              responseType: "stream",
            });

            const reader = res.getReader();

            for (;;) {
              const { value, done } = await reader.read();
              if (done) break;

              if (!responseStarted) {
                responseStarted = true;
                onResponseStart?.();
              }

              if (value?.type === "CHUNK") {
                if (!message) {
                  // Get the session (automatically created) id from the first message
                  if (!sessionId) {
                    sessionId = value.sessionId;

                    STATE_CACHE[sessionId] = state;

                    set((state) => {
                      state.sessionId = sessionId;
                      state.loaded = true;
                      state.noMoreMessage = true;
                    });
                  } else if (sessionId !== value.sessionId) {
                    throw new Error(
                      `Unexpected session id: ${value.sessionId}, expected: ${sessionId}`,
                    );
                  }

                  mainTaskId = value.taskId;

                  message = {
                    aid,
                    id: value.messageId,
                    agentId: identity.agentId,
                    sessionId,
                    inputs,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    loading: true,
                  };

                  set((state) => {
                    state.messages ??= [];
                    state.messages.unshift(message!);
                  });
                }

                if (mainTaskId === value.taskId) {
                  requestAnimationFrame(() => {
                    set((state) => {
                      const msg = state.messages?.findLast((i) => i.id === message!.id);
                      if (!msg) return;

                      msg.outputs ??= {};
                      msg.outputs.content =
                        (msg.outputs.content || "") + (value.delta.content || "");

                      if (value.delta.object) {
                        msg.outputs.objects ??= [];
                        msg.outputs.objects.push(value.delta.object);
                      }
                    });
                  });
                }
              }

              if (value?.type === "ERROR") {
                set((state) => {
                  const msg = state.messages?.findLast((i) => i.id === message!.id);
                  if (msg) msg.error = value.error;
                  else throw new Error(value.error.message);
                });
              }
            }
          } catch (error) {
            set((state) => {
              const msg = message
                ? state.messages?.findLast((i) => i.id === message!.id)
                : undefined;
              if (msg) msg.error = error;
              else state.error = error;
            });
            throw error;
          } finally {
            set((state) => {
              state.running = false;
              if (message) {
                const msg = state.messages?.findLast((i) => i.id === message!.id);
                if (msg) msg.loading = false;
              }
            });
          }
        },
        reload: async () => {
          const { sessionId } = get();
          if (!sessionId) return;

          set((state) => {
            state.loading = true;
          });
          try {
            const [session, { messages }] = await Promise.all([
              options.getSession({ sessionId }),
              options.getMessages({
                sessionId,
                orderDirection: GET_MESSAGES_ORDER_DIRECTION,
                limit: GET_MESSAGES_LIMIT,
              }),
            ]);
            set((state) => {
              state.session = session;
              state.messages = messages;
              state.noMoreMessage = messages.length < GET_MESSAGES_LIMIT;
              state.error = undefined;
            });
          } catch (error) {
            set((state) => {
              state.error = error;
            });
            throw error;
          } finally {
            set((state) => {
              state.loaded = true;
              state.loading = false;
              state.messageLoading = false;
            });
          }
        },
        loadMoreMessages: async () => {
          const { sessionId } = get();
          if (!sessionId) return;

          set((state) => {
            state.messageLoading = true;
          });

          try {
            const lastMessage = get().messages?.at(-1);

            const { messages } = await options.getMessages({
              sessionId,
              orderDirection: GET_MESSAGES_ORDER_DIRECTION,
              limit: GET_MESSAGES_LIMIT,
              before: lastMessage?.id,
            });
            set((state) => {
              state.messages?.push(...messages);
              state.noMoreMessage = messages.length < GET_MESSAGES_LIMIT;
              state.error = undefined;
            });
          } catch (error) {
            set((state) => {
              state.error = error;
            });
            throw error;
          } finally {
            set((state) => {
              state.messageLoading = false;
            });
          }
        },
        clearSession: async () => {
          const { sessionId } = get();
          if (!sessionId) return;
          await options.clearSession({ sessionId });
          set((state) => {
            state.messages = [];
            state.noMoreMessage = true;
            state.messageLoading = false;
          });
        },
      };
    }),
  );

  if (options.sessionId) STATE_CACHE[options.sessionId] = state;

  return state;
}

export function useSession<U>(selector: (state: SessionContextValue) => U): U {
  const state = useContext(sessionContext);

  if (!state)
    throw new Error(
      "No such session context. You should use `useSession` within the `SessionProvider`",
    );

  const runAgent = useRunAgentWithLogin();

  return state(useShallow((s) => selector({ ...s, runAgent })));
}

function useRunAgentWithLogin() {
  const { session: authSession } = useSessionContext();
  const { aid } = useCurrentAgent();
  const agent = useAgent({ aid });

  const state = useContext(sessionContext);
  if (!state)
    throw new Error(
      "No such session context. You should use `useSession` within the `SessionProvider`",
    );

  const exec = state((s) => s.runAgent);

  const login = useCallback(async () => {
    await new Promise<void>((resolve) => {
      authSession.login(() => resolve());
    });
  }, [authSession]);

  const runAgent: typeof exec = useCallback(
    async (...args) => {
      if (!agent.access?.noLoginRequired && !authSession.user) {
        await login();
      }
      return exec(...args);
    },
    [agent.access?.noLoginRequired, authSession.user, exec, login],
  );

  return runAgent;
}
