import { createAxios } from "@blocklet/js-sdk";

const AI_RUNTIME_DID = "z2qaBP9SahqU2L2YA3ip7NecwKACMByTFuiJ2";
const api = createAxios({ timeout: 120 * 1000 });

const AIGNE_RUNTIME_MOUNT_POINT =
  window.blocklet?.componentMountPoints.find((i) => i.did === AI_RUNTIME_DID)?.mountPoint || "/";

export async function uploadImage({
  input,
}: { input: any }): Promise<{ uploads: { url: string }[] }> {
  return api
    .post("/api/images/upload", input, {
      baseURL: AIGNE_RUNTIME_MOUNT_POINT,
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
}
