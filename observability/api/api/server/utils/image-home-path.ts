import { existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import path, { join } from "node:path";
import dayjs from "@abtnode/util/lib/dayjs";

const getAIGNEHomePath = async () => {
  const folder = path.join("images", dayjs().format("YYYY-MM-DD"));

  const AIGNE_OBSERVER_IMAGE_DIR = join(homedir(), ".aigne", "observability", folder);

  if (!existsSync(AIGNE_OBSERVER_IMAGE_DIR)) {
    mkdirSync(AIGNE_OBSERVER_IMAGE_DIR, { recursive: true });
  }

  return AIGNE_OBSERVER_IMAGE_DIR;
};

export default getAIGNEHomePath;
