import { Box, FormControlLabel, Switch } from "@mui/material";
import type { ReactNode } from "react";

const SwitchComponent = ({
  checked,
  onChange,
  label,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  disabled?: boolean;
}) => {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        px: 1.5,
        py: 0.5,
        display: "inline-flex",
        alignItems: "center",
        minHeight: 36,
      }}
    >
      <FormControlLabel
        control={
          <Switch
            disabled={disabled}
            checked={checked}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
            color="primary"
            size="small"
          />
        }
        label={
          <Box
            component="span"
            sx={{ fontSize: 13, color: "text.primary", fontWeight: 400, mr: 0.5 }}
          >
            {label}
          </Box>
        }
        labelPlacement="start"
        sx={{ m: 0, mr: 0.5 }}
      />
    </Box>
  );
};

export default SwitchComponent;
