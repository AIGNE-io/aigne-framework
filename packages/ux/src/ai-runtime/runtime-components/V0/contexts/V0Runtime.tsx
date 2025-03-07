import { useMediaQuery } from "@mui/material";
import { type ReactNode, createContext, useContext, useMemo, useState } from "react";

interface V0RuntimeContext {
  setCurrentMessageTaskId: (messageId: string | undefined) => void;
  currentMessageTaskId: string | undefined;
  propertiesValueMap: { [taskId: string]: any };
  setPropertiesValueMap: (valueMap: { [taskId: string]: any }) => void;
  isMobile: boolean;
}

const context = createContext<V0RuntimeContext | undefined>(undefined);

let cancelAutoScrollTimer: any;

export function V0RuntimeProvider({ children }: { children?: ReactNode }) {
  const [currentMessageTaskId, setCurrentMessageTaskId] = useState<string | undefined>();
  const [propertiesValueMap, setPropertiesValueMap] = useState(
    {} as {
      [taskId: string]: any;
    },
  );
  const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const state = useMemo(
    () =>
      ({
        setCurrentMessageTaskId: (taskId: string | undefined) => {
          setCurrentMessageTaskId(taskId);

          // auto scroll to the task
          if (taskId) {
            const scrollIntoView = () => {
              const el = document.getElementById(taskId);

              if (el) {
                el.scrollIntoView({ behavior: "smooth" });

                // is first time to scroll
                if (!currentMessageTaskId) {
                  const observer = new MutationObserver(() => {
                    if (cancelAutoScrollTimer) clearTimeout(cancelAutoScrollTimer);
                    el?.scrollIntoView({ behavior: "smooth" });

                    cancelAutoScrollTimer = setTimeout(() => {
                      observer.disconnect();
                      cancelAutoScrollTimer = null;
                    }, 1000);
                  });
                  observer.observe(el.parentElement as any, {
                    attributes: true,
                    childList: true,
                    subtree: true,
                  });
                }
              }
            };
            setTimeout(scrollIntoView, 300);
          }
        },
        currentMessageTaskId,
        propertiesValueMap,
        setPropertiesValueMap: (valueMap: { [taskId: string]: any }) => {
          setPropertiesValueMap({
            ...propertiesValueMap,
            ...valueMap,
          });
        },
        isMobile,
      }) as V0RuntimeContext,
    [
      setCurrentMessageTaskId,
      currentMessageTaskId,
      propertiesValueMap,
      setPropertiesValueMap,
      isMobile,
    ],
  );

  return <context.Provider value={state}>{children}</context.Provider>;
}

export function useV0RuntimeContext() {
  const current = useContext(context);
  if (!current) {
    throw new Error(
      "No such message state. You should use `V0RuntimeProvider` within the `CurrentMessageProvider`",
    );
  }

  return current;
}
