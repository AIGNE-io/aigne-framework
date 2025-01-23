import { TextField, type TextFieldProps } from "@mui/material";
import { forwardRef } from "react";

import type { NumberParameter } from "@aigne/agent-v1";

const NumberField = forwardRef<
  HTMLDivElement,
  {
    readOnly?: boolean;
    parameter?: NumberParameter;
    onChange: (value: number) => void;
  } & Omit<TextFieldProps, "onChange">
>(({ readOnly, parameter, ...props }, ref) => {
  return (
    <TextField
      ref={ref}
      {...props}
      InputProps={{
        ...props.InputProps,
        readOnly,
        inputProps: {
          type: "number",
          inputMode: "numeric",
          pattern: "[0-9]*",
          min: parameter?.min,
          max: parameter?.max,
          ...props.inputProps,
        },
      }}
      onChange={(e) => props.onChange?.(Number(e.target.value))}
    />
  );
});

export default NumberField;
