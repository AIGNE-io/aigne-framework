import chalk from "chalk";
import Table from "cli-table3";
import { Workbook } from "exceljs";
import type { Report, Reporter } from "./type.ts";

const truncate = (str: string, _max = 50) => str;

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
            ? truncate(
                `${(r.usage.inputTokens || 0) + (r.usage.outputTokens || 0)} (input:${r.usage.inputTokens || 0}, output:${r.usage.outputTokens || 0})`,
              )
            : "-",
        },
      ];
    });
  }
}

export class ConsoleReporter extends BaseReporter {
  override name = "console";

  override async report(report: Report): Promise<void> {
    const summary = report.summary;

    console.log("\n=== 📊 Evaluation Summary ===");
    const summaryTable = new Table({
      head: ["Total", "Success Rate", "Avg Latency", "Total Tokens", "Errors"],
      colWidths: [8, 15, 15, 15, 8],
      chars,
    });

    summaryTable.push([
      summary.total,
      summary.successRate >= 4 ? chalk.green(summary.successRate) : chalk.red(summary.successRate),
      summary.avgLatency ? `${summary.avgLatency.toFixed(3)}s` : "-",
      summary.totalTokens ?? "-",
      summary.errorCount ?? 0,
    ]);
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
          `#${f.id} Input: ${truncate(JSON.stringify(f.input))}\n  Expected: ${
            f.expected ? truncate(JSON.stringify(f.expected)) : "-"
          }\n  Output: ${f.output ? truncate(JSON.stringify(f.output)) : "-"}\n  Error: ${
            f.error ?? "-"
          }\n`,
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
    const workbook = new Workbook();

    const summarySheet = workbook.addWorksheet("Summary");
    summarySheet.columns = [
      { header: "Total", key: "Total", width: 10 },
      { header: "Success Rate", key: "SuccessRate", width: 15 },
      { header: "Avg Latency", key: "AvgLatency", width: 15 },
      { header: "Total Tokens", key: "TotalTokens", width: 15 },
    ];

    summarySheet.addRow({
      Total: report.summary.total,
      SuccessRate: `${(report.summary.successRate * 100).toFixed(2)}%`,
      AvgLatency: report.summary.avgLatency ? `${report.summary.avgLatency.toFixed(3)}s` : "-",
      TotalTokens: report.summary.totalTokens ?? "-",
    });

    const resultsSheet = workbook.addWorksheet("Results");
    const list = this.formatReport(report);
    if (!list.length) return;

    resultsSheet.columns =
      list[0]?.map((h) => ({ header: h.header, key: h.key, width: h.width })) ?? [];

    for (const r of list) {
      resultsSheet.addRow(
        r.reduce(
          (acc, h) => {
            acc[h.key] = h.value;
            return acc;
          },
          {} as Record<string, string | number>,
        ),
      );
    }

    await workbook.xlsx.writeFile(this.filePath);
    console.log(`✅ Excel report saved to ${this.filePath}`);
  }
}
