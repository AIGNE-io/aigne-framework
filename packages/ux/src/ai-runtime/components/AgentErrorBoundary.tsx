import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import { SubscriptionErrorType } from "@blocklet/ai-kit/api";
import { SubscribeErrorAlert } from "@blocklet/ai-kit/components";
import { Alert, Button, Stack, alertClasses } from "@mui/material";
import type { ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { useAgent } from "../contexts/Agent";
import { useEntryAgent } from "../contexts/EntryAgent";
import { useIsAgentAdmin } from "../hooks/use-agent-admin";
import { settingsDialogState } from "./AgentSettings/AgentSettingsDialog";

export function AgentErrorBoundary({ children }: { children?: ReactNode }) {
  return <ErrorBoundary FallbackComponent={AgentErrorView}>{children}</ErrorBoundary>;
}

export function AgentErrorView({ error }: { error: any }) {
  if (error.type === "MissingSecretError") {
    return <MissingSecretErrorView />;
  }

  if (error.type === SubscriptionErrorType.UNSUBSCRIBED) {
    return <SubscribeErrorAlert error={error} />;
  }

  // 隐藏 session#message 的请求超限错误
  if (error.type === "RequestExceededError") {
    return null;
  }

  return <Alert severity="error">{String(error?.message)}</Alert>;
}

function MissingSecretErrorView() {
  const { t } = useLocaleContext();
  const agent = useAgent({ aid: useEntryAgent().aid });
  const isAdmin = useIsAgentAdmin(agent);

  const allSecretsHasValue = agent.config.secrets.every((i) => i.hasValue);

  return (
    <Alert
      severity={allSecretsHasValue ? "info" : "error"}
      sx={{ [`.${alertClasses.message}`]: { flex: 1 } }}
    >
      <Stack width="100%">
        {allSecretsHasValue
          ? "Configuration successful, you can continue to use it now!"
          : "The required configuration is missing. Please complete the setup before proceeding!"}

        {isAdmin && (
          <Stack alignItems="flex-end">
            <Button
              size="small"
              variant="outlined"
              onClick={() => settingsDialogState.getState().open()}
            >
              {t("setup")}
            </Button>
          </Stack>
        )}
      </Stack>
    </Alert>
  );
}
