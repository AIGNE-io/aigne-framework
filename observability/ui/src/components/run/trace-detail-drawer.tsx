import Toast from "@arcblock/ux/lib/Toast";
import { CircularProgress, useMediaQuery } from "@mui/material";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import useRafInterval from "ahooks/lib/useRafInterval";
import { useEffect, useState } from "react";
import { joinURL } from "ufo";
import { origin } from "../../utils/index.ts";
import TraceDetailDrawerDesktop from "./trace-detail-drawer-desktop.tsx";
import TraceDetailDrawerMobile from "./trace-detail-drawer-mobile.tsx";
import type { TraceData } from "./types.ts";

interface RunDetailDrawerProps {
  traceId: string | null;
  open: boolean;
  onClose: () => void;
  trace: TraceData | null;
}

export default function RunDetailDrawer({
  traceId,
  trace,
  open,
  onClose: onCloseDrawer,
}: RunDetailDrawerProps) {
  const [selectedTrace, setSelectedTrace] = useState(trace);
  const [traceInfo, setTraces] = useState(trace);
  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery((x) => x.breakpoints.down("md"));

  const init = async (setSelectTrace: boolean = false, signal?: AbortSignal) => {
    try {
      const res = await fetch(joinURL(origin, `/api/trace/tree/${traceId}`), { signal });
      const { data } = (await res.json()) as { data: TraceData };
      const format = {
        ...data,
        startTime: Number(data.startTime),
        endTime: Number(data.endTime),
      };

      setTraces(format);
      if (setSelectTrace) {
        setSelectedTrace(format);
        setLoading(false);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        Toast.error((err as Error)?.message);
      }

      setLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  useEffect(() => {
    if (!traceId) return;

    const controller = new AbortController();
    setLoading(true);
    init(true, controller.signal);

    setSelectedTrace(trace);

    return () => {
      controller.abort();
    };
  }, [trace, traceId]);

  useRafInterval(() => {
    if (!open) return;

    const controller = new AbortController();
    init(undefined, controller.signal);

    return () => controller.abort();
  }, 3000);

  const onClose = () => {
    setTraces(null);
    setSelectedTrace(null);
    onCloseDrawer();
  };

  const renderContent = () => {
    if (!traceInfo || !traceId || !selectedTrace) return null;

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
      <TraceDetailDrawerDesktop
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
        {!loading && renderContent()}

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
