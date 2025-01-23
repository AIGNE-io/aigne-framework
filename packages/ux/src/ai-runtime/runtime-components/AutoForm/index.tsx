import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import { cx } from "@emotion/css";
import {
  Box,
  FormLabel,
  InputAdornment,
  Stack,
  formLabelClasses,
  styled,
} from "@mui/material";
import isEmpty from "lodash/isEmpty";
import omit from "lodash/omit";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import AgentInputField from "../../components/AgentInputField";
import LoadingButton from "../../components/LoadingButton";
import { useAgent } from "../../contexts/Agent";
import { useComponentPreferences } from "../../contexts/ComponentPreferences";
import { useCurrentAgent } from "../../contexts/CurrentAgent";
import { useDebug } from "../../contexts/Debug";
import { useSession } from "../../contexts/Session";
import { isValidInput } from "../../utils/agent-inputs";
import { ImagePreview, ImageUpload } from "./image-upload";

export default function AutoForm({
  submitText,
  inlineLabel,
  autoFillLastForm = true,
  submitInQuestionField,
  chatMode,
}: {
  submitText?: string;
  inlineLabel?: boolean;
  autoFillLastForm?: boolean;
  submitInQuestionField?: boolean;
  chatMode?: boolean;
}) {
  const preferences = useComponentPreferences();

  const submitRef = useRef<HTMLButtonElement>(null);
  const { t } = useLocaleContext();
  const { aid } = useCurrentAgent();
  const agent = useAgent({ aid });
  const debugStore = useDebug();
  const autoFocus = debugStore ? debugStore((s) => s.autoFocus) : true;

  const { running, runAgent } = useSession((s) => ({
    running: s.running,
    runAgent: s.runAgent,
  }));

  const parameters = useMemo(
    () =>
      agent.parameters
        ?.filter(
          (i) =>
            isValidInput(i) && !preferences?.hideInputFields?.includes(i.key),
        )
        .map((i) => ({ ...i, label: i.label?.trim() || undefined })),
    [agent.parameters],
  );

  const imageParameters = useMemo(
    () => parameters?.filter((i) => i.type === "image"),
    [parameters],
  );
  const imageParametersMap = useMemo(
    () =>
      imageParameters?.reduce(
        (acc, curr) => {
          if (curr.multiple) {
            acc[curr.key!] = [];
          } else {
            acc[curr.key!] = "";
          }

          return acc;
        },
        {} as Record<string, string | string[]>,
      ),
    [imageParameters],
  );

  const isOnlyOneImageParameter = useMemo(
    () => (imageParameters?.length || 0) === 1,
    [imageParameters],
  );
  const initialFormValues = useInitialFormValues();
  const changeImageParameterRender =
    agent.type === "prompt" && isOnlyOneImageParameter;

  const isOnlyOneVCInput =
    parameters?.length === 1 && parameters[0]?.type === "verify_vc";

  const hiddenSubmit = isOnlyOneVCInput;

  const defaultForm = useMemo(() => {
    return { ...initialFormValues, ...(imageParametersMap || {}) };
  }, [initialFormValues, imageParametersMap]);

  const form = useForm({ defaultValues: defaultForm });

  const submitDisabled = !form.formState.isValid;

  useEffect(() => {
    if (preferences?.autoGenerate && !form.formState.submitCount) {
      submitRef.current?.form?.requestSubmit();
    }
  }, [defaultForm, preferences?.autoGenerate]);

  const isInInput =
    submitInQuestionField && parameters?.some((i) => i.key === "question");

  const renderImageUploadIcon = () => {
    if (!isOnlyOneImageParameter || !imageParameters?.[0]) return null;
    return (
      <ImageUpload
        control={form.control}
        parameter={imageParameters[0]}
        isInInput={isInInput}
      />
    );
  };

  const previewsValue = useWatch({
    control: form.control,
    name: changeImageParameterRender ? imageParameters?.[0]?.key || "" : "",
  });

  const renderImageUploadPreview = () => {
    if (!changeImageParameterRender || !imageParameters?.[0]) return null;
    return (
      <ImagePreview
        value={previewsValue}
        parameter={imageParameters[0]}
        onRemove={(index) => {
          const list = (
            Array.isArray(previewsValue) ? previewsValue : [previewsValue]
          ).filter(Boolean);
          const newUrls = list.filter((_: any, i: any) => i !== index);
          form.setValue(imageParameters[0]!.key!, newUrls);
        }}
      />
    );
  };

  useEffect(() => {
    if (
      autoFillLastForm &&
      !form.formState.isSubmitted &&
      !form.formState.isSubmitting
    ) {
      form.reset(chatMode ? omit(defaultForm, "question") : defaultForm);
    }
  }, [defaultForm, autoFillLastForm, form, chatMode]);

  const onSubmit = async (inputs: any) => {
    submitRef.current?.scrollIntoView({ block: "center" });
    await runAgent({
      aid,
      inputs,
      onResponseStart: () => {
        if (chatMode) form.resetField("question", { defaultValue: "" });
      },
    });
  };

  return (
    <Form
      component="form"
      className={cx("form", `label-position-${inlineLabel ? "start" : "top"}`)}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {isInInput && changeImageParameterRender && renderImageUploadPreview()}

      {parameters?.map((parameter, index) => {
        const { key, required } = parameter ?? {};
        if (!key) return null;
        if (parameter.type === "image" && changeImageParameterRender)
          return null;

        return (
          <Box key={parameter.id}>
            <Controller
              control={form.control}
              name={key}
              rules={{
                required: required || key === "question",
                min:
                  parameter.type === "number" &&
                  typeof parameter.min === "number"
                    ? { value: parameter.min, message: "" }
                    : undefined,
                max:
                  parameter.type === "number" &&
                  typeof parameter.max === "number"
                    ? { value: parameter.max, message: "" }
                    : undefined,
                minLength:
                  parameter.type === "string" &&
                  typeof parameter.minLength === "number"
                    ? { value: parameter.minLength, message: "" }
                    : undefined,
                maxLength:
                  parameter.type === "string" &&
                  typeof parameter.maxLength === "number"
                    ? { value: parameter.maxLength, message: "" }
                    : undefined,
              }}
              render={({ field, fieldState }) => {
                return (
                  <Stack className="form-item">
                    {parameter.label && (
                      <FormLabel>{parameter.label}</FormLabel>
                    )}

                    <AgentInputField
                      inputProps={{ "data-testid": `runtime-input-${key}` }}
                      inputRef={field.ref}
                      autoFocus={autoFocus && index === 0}
                      size="small"
                      hiddenLabel
                      fullWidth
                      label={undefined}
                      parameter={parameter}
                      maxRows={
                        !parameter?.type || parameter?.type === "string"
                          ? 5
                          : undefined
                      }
                      value={field.value || ""}
                      onChange={(value) =>
                        field.onChange({ target: { value } })
                      }
                      error={Boolean(fieldState.error)}
                      helperText={
                        fieldState.error?.message || parameter?.helper
                      }
                      sx={{ flex: 1 }}
                      InputProps={{
                        ...(parameter.key === "question" &&
                        submitInQuestionField
                          ? {
                              endAdornment: (
                                <InputAdornment
                                  position="end"
                                  sx={{
                                    py: 3,
                                    mr: -0.75,
                                    alignSelf: "flex-end",
                                  }}
                                >
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    gap={1}
                                  >
                                    {changeImageParameterRender &&
                                      renderImageUploadIcon()}

                                    <LoadingButton
                                      data-testid="runtime-submit-button"
                                      ref={submitRef}
                                      type="submit"
                                      variant="contained"
                                      loading={running}
                                      disabled={submitDisabled}
                                      sx={{ borderRadius: 1.5 }}
                                    >
                                      {submitText}
                                    </LoadingButton>
                                  </Stack>
                                </InputAdornment>
                              ),
                            }
                          : {}),
                      }}
                    />
                  </Stack>
                );
              }}
            />
          </Box>
        );
      })}

      {!isInInput && (
        <Stack gap={1}>
          {changeImageParameterRender && renderImageUploadPreview()}

          <Stack gap={1} direction="row" alignItems="center">
            {changeImageParameterRender && renderImageUploadIcon()}

            <LoadingButton
              hidden={hiddenSubmit}
              data-testid="runtime-submit-button"
              ref={submitRef}
              type="submit"
              variant="contained"
              loading={running}
              disabled={submitDisabled}
              sx={{ height: 40, display: hiddenSubmit ? "none" : undefined }}
            >
              {submitText || t("generate")}
            </LoadingButton>
          </Stack>
        </Stack>
      )}
    </Form>
  );
}

