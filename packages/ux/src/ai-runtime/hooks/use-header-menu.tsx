import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import { useHeader } from "@blocklet/pages-kit/builtin/page/header";
import { Icon } from "@iconify/react";
import { IconButton, ListItemIcon, MenuItem } from "@mui/material";

import { settingsDialogState } from "../components/AgentSettings/AgentSettingsDialog";
import PopperMenuButton from "../components/PopperMenuButton";
import LoadingMenuItem from "../components/PopperMenuButton/LoadingMenuItem";
import { useAgent } from "../contexts/Agent";
import { useComponentPreferences } from "../contexts/ComponentPreferences";
import { useEntryAgent } from "../contexts/EntryAgent";
import { useSession } from "../contexts/Session";
import { useIsAgentAdmin } from "./use-agent-admin";

export function useHeaderMenu() {
  const { t, locale } = useLocaleContext();
  const { hideHeaderMenuButton } =
    useComponentPreferences<{ hideHeaderMenuButton?: boolean }>() ?? {};

  const clearSession = useSession((s) => s.clearSession);

  const { aid } = useEntryAgent();
  const agent = useAgent({ aid });
  const isAdmin = useIsAgentAdmin(agent);
  const hasSettings = agent.config.secrets.length > 0;

  useHeader(
    () =>
      hideHeaderMenuButton
        ? {}
        : {
            addons: (exists) => [
              <PopperMenuButton
                data-testid="aigne-runtime-header-menu-button"
                component={IconButton}
                PopperProps={{
                  placement: "bottom-end",
                  sx: { zIndex: "appBar" },
                }}
                menus={[
                  hasSettings && isAdmin && (
                    <MenuItem key="settings" onClick={() => settingsDialogState.getState().open()}>
                      <ListItemIcon>
                        <Icon icon="tabler:settings" />
                      </ListItemIcon>
                      {t("settings")}
                    </MenuItem>
                  ),

                  <LoadingMenuItem key="clearSession" onClick={async () => clearSession()}>
                    <ListItemIcon>
                      <Icon icon="mingcute:broom-line" />
                    </ListItemIcon>
                    {t("clearSession")}
                  </LoadingMenuItem>,
                ]}
              >
                <Icon icon="tabler:dots" />
              </PopperMenuButton>,
              ...exists,
            ],
          },
    [locale, hideHeaderMenuButton],
  );
}
