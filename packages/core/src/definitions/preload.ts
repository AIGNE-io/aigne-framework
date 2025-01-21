import type { Preload } from "../agent";
import type { Runnable, RunnableInput } from "../runnable";
import { isNonNullable } from "../utils/is-non-nullable";
import { OrderedRecord } from "../utils/ordered-map";
import type { ExtractRunnableInputType } from "../utils/runnable-type";
import type { UnionToIntersection } from "../utils/union";
import type { DataTypeSchema, SchemaMapType } from "./data-type-schema";

export function preloadCreatorsToPreloads<
  I extends { [name: string]: any },
  C extends { [name: string]: PreloadCreator<I> },
>(inputs: OrderedRecord<RunnableInput>, creators?: C): OrderedRecord<Preload> {
  return OrderedRecord.fromArray(
    Object.entries(creators ?? {}).map<Preload>(([name, preload]) => {
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

export type PreloadCreator<I extends { [name: string]: DataTypeSchema }> = (
  preload: <
    R extends Runnable,
    Input extends BindAgentInputs<SchemaMapType<I>, R>,
  >(
    runnable: R,
    input: Input,
    options?: {
      description?: string;
    },
  ) => Readonly<BoundAgent<I, R, Input>>,
) => ReturnType<typeof preload>;

export type BindAgentInput<
  Vars extends Record<string, any> = Record<string, any>,
  Input = any,
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

export type PickInputFrom<I, From extends BindAgentInput["from"]> = {
  [key in keyof I as I[key] extends { from: From } ? key : never]: I[key];
};

export type OmitBoundAgentInput<
  Case extends BoundAgent,
  From extends BindAgentInput["from"],
> = Omit<
  UnionToIntersection<ExtractRunnableInputType<Case["runnable"]>, {}>,
  keyof PickInputFrom<
    Required<UnionToIntersection<NonNullable<Case["input"]>, {}>>,
    From
  >
>;

export type BindAgentInputs<
  Vars extends Record<string, unknown>,
  R extends Runnable,
> = {
  [key in keyof ExtractRunnableInputType<R>]: BindAgentInput<
    Vars,
    ExtractRunnableInputType<R>[key]
  >;
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
