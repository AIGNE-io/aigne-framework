import os from "node:os";

export default function systemInfo() {
  return {
    platform: os.platform(),
    arch: os.arch(),
    cpuCount: os.cpus().length,
    totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
    freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
    uptime: `${Math.floor(os.uptime() / 60)} min`,
  };
}
