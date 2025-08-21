import { createAuthServiceSessionContext } from "@arcblock/did-connect/lib/Session";
import { useContext, useMemo } from "react";

const { SessionProvider, SessionContext, SessionConsumer, withSession } =
  createAuthServiceSessionContext();

export function useSessionContext(): any {
  const ctx: any = useContext(SessionContext);
  const data = useMemo(
    () => ({ ...ctx, isAdmin: ["admin", "owner"].includes(ctx?.session?.user?.role) }),
    [ctx],
  );

  return data;
}

export { SessionProvider, SessionContext, SessionConsumer, withSession };

export function useIsRole(...roles: string[]) {
  const { session } = useSessionContext();
  return roles.includes(session.user?.role);
}
