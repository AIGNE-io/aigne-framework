import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

function isWSL() {
  if (process.platform !== "linux") return false;

  // 2. /proc/version
  try {
    const v = readFileSync("/proc/version", "utf8").toLowerCase();
    if (v.includes("microsoft") || v.includes("wsl")) return true;
  } catch {}

  // 3. /proc/sys/kernel/osrelease
  try {
    const r = readFileSync("/proc/sys/kernel/osrelease", "utf8").toLowerCase();
    if (r.includes("microsoft") || r.includes("wsl")) return true;
  } catch {}

  return false;
}

function isDisplayAvailable(): boolean {
  return !!(process.env.DISPLAY || process.env.WAYLAND_DISPLAY);
}

function isLibsecretInstalled(): boolean {
  try {
    execSync("ldconfig -p | grep libsecret", { stdio: "pipe" });
    return true;
  } catch {
    try {
      execSync("pkg-config --exists libsecret-1", { stdio: "pipe" });
      return true;
    } catch {
      return false;
    }
  }
}

export function isKeyringEnvironmentReady(): boolean {
  if (process.platform === "win32") {
    return true;
  }

  if (process.platform === "darwin") {
    return true;
  }

  if (process.platform === "linux") {
    if (isWSL()) {
      console.log("WSL detected");
      return false;
    }

    // Check for display server (most keyring services need it)
    if (!isDisplayAvailable()) {
      return false;
    }

    // Check if libsecret is installed
    if (!isLibsecretInstalled()) {
      return false;
    }

    return true;
  }

  return false;
}
