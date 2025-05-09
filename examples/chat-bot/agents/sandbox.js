import vm from "node:vm";

export default async function evaluateJs({ jsCode }) {
  const sandbox = {};
  const context = vm.createContext(sandbox);
  const result = vm.runInContext(jsCode, context, { displayErrors: true });
  return { result };
}

evaluateJs.description = `
This agent generates a JavaScript code snippet that is suitable to be passed directly into Node.js's 'vm.runInContext(code, context)' function. Follow these constraints:
- Do NOT use any top-level 'return' statements, as the code is not inside a function.
- The code can define variables or perform calculations.
- To return a value from the code, make sure the final line is an expression (not a statement) whose value will be the result.
- Do NOT wrap the code in a function or IIFE unless explicitly instructed.
- The code should be self-contained and valid JavaScript.`;

evaluateJs.input_schema = {
  type: "object",
  properties: {
    jsCode: {
      type: "string",
      description: "JavaScript code snippet to evaluate",
    },
  },
  required: ["jsCode"],
};

evaluateJs.output_schema = {
  type: "object",
  properties: {
    result: { type: "any", description: "Result of the evaluated code" },
  },
  required: ["result"],
};
