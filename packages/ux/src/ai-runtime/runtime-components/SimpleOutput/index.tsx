import { RuntimeOutputVariable } from "@aigne/agent-v1/types";
import { Stack } from "@mui/material";
import { Suspense, useMemo } from "react";
import {
  AgentErrorBoundary,
  AgentErrorView,
} from "../../components/AgentErrorBoundary";
import { getDefaultOutputComponent } from "../../constants";
import { useAgent } from "../../contexts/Agent";
import { useComponentPreferences } from "../../contexts/ComponentPreferences";
import { useCurrentAgent } from "../../contexts/CurrentAgent";
import { useCurrentMessage } from "../../contexts/CurrentMessage";
import MessageOutputRenderer from "./MessageOutputRenderer";

const ignoredOutputs = new Set<string>([
  RuntimeOutputVariable.appearancePage,
  RuntimeOutputVariable.appearanceInput,
  RuntimeOutputVariable.appearanceOutput,
  RuntimeOutputVariable.openingQuestions,
  RuntimeOutputVariable.openingMessage,
  RuntimeOutputVariable.profile,
]);

export default function SimpleOutput() {
  const preferences = useComponentPreferences();
  const CustomComponentActionsComponent =
    preferences?.customOutputActionsComponent;

  const { message } = useCurrentMessage();

  const { aid } = useCurrentAgent();
  const agent = useAgent({ aid });

  const outputs = useMemo(() => {
    return agent.outputVariables
      ?.map((i) => ({
        ...i,
        appearance: {
          ...i.appearance,
          componentId:
            i.appearance?.componentId ||
            getDefaultOutputComponent(i)?.componentId,
        },
      }))
      .filter(
        (i): i is typeof i & { appearance: { componentId: string } } =>
          !!i.appearance?.componentId && !ignoredOutputs.has(i.name!),
      );
  }, [agent.outputVariables]);

  if (!outputs?.length) return null;

  return (
    <Stack gap={2}>
      {outputs.map((output) => {
        return (
          <MessageOutputRenderer
            key={output.id}
            output={output}
            message={message}
          />
        );
      })}

      {message.error && <AgentErrorView error={message.error} />}

      {CustomComponentActionsComponent && (
        <AgentErrorBoundary>
          <Suspense>
            <CustomComponentActionsComponent />
          </Suspense>
        </AgentErrorBoundary>
      )}
    </Stack>
  );
}
