import Avatar from "@arcblock/ux/lib/Avatar";
import { cx } from "@emotion/css";
import {
  Box,
  Skeleton,
  Stack,
  type StackProps,
  Tooltip,
  Typography,
  styled,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import isEmpty from "lodash/isEmpty";
import React, { type ReactNode, memo, useMemo, useState } from "react";

import { getAssetUrl } from "../../api/asset";
import MarkdownRenderer from "../../components/MarkdownRenderer";
import ShareActions from "../../components/ShareActions";
import { useEntryAgent } from "../../contexts/EntryAgent";
import type { MessageItem } from "../../contexts/Session";
import { useProfile } from "../../hooks/use-appearances";
import { useSessionContext } from "../../utils/session";
import MessageErrorView from "./MessageErrorView";
import MessageMetadataRenderer from "./MessageMetadataRenderer";

const MessageItemView = memo(
  ({
    message,
    hideAvatar,
    ...props
  }: {
    message: MessageItem;
    hideAvatar?: boolean;
  } & StackProps) => {
    const showUserMessage = !!message.inputs?.question;

    return (
      <MessageItemContainer
        {...props}
        className={cx(
          "ai-chat-message-item",
          hideAvatar && "hide-avatar",
          props.className,
        )}
      >
        {showUserMessage && !isEmpty(message.inputs) && (
          <UserMessage message={message} hideAvatar={hideAvatar} />
        )}

        {!isEmpty(message.outputs) && (
          <AgentMessage message={message} hideAvatar={hideAvatar} />
        )}
      </MessageItemContainer>
    );
  },
);

export default MessageItemView;

const MessageItemContainer = styled(Stack)`
  gap: ${({ theme }) => theme.spacing(2.5)};
  overflow: hidden;

  &.hide-avatar {
    .message-question {
      border-top-right-radius: ${({ theme }) => theme.shape.borderRadius}px;
    }

    .message-response {
      border-top-left-radius: ${({ theme }) => theme.shape.borderRadius}px;
    }
  }

  .message-question {
    position: relative;
    border-radius: ${({ theme }) => theme.shape.borderRadius}px;
    border-top-right-radius: 2px;
    padding: ${({ theme }) => theme.spacing(1, 2)};
    margin-top: ${({ theme }) => theme.spacing(0.5)};
    // without logo width
    max-width: calc(100% - 40px);
    background-color: rgba(239, 246, 255, 1);
  }

  .message-response {
    position: relative;
    border-radius: ${({ theme }) => theme.shape.borderRadius}px;
    border-top-left-radius: 2px;
    padding: ${({ theme }) => theme.spacing(1, 2)};
    margin-top: ${({ theme }) => theme.spacing(0.5)};
    // without logo width
    max-width: calc(100% - 40px);
    display: inline-flex;
    background-color: rgba(229, 231, 235, 1);
  }
`;

function UserMessage({
  message,
  hideAvatar,
}: { message: MessageItem; hideAvatar?: boolean }) {
  const { session: authSession } = useSessionContext();

  return (
    <Stack
      className="ai-chat-message-user"
      direction="row"
      gap={1.5}
      sx={{
        display: "flex",
        flexDirection: "row-reverse",
        textAlign: "right",
        justifyContent: "flex-end",
      }}
    >
      {!hideAvatar && (
        <Box>
          <Avatar
            size={40}
            // @ts-ignore
            src={authSession.user?.avatar}
            did={authSession.user?.did!}
            variant="circle"
            shape="circle"
          />
        </Box>
      )}

      <Stack
        flex={1}
        overflow="hidden"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
        }}
      >
        {!hideAvatar && (
          <MessageUserName>
            {authSession.user?.fullName}
            <MessageTime time={message.createdAt} />
          </MessageUserName>
        )}

        <Box
          className="message-question"
          sx={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            textAlign: "left",
          }}
        >
          {message.inputs?.question}
        </Box>
      </Stack>
    </Stack>
  );
}

