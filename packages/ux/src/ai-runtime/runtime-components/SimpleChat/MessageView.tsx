import { cx } from "@emotion/css";
import { Box, type BoxProps, Stack } from "@mui/material";
import { Suspense, memo } from "react";

import type { SimpleChatPreferences } from ".";
import { getAssetUrl } from "../../api/asset";
import {
  AgentErrorBoundary,
  AgentErrorView,
} from "../../components/AgentErrorBoundary";
import CustomComponentRenderer from "../../components/CustomComponentRenderer/CustomComponentRenderer";
import UserInfo from "../../components/UserInfo";
import { useComponentPreferences } from "../../contexts/ComponentPreferences";
import { CurrentAgentProvider } from "../../contexts/CurrentAgent";
import { CurrentMessageProvider } from "../../contexts/CurrentMessage";
import type { MessageItem } from "../../contexts/Session";
import { useAppearances, useProfile } from "../../hooks/use-appearances";
import { useSessionContext } from "../../utils/session";
import UserMessageView from "./UserMessageView";

const MessageView = memo(({ message }: { message: MessageItem }) => {
  const preferences = useComponentPreferences<SimpleChatPreferences>();
  const hasBg = !!preferences?.backgroundImage?.url;

  const { session: authSession } = useSessionContext();

  const { appearanceOutput } = useAppearances({ aid: message.aid });
  const profile = useProfile({ aid: message.aid });

  const { hideAgentAvatar, hideUserInputs } =
    useComponentPreferences<SimpleChatPreferences>() ?? {};

  if (!appearanceOutput?.componentId) return null;

  const agentMessage = (
    <MessageBodyContainer messageRole="assistant">
      <Suspense>
        <CustomComponentRenderer
          key={message.id}
          aid={message.aid}
          output={appearanceOutput.outputSettings}
          componentId={appearanceOutput.componentId}
          properties={appearanceOutput.componentProperties}
          fallbackRender={AgentErrorView}
        />
      </Suspense>
    </MessageBodyContainer>
  );

  return (
    <CurrentAgentProvider aid={message.aid}>
      <CurrentMessageProvider message={message}>
        <Stack
          gap={2}
          className="message-item"
          data-testid={`message-${message.id}`}
        >
          {!hideUserInputs && (
            <Box>
              <UserInfo
                name={authSession.user?.fullName}
                did={authSession.user?.did}
                avatar={getAssetUrl({
                  filename: authSession.user?.avatar,
                  preset: "avatar",
                })}
                time={message.createdAt}
                reverse
                alignItems="flex-start"
                UserNameProps={{ sx: { color: hasBg ? "white" : undefined } }}
              >
                <Stack sx={{ alignItems: "flex-end" }}>
                  <MessageBodyContainer messageRole="user">
                    <AgentErrorBoundary>
                      <Suspense>
                        <UserMessageView />
                      </Suspense>
                    </AgentErrorBoundary>
                  </MessageBodyContainer>
                </Stack>
              </UserInfo>
            </Box>
          )}

          <Box>
            {!hideAgentAvatar ? (
              <UserInfo
                name={profile.name}
                did={window.blocklet?.appId}
                avatar={getAssetUrl({
                  aid: message.aid,
                  filename: profile.avatar,
                  preset: "avatar",
                })}
                time={message.createdAt}
                alignItems="flex-start"
                UserNameProps={{ sx: { color: hasBg ? "white" : undefined } }}
              >
                {agentMessage}
              </UserInfo>
            ) : (
              agentMessage
            )}
          </Box>
        </Stack>
      </CurrentMessageProvider>
    </CurrentAgentProvider>
  );
});

export default MessageView;

export function MessageBodyContainer({
  messageRole,
  ...props
}: { messageRole?: "assistant" | "user" } & BoxProps) {
  const preferences = useComponentPreferences<SimpleChatPreferences>();
  const hasBg = !!preferences?.backgroundImage?.url;
  const hideUserMessage = preferences?.hideUserInputs;

  return (
    <Box
      {...props}
      className={cx(
        props.className,
        "message-content",
        `${messageRole}-message-content`,
      )}
      sx={
        hasBg
          ? {
              borderRadius: 1,
              borderTopRightRadius: messageRole === "user" ? 2 : undefined,
              borderTopLeftRadius: messageRole !== "user" ? 2 : undefined,
              px: 2,
              py: 1,
              marginTop: 0.5,
              maxWidth: hideUserMessage ? "unset" : "calc(100% - 40px)",
              bgcolor: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(16px)",
              ...props.sx,
            }
          : { ...props.sx }
      }
    />
  );
}
