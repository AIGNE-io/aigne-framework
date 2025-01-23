import { RuntimeOutputVariable } from "@aigne/agent-v1/types";
import { memo, useMemo } from "react";
import type { SimpleChatPreferences } from ".";
import { getAssetUrl } from "../../api/asset";
import CustomComponentRenderer from "../../components/CustomComponentRenderer/CustomComponentRenderer";
import UserInfo from "../../components/UserInfo";
import { DEFAULT_OUTPUT_COMPONENTS } from "../../constants";
import { useAgent } from "../../contexts/Agent";
import { useComponentPreferences } from "../../contexts/ComponentPreferences";
import { useCurrentAgent } from "../../contexts/CurrentAgent";
import { CurrentMessageOutputProvider } from "../../contexts/CurrentMessage";
import { useEntryAgent } from "../../contexts/EntryAgent";
import { useSession } from "../../contexts/Session";
import {
  useOpeningMessage,
  useOpeningQuestions,
  useProfile,
} from "../../hooks/use-appearances";
import { MessageBodyContainer } from "./MessageView";

const OpeningMessageView = memo(() => {
  const { aid } = useEntryAgent();

  const isMessagesEmpty = useSession((s) => !s.messages?.length);

  const { hideAgentAvatar, backgroundImage } =
    useComponentPreferences<SimpleChatPreferences>() ?? {};
  const hasBg = !!backgroundImage?.url;

  const openingMessage = useOpeningMessage();
  const openingMessageOutput = useMemo(
    () =>
      openingMessage?.agent.outputVariables?.find(
        (i) => i.name === RuntimeOutputVariable.openingMessage,
      ),
    [openingMessage?.agent],
  );
  const openingMessageComponentId =
    openingMessageOutput?.appearance?.componentId ||
    DEFAULT_OUTPUT_COMPONENTS[RuntimeOutputVariable.openingMessage]
      ?.componentId;

  const profile = useProfile();
  const agent = useAgent({ aid: useCurrentAgent().aid });
  const openingQuestions = useOpeningQuestions();
  const openingQuestionsOutput = useMemo(
    () =>
      agent.outputVariables?.find(
        (i) => i.name === RuntimeOutputVariable.openingQuestions,
      ),
    [agent.outputVariables],
  );
  const openingQuestionsComponentId =
    openingQuestionsOutput?.appearance?.componentId ||
    DEFAULT_OUTPUT_COMPONENTS[RuntimeOutputVariable.openingQuestions]
      ?.componentId;

  if (
    (!openingMessage?.message || !openingMessageComponentId) &&
    (!openingQuestionsComponentId ||
      !openingQuestions?.questions.length ||
      !isMessagesEmpty)
  ) {
    return null;
  }

  const children = (
    <MessageBodyContainer>
      {openingMessage?.message &&
        openingMessageOutput &&
        openingMessageComponentId && (
          <CurrentMessageOutputProvider
            output={openingMessageOutput}
            outputValue={undefined}
          >
            <CustomComponentRenderer
              aid={aid}
              output={{ id: openingMessageOutput.id }}
              instanceId={`${agent.id}-${openingMessageOutput.id}`}
              componentId={openingMessageComponentId}
              properties={openingMessageOutput?.appearance?.componentProperties}
            />
          </CurrentMessageOutputProvider>
        )}

      {isMessagesEmpty &&
        openingQuestionsOutput &&
        openingQuestionsComponentId && (
          <CurrentMessageOutputProvider
            output={openingQuestionsOutput}
            outputValue={undefined}
          >
            <CustomComponentRenderer
              aid={aid}
              output={{ id: openingQuestionsOutput.id }}
              instanceId={`${agent.id}-${openingQuestionsOutput.id}`}
              componentId={openingQuestionsComponentId}
              properties={
                openingQuestionsOutput?.appearance?.componentProperties
              }
            />
          </CurrentMessageOutputProvider>
        )}
    </MessageBodyContainer>
  );

  return hideAgentAvatar ? (
    children
  ) : (
    <UserInfo
      name={(openingMessage?.profile ?? profile).name}
      did={window.blocklet?.appId}
      avatar={getAssetUrl({
        aid,
        filename: (openingMessage?.profile ?? profile).avatar,
        preset: "avatar",
      })}
      alignItems="flex-start"
      UserNameProps={{ sx: { color: hasBg ? "white" : undefined } }}
    >
      {children}
    </UserInfo>
  );
});

export default OpeningMessageView;