function useInitialFormValues() {
  const preferences = useComponentPreferences();
  const { aid } = useCurrentAgent();
  const agent = useAgent({ aid });

  const lastMessage = useSession((s) => s.messages?.at(0));

  const [lastInputs, setLastInputs] = useState<any>();

  useEffect(() => {
    setLastInputs(undefined);
  }, [aid]);

  useEffect(() => {
    if (!lastInputs) {
      const lastParameters = lastMessage?.inputs;
      if (!isEmpty(lastParameters)) setLastInputs(lastParameters);
    }
  }, [lastMessage]);

  return useMemo(() => {
    if (preferences?.initialInputValues) return preferences.initialInputValues;

    if (lastInputs) {
      return lastInputs;
    }

    return Object.fromEntries(
      agent.parameters?.map((parameter) => [
        parameter.key,
        parameter.defaultValue,
      ]) ?? [],
    );
  }, [lastInputs, agent, preferences?.initialInputValues]);
}

const Form = styled(Stack)(({ theme }) =>
  theme.unstable_sx({
    gap: 2,

    ".form-item": {
      gap: 0.5,

      [`.${formLabelClasses.root}`]: {
        fontWeight: 500,
        color: "text.primary",
      },
    },

    "&.label-position-start": {
      ".form-item": {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 1,
      },
    },
  }),
) as typeof Stack;
