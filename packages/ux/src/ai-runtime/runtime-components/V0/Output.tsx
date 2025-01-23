import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import Toast from "@arcblock/ux/lib/Toast";
import { transpileAndLoadScript } from "@blocklet/pages-kit/components";
import { Icon } from "@iconify/react";
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Drawer,
  Stack,
  Typography,
} from "@mui/material";
import groupBy from "lodash/groupBy";
import { Suspense, useRef, useState } from "react";

import MarkdownRenderer from "../../components/MarkdownRenderer";
import ShareActions from "../../components/ShareActions";
import { useCurrentMessage } from "../../contexts/CurrentMessage";
import MessageMetadataRenderer from "../ChatOutput/MessageMetadataRenderer";
import {
  CodeRenderByMessageMemo as CodeRenderByMessage,
  getCurrentCodeByTaskId,
} from "./components/CodePreview";
import Loading from "./components/Loading";
import PropertiesSetting from "./components/PropertiesSetting";
import UserQuestion from "./components/UserQuestion";
import { useV0RuntimeContext } from "./contexts/V0Runtime";

const DEFAULT_DESKTOP_SX = {
  width: "100%",
  height: "100%",
};

export default function V0Output() {
  const { message } = useCurrentMessage();
  const propertiesSettingRef = useRef(null);
  const { propertiesValueMap, setPropertiesValueMap, isMobile } =
    useV0RuntimeContext();

  const [code, setCode] = useState("");
  const { t, locale } = useLocaleContext();

  const [codePreviewExtraProps, setCodePreviewExtraProps] = useState({
    sx: DEFAULT_DESKTOP_SX,
    key: "Desktop",
  });

  const objects = message.outputs?.objects;
  const { id: taskId, inputs } = message;

  const isMessageLoading =
    (message.loading || !message.outputs) && !message.error;

  const disabled = isMessageLoading || !objects?.length || message.error;

  const responsiveSx = {
    backgroundColor: "white",
    borderColor: "rgba(0, 0, 0, 0.1) !important",
    // rewrite disabled style
    "&.frame-button.Mui-disabled": {
      backgroundColor: "primary.main",
      color: "white",
    },
  };

  const tooltipOptions = [
    !isMobile && {
      key: "Desktop",
      icon: "tabler:device-desktop",
      props: {
        className: "frame-button",
        disabled: codePreviewExtraProps?.key === "Desktop",
        sx: {
          ...responsiveSx,
        },
        onClick: () =>
          setCodePreviewExtraProps({
            sx: DEFAULT_DESKTOP_SX,
            key: "Desktop",
          }),
      },
      group: "responsive",
    },
    !isMobile && {
      key: "Tablet",
      icon: "tabler:device-tablet",
      props: {
        className: "frame-button",
        disabled: codePreviewExtraProps?.key === "Tablet",
        sx: {
          ...responsiveSx,
        },
        onClick: () =>
          setCodePreviewExtraProps({
            sx: {
              width: "768px",
              height: "1024px",
            },
            key: "Tablet",
          }),
      },
      group: "responsive",
    },
    !isMobile && {
      key: "Mobile",
      icon: "tabler:device-mobile",
      props: {
        className: "frame-button",
        disabled: codePreviewExtraProps?.key === "Mobile",
        sx: {
          ...responsiveSx,
        },
        onClick: () =>
          setCodePreviewExtraProps({
            sx: {
              width: "375px",
              height: "667px",
            },
            key: "Mobile",
          }),
      },
      group: "responsive",
    },
    // setting
    {
      key: "Setting",
      icon: "tabler:settings-2",
      props: {
        disabled,
        sx: {
          ...responsiveSx,
        },
        onClick: async (e: any) => {
          const { taskid: taskId } = e?.currentTarget?.dataset || {};
          const currentCode = getCurrentCodeByTaskId(message);

          try {
            await transpileAndLoadScript(currentCode).then((m) => {
              if (
                typeof m?.PROPERTIES_SCHEMA === "object" &&
                m?.PROPERTIES_SCHEMA.length
              ) {
                const schemaDefaultValues = Object.fromEntries(
                  m.PROPERTIES_SCHEMA.map((item: any) => {
                    const { key, locales } = item;
                    const currentLocale = locales?.[locale] || locales?.en;
                    return [key, currentLocale?.defaultValue];
                  }),
                );

                const defaultValues = {
                  ...schemaDefaultValues,
                  ...(propertiesValueMap[taskId]?.[locale] ||
                    propertiesValueMap[taskId]?.en ||
                    {}),
                };

                // format default values
                m.PROPERTIES_SCHEMA.forEach((item: any) => {
                  const { key, type } = item;
                  if (
                    type === "json" &&
                    typeof defaultValues[key] === "object"
                  ) {
                    try {
                      defaultValues[key] = JSON.stringify(
                        defaultValues[key],
                        null,
                        2,
                      );
                    } catch (error) {
                      // ignore error
                    }
                  }
                });

                // @ts-ignore
                propertiesSettingRef.current?.open({
                  schema: m.PROPERTIES_SCHEMA,
                  onSubmit: (values: any) => {
                    const realValues = {} as any;
                    m.PROPERTIES_SCHEMA.forEach((item: any) => {
                      const { key, type } = item;
                      if (type === "json" && typeof values[key] === "string") {
                        try {
                          realValues[key] = JSON.parse(values[key]);
                          return;
                        } catch (error) {
                          // ignore error
                        }
                      }
                      realValues[key] = values[key];
                    });

                    setPropertiesValueMap({
                      ...propertiesValueMap,
                      [taskId]: {
                        ...propertiesValueMap[taskId],
                        [locale]: realValues,
                      },
                    });
                  },
                  defaultValues,
                });

                return;
              }
              throw new Error("No properties schema found");
            });
          } catch (error) {
            // ignore error
            // send cannot set properties message
            Toast.info(t("v0.cannotSetPropertiesTip"));
          }
        },
      },
      group: "setting",
    },
    {
      key: "CodePreview",
      icon: code ? "tabler:layout-board" : "tabler:code",
      buttonText: !isMobile && (code ? "Canvas" : "Code"),
      props: {
        disabled,
        variant: "contained",
        color: "primary",
        onClick: () => {
          setCode(getCurrentCodeByTaskId(message));
        },
      },
      group: "codePreview",
    },
  ].filter(Boolean) as any[];

  const onCloseCode = () => setCode("");

  return (
    <Stack
      sx={{
        p: 2,
        gap: 2,
        height: "100%",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Stack
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          gap: 1.5,
          flexDirection: "row",
          ".question": {
            backgroundColor: "white",
            border: 1,
            borderColor: "rgba(0, 0, 0, 0.1) !important",
          },
        }}
      >
        {/* question */}
        <UserQuestion question={inputs?.question} />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {/* render tooltip by group */}
          {Object.entries(groupBy(tooltipOptions, "group")).map(
            ([group, options]) => {
              return (
                <ButtonGroup
                  variant="text"
                  key={group}
                  color="inherit"
                  size="small"
                  sx={{
                    borderColor: "rgba(0, 0, 0, 0.1) !important",
                    border: 1,
                  }}
                >
                  {options.map(
                    (option: {
                      icon: string;
                      key: string;
                      props?: any;
                      buttonText?: string;
                    }) => {
                      const { icon, key, props, buttonText } = option;
                      return (
                        <Button key={key} data-taskid={taskId} {...props}>
                          <Icon icon={icon} fontSize={22} />
                          {buttonText && <Box sx={{ ml: 1 }}>{buttonText}</Box>}
                        </Button>
                      );
                    },
                  )}
                </ButtonGroup>
              );
            },
          )}
        </Box>
      </Stack>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          overflow: "hidden",
          backgroundColor: "white",
          borderRadius: 1,
          ...codePreviewExtraProps?.sx,
        }}
      >
        <CodeRenderByMessage
          message={message}
          zoom={1}
          sx={{
            overflowX: "auto",
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "grey transparent",
          }}
          propertiesValueMap={propertiesValueMap}
        />
      </Box>

      {objects?.map((item, index) => (
        <MessageMetadataRenderer key={index} object={item} />
      ))}

      {!isMessageLoading && message.outputs?.content && (
        <ShareActions
          direction="row"
          justifyContent="flex-end"
          sx={{ mt: 2 }}
        />
      )}

      <Suspense fallback={<Loading />}>
        <Drawer
          anchor={isMobile ? "bottom" : "right"}
          open={!!code}
          onClose={onCloseCode}
        >
          <Box
            sx={{
              p: 2,
              pt: 0,
              ...(isMobile ? { maxHeight: "70vh" } : { maxWidth: "70vw" }),
            }}
          >
            <Box
              sx={{
                py: 2,
                position: "sticky",
                top: 0,
                left: 0,
                backgroundColor: "white",
                zIndex: 9999,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  lineHeight: 1,
                }}
              >
                {t("v0.codePreview")}
              </Typography>
              <Button
                onClick={onCloseCode}
                //   variant="text"
                color="inherit"
                disableElevation
                sx={{
                  minWidth: 32,
                  minHeight: 32,
                  p: 0,
                  fontSize: 22,
                }}
              >
                <Icon icon="tabler:x" />
              </Button>
            </Box>

            <Alert severity="info" sx={{ mb: 2 }}>
              {t("v0.codePreviewTip")}
            </Alert>
            <MarkdownRenderer>{`\`\`\`typescript\n${code}\n\`\`\``}</MarkdownRenderer>
          </Box>
        </Drawer>

        <PropertiesSetting ref={propertiesSettingRef} />
      </Suspense>
    </Stack>
  );
}
