import Box from "@mui/material/Box";
import useGetStats from "../../hooks/get-stats.ts";
import { parseDuration } from "../../utils/latency.ts";
import TraceDetailPanel from "./trace-detail-panel.tsx";
import TraceItemList from "./trace-item.tsx";
import RunStatsHeader from "./trace-stats-header.tsx";
import type { TraceData } from "./types.ts";

interface RunDetailDrawerProps {
  traceId: string;
  traceInfo: TraceData;
  selectedTrace: TraceData;
  setSelectedTrace: (trace: TraceData | null) => void;
  onClose: () => void;
}

export default function RunDetailDrawer({
  traceId,
  traceInfo,
  selectedTrace,
  setSelectedTrace,
  onClose,
}: RunDetailDrawerProps) {
  const stats = useGetStats({ traceInfo });
  const latency = parseDuration(traceInfo.startTime, traceInfo.endTime);
  const timestamp = new Date(traceInfo.startTime || Date.now()).toLocaleString();

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      <RunStatsHeader
        inputTokens={stats.inputTokens}
        inputCost={stats.inputCost}
        outputTokens={stats.outputTokens}
        outputCost={stats.outputCost}
        totalTokens={stats.totalTokens}
        totalCost={stats.totalCost}
        count={stats.count}
        latency={latency}
        timestamp={timestamp}
        onClose={onClose}
      />

      <Box sx={{ flex: 1, display: "flex", height: 0, overflow: "hidden" }}>
        <Box
          sx={{
            flex: 1,
            py: 3,
            px: 2,
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
            minWidth: 300,
            overflow: "auto",
          }}
        >
          <TraceItemList
            traceId={traceId}
            steps={[traceInfo]}
            onSelect={(trace) => setSelectedTrace(trace ?? null)}
            selectedTrace={selectedTrace}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          <TraceDetailPanel trace={selectedTrace} />
        </Box>
      </Box>
    </Box>
  );
}
