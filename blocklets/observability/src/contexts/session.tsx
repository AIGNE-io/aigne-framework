import { createAuthServiceSessionContext } from "@arcblock/did-connect/lib/Session";
import { useContext } from "react";

const { SessionProvider, SessionContext, SessionConsumer, withSession } =
  createAuthServiceSessionContext();

function useSessionContext() {
  const info = useContext(SessionContext);
  return info;
}

export { SessionProvider, SessionContext, SessionConsumer, useSessionContext, withSession };
