import { existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const formatDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getAIGNEHomePath = () => {
  const folder = join("images", formatDate());

  const AIGNE_OBSERVER_IMAGE_DIR = join(homedir(), ".aigne", "observability", folder);

  if (!existsSync(AIGNE_OBSERVER_IMAGE_DIR)) {
    mkdirSync(AIGNE_OBSERVER_IMAGE_DIR, { recursive: true });
  }

  return AIGNE_OBSERVER_IMAGE_DIR;
};

export default getAIGNEHomePath;
