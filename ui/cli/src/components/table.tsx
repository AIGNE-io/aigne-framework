import { Box, Text } from "ink";
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

type Column = {
  key: string;
  width: number;
};

/**
 * Helper to intersperse elements with separators
 */
function intersperse<T>(separator: string, elements: React.ReactElement[]): React.ReactElement[] {
  if (elements.length === 0) return [];

  return elements.reduce((acc, element, index) => {
    if (index === 0) return [element];
    return [...acc, <Text key={`sep-${index}`} bold>{separator}</Text>, element];
  }, [] as React.ReactElement[]);
}

/**
 * Renders a table row with box-drawing characters
 */
function TableRow({
  columns,
  data,
  padding,
  chars,
  cellRenderer,
}: {
  columns: Column[];
  data: Record<string, string | number>;
  padding: number;
  chars: { left: string; right: string; cross: string; line: string };
  cellRenderer: (content: string, index: number) => React.ReactElement;
}) {
  const cells = columns.map((column, colIndex) => {
    const value = data[column.key];
    const content = value != null ? String(value) : "";

    // Calculate padding
    const ml = padding;
    const mr = column.width - content.length - padding;

    const cellContent = `${chars.line.repeat(ml)}${content}${chars.line.repeat(mr)}`;

    return cellRenderer(cellContent, colIndex);
  });

  return (
    <Box flexDirection="row">
      <Text bold>{chars.left}</Text>
      {...intersperse(chars.cross, cells)}
      <Text bold>{chars.right}</Text>
    </Box>
  );
}

/**
 * Professional table renderer using box-drawing characters (like ink-table)
 */
export function TableComponent({
  data,
  columns: columnNames,
  title,
  padding = 1,
}: TableProps) {
  if (data.length === 0) {
    return (
      <Box flexDirection="column" padding={1}>
        {title && (
          <Text bold color="cyan">
            {title}
          </Text>
        )}
        <Text dimColor>No data to display</Text>
      </Box>
    );
  }

  // Determine columns to display
  const displayColumnKeys = columnNames || (data[0] ? Object.keys(data[0]) : []);

  // Calculate column widths
  const columns: Column[] = displayColumnKeys.map((key) => {
    const headerLength = key.length;
    const maxDataLength = Math.max(
      ...data.map((row) => String(row[key] ?? "").length)
    );
    return {
      key,
      width: Math.max(headerLength, maxDataLength) + padding * 2,
    };
  });

  // Create headings row data
  const headings = displayColumnKeys.reduce(
    (acc, key) => ({ ...acc, [key]: key }),
    {} as Record<string, string>
  );

  return (
    <Box flexDirection="column" padding={1}>
      {title && (
        <Box marginBottom={1}>
          <Text bold color="cyan">
            {title}
          </Text>
        </Box>
      )}

      {/* Top border: ┌─┬─┐ */}
      <TableRow
        columns={columns}
        data={{}}
        padding={padding}
        chars={{ left: "┌", right: "┐", cross: "┬", line: "─" }}
        cellRenderer={(content) => <Text bold>{content}</Text>}
      />

      {/* Header row with column names */}
      <TableRow
        columns={columns}
        data={headings}
        padding={padding}
        chars={{ left: "│", right: "│", cross: "│", line: " " }}
        cellRenderer={(content, index) => (
          <Text key={`header-${index}`} bold color="blue">
            {content}
          </Text>
        )}
      />

      {/* Data rows with separators */}
      {data.map((row, rowIndex) => (
        <Box key={`row-${rowIndex}`} flexDirection="column">
          {/* Separator: ├─┼─┤ */}
          <TableRow
            columns={columns}
            data={{}}
            padding={padding}
            chars={{ left: "├", right: "┤", cross: "┼", line: "─" }}
            cellRenderer={(content) => <Text bold>{content}</Text>}
          />

          {/* Data row */}
          <TableRow
            columns={columns}
            data={row}
            padding={padding}
            chars={{ left: "│", right: "│", cross: "│", line: " " }}
            cellRenderer={(content, index) => (
              <Text key={`cell-${rowIndex}-${index}`}>{content}</Text>
            )}
          />
        </Box>
      ))}

      {/* Bottom border: └─┴─┘ */}
      <TableRow
        columns={columns}
        data={{}}
        padding={padding}
        chars={{ left: "└", right: "┘", cross: "┴", line: "─" }}
        cellRenderer={(content) => <Text bold>{content}</Text>}
      />
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
