import { type ReactNode, createContext, useContext, useMemo } from "react";
import { type StoreApi, type UseBoundStore, create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { useShallow } from "zustand/react/shallow";

import type { Session } from "../api/session";
import { createCachedStore } from "../utils/zustand";
import { useAIGNEApi } from "./Api";

export interface SessionsContextValue {
  currentSessionId?: string;
  sessions?: Session[];
  loading?: boolean;
  loaded?: boolean;
  error?: Error;
  reload: (options?: { autoSetCurrentSessionId?: boolean }) => Promise<void>;
  createSession: (options: { name?: string }) => Promise<Session>;
  deleteSession: (options: { sessionId: string }) => Promise<void>;
  setCurrentSessionId: (sessionId?: string) => void;
}

const sessionsContext = createContext<UseBoundStore<
  StoreApi<SessionsContextValue>
> | null>(null);

const LOADING_TASKS: { [id: string]: Promise<void> } = {};

export function SessionsProvider({
  aid,
  children,
}: { aid: string; children?: ReactNode }) {
  const { getSessions, createSession, deleteSession } = useAIGNEApi();

  const state = useMemo(
    () =>
      createCachedStore(`sessions-state-${aid}`, () =>
        create(
          immer<SessionsContextValue>((set, get) => ({
            reload: async (options) => {
              set((state) => {
                state.loading = true;
              });

              try {
                const { sessions } = await getSessions({ aid });

                set((state) => {
                  state.sessions = sessions;
                  state.error = undefined;

                  if (options?.autoSetCurrentSessionId) {
                    // Set current session id to the last session id if it's not set
                    if (!state.currentSessionId)
                      state.currentSessionId = sessions.at(0)?.id;
                  }
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
                });
              }
            },
            createSession: async ({ name } = {}) => {
              const session = await createSession({ aid, name });
              await get().reload();
              return session;
            },
            deleteSession: async ({ sessionId }) => {
              await deleteSession({ sessionId });

              if (get().currentSessionId === sessionId) {
                set((state) => {
                  state.currentSessionId = undefined;
                });
              }

              await get().reload();
            },
            setCurrentSessionId: (sessionId) => {
              set((state) => {
                state.currentSessionId = sessionId;
              });
            },
          })),
        ),
      ),
    [aid],
  );

  const { loaded, error } = state((s) => ({
    loaded: s.loaded,
    error: s.error,
  }));

  if (!loaded) {
    if (error) throw error;

    const key = `sessions-loading-${aid}`;
    LOADING_TASKS[key] ??= state
      .getState()
      .reload({ autoSetCurrentSessionId: true });
    throw LOADING_TASKS[key]!;
  }

  return (
    <sessionsContext.Provider value={state}>
      {children}
    </sessionsContext.Provider>
  );
}

export function useSessions<U>(
  selector: (state: SessionsContextValue) => U,
): U {
  const state = useContext(sessionsContext);

  if (!state)
    throw new Error(
      "No such sessions context. You should use `useSessions` within the `SessionsProvider`",
    );

  return state(useShallow(selector));
}
