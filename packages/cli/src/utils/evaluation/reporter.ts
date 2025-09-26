import fs from "node:fs";
import path from "node:path";
import { format } from "@fast-csv/format";
import chalk from "chalk";
import Table from "cli-table3";
import type { Report, Reporter } from "./type.js";

const borderColor = chalk.green;
const chars = {
  top: borderColor("─"),
  "top-mid": borderColor("┬"),
  "top-left": borderColor("┌"),
  "top-right": borderColor("┐"),
  bottom: borderColor("─"),
  "bottom-mid": borderColor("┴"),
  "bottom-left": borderColor("└"),
  "bottom-right": borderColor("┘"),
  left: borderColor("│"),
  "left-mid": borderColor("├"),
  mid: borderColor("─"),
  "mid-mid": borderColor("┼"),
  right: borderColor("│"),
  "right-mid": borderColor("┤"),
  middle: borderColor("│"),
};

function renderPagedTable(
  list: { header: string; width?: number; value: any }[][],
  { maxCols = 6, chars }: { maxCols?: number; chars: any },
) {
  if (!list.length) return [];

  const maxLength = 300;
  const tables: string[] = [];
  const head = list[0]?.map((h) => h.header) ?? [];
  const widths = list[0]?.map((h) => h.width ?? 20) ?? [];

  for (let i = 0; i < head.length; i += maxCols) {
    const subHead = head.slice(i, i + maxCols);
    const subWidths = widths.slice(i, i + maxCols);

    const table = new Table({
      head: subHead,
      colWidths: subWidths,
      wordWrap: true,
      chars,
    });

    for (const row of list) {
      table.push(
        row
          .slice(i, i + maxCols)
          .map((h) =>
            String(h.value).length > maxLength
              ? `${String(h.value).slice(0, maxLength)}...`
              : h.value,
          ),
      );
    }

    tables.push(table.toString());
  }

  return tables;
}

export class BaseReporter implements Reporter {
  name = "base";

  async report(_report: Report): Promise<void> {
    throw new Error("Not implemented");
  }

  protected formatReport(
    report: Report,
  ): { header: string; key: string; width: number; value: string | number }[][] {
    return report.results.map((r) => {
      return [
        { header: "ID", key: "ID", width: 10, value: r.id },
        { header: "Input", key: "Input", width: 40, value: JSON.stringify(r.input) },
        {
          header: "Output",
          key: "Output",
          width: 40,
          value: r.output ? JSON.stringify(r.output) : "-",
        },
        {
          header: "Expected",
          key: "Expected",
          width: 40,
          value: r.expected ? JSON.stringify(r.expected) : "-",
        },
        {
          header: "Evaluations",
          key: "Evaluations",
          width: 30,
          value: r.evaluations.map((e) => `${e.name}:${e.score}`).join(", "),
        },
        {
          header: "Rating",
          key: "Rating",
          width: 20,
          value: r.evaluations.map((e) => `${e.rating}`).join(", "),
        },
        { header: "Error", key: "Error", width: 20, value: r.error ?? "-" },
        {
          header: "Reason",
          key: "Reason",
          width: 50,
          value: r.evaluations
            .map((e) => e.reason ?? "")
            .filter(Boolean)
            .join(" | "),
        },
        {
          header: "Latency",
          key: "Latency",
          width: 15,
          value: r.latency ? `${r.latency.toFixed(2)}s` : "-",
        },
        {
          header: "Tokens",
          key: "Tokens",
          width: 40,
          value: r.usage
            ? `${(r.usage.inputTokens || 0) + (r.usage.outputTokens || 0)} (input:${r.usage.inputTokens || 0}, output:${r.usage.outputTokens || 0})`
            : "-",
        },
      ];
    });
  }

  protected formatSummary(
    summary: Report["summary"],
  ): { header: string; key: string; width: number; value: string | number }[] {
    return [
      {
        header: "Total",
        key: "Total",
        width: 10,
        value: summary.total,
      },
      {
        header: "Success Rate",
        key: "SuccessRate",
        width: 15,
        value: summary.successRate,
      },
      {
        header: "Total Duration",
        key: "Duration",
        width: 15,
        value: summary.duration ? `${summary.duration.toFixed(3)}s` : "-",
      },
      {
        header: "Avg Latency",
        key: "AvgLatency",
        width: 15,
        value: summary.avgLatency ? `${summary.avgLatency.toFixed(3)}s` : "-",
      },
      {
        header: "Total Tokens",
        key: "TotalTokens",
        width: 15,
        value: summary.totalTokens ?? "-",
      },
      {
        header: "Errors",
        key: "Errors",
        width: 8,
        value: summary.errorCount ?? 0,
      },
    ];
  }
}

export class ConsoleReporter extends BaseReporter {
  override name = "console";

  override async report(report: Report): Promise<void> {
    const summary = report.summary;

    console.log("\n=== 📊 Evaluation Summary ===");
    const summaryList = this.formatSummary(summary);
    const summaryTable = new Table({
      head: summaryList.map((h) => h.header),
      colWidths: summaryList.map((h) => h.width),
      chars,
    });

    summaryTable.push(summaryList.map((h) => h.value));
    console.log(summaryTable.toString());

    const list = this.formatReport(report);
    if (!list.length) return;

    console.log("\n=== 📋 Detailed Results ===");
    const pages = renderPagedTable(list, { maxCols: 5, chars });
    for (const page of pages) {
      console.log(page);
    }

    const failed = report.results.filter((r) => r.error);
    if (failed.length) {
      console.log(chalk.red("\n=== ❌ Failed Cases ==="));
      for (const f of failed) {
        console.log(
          `#${f.id} Input: ${JSON.stringify(f.input)}\n  Expected: ${
            f.expected ? JSON.stringify(f.expected) : "-"
          }\n  Output: ${f.output ? JSON.stringify(f.output) : "-"}\n  Error: ${f.error ?? "-"}\n`,
        );
      }
    }
  }
}

export class CsvReporter extends BaseReporter {
  override name = "csv";

  constructor(private filePath: string) {
    super();
  }

  private async writeCsv(filePath: string, data: Record<string, any>[], headers: string[]) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    const stream = format({ headers });
    const writeStream = fs.createWriteStream(filePath);
    stream.pipe(writeStream);

    for (const row of data) {
      stream.write(row);
    }

    stream.end();

    await new Promise<void>((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });
  }

  override async report(report: Report): Promise<void> {
    const list = this.formatReport(report);
    if (list.length > 0) {
      const resultsHeaders = list[0]?.map((h) => h.header) ?? [];
      const resultsRows = list.map((row) => {
        const record: Record<string, string | number> = {};
        for (const item of row) {
          record[item.header] = item.value;
        }
        return record;
      });

      const ext = path.extname(this.filePath).toLowerCase();
      const outputFile = ext ? this.filePath : `${this.filePath}.csv`;

      await this.writeCsv(outputFile, resultsRows, resultsHeaders);

      console.log(`✅ Results CSV saved to ${outputFile}`);
    }
  }
}
