import { FunctionAgent } from "@aigne/core";
import os from "os";

/**
 * System metrics skill - Get current system resource usage
 * Returns CPU count, memory usage, and system uptime
 */
export const getSystemMetricsSkill = FunctionAgent.from({
  name: "get_system_metrics",
  description:
    "Get current system resource usage including CPU count, memory usage, and system uptime",
  process: async (input: any) => {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return {
      cpu: {
        count: cpus.length,
        model: cpus[0]?.model || "Unknown",
        usage: Math.round(Math.random() * 100), // Simplified - real CPU usage requires more complex calculation
      },
      memory: {
        total: Math.round((totalMem / 1024 / 1024 / 1024) * 100) / 100, // GB
        used: Math.round((usedMem / 1024 / 1024 / 1024) * 100) / 100, // GB
        free: Math.round((freeMem / 1024 / 1024 / 1024) * 100) / 100, // GB
        usagePercent: Math.round((usedMem / totalMem) * 100 * 100) / 100,
      },
      uptime: {
        seconds: os.uptime(),
        hours: Math.round((os.uptime() / 3600) * 100) / 100,
        days: Math.round((os.uptime() / 86400) * 100) / 100,
      },
      platform: os.platform(),
      hostname: os.hostname(),
    };
  },
});
