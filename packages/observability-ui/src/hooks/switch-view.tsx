import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Button } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useState } from "react";

function RenderButton({ view }: { view: string }) {
  return (
    <Button
      variant="outlined"
      sx={{
        borderRadius: 1,
        textTransform: "none",
        paddingX: 1.5,
        paddingY: 0.5,
        fontSize: 14,
        minHeight: 28,
        borderColor: "divider",
        zIndex: 1000,
        backgroundColor: "action.disabledBackground",
        color: "common.white",

        "&:hover": {
          backgroundColor: "action.disabledBackground",
          borderColor: "divider",
        },
      }}
    >
      <Typography variant="body2" sx={{ color: "common.white", ml: 1 }}>
        {view}
      </Typography>
      <Box sx={{ display: "flex" }}>
        <ChevronLeftIcon sx={{ fontSize: 16 }} />
        <ChevronRightIcon sx={{ fontSize: 16 }} />
      </Box>
    </Button>
  );
}
const useSwitchView = () => {
  const list = ["json", "yaml", "rendered"].filter(Boolean);
  const [view, setView] = useState<(typeof list)[number]>(list[0]);

  const handleViewChange = () => {
    setView(list[list.indexOf(view) + 1] || list[0]);
  };

  const renderView = () => {
    return (
      <Box onClick={() => handleViewChange()}>
        <RenderButton view={view.toUpperCase()} />
      </Box>
    );
  };

  return {
    view,
    renderView,
  };
};

export default useSwitchView;
