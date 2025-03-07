import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
  type RadioGroupProps,
  alpha,
} from "@mui/material";
import { forwardRef } from "react";

import type { SelectParameter } from "@aigne/agent-v1";

const RadioField = forwardRef<
  HTMLDivElement,
  {
    readOnly?: boolean;
    parameter?: SelectParameter;
    onChange: (value: string | string[]) => void;
  } & Omit<RadioGroupProps, "onChange">
>(({ readOnly, parameter, onChange, ...props }, ref) => {
  if (parameter?.multiple) {
    const value = Array.isArray(props.value) ? props.value : props.value ? [props.value] : [];

    return (
      <FormGroup sx={{ display: "flex", flexDirection: "row" }}>
        {parameter?.options?.map((option) => {
          const val = option.value || option.label;
          const checked = value.includes(val);

          return (
            <FormControlLabel
              label={option.label || option.value}
              disabled={readOnly}
              key={option.id}
              value={option.value || option.label}
              checked={checked}
              control={<Checkbox />}
              onChange={(_, v) => {
                onChange(v ? [...value, val] : value.filter((i) => i !== val));
              }}
              sx={{
                transition: "all 0.3s linear",
                ml: 0,
                mr: 1,
                my: 0.5,
                py: 0.5,
                px: 2.5,
                border: 2,
                borderColor: (theme) =>
                  checked ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.3),
                borderRadius: 8,
                ".MuiCheckbox-root": {
                  // hidden radio button
                  display: "none",
                },
              }}
            />
          );
        })}
      </FormGroup>
    );
  }

  const value = Array.isArray(props.value) ? props.value[0] : props.value;

  return (
    <RadioGroup ref={ref} row onChange={(e) => onChange(e.target.value)} {...props}>
      {parameter?.options?.map((option) => {
        const val = option.value || option.label;
        const checked = val === value;

        return (
          <FormControlLabel
            label={option.label || option.value}
            disabled={readOnly}
            key={option.id}
            value={val}
            checked={checked}
            control={<Radio />}
            sx={{
              transition: "all 0.3s linear",
              ml: 0,
              mr: 1,
              my: 0.5,
              py: 0.5,
              px: 2.5,
              border: 2,
              borderColor: (theme) =>
                checked ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.3),
              borderRadius: 8,
              ".MuiRadio-root": {
                // hidden radio button
                display: "none",
              },
            }}
          />
        );
      })}
    </RadioGroup>
  );
});

export default RadioField;
