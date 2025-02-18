import type { TextFieldProps } from "@mui/material";
import type { ComponentType } from "react";

import type { Parameter } from "@aigne/agent-v1";
import BooleanField from "./BooleanField";
import ImageField from "./ImageField";
import LanguageField from "./LanguageField";
import NumberField from "./NumberField";
import RadioField from "./RadioField";
import SelectField from "./SelectField";
import StringField from "./StringField";
import VerifyVC from "./VerifyVC";

export default function AgentInputField({
  parameter,
  ...props
}: {
  readOnly?: boolean;
  parameter: Parameter;
  onChange: (value: string | number | undefined | string[]) => void;
} & Omit<TextFieldProps, "onChange">) {
  if (parameter.type === "source") return null;

  if (parameter.key === "datasetId") {
    return null;
  }

  if (parameter.type === "image") {
    return <ImageField parameter={parameter} {...props} />;
  }

  const FIELDS: {
    [type in NonNullable<Parameter["type"]>]?: ComponentType<any>;
  } = {
    number: NumberField,
    string: StringField,
    select:
      parameter.type === "select" && parameter.style === "checkbox"
        ? RadioField
        : SelectField,
    language: LanguageField,
    boolean: BooleanField,
    verify_vc: VerifyVC,
  };

  const Field = FIELDS[parameter.type || "string"] || StringField;

  return (
    <Field
      parameter={parameter}
      label={parameter?.label}
      helperText={parameter?.helper}
      placeholder={parameter?.placeholder}
      {...({ parameter } as any)}
      size="small"
      {...props}
    />
  );
}
