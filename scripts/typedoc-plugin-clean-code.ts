import { type Application, type Context, ParameterType, type Reflection } from "typedoc";
import { z } from "zod";
import { formatCode, removeFunctionCallsFromCode } from "./ts-utils.ts";

export function load(app: Application) {
  app.options.addDeclaration({
    name: "removeExpressionsFromExamples",
    type: ParameterType.Array,
    help: 'Expression to remove from examples. Example: ["spyOn", "expect"]',
  });

  // @ts-ignore
  app.converter.on("resolveReflection", (_: Context, reflection: Reflection) => {
    const expressions = z
      .array(z.string())
      .nullish()
      .parse(app.options.getValue("removeExpressionsFromExamples"));
    if (!expressions) return;

    if (!reflection.comment) return;

    const exampleTags = reflection.comment.getTags("@example");

    for (const tag of exampleTags) {
      for (const content of tag.content) {
        if (content.kind === "code") {
          const code = content.text
            .trim()
            .replace(/^\s*```\S+/, "")
            .replace(/```$/, "");

          const c = formatCode(removeFunctionCallsFromCode(code, expressions));
          content.text = `\`\`\`ts\n${c}\n\`\`\``;
        }
      }
    }
  });
}