function AgentMessage({
  message,
  hideAvatar,
}: { message: MessageItem; hideAvatar?: boolean }) {
  const { aid } = useEntryAgent();
  const profile = useProfile({ aid });

  const showMainMessage = !!message.outputs?.content;

  const isMessageLoading =
    (message.loading || !message.outputs) && !message.error;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Stack className="ai-chat-message-ai" direction="row" gap={1.5}>
      {!hideAvatar && (
        <Box>
          <Avatar
            size={40}
            did={window.blocklet?.appId!}
            variant="circle"
            shape="circle"
            // @ts-ignore
            src={getAssetUrl({
              aid,
              filename: profile.avatar,
              preset: "avatar",
            })}
          />
        </Box>
      )}

      <Box flex={1} width={0}>
        {!hideAvatar && (
          <MessageUserName>
            {profile.name}
            <MessageTime time={message.createdAt} />
          </MessageUserName>
        )}

        <React.Suspense>
          {showMainMessage ? (
            <Tooltip
              placement="right-start"
              slotProps={{
                popper: {
                  disablePortal: true,
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [-3, isMobile ? (!hideAvatar ? -18 : -8) : -6],
                      },
                    },
                  ],
                },
                tooltip: {
                  sx: { p: 0, bgcolor: "white" },
                },
              }}
              title={
                !isMessageLoading &&
                message.outputs?.content && (
                  <ShareActions
                    sx={{
                      fontSize: "1rem",
                      boxShadow: "0px 4px 8px 0px rgba(3, 7, 18, 0.08)",
                      border: "1px solid rgba(229, 231, 235, 1)",
                      borderRadius: 1,
                      p: 0.25,
                    }}
                  />
                )
              }
            >
              <Stack gap={1} className="message-response">
                {message.outputs?.content && (
                  <MarkdownRenderer
                    className={isMessageLoading ? "writing" : ""}
                  >
                    {message.outputs.content}
                  </MarkdownRenderer>
                )}
              </Stack>
            </Tooltip>
          ) : (
            isMessageLoading && (
              <Skeleton
                variant="rectangular"
                height={24 + 8 + 8}
                // only response with loading
                className="message-response"
              />
            )
          )}

          {message.outputs?.objects?.map((object, index) => (
            <MessageMetadataRenderer key={index} object={object} />
          ))}

          {message.error && <MessageErrorView error={message.error} />}
        </React.Suspense>
      </Box>
    </Stack>
  );
}

export function MessageItemWrapper({
  hideAvatar,
  agentMessage,
  ...props
}: {
  hideAvatar?: boolean;
  agentMessage?: ReactNode;
} & StackProps) {
  const { aid } = useEntryAgent();
  const profile = useProfile({ aid });
  const [time] = useState(() => new Date().toISOString());

  return (
    <MessageItemContainer
      {...props}
      className={cx(
        "ai-chat-message-item",
        hideAvatar && "hide-avatar",
        props.className,
      )}
    >
      {agentMessage && (
        <Stack className="ai-chat-message-ai" direction="row" gap={1.5}>
          {!hideAvatar && (
            <Box>
              <Avatar
                size={40}
                did={window.blocklet?.appId!}
                variant="circle"
                shape="circle"
                // @ts-ignore
                src={getAssetUrl({
                  aid,
                  filename: profile.avatar,
                  preset: "avatar",
                })}
              />
            </Box>
          )}

          <Box flex={1} width={0}>
            {!hideAvatar && (
              <MessageUserName>
                {profile.name}
                <MessageTime time={time} />
              </MessageUserName>
            )}

            {agentMessage}
          </Box>
        </Stack>
      )}
    </MessageItemContainer>
  );
}

function MessageUserName({ children }: { children: ReactNode }) {
  return (
    <Typography
      component="div"
      noWrap
      sx={{
        fontSize: 14,
        lineHeight: "24px",
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      {children}
    </Typography>
  );
}

function MessageTime({ time }: { time: string }) {
  const t = useMemo(() => {
    const date = dayjs(time);
    if (!date.isValid()) return undefined;

    return date.isSame(dayjs(), "date")
      ? date.format("HH:mm")
      : date.format("YYYY-MM-DD HH:mm");
  }, [time]);

  if (!t) return null;

  return (
    <Typography
      key="user-time"
      sx={{
        fontSize: 12,
        lineHeight: "24px",
        color: "text.secondary",
      }}
    >
      {t}
    </Typography>
  );
}
