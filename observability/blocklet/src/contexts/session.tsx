import { createAuthServiceSessionContext } from "@arcblock/did-connect-react/lib/Session";
import { useContext } from "react";

const { SessionProvider, SessionContext, SessionConsumer, withSession } =
  createAuthServiceSessionContext();

function useSessionContext() {
  const info = useContext<{ session: import("@blocklet/sdk/lib/util/login").SessionUser }>(
    SessionContext,
  );
  return info;
}

export { SessionProvider, SessionContext, SessionConsumer, useSessionContext, withSession };
