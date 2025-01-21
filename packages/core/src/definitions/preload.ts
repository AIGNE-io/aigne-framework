import type {
  CreateAgentInputSchema,
  CreateAgentPreloadsSchema,
} from "../agent";
import type { Runnable, RunnableInputType } from "../runnable";
import { isNonNullable } from "../utils/is-non-nullable";
import { OrderedRecord } from "../utils/ordered-map";
import type { ExtractRunnableInputType } from "../utils/runnable-type";
import type { UnionToIntersection } from "../utils/union";
import type { SchemaToType } from "./data-schema";

export function preloadCreatorsToPreloads<
  I extends CreateAgentInputSchema,
  C extends CreateAgentPreloadsSchema<I>,
>(
  inputs: OrderedRecord<RunnableInputType>,
  creators?: C,
): OrderedRecord<AgentPreload> {
  return OrderedRecord.fromArray(
    Object.entries(creators ?? {}).map<AgentPreload>(([name, preload]) => {
      const p = preload((runnable, input, options) => ({
        ...options,
        runnable,
        input,
      }));

      const input = Object.fromEntries(
        OrderedRecord.map(p.runnable.definition.inputs, (i) => {
          if (!i.name) return null;

          const bind = p.input?.[i.name as keyof typeof p.input] as
            | BindAgentInput
            | undefined;
          if (!bind) return null;

          if (bind.from !== "input")
            throw new Error(`Unsupported bind from ${bind.from} in preloads`);

          const from = OrderedRecord.find(
            inputs,
            (i) => i.name === bind.fromInput,
          );
          if (!from) throw new Error(`Input ${bind.fromInput} not found`);

          return [i.id, { ...bind, fromInput: from.id }];
        }).filter(isNonNullable),
      );

      return {
        id: name,
        name,
        description: p.description,
        runnable: { id: p.runnable.id },
        input,
      };
    }),
  );
}

export type PreloadCreator<I extends CreateAgentInputSchema> = (
  preload: <
    R extends Runnable,
    Input extends BindAgentInputs<SchemaToType<I>, R>,
  >(
    runnable: R,
    input: Input,
    options?: {
      description?: string;
    },
  ) => Readonly<BoundAgent<I, R, Input>>,
) => ReturnType<typeof preload>;

export type BindAgentInputs<
  Vars extends Record<string, unknown>,
  R extends Runnable,
> = {
  [key in keyof ExtractRunnableInputType<R>]: BindAgentInput<
    Vars,
    ExtractRunnableInputType<R>[key]
  >;
};

export interface AgentPreload {
  id: string;

  name?: string;

  runnable?: {
    id: string;
  };

  input?: { [inputId: string]: BindAgentInput };
}

export type BindAgentInput<
  Vars extends Record<string, unknown> = Record<string, unknown>,
  Input = unknown,
> =
  | {
      from: "ai";
    }
  | {
      from: "input";
      fromInput: keyof {
        [name in keyof Vars as Vars[name] extends Input ? name : never]: name;
      };
    };

export interface BoundAgent<
  Vars extends Record<string, unknown> = Record<string, unknown>,
  R extends Runnable = Runnable,
  I extends BindAgentInputs<Vars, R> = BindAgentInputs<Vars, R>,
> {
  description?: string;

  runnable: R;

  input?: I;
}

type PickInputFrom<I, From extends BindAgentInput["from"]> = {
  [key in keyof I as I[key] extends { from: From } ? key : never]: I[key];
};

export type OmitBoundAgentInput<
  Case extends BoundAgent,
  From extends BindAgentInput["from"],
> = Omit<
  UnionToIntersection<
    ExtractRunnableInputType<Case["runnable"]>,
    Record<string, never>
  >,
  keyof PickInputFrom<
    Required<
      UnionToIntersection<NonNullable<Case["input"]>, Record<string, never>>
    >,
    From
  >
>;
