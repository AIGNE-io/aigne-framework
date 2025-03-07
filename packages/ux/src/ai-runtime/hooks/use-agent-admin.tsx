import type { Agent } from "../api/agent";
import { useSessionContext } from "../utils/session";

const ADMIN_ROLES = ["admin", "owner"];

export function useIsAgentAdmin(agent: Agent) {
  const { session } = useSessionContext();
  if (!session.user) return false;

  if (ADMIN_ROLES.includes(session.user.role)) return true;

  return session.user.did === agent.createdBy || session.user.did === agent.project.createdBy;
}
