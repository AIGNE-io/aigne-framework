import List from "@aigne/observability-ui/list";
import { useEffect, useRef } from "react";
import { useSessionContext } from "./contexts/session.js";

export default function ListPage() {
  const appRef = useRef<{ refetch: () => void }>(null);
  const { session } = useSessionContext();

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  useEffect(() => {
    appRef.current?.refetch?.();

    if (!session?.user) {
      session.login();
    }
  }, [session?.user]);

  return <List ref={appRef} />;
}
