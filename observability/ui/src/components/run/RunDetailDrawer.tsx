import { Backdrop, CircularProgress } from "@mui/material";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Decimal from "decimal.js";
import { useEffect, useState } from "react";
import { joinURL } from "ufo";
import useGetTokenPrice from "../../hooks/get-token-price.ts";
import { origin } from "../../utils/index.ts";
import { parseDuration } from "../../utils/latency.ts";
import RunStatsHeader from "./RunStatsHeader.tsx";
import TraceDetailPanel from "./TraceDetailPanel.tsx";
import TraceItemList from "./TraceItem.tsx";
import type { TraceData } from "./types.ts";

interface RunDetailDrawerProps {
  traceId: string | null;
  open: boolean;
  onClose: () => void;
  trace: TraceData | null;
}

export default function RunDetailDrawer({
  traceId,
  open,
  onClose: onCloseDrawer,
  trace,
}: RunDetailDrawerProps) {
  const [selectedTrace, setSelectedTrace] = useState(trace);
  const [traceInfo, setTraces] = useState(trace);
  const [loading, setLoading] = useState(false);
  const getPrices = useGetTokenPrice();

  const init = async () => {
    setLoading(true);

    fetch(joinURL(origin, `/api/trace/tree/${traceId}`))
      .then((res) => res.json() as Promise<{ data: TraceData }>)
      .then(({ data }) => {
        const format = {
          ...data,
          startTime: Number(data.startTime),
          endTime: Number(data.endTime),
        };

        setTraces(format);
        setSelectedTrace(format);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  useEffect(() => {
    if (traceId) {
      init();
    }

    setSelectedTrace(trace);
  }, [trace, traceId]);

  const onClose = () => {
    setTraces(null);
    setSelectedTrace(null);
    onCloseDrawer();
  };

  const getRunStats = (run: TraceData | null) => {
    let count = 0;
    let inputTokens = 0;
    let outputTokens = 0;
    let inputCost = new Decimal(0);
    let outputCost = new Decimal(0);

    function traverse(node: TraceData | null) {
      if (!node) return;
      count += 1;
      if (node.attributes.output?.usage) {
        inputTokens += node.attributes.output?.usage?.inputTokens || 0;
        outputTokens += node.attributes.output?.usage?.outputTokens || 0;
        inputCost = inputCost.add(
          getPrices({
            model: node.attributes.output?.model,
            inputTokens: node.attributes.output?.usage?.inputTokens || 0,
            outputTokens: node.attributes.output?.usage?.outputTokens || 0,
          }).inputCost,
        );
        outputCost = outputCost.add(
          getPrices({
            model: node.attributes.output?.model,
            inputTokens: node.attributes.output?.usage?.inputTokens || 0,
            outputTokens: node.attributes.output?.usage?.outputTokens || 0,
          }).outputCost,
        );
      }
      if (node.children) node.children.forEach(traverse);
    }
    traverse(run);

    return {
      count,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      inputCost: inputCost.gt(new Decimal(0)) ? `($${inputCost.toString()})` : "",
      outputCost: outputCost.gt(new Decimal(0)) ? `($${outputCost.toString()})` : "",
      totalCost: inputCost.add(outputCost).gt(new Decimal(0))
        ? `($${inputCost.add(outputCost).toString()})`
        : "",
    };
  };

  const renderContent = () => {
    if (!traceInfo) return null;

    const stats = getRunStats(traceInfo);
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
              traceId={traceId ?? ""}
              steps={[traceInfo]}
              onSelect={(trace) => setSelectedTrace(trace ?? null)}
              selectedTrace={selectedTrace}
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
            <TraceDetailPanel trace={selectedTrace} />
          </Box>
        </Box>

        {loading && (
          <Backdrop
            sx={{
              color: "common.white",
              zIndex: (theme) => theme.zIndex.drawer + 1,
              position: "absolute",
              inset: 0,
            }}
            open
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        )}
      </Box>
    );
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: { sx: { width: "85vw", p: 0, boxSizing: "border-box" } },
      }}
    >
      {renderContent()}
    </Drawer>
  );
}
