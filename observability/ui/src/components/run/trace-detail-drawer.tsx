import { CircularProgress, useMediaQuery } from "@mui/material";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import { useEffect, useState } from "react";
import { joinURL } from "ufo";
import { origin } from "../../utils/index.ts";
import TraceDetailDrawerMobile from "./trace-detail-drawer-mobile.tsx";
import TraceDetailDrawerPC from "./trace-detail-drawer-pc.tsx";
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
  const isMobile = useMediaQuery((x) => x.breakpoints.down("md"));

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
    if (traceId) init();

    setSelectedTrace(trace);
  }, [trace, traceId]);

  const onClose = () => {
    setTraces(null);
    setSelectedTrace(null);
    onCloseDrawer();
  };

  const renderContent = () => {
    if (!traceInfo) return null;
    if (!traceId) return null;
    if (!selectedTrace) return null;

    if (isMobile) {
      return (
        <TraceDetailDrawerMobile
          traceId={traceId}
          traceInfo={traceInfo}
          selectedTrace={selectedTrace}
          setSelectedTrace={setSelectedTrace}
          onClose={onClose}
        />
      );
    }

    return (
      <TraceDetailDrawerPC
        traceId={traceId}
        traceInfo={traceInfo}
        selectedTrace={selectedTrace}
        setSelectedTrace={setSelectedTrace}
        onClose={onClose}
      />
    );
  };

  return (
    <Drawer
      anchor={"right"}
      open={open}
      onClose={onClose}
      slotProps={{
        paper: { sx: { width: isMobile ? "100vw" : "85vw", p: 0, boxSizing: "border-box" } },
      }}
    >
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {renderContent()}

        {loading && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress color="primary" />
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
