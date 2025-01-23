import { RuntimeOutputVariable } from "@aigne/agent-v1/types";
import { Stack, type StackProps } from "@mui/material";
import { memo, useMemo } from "react";
import CustomComponentRenderer from "../../components/CustomComponentRenderer/CustomComponentRenderer";
import { DEFAULT_OUTPUT_COMPONENTS } from "../../constants";
import { useAgent } from "../../contexts/Agent";
import { useCurrentAgent } from "../../contexts/CurrentAgent";
import { CurrentMessageOutputProvider } from "../../contexts/CurrentMessage";
import { useEntryAgent } from "../../contexts/EntryAgent";
import { useSession } from "../../contexts/Session";
import {
  useOpeningMessage,
  useOpeningQuestions,
} from "../../hooks/use-appearances";

const OpeningMessageView = memo((props: StackProps) => {
  const { aid } = useEntryAgent();

  const isMessagesEmpty = useSession((s) => !s.messages?.length);

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

  return (
    <Stack {...props}>
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

      {openingQuestionsOutput && openingQuestionsComponentId && (
        <CurrentMessageOutputProvider
          output={openingQuestionsOutput}
          outputValue={undefined}
        >
          <CustomComponentRenderer
            aid={aid}
            output={{ id: openingQuestionsOutput.id }}
            instanceId={`${agent.id}-${openingQuestionsOutput.id}`}
            componentId={openingQuestionsComponentId}
            properties={openingQuestionsOutput?.appearance?.componentProperties}
          />
        </CurrentMessageOutputProvider>
      )}
    </Stack>
  );
});

export default OpeningMessageView;
