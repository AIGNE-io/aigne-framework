import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import { SubscriptionErrorType } from "@blocklet/ai-kit/api";
import { CustomComponentRenderer } from "@blocklet/pages-kit/components";
import { Icon } from "@iconify/react";
import { Box, type BoxProps, Typography } from "@mui/material";
import { memo, useCallback, useState } from "react";

import { AgentErrorView } from "../../../components/AgentErrorBoundary";
import LoadingButton from "../../../components/LoadingButton";
import { useCurrentAgent } from "../../../contexts/CurrentAgent";
import { type MessageItem, useSession } from "../../../contexts/Session";
import MessageErrorView from "../../ChatOutput/MessageErrorView";
import { useV0RuntimeContext } from "../contexts/V0Runtime";
import { AIRunningLoading } from "./Loading";
import TransparentTooltip from "./TransparentTooltip";

const codeField = "code";

function RetryComponent({ message, tip }: { message: MessageItem | undefined; tip?: string }) {
  const { t } = useLocaleContext();
  const runAgent = useSession((s) => s.runAgent);
  const { aid } = useCurrentAgent();
  const { setCurrentMessageTaskId } = useV0RuntimeContext();
  const [loading, setLoading] = useState(false);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 2,
        p: 4,
      }}
    >
      <Box
        component={Icon}
        icon="unjs:automd"
        sx={{
          mt: 6,
          fontSize: 120,
        }}
      />

      {message?.error?.type === SubscriptionErrorType.UNSUBSCRIBED ? (
        <Box width="100%">
          <AgentErrorView error={message.error} />
        </Box>
      ) : (
        <Typography
          variant="h6"
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          {tip || t("v0.retryTip")}

          <TransparentTooltip
            arrow
            placement="top"
            title={
              <MessageErrorView
                error={message?.error || new Error("Code syntax errors")}
                sx={{
                  mr: 0,
                }}
              />
            }
          >
            <Box
              component={Icon}
              icon="akar-icons:info"
              sx={{
                ml: 1,
              }}
            />
          </TransparentTooltip>
        </Typography>
      )}

      <LoadingButton
        variant="contained"
        loading={loading}
        color="primary"
        onClick={async () => {
          setLoading(true);
          try {
            const { inputs } = message || {};

            // remove $ starting parameters object
            const canUseParameters = Object.fromEntries(
              Object.entries(inputs || {}).filter(([key]) => !key.startsWith("$")),
            );

            await runAgent({
              aid,
              inputs: canUseParameters,
              onResponseStart: () => {
                setCurrentMessageTaskId(undefined);
              },
            });
          } catch (error) {
            console.error(error);
          } finally {
            setLoading(false);
          }
        }}
      >
        {t("v0.retry")}
      </LoadingButton>
    </Box>
  );
}

export default function CodePreview({
  componentId = "mock-dev-component",
  code,
  propertiesValue,
  message,
  ...restProps
}: {
  componentId?: string;
  code: string | undefined;
  propertiesValue?: any;
  message?: MessageItem | undefined;
} & BoxProps) {
  const { t, locale } = useLocaleContext();

  if (!code) return null;

  return (
    <Box id={componentId} key={componentId} className="code-preview-wrapper" {...restProps}>
      <CustomComponentRenderer
        componentId={componentId}
        locale={locale}
        props={propertiesValue || {}}
        // eslint-disable-next-line react/no-unstable-nested-components
        fallbackRender={() => <RetryComponent message={message} tip={t("v0.errorCodeTip")} />}
        dev={{
          components: {
            [componentId]: {
              data: {
                id: componentId,
                createdAt: "",
                updatedAt: "",
                renderer: {
                  type: "react-component",
                  script: code,
                },
              },
            },
          },
        }}
      />
    </Box>
  );
}

export const CodePreviewMemo = memo(CodePreview);

export function CodeRenderByMessage({
  zoom,
  message,
  minHeight = 200,
  sx,
  propertiesValueMap,
}: {
  zoom?: number;
  message: MessageItem | undefined;
  minHeight?: number;
  sx?: any;
  propertiesValueMap?: {
    [taskId: string]: any;
  };
}) {
  const { locale } = useLocaleContext();
  const zoomSx = {
    "& > *": {
      zoom,
      minHeight,
    },
  };
  const isMessageLoading = (message?.loading || !message?.outputs) && !message?.error;

  const ContentRender = useCallback(() => {
    if (isMessageLoading) {
      return (
        <Box
          className="code-message-loading"
          sx={{
            py: 8,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <AIRunningLoading />
        </Box>
      );
    }

    if (message?.error || !message?.outputs?.objects?.length) {
      return <RetryComponent message={message} />;
    }

    return message?.outputs?.objects?.map((item) => {
      const { taskId } = item;

      // @ts-ignore
      const code = item?.[codeField];

      return (
        <CodePreviewMemo
          key={item.taskId}
          componentId={`code-preview-${taskId}`}
          code={code}
          propertiesValue={
            propertiesValueMap?.[taskId]?.[locale] || propertiesValueMap?.[taskId]?.en || {}
          }
          message={message}
        />
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMessageLoading, message?.outputs?.objects, propertiesValueMap, locale]);

  return (
    <Box
      key={message?.id}
      sx={{
        transition: "all 0.3s",
        overflow: "hidden",
        borderRadius: 1,
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        ...zoomSx,
        ...sx,
        ".code-preview-wrapper": {
          // p: 2,
        },
      }}
    >
      <ContentRender />
    </Box>
  );
}

export const CodeRenderByMessageMemo = memo(CodeRenderByMessage);

export function getCurrentCodeByTaskId(message: MessageItem | undefined) {
  return message?.outputs?.objects?.find((i) => i?.[codeField])?.[codeField];
}
