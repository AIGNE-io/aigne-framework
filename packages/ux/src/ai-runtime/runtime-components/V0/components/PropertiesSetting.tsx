import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import {
  Alert,
  Box,
  type DialogProps,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

import ConfirmDialog from "./ConfirmDialog";

type PropertiesSchemaProps = {
  id: string; // Unique random uuid
  key: string; // prop key
  type: "number" | "boolean" | "json" | "url" | "string"; // prop type
  locales?: {
    // locales has at least a value for en | zh.
    [locale: string]: {
      name?: string; // input label name
      defaultValue?: any; // match type
    };
  };
};

interface PropertiesSettingProps extends Omit<DialogProps, "open"> {}

type OpenParamsRefProps = {
  schema?: PropertiesSchemaProps[];
  onSubmit?: (values: any) => void;
  defaultValues?: any;
};

type FileItemProps = {
  Filed: any;
  extraProps?: any;
};

const FieldComponentMap = {
  number: {
    Filed: TextField,
    extraProps: {
      type: "number",
    },
  },
  boolean: {
    Filed: Switch,
  },
  json: {
    Filed: TextField,
    extraProps: {
      multiline: true,
      minRows: 3,
      maxRows: 5,
    },
  },
  url: {
    Filed: TextField,
  },
  string: {
    Filed: TextField,
  },
} as {
  [key: string]: FileItemProps;
};

const PropertiesSetting = forwardRef(
  (props: PropertiesSettingProps, ref: any) => {
    const { t, locale } = useLocaleContext();
    const ConfirmDialogRef = useRef<any>(null);
    const valuesRef = useRef({});
    const openParamsRef = useRef<OpenParamsRefProps>({});

    const open = (params: OpenParamsRefProps) => {
      if (!ConfirmDialogRef?.current) return;

      openParamsRef.current = params;

      ConfirmDialogRef.current.open({
        title: t("v0.propertiesSetting"),
        children: (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              {t("v0.propertiesSettingTip")}
            </Alert>
            <Stack spacing={2}>
              {params?.schema?.map((item) => {
                const { id, key, type, locales } = item;
                const { Filed, extraProps } = (FieldComponentMap[type] ||
                  FieldComponentMap.string) as FileItemProps;
                const currentLocale = locales?.[locale] || locales?.en;

                return (
                  <Box key={id}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 0.5,
                      }}
                    >
                      {currentLocale?.name}
                    </Typography>
                    <Filed
                      fullWidth
                      variant="outlined"
                      defaultValue={
                        openParamsRef?.current?.defaultValues?.[key] ||
                        currentLocale?.defaultValue
                      }
                      size="small"
                      onChange={(e: any) => {
                        // update value
                        valuesRef.current = {
                          ...valuesRef.current,
                          [key]: e.target.value,
                        };
                      }}
                      {...extraProps}
                    />
                  </Box>
                );
              })}
            </Stack>
          </Box>
        ),
        onConfirm: () => {
          params?.onSubmit?.(getValues());
        },
        onCancel: () => {},
      });
    };

    const getValues = () => {
      return {
        ...openParamsRef?.current?.defaultValues,
        ...valuesRef.current,
      };
    };

    useImperativeHandle(ref, () => ({
      open,
      getValues,
    }));

    useEffect(() => {
      valuesRef.current = {};
    }, [locale]);

    return <ConfirmDialog ref={ConfirmDialogRef} {...props} />;
  },
);

export default PropertiesSetting;
