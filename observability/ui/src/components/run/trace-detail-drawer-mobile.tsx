import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import { useCallback, useMemo, useState } from "react";
import TraceDetailPanel from "./trace-detail-panel.tsx";
import TraceItemList from "./trace-item.tsx";
import type { RunDetailDrawerProps } from "./types.ts";

export default function RunDetailDrawer({
  traceId,
  traceInfo,
  selectedTrace,
  setSelectedTrace,
  onClose,
}: RunDetailDrawerProps) {
  const [open, setOpen] = useState(false);

  const handleOpenDrawer = useCallback(() => setOpen(true), []);
  const handleCloseDrawer = useCallback(() => setOpen(false), []);

  const steps = useMemo(() => [traceInfo], [traceInfo]);

  return (
    <>
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", p: 1 }}>
          <IconButton onClick={handleOpenDrawer}>
            <MenuIcon />
          </IconButton>

          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ overflow: "auto", height: 1 }}>
          <TraceDetailPanel
            trace={selectedTrace}
            traceInfo={traceInfo}
            sx={{ height: "inherit" }}
          />
        </Box>
      </Box>

      {open && (
        <Drawer
          open={open}
          onClose={handleCloseDrawer}
          slotProps={{
            paper: { sx: { width: "85vw", p: 0, boxSizing: "border-box", position: "relative" } },
          }}
        >
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: "85vw",
              zIndex: 1000,
              bgcolor: "background.paper",
            }}
          >
            <IconButton onClick={handleCloseDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ py: 3, px: 2, overflow: "auto" }}>
            <TraceItemList
              traceId={traceId}
              steps={steps}
              onSelect={(trace) => setSelectedTrace(trace ?? null)}
              selectedTrace={selectedTrace}
            />
          </Box>
        </Drawer>
      )}
    </>
  );
}
