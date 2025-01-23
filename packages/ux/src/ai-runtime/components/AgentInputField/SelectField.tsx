import {
  Box,
  Chip,
  MenuItem,
  TextField,
  type TextFieldProps,
} from "@mui/material";
import { isNil } from "lodash";
import { forwardRef } from "react";

import type { SelectParameter } from "@aigne/agent-v1";

const SelectField = forwardRef<
  HTMLDivElement,
  {
    readOnly?: boolean;
    parameter?: SelectParameter;
    onChange: (value: string | string[]) => void;
  } & Omit<TextFieldProps, "onChange">
>(({ readOnly, parameter, onChange, ...props }, ref) => {
  return (
    <TextField
      ref={ref}
      select
      {...props}
      value={
        parameter?.multiple
          ? Array.isArray(props.value)
            ? props.value.filter((i) => !isNil(i) && i !== "")
            : props.value
              ? [props.value]
              : []
          : Array.isArray(props.value)
            ? props.value[0]
            : props.value
      }
      onChange={(e) => onChange(e.target.value)}
      InputProps={{ ...props.InputProps, readOnly }}
      SelectProps={{
        ...props.SelectProps,
        multiple: parameter?.multiple,
        renderValue: parameter?.multiple
          ? (selected: any) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((value: any) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )
          : undefined,
        MenuProps: {
          disableScrollLock: true,
          ...props.SelectProps?.MenuProps,
          sx: {
            ...props.SelectProps?.MenuProps?.sx,
            ".MuiMenuItem-root": {
              whiteSpace: "pre-wrap",
            },
          },
        },
      }}
    >
      {parameter?.options?.map((option) => (
        <MenuItem key={option.id} value={option.value || option.label}>
          {option.label || option.value}
        </MenuItem>
      ))}
    </TextField>
  );
});

export default SelectField;
