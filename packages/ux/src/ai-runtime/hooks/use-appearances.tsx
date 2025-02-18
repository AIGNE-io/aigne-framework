import { RuntimeOutputVariable } from "@aigne/agent-v1/types";
import { useMemo } from "react";
import { joinURL } from "ufo";
import {
  AI_RUNTIME_DID,
  DEFAULT_HEADER_COMPONENT_ID,
  DEFAULT_INPUT_COMPONENT_ID,
  DEFAULT_OUTPUT_COMPONENT_ID,
  DEFAULT_PAGE_COMPONENT_ID,
} from "../constants";
import { useAgent } from "../contexts/Agent";
import { useCurrentAgent } from "../contexts/CurrentAgent";
import { useEntryAgent } from "../contexts/EntryAgent";
import { getComponentMountPoint } from "../utils/mount-point";
import { getOutputVariableInitialValue } from "../utils/runtime-output-schema";

export function useAppearances(args?: { aid: string }) {
  const entryAgent = useAgent({ aid: useEntryAgent().aid });

  const { aid } = useCurrentAgent();
  const agent = useAgent({ aid: args?.aid || aid });

  const appearancePage = useMemo(() => {
    const output = agent.outputVariables?.find(
      (i) => i.name === RuntimeOutputVariable.appearancePage,
    );
    const appearance = output?.appearance;

    const entryAppearance = entryAgent.outputVariables?.find(
      (i) => i.name === RuntimeOutputVariable.appearancePage,
    )?.appearance;

    const result = appearance?.componentId
      ? { ...appearance, componentId: appearance.componentId }
      : entryAppearance?.componentId
        ? { ...entryAppearance, componentId: entryAppearance.componentId }
        : { componentId: DEFAULT_PAGE_COMPONENT_ID };

    return {
      ...result,
      output,
      outputSettings: output
        ? { id: output.id }
        : { name: RuntimeOutputVariable.appearancePage },
    };
  }, [agent]);

  const appearanceInput = useMemo(() => {
    const output = agent.outputVariables?.find(
      (i) => i.name === RuntimeOutputVariable.appearanceInput,
    );
    const appearance = output?.appearance;
    const entryAppearance = entryAgent.outputVariables?.find(
      (i) => i.name === RuntimeOutputVariable.appearanceInput,
    )?.appearance;

    const result = appearance?.componentId
      ? { ...appearance, componentId: appearance.componentId }
      : entryAppearance?.componentId
        ? { ...entryAppearance, componentId: entryAppearance.componentId }
        : { componentId: DEFAULT_INPUT_COMPONENT_ID };

    return {
      ...result,
      output,
      outputSettings: output
        ? { id: output.id }
        : { name: RuntimeOutputVariable.appearanceInput },
    };
  }, [agent, entryAgent]);

  const appearanceOutput = useMemo(() => {
    const output = agent.outputVariables?.find(
      (i) => i.name === RuntimeOutputVariable.appearanceOutput,
    );
    const appearance = output?.appearance;

    const entryAppearance = entryAgent.outputVariables?.find(
      (i) => i.name === RuntimeOutputVariable.appearanceOutput,
    )?.appearance;

    const result = appearance?.componentId
      ? { ...appearance, componentId: appearance.componentId }
      : entryAppearance?.componentId
        ? { ...entryAppearance, componentId: entryAppearance.componentId }
        : { componentId: DEFAULT_OUTPUT_COMPONENT_ID };

    return {
      ...result,
      output,
      outputSettings: output
        ? { id: output.id }
        : { name: RuntimeOutputVariable.appearanceOutput },
    };
  }, [agent, entryAgent]);

  return { appearancePage, appearanceInput, appearanceOutput };
}

function getProjectIconUrl({ aid }: { aid: string }) {
  return joinURL(
    window.location.origin,
    getComponentMountPoint(AI_RUNTIME_DID),
    "/api/agents",
    aid,
    "/logo",
  );
}

export function useProfile(args?: { aid: string }) {
  const entryAgent = useAgent({ aid: useEntryAgent().aid });

  const { aid } = useCurrentAgent();
  const agent = useAgent({ aid: args?.aid || aid });

  return useMemo(() => {
    const profile = getOutputVariableInitialValue(
      agent,
      RuntimeOutputVariable.profile,
    );
    const entryProfile = getOutputVariableInitialValue(
      entryAgent,
      RuntimeOutputVariable.profile,
    );

    const output = agent.outputVariables?.find(
      (i) => i.name === RuntimeOutputVariable.profile,
    );
    const appearance = output?.appearance;
    const entryAppearance = entryAgent.outputVariables?.find(
      (i) => i.name === RuntimeOutputVariable.profile,
    )?.appearance;

    return {
      avatar:
        profile?.avatar || entryProfile?.avatar || getProjectIconUrl({ aid }),
      name:
        profile?.name ||
        entryProfile?.name ||
        entryAgent.name ||
        entryAgent.project.name,
      description:
        profile?.description ||
        entryProfile?.description ||
        entryAgent.description ||
        entryAgent.project.description,
      output,
      outputSettings: output
        ? { id: output.id }
        : { name: RuntimeOutputVariable.profile },
      appearance: appearance?.componentId
        ? { ...appearance, componentId: appearance.componentId }
        : entryAppearance?.componentId
          ? { ...entryAppearance, componentId: entryAppearance.componentId }
          : { componentId: DEFAULT_HEADER_COMPONENT_ID },
    };
  }, [agent, entryAgent]);
}

export function useOpeningMessage(args?: { aid: string }) {
  const { aid: entryAid } = useEntryAgent();
  const entryAgent = useAgent({ aid: entryAid });
  const entryProfile = useProfile({ aid: entryAid });

  const { aid } = useCurrentAgent();
  const agent = useAgent({ aid: args?.aid || aid });
  const profile = useProfile({ aid: args?.aid || aid });

  return useMemo(() => {
    const agentOpening = getOutputVariableInitialValue(
      agent,
      RuntimeOutputVariable.openingMessage,
    );
    if (agentOpening?.message) {
      return {
        agent,
        message: agentOpening.message,
        profile,
      };
    }

    const entryOpening = getOutputVariableInitialValue(
      entryAgent,
      RuntimeOutputVariable.openingMessage,
    );
    if (entryOpening?.message) {
      return {
        agent: entryAgent,
        message: entryOpening.message,
        profile: entryProfile,
      };
    }

    return undefined;
  }, [agent, profile, entryAgent, entryProfile]);
}

export function useOpeningQuestions(args?: { aid: string }) {
  const { aid } = useCurrentAgent();
  const agent = useAgent({ aid: args?.aid || aid });

  return useMemo(() => {
    const questions = getOutputVariableInitialValue(
      agent,
      RuntimeOutputVariable.openingQuestions,
    )?.items?.filter((i) => !!i.title);

    if (!questions?.length) return undefined;

    return { questions };
  }, [agent]);
}
