import { existsSync, readFileSync } from "node:fs";

function isWSL(): boolean {
  if (process.platform !== "linux") return false;

  // env checks
  if (process.env.WSL_DISTRO_NAME || process.env.WSL_INTEROP) return true;

  try {
    const v = readFileSync("/proc/version", "utf8").toLowerCase();
    if (v.includes("microsoft") || v.includes("wsl")) return true;
  } catch {}

  try {
    const r = readFileSync("/proc/sys/kernel/osrelease", "utf8").toLowerCase();
    if (r.includes("microsoft") || r.includes("wsl")) return true;
  } catch {}

  // some WSL setups have /run/WSL or other hints
  if (existsSync("/run/WSL") || existsSync("/run/WSL/")) return true;

  return false;
}

function isDBusAvailable() {
  return !!process.env.DBUS_SESSION_BUS_ADDRESS;
}

function isDisplayAvailable(): boolean {
  return !!(process.env.DISPLAY || process.env.WAYLAND_DISPLAY);
}

export function isKeyringEnvironmentReady(): { ready: boolean; reason?: string } {
  if (process.platform === "win32") return { ready: true };
  if (process.platform === "darwin") return { ready: true };

  if (process.platform === "linux") {
    if (isWSL()) {
      return { ready: false, reason: "Detected WSL (no GNOME keyring by default)" };
    }

    // Check for D-Bus (required for libsecret)
    if (!isDBusAvailable()) {
      return { ready: false, reason: "D-Bus not available" };
    }

    // Check for display server (most keyring services need it)
    if (!isDisplayAvailable()) {
      return { ready: false, reason: "Display not available" };
    }

    return { ready: true };
  }

  // Unknown platform
  return { ready: false, reason: `Unsupported platform: ${process.platform}` };
}
