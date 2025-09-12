import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import { useState } from "react";
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
          <IconButton onClick={() => setOpen(true)}>
            <MenuIcon />
          </IconButton>

          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ overflow: "auto" }}>
          <TraceDetailPanel trace={selectedTrace} sx={{ height: "inherit" }} />
        </Box>
      </Box>

      {open && (
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
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
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ py: 3, px: 2, overflow: "auto" }}>
            <TraceItemList
              traceId={traceId}
              steps={[traceInfo]}
              onSelect={(trace) => setSelectedTrace(trace ?? null)}
              selectedTrace={selectedTrace}
            />
          </Box>
        </Drawer>
      )}
    </>
  );
}
