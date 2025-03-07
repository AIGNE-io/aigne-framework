import { TextField, type TextFieldProps, inputBaseClasses } from "@mui/material";
import { type KeyboardEvent, forwardRef, useCallback } from "react";

import type { StringParameter } from "@aigne/agent-v1";

const StringField = forwardRef<
  HTMLDivElement,
  {
    readOnly?: boolean;
    parameter?: StringParameter;
    onChange: (value: string) => void;
  } & Omit<TextFieldProps, "onChange">
>(({ readOnly, parameter, onChange, ...props }, ref) => {
  const isQuestion = parameter?.key === "question";

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isQuestion) return;

      // NOTE: Pressing Enter in the IME will trigger the 229 event
      if (e.keyCode === 229) return;
      if (e.key === "Enter" && !e.shiftKey && !e.repeat) {
        e.preventDefault();
        (e.target as HTMLInputElement).form?.requestSubmit();
      }
    },
    [isQuestion],
  );

  return (
    <TextField
      ref={ref}
      multiline={isQuestion || parameter?.multiline || isQuestion}
      minRows={isQuestion ? 1 : parameter?.multiline ? 2 : undefined}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      {...props}
      InputProps={{
        readOnly,
        ...props.InputProps,
        sx: {
          py: 0,
          [`.${inputBaseClasses.input}`]: { py: 1 },
          ...props.InputProps?.sx,
        },
        inputProps: { ...props.inputProps, maxLength: parameter?.maxLength },
      }}
    />
  );
});

export default StringField;
