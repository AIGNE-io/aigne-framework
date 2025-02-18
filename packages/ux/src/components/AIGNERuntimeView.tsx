import type { Assistant } from "@aigne/agent-v1";
import {
  AssistantResponseType,
  RuntimeOutputVariable,
} from "@aigne/agent-v1/types";
import type { Context, Runnable } from "@aigne/core";
import { CustomComponentRenderer } from "@blocklet/pages-kit/components";
import { nanoid } from "nanoid";
import { useMemo } from "react";
import { Helmet } from "react-helmet";
import { parseIdentity, stringifyIdentity } from "../ai-runtime/aid";
import {
  type AIGNEApiContextValue,
  type Message,
  RuntimeProvider,
  ScrollView,
  useAgent,
  useAppearances,
} from "./ai-runtime";

export function AIGNERuntimeView(props: {
  context: Context;
  agent: Runnable;
  children?: React.ReactNode;
}) {
  const apiProps = useApiProps(props.context, props.agent);
  const aid = useMemo(
    () =>
      stringifyIdentity({
        projectId: props.context.id,
        agentId: props.agent.id,
      }),
    [props.context.id, props.agent.id],
  );

  return (
    <RuntimeProvider aid={aid} ApiProps={apiProps}>
      <RuntimeView aid={aid} />
      {props.children}
    </RuntimeProvider>
  );
}

function RuntimeView({ aid }: { aid: string }) {
  const agent = useAgent({ aid });
  const { appearancePage } = useAppearances({ aid });

  return (
    <>
      <HeaderMenu />

      <Helmet>
        {agent.project.name && <title>{agent.project.name}</title>}
        {agent.project.description && (
          <meta name="description" content={agent.project.description} />
        )}
      </Helmet>

      <ScrollView scroll="window" initialScrollBehavior="auto">
        <CustomComponentRenderer
          componentId={appearancePage.componentId}
          properties={appearancePage.componentProperties}
        />
      </ScrollView>

      {/* <AgentSettingsDialog /> */}
    </>
  );
}

function HeaderMenu() {
  // useHeaderMenu();

  return null;
}

function useApiProps(
  context: Context,
  agent: Runnable,
): Partial<AIGNEApiContextValue> {
  const sessionId = "default-session";

  const aid = stringifyIdentity({
    projectId: context.id,
    agentId: agent.id,
  });

  return useMemo(
    () => ({
      async getAgent({ aid }) {
        const { agentId } = parseIdentity(aid, { rejectWhenError: true });
        const agent = (await context.resolve(agentId))
          .definition as any as Assistant;

        const profile = agent.outputVariables?.find(
          (i) => i.name === RuntimeOutputVariable.profile,
        );

        if (profile?.initialValue) {
          // TODO: set url to aigne project avatar url
          // @ts-ignore
          profile.initialValue.avatar =
            "https://team.arcblock.io/.well-known/service/blocklet/logo-rect?hash=ce7b0ff";
        }

        return {
          ...agent,
          project: {
            ...(context as any).options?.projectDefinition!,
          },
          config: {
            secrets: [],
          },
        };
      },
      async getSessions() {
        return {
          sessions: [
            {
              id: sessionId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              projectId: context.id,
              agentId: agent.id,
            },
          ],
        };
      },
      async getSession({ sessionId }) {
        return {
          id: sessionId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          projectId: context.id,
          agentId: agent.id,
        };
      },
      async getMessages({
        sessionId,
        limit,
        before,
        after,
        orderDirection = "desc",
      }) {
        const results =
          (
            await context.historyManager?.filter({
              agentId: agent.id,
              sessionId,
              k: limit,
              sort: { field: "createdAt", direction: orderDirection },
            })
          )?.results ?? [];

        const messages: Message[] = results.map((i) => ({
          id: i.id,
          aid,
          agentId: agent.id,
          sessionId,
          createdAt: i.createdAt,
          updatedAt: i.updatedAt,
          inputs: i.memory.input,
          outputs: {
            objects: [i.memory.output],
          },
        }));

        return {
          messages,
        };
      },
      async runAgent({ aid, inputs = {}, responseType }) {
        const { agentId } = parseIdentity(aid, { rejectWhenError: true });
        const agent = await context.resolve(agentId);
        if (responseType !== "stream") return agent.run(inputs) as any;

        const stream = await agent.run(inputs, { stream: true });
        const messageId = nanoid();
        const taskId = nanoid();

        return new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of stream as any) {
                controller.enqueue({
                  type: AssistantResponseType.CHUNK,
                  taskId,
                  messageId,
                  sessionId,
                  assistantId: agentId,
                  delta: { content: chunk.$text, object: chunk.delta },
                });
              }
            } catch (error) {
              controller.error(error);
            } finally {
              controller.close();
            }
          },
        });
      },
    }),
    [aid, context, agent.id],
  );
}
