import { Box, Text, useStdout } from "ink";
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
    .describe("Type of chart: 'line' for trends, 'bar' for comparisons, 'sparkline' for compact trends"),
  data: z
    .array(z.number())
    .describe("Array of numeric values to visualize. Example: [5, 10, 15, 20, 18, 25]"),
  title: z.string().optional().describe("Optional chart title displayed above the chart"),
  height: z
    .number()
    .min(5)
    .max(20)
    .default(10)
    .describe("Chart height in terminal rows (5-20, default: 10)"),
  color: z
    .enum(["green", "red", "blue", "yellow", "cyan", "magenta"])
    .optional()
    .default("cyan")
    .describe("Chart color (default: cyan)"),
  labels: z
    .array(z.string())
    .optional()
    .describe("Optional x-axis labels for data points. Example: ['Jan', 'Feb', 'Mar', 'Apr']"),
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
  // Get terminal width and calculate half
  const { stdout } = useStdout();
  const terminalWidth = stdout?.columns || 80; // Default to 80 if not available
  const halfWidth = Math.floor(terminalWidth / 2);

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
          width={halfWidth}
          height={height}
        />
      )}

      {type === "bar" && (
        <BarChart data={barChartData} showValue="right" width={halfWidth} />
      )}

      {type === "sparkline" && (
        <Box flexDirection="column">
          <Sparkline data={data} width={Math.min(data.length * 8, halfWidth)} />
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
Supports line graphs, bar charts, and sparklines for visualizing numeric data.

Example usage for a bar chart:
{
  "type": "bar",
  "data": [45, 78, 62, 95, 83],
  "title": "Sales by Region"
}

Example usage for a line graph with labels:
{
  "type": "line",
  "data": [10, 15, 12, 18, 20, 25],
  "title": "Monthly Revenue",
  "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
}

Example usage for a sparkline (compact):
{
  "type": "sparkline",
  "data": [5, 8, 3, 12, 7, 15, 9]
}

Use 'line' for trends over time, 'bar' for comparisons, 'sparkline' for compact inline trends.`,

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
