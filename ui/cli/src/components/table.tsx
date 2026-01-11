import { Box, Text } from "ink";
import InkTable from "ink-table";
import React from "react";
import { z } from "zod";
import type { UIComponent } from "@aigne/ui";

/**
 * Props schema for Table component
 */
const TablePropsSchema = z.object({
  data: z
    .array(z.record(z.union([z.string(), z.number()])))
    .describe("Array of row objects with column data"),
  columns: z
    .array(z.string())
    .optional()
    .describe("Column names to display (if not provided, uses all keys from data)"),
  title: z.string().optional().describe("Optional table title"),
  padding: z
    .number()
    .min(0)
    .max(5)
    .default(1)
    .describe("Cell padding (0-5)"),
});

type TableProps = z.output<typeof TablePropsSchema>;

/**
 * Ink.js component for rendering tables using ink-table
 */
export function TableComponent({
  data,
  columns,
  title,
  padding = 1,
}: TableProps) {
  return (
    <Box flexDirection="column" padding={1}>
      {title && (
        <Box marginBottom={1}>
          <Text bold color="cyan">
            {title}
          </Text>
        </Box>
      )}

      <InkTable data={data} columns={columns} padding={padding} />
    </Box>
  );
}

/**
 * Table UI component definition
 * Display tabular data in the terminal with proper formatting
 */
export const Table: UIComponent<TableProps> = {
  name: "table",
  description: `Display tabular data in the terminal.
Supports sorting, highlighting, and custom column formatting.
Best for displaying structured data with multiple fields.

Automatically formats columns based on data types.
If columns are not specified, displays all keys from the data objects.
Supports both string and numeric values in cells.`,

  propsSchema: TablePropsSchema as any,

  environment: "cli",

  async render(props, context) {
    // Render Ink component
    const element = <TableComponent {...props} />;

    return {
      element,
      stateUpdates: {
        lastRendered: new Date().toISOString(),
        rowCount: props.data.length,
        columnCount: props.columns?.length || Object.keys(props.data[0] || {}).length,
      },
    };
  },

  async onMount(props, context) {
    const cols = props.columns?.length || Object.keys(props.data[0] || {}).length;
    console.log(
      `[Table] Mounted table with ${props.data.length} rows and ${cols} columns`
    );
  },
};
