import chalk from "chalk";
import Table from "cli-table3";
import * as XLSX from "xlsx";
import type { Report, Reporter } from "./type.ts";

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
        { header: "Error", key: "Error", width: 20, value: r.error ?? "-" },
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
    const head = list[0]?.map((h) => h.header) ?? [];
    const colWidths = list[0]?.map((h) => h.width) ?? [];
    const detailTable = new Table({
      head,
      colWidths,
      wordWrap: true,
      chars,
    });

    for (const r of list) {
      detailTable.push(r.map((h) => h.value));
    }
    console.log(detailTable.toString());

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

export class ExcelReporter extends BaseReporter {
  override name = "excel";
  constructor(private filePath: string) {
    super();
  }

  override async report(report: Report): Promise<void> {
    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryList = this.formatSummary(report.summary);
    const summaryData = [summaryList.map((h) => h.header), summaryList.map((h) => h.value)];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

    // Results sheet
    const list = this.formatReport(report);
    if (list.length > 0) {
      const headers: (string | number)[] = list[0]?.map((h) => h.header) ?? [];
      const rows: (string | number)[][] = list.map((row) => row.map((h) => h.value));
      const resultsSheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      XLSX.utils.book_append_sheet(wb, resultsSheet, "Results");
    }

    XLSX.writeFile(wb, this.filePath);
    console.log(`✅ Excel report saved to ${this.filePath}`);
  }
}
