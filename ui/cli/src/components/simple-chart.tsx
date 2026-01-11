import { Box, Text } from "ink";
import React from "react";
import { z } from "zod";
import type { UIComponent } from "@aigne/ui";

/**
 * Props schema for SimpleChart
 */
const SimpleChartPropsSchema = z.object({
  data: z.array(z.number()).describe("Array of numbers to display in the chart"),
  title: z.string().optional().describe("Optional chart title"),
  height: z.number().default(10).describe("Chart height in rows"),
});

type SimpleChartProps = z.output<typeof SimpleChartPropsSchema>;

/**
 * Ink.js component for rendering ASCII bar chart
 */
export function SimpleChartComponent({ data, title, height = 10 }: SimpleChartProps) {
  const maxValue = Math.max(...data, 1);
  const barWidth = 3;

  return (
    <Box flexDirection="column" padding={1}>
      {title && (
        <Box marginBottom={1}>
          <Text bold color="cyan">
            {title}
          </Text>
        </Box>
      )}
      <Box flexDirection="column">
        {/* Chart area */}
        {Array.from({ length: height }).map((_, row) => {
          const threshold = maxValue * (1 - row / height);
          return (
            <Box key={row}>
              <Text dimColor>{threshold.toFixed(0).padStart(4)} │ </Text>
              {data.map((value, idx) => {
                const filled = value >= threshold;
                return (
                  <Text key={idx} color={filled ? "green" : undefined}>
                    {filled ? "█".repeat(barWidth) : " ".repeat(barWidth)}
                  </Text>
                );
              })}
            </Box>
          );
        })}
        {/* X-axis */}
        <Box>
          <Text>     └{"─".repeat(data.length * barWidth)}</Text>
        </Box>
        {/* Labels */}
        <Box>
          <Text>      </Text>
          {data.map((value, idx) => (
            <Text key={idx}>{value.toString().padEnd(barWidth)}</Text>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

/**
 * SimpleChart UI component definition
 * Renders data as an ASCII bar chart in the terminal
 */
export const SimpleChart: UIComponent<SimpleChartProps> = {
  name: "chart",
  description:
    "Renders a simple ASCII bar chart in the terminal. Use this when the user wants to visualize numeric data, see trends, or compare values.",

  propsSchema: SimpleChartPropsSchema as any,

  environment: "cli",

  async render(props, context) {
    // Render Ink component to get serializable representation
    const element = <SimpleChartComponent {...props} />;

    // For CLI, we return the React element which Ink will render
    // The serializable representation is stored for state persistence
    return {
      element,
      stateUpdates: {
        lastRendered: new Date().toISOString(),
        lastData: props.data,
      },
    };
  },

  async onMount(props, context) {
    // Log component mount for debugging
    console.log(`[SimpleChart] Mounted with data: ${props.data.join(", ")}`);
  },
};
