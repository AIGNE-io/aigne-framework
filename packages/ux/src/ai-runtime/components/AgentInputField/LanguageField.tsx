import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import {
  Autocomplete,
  ListItemIcon,
  ListItemText,
  MenuItem,
  TextField,
  type TextFieldProps,
} from "@mui/material";
import pick from "lodash/pick";
import type React from "react";
import { forwardRef } from "react";

import type { SelectParameter } from "@aigne/agent-v1";
import { languages } from "../../utils/languages";

type Option = {
  name: string;
  en: string;
  cn: string;
  abbr: string;
  flag: (props: React.SVGProps<SVGSVGElement>) => any;
};

const filter = (options: Option[], state: { inputValue: string }) => {
  return options.filter((o: Option) => {
    if (state.inputValue) {
      return (
        o.en.toLowerCase().includes(state.inputValue.toLowerCase()) ||
        o.name.toLowerCase().includes(state.inputValue.toLowerCase())
      );
    }

    return true;
  });
};

const LanguageField = forwardRef<
  HTMLDivElement,
  {
    readOnly?: boolean;
    parameter?: SelectParameter;
    onChange: (value: string | undefined) => void;
  } & Omit<TextFieldProps, "onChange">
>(({ readOnly, parameter, onChange, ...props }, ref) => {
  const { locale } = useLocaleContext();

  const value = props?.value
    ? languages.find((o) => o.en === props.value)
    : null;

  return (
    <Autocomplete
      size="small"
      ref={ref}
      {...pick(props, "autoFocus", "fullWidth", "sx", "className", "style")}
      renderInput={(params) => (
        <TextField
          {...pick(
            props,
            "inputRef",
            "size",
            "hiddenLabel",
            "helperText",
            "error",
            "placeholder",
            "InputProps",
            "inputProps",
          )}
          {...params}
        />
      )}
      options={languages}
      getOptionKey={(i) => i.en}
      getOptionLabel={(o: Option) => {
        return locale === "zh" ? o.cn : o.en;
      }}
      autoHighlight
      value={value}
      filterOptions={filter}
      onChange={(_e, newValue) => {
        onChange?.(newValue?.en);
      }}
      renderOption={(props, option) => {
        return (
          <MenuItem {...props} key={option.name}>
            <ListItemIcon>
              <option.flag />
            </ListItemIcon>

            <ListItemText
              primary={`${option.name} ${locale === "zh" ? option.cn : option.en} (${option.abbr})`}
            />
          </MenuItem>
        );
      }}
    />
  );
});

export default LanguageField;
