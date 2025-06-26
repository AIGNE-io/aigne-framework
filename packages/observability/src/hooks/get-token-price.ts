import Decimal from "decimal.js";
import { useCallback } from "react";
import modelPricesAndContextWindow from "../utils/model_prices_and_context_window.json";

export default function useGetTokenPrice() {
  const getPrices = useCallback(
    ({
      model,
      inputTokens,
      outputTokens,
    }: {
      model?: string;
      inputTokens: number;
      outputTokens: number;
    }) => {
      if (!model) {
        return {
          inputCost: new Decimal(0),
          outputCost: new Decimal(0),
        };
      }

      const price = modelPricesAndContextWindow[model as keyof typeof modelPricesAndContextWindow];
      if (!price) {
        return {
          inputCost: new Decimal(0),
          outputCost: new Decimal(0),
        };
      }

      // @ts-ignore
      const inputCostPerToken = new Decimal(price.input_cost_per_token || 0);
      // @ts-ignore
      const outputCostPerToken = new Decimal(price.output_cost_per_token || 0);

      return {
        inputCost: new Decimal(inputTokens).mul(inputCostPerToken),
        outputCost: new Decimal(outputTokens).mul(outputCostPerToken),
      };
    },
    [],
  );

  return getPrices;
}
