import List from "@aigne/observability/list";
import { Box } from "@mui/material";
import { useEffect, useRef } from "react";
import { useSessionContext } from "./contexts/session.js";

export default function ListPage() {
  const appRef = useRef<{ refetch: () => void }>(null);
  const { session } = useSessionContext();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    appRef.current?.refetch();
  }, [session?.user]);

  return (
    <Box sx={{ my: 3 }}>
      <List ref={appRef} />
    </Box>
  );
}
