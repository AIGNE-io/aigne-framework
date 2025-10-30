import Decimal from "decimal.js";
import type { TraceData } from "../components/run/types.ts";
import { calculateCost } from "../libs/index.ts";

export default function useGetStats({ traceInfo }: { traceInfo: TraceData }) {
  const getRunStats = (run: TraceData | null) => {
    let count = 0;
    let inputTokens = 0;
    let outputTokens = 0;
    let inputCost = new Decimal(0);
    let outputCost = new Decimal(0);

    function traverse(node: TraceData | null) {
      if (!node) return;
      count += 1;
      if (node.attributes.output?.usage) {
        inputTokens += node.attributes.output?.usage?.inputTokens || 0;
        outputTokens += node.attributes.output?.usage?.outputTokens || 0;
        inputCost = inputCost.add(calculateCost(node.attributes.output).inputCost);
        outputCost = outputCost.add(calculateCost(node.attributes.output).outputCost);
      }
      if (node.children) node.children.forEach(traverse);
    }
    traverse(run);

    return {
      count,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      inputCost: inputCost.gt(new Decimal(0)) ? `$${inputCost.toString()}` : "",
      outputCost: outputCost.gt(new Decimal(0)) ? `$${outputCost.toString()}` : "",
      totalCost: inputCost.add(outputCost).gt(new Decimal(0))
        ? `$${inputCost.add(outputCost).toString()}`
        : "",
    };
  };

  return getRunStats(traceInfo);
}
