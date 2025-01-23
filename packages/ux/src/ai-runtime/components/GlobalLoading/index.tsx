import { LinearProgress, type LinearProgressProps } from "@mui/material";

import { globalLoadingState } from "./state";

export { globalLoadingState } from "./state";

export default function GlobalLoading({ ...props }: LinearProgressProps) {
  const state = globalLoadingState();

  if (!state.loading) return null;

  return <LinearProgress {...props} />;
}
