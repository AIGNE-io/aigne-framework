import { Box, Text } from "ink";
import React from "react";
import { z } from "zod";
import type { UIComponent } from "@aigne/ui";
import { BarChart, LineGraph, Sparkline } from "@pppp606/ink-chart";

/**
 * Props schema for Chart component
 */
const ChartPropsSchema = z.object({
  type: z
    .enum(["line", "bar", "sparkline"])
    .describe("Type of chart to render"),
  data: z.array(z.number()).describe("Array of numbers to visualize"),
  title: z.string().optional().describe("Optional chart title"),
  height: z
    .number()
    .min(5)
    .max(20)
    .default(10)
    .describe("Chart height in rows (5-20)"),
  color: z
    .enum(["green", "red", "blue", "yellow", "cyan", "magenta"])
    .optional()
    .default("cyan")
    .describe("Chart color"),
  labels: z
    .array(z.string())
    .optional()
    .describe("Optional labels for data points"),
});

type ChartProps = z.output<typeof ChartPropsSchema>;

/**
 * Ink.js component for rendering charts using @pppp606/ink-chart
 */
export function ChartComponent({
  type,
  data,
  title,
  height = 10,
  color = "cyan",
  labels,
}: ChartProps) {
  // Transform data for BarChart - needs {label, value, color} format
  const barChartData = data.map((value, index) => ({
    label: labels?.[index] || `${index + 1}`,
    value,
    color,
  }));

  // Transform data for LineGraph - needs series format with values array
  const lineGraphData = [
    {
      values: data,
      color,
    },
  ];

  return (
    <Box flexDirection="column" padding={1}>
      {title && (
        <Box marginBottom={1}>
          <Text bold color="cyan">
            {title}
          </Text>
        </Box>
      )}

      {type === "line" && (
        <LineGraph
          data={lineGraphData}
          xLabels={labels}
        />
      )}

      {type === "bar" && (
        <BarChart data={barChartData} />
      )}

      {type === "sparkline" && (
        <Box flexDirection="column">
          <Sparkline data={data} />
          <Box marginTop={1}>
            <Text dimColor>
              Min: {Math.min(...data).toFixed(2)}
              {" • "}
              Max: {Math.max(...data).toFixed(2)}
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}

/**
 * Chart UI component definition
 * Renders data as line graph, bar chart, or sparkline using Ink charts
 */
export const Chart: UIComponent<ChartProps> = {
  name: "chart",
  description: `Render charts in the terminal using Ink components.
Supports line graphs, bar charts, and sparklines.
Best for visualizing trends and time-series data.

Use line charts for trends over time with optional axis labels.
Use bar charts for comparing values side-by-side.
Use sparklines for compact inline trend visualization with min/max values.`,

  propsSchema: ChartPropsSchema as any,

  environment: "cli",

  async render(props, context) {
    // Render Ink component
    const element = <ChartComponent {...props} />;

    return {
      element,
      stateUpdates: {
        lastRendered: new Date().toISOString(),
        chartType: props.type,
        dataPoints: props.data.length,
      },
    };
  },

  async onMount(props, context) {
    console.log(
      `[Chart] Mounted ${props.type} chart with ${props.data.length} data points`
    );
  },
};
