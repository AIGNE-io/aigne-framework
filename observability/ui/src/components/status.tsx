import { Box } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

const Status = () => {
  const theme = useTheme();

  const breathingStyle = {
    boxShadow: `0 0 3px 1px ${alpha(theme.palette.warning.light, 0.5)}`,
    animation: "breathing 1.5s infinite",
    "@keyframes breathing": {
      "0%": { boxShadow: `0 0 3px 1px ${alpha(theme.palette.warning.light, 0.5)}` },
      "50%": { boxShadow: `0 0 6px 2px ${alpha(theme.palette.warning.light, 0.7)}` },
      "100%": { boxShadow: `0 0 3px 1px ${alpha(theme.palette.warning.light, 0.5)}` },
    },
  };

  return (
    <Box
      sx={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        backgroundColor: "warning.light",
        flexShrink: 0,
        ...breathingStyle,
      }}
    />
  );
};

export default Status;
