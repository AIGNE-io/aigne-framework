import type { OutputVariable } from "@aigne/agent-v1";
import { RuntimeOutputVariable } from "@aigne/agent-v1/types";
import { useComponent } from "@blocklet/pages-kit/components";
import Ajv, { type ValidateFunction } from "ajv";
import jsonata, { type Expression } from "jsonata";
import { memo, useDeferredValue, useMemo } from "react";
import usePromise from "react-promise-suspense";
import CustomComponentRenderer from "../../components/CustomComponentRenderer/CustomComponentRenderer";
import { CurrentMessageOutputProvider } from "../../contexts/CurrentMessage";
import type { MessageItem } from "../../contexts/Session";

export default function MessageOutputRenderer({
  message,
  output,
}: { message: MessageItem; output: OutputVariable }) {
  const { outputs } = message;

  const outputValue = useMemo(
    () =>
      output.name === RuntimeOutputVariable.text
        ? outputs?.content ||
          outputs?.objects?.find((i) => i?.[RuntimeOutputVariable.text])?.[
            RuntimeOutputVariable.text
          ]
        : outputs?.objects?.find((i) => i?.[output.name!])?.[output.name!],
    [output.name, outputs],
  );

  if (!output.appearance?.componentId) return null;

  if (output.appearance.jsonataExpression) {
    return (
      <MessageOutputValueTransformView
        componentId={output.appearance.componentId}
        jsonataExpression={output.appearance.jsonataExpression}
        output={output}
        message={message}
        outputValue={outputValue}
      />
    );
  }

  return (
    <MessageOutputValueRenderer
      componentId={output.appearance.componentId}
      output={output}
      message={message}
      outputValue={outputValue}
    />
  );
}

const MessageOutputValueTransformView = memo(
  ({
    componentId,
    jsonataExpression,
    output,
    message,
    outputValue,
  }: {
    componentId: string;
    jsonataExpression: string;
    output: OutputVariable;
    message: MessageItem;
    outputValue: any;
  }) => {
    const expression = useJsonataExpression(jsonataExpression);

    const deferredOutputValue = useDeferredValue(outputValue);

    const transformedOutputValue = usePromise(jsonataEvaluate, [
      expression,
      deferredOutputValue,
    ]);

    return (
      <MessageOutputValueRenderer
        componentId={componentId}
        output={output}
        message={message}
        outputValue={transformedOutputValue}
      />
    );
  },
);

const MessageOutputValueRenderer = memo(
  ({
    componentId,
    output,
    message,
    outputValue,
  }: {
    componentId: string;
    output: OutputVariable;
    message: MessageItem;
    outputValue: any;
  }) => {
    const deferredOutputValue = useDeferredValue(outputValue);

    // NOTE: get the output value schema of the custom component
    const schema = (
      useComponent({ instanceId: componentId, componentId })?.Component as any
    )?.aigneOutputValueSchema;

    const validate = useAjvInstance(schema);

    const valid = useMemo(() => {
      // skip validation if no schema
      if (!validate) return { outputValue: deferredOutputValue };

      return validate({ outputValue: deferredOutputValue })
        ? { outputValue: deferredOutputValue }
        : undefined;
    }, [deferredOutputValue, validate]);

    if (!valid) return null;

    return (
      <CurrentMessageOutputProvider
        output={output}
        outputValue={valid.outputValue}
      >
        <CustomComponentRenderer
          aid={message.aid}
          output={{ id: output.id }}
          instanceId={output.id}
          componentId={componentId}
          properties={output.appearance?.componentProperties}
          props={output?.appearance?.componentProps}
        />
      </CurrentMessageOutputProvider>
    );
  },
);

async function jsonataEvaluate(expression: Expression, value: any) {
  return expression.evaluate(value);
}

const JSONATA_EXPRESSION_CACHE: Map<string, Expression> = new Map();

function useJsonataExpression(expression: string) {
  return useMemo(() => {
    let expr = JSONATA_EXPRESSION_CACHE.get(expression);
    if (!expr) {
      expr = jsonata(expression);
      JSONATA_EXPRESSION_CACHE.set(expression, expr);
    }
    return expr;
  }, [expression]);
}

const AJV_INSTANCE_CACHE: Map<string, ValidateFunction> = new Map();

function useAjvInstance(schema: any) {
  return useMemo(() => {
    if (!schema) return undefined;

    let ajv = AJV_INSTANCE_CACHE.get(schema);
    if (!ajv) {
      ajv = new Ajv({ strict: false }).compile(schema);
      AJV_INSTANCE_CACHE.set(schema, ajv);
    }
    return ajv;
  }, [schema]);
}
