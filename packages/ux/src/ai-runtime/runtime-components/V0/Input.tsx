import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import { cx } from "@emotion/css";
import { Icon } from "@iconify/react";
import {
  Box,
  Button,
  FormLabel,
  InputAdornment,
  Stack,
  type ThemeOptions,
  ThemeProvider,
  createTheme,
  formLabelClasses,
  outlinedInputClasses,
  styled,
  useTheme,
} from "@mui/material";
import isEmpty from "lodash/isEmpty";
import omit from "lodash/omit";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import AgentInputField from "../../components/AgentInputField";
import LoadingButton from "../../components/LoadingButton";
import { useAgent } from "../../contexts/Agent";
import { useCurrentAgent } from "../../contexts/CurrentAgent";
import { useSession } from "../../contexts/Session";
import { useSessions } from "../../contexts/Sessions";
import { useOpeningQuestions } from "../../hooks/use-appearances";
import { isValidInput } from "../../utils/agent-inputs";
import { useV0RuntimeContext } from "./contexts/V0Runtime";

export default function V0Input({
  submitText,
  inlineLabel,
  autoFillLastForm = false,
  submitInQuestionField = true,
  chatMode = true,
}: {
  submitText?: string;
  inlineLabel?: boolean;
  autoFillLastForm?: boolean;
  submitInQuestionField?: boolean;
  chatMode?: boolean;
}) {
  const { t } = useLocaleContext();
  const { aid } = useCurrentAgent();
  const agent = useAgent({ aid });
  const [executeLoading, setExecuteLoading] = useState(false);
  const opening = useOpeningQuestions();
  const { running, runAgent } = useSession((s) => ({
    running: s.running,
    runAgent: s.runAgent,
  }));
  const currentSessionId = useSessions((s) => s.currentSessionId);
  const { setCurrentMessageTaskId } = useV0RuntimeContext();

  const parameters = useMemo(
    () =>
      agent.parameters?.filter(isValidInput).map((i) => ({
        ...i,
        label: i.label?.trim() || undefined,
      })),
    [agent.parameters],
  );

  const defaultForm = useInitialFormValues();

  const theme = useFormTheme();

  const form = useForm({ defaultValues: defaultForm });

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
    try {
      if (!inputs?.question) return;
      setExecuteLoading(true);

      // in session page, send message
      await runAgent({
        aid,
        inputs,
        onResponseStart: () => {
          setCurrentMessageTaskId(undefined);
          if (chatMode) form.resetField("question", { defaultValue: "" });
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      setExecuteLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      {!currentSessionId && opening?.questions?.length && (
        <Stack
          sx={{
            flexDirection: "row",
            gap: 1,
            mb: 1,
            flexWrap: "wrap",
          }}
        >
          {opening?.questions?.map((item) => {
            const { title, parameters, id } = item;

            const question = parameters?.questions || title;
            return (
              <Button
                key={id}
                variant="outlined"
                size="small"
                endIcon={
                  <Icon
                    icon="tabler:arrow-down-right"
                    style={{
                      marginLeft: -4,
                    }}
                  />
                }
                onClick={() => {
                  form.reset({
                    ...parameters,
                  });
                  // auto execute message
                  // onSubmit({ ...parameters });
                }}
              >
                {question}
              </Button>
            );
          })}
        </Stack>
      )}
      <Form
        id="v0-input"
        component="form"
        className={cx(
          "form",
          `label-position-${inlineLabel ? "start" : "top"}`,
        )}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {parameters?.map((parameter, index) => {
          const { key, required } = parameter ?? {};

          return (
            <Box key={parameter.id}>
              <Controller
                control={form.control}
                name={key}
                rules={{
                  required,
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
                        inputRef={field.ref}
                        autoFocus={index === 0}
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
                        InputProps={
                          parameter.key === "question" && submitInQuestionField
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
                                    <LoadingButton
                                      type="submit"
                                      variant="contained"
                                      loading={running}
                                      sx={{ borderRadius: 100 }}
                                    >
                                      {submitText || t("generate")}
                                    </LoadingButton>
                                  </InputAdornment>
                                ),
                              }
                            : undefined
                        }
                      />
                    </Stack>
                  );
                }}
              />
            </Box>
          );
        })}

        {!(
          submitInQuestionField && parameters?.some((i) => i.key === "question")
        ) && (
          <LoadingButton
            type="submit"
            variant="contained"
            loading={executeLoading || running}
            sx={{ height: 40 }}
          >
            {submitText || t("generate")}
          </LoadingButton>
        )}
      </Form>
    </ThemeProvider>
  );
}

const autoSetLastParameters = false;

function useInitialFormValues() {
  const { aid } = useCurrentAgent();
  const agent = useAgent({ aid });

  const lastMessage = useSession((s) => s?.messages?.at(0));

  const [lastInputs, setLastInputs] = useState<any>();

  useEffect(() => {
    if (autoSetLastParameters && !lastInputs) {
      const lastParameters = lastMessage?.inputs;
      if (!isEmpty(lastParameters)) setLastInputs(lastParameters);
    }
  }, [lastMessage]);

  return useMemo(() => {
    if (lastInputs) {
      return lastInputs;
    }

    return Object.fromEntries(
      agent.parameters?.map((parameter) => [
        parameter.key,
        parameter.defaultValue,
      ]) ?? [],
    );
  }, [lastInputs, agent]);
}

function useFormTheme() {
  const theme = useTheme();
  return useMemo(() => {
    const themeOptions: ThemeOptions = {
      shape: {
        borderRadius: 8,
      },
      components: {
        MuiTextField: {
          styleOverrides: {
            root: ({ theme }) =>
              theme.unstable_sx({
                [`.${outlinedInputClasses.root}`]: {
                  [`.${outlinedInputClasses.notchedOutline}`]: {
                    borderWidth: 2,
                    borderColor: "primary.light",
                  },
                  ":hover": {
                    [`.${outlinedInputClasses.notchedOutline}`]: {
                      borderColor: "primary.main",
                    },
                  },
                },
              }),
          },
        },
      },
    };

    return createTheme(theme, themeOptions);
  }, [theme]);
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
