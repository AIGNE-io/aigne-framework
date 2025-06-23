import { createServer } from "node:net";
import { promiseWithResolvers } from "./promise.js";

function checkPortInUse(port: number, host = "0.0.0.0") {
  const { promise, resolve, reject } = promiseWithResolvers<boolean>();
  const server = createServer();

  server.once("error", (err: ErrnoException) => {
    if (err.code === "EADDRINUSE") resolve(true);
    else reject(err);
  });

  server.once("listening", () => {
    server.close(() => resolve(false));
  });

  server.listen(port, host);
  return promise;
}

async function detect(startPort: number) {
  let port = startPort;
  while (await checkPortInUse(port)) port++;
  return port;
}

export default detect;
