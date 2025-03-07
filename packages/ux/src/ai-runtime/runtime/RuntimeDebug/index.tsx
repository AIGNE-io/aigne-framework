import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import RelativeTime from "@arcblock/ux/lib/RelativeTime";
import Toast from "@arcblock/ux/lib/Toast";
import MessageXIcon from "@iconify-icons/tabler/message-x";
import PlusIcon from "@iconify-icons/tabler/plus";
import TrashIcon from "@iconify-icons/tabler/trash";
import WandIcon from "@iconify-icons/tabler/wand";
import { Icon } from "@iconify/react";
import {
  Box,
  CircularProgress,
  Divider,
  MenuItem,
  Select,
  Stack,
  ThemeProvider,
  Tooltip,
  Typography,
  selectClasses,
  useTheme,
} from "@mui/material";
import pick from "lodash/pick";
import { Suspense } from "react";

import AgentSettingsDialog from "../../components/AgentSettings/AgentSettingsDialog";
import CustomComponentRenderer from "../../components/CustomComponentRenderer/CustomComponentRenderer";
import LoadingButton from "../../components/LoadingButton";
import ScrollView from "../../components/ScrollView";
import type { AIGNEApiContextValue } from "../../contexts/Api";
import { useDebugDialog } from "../../contexts/Debug";
import { useEntryAgent } from "../../contexts/EntryAgent";
import { RuntimeProvider } from "../../contexts/Runtime";
import { SessionProvider, useSession } from "../../contexts/Session";
import { useSessions } from "../../contexts/Sessions";
import { useAppearances } from "../../hooks/use-appearances";

export default function RuntimeDebug({
  aid,
  ApiProps,
  hideSessionsBar,
}: {
  aid: string;
  ApiProps?: Partial<AIGNEApiContextValue>;
  hideSessionsBar?: boolean;
}) {
  const hostTheme = useTheme();

  return (
    <RuntimeProvider aid={aid} working ApiProps={ApiProps} debug>
      {!hideSessionsBar && (
        <ThemeProvider theme={hostTheme}>
          <SessionsBar />

          <Divider />
        </ThemeProvider>
      )}

      <DebugView />
    </RuntimeProvider>
  );
}

function DebugView() {
  return (
    <Suspense
      fallback={
        <Box textAlign="center" my={4}>
          <CircularProgress size={24} />
        </Box>
      }
    >
      <Stack
        sx={{
          flex: 1,
          flexDirection: "column",
          overflow: "hidden",
          transform: "translate(0,0)",
        }}
      >
        <ScrollView
          initialScrollBehavior="auto"
          scroll="element"
          component={Stack}
          sx={{
            flex: 1,
            overflow: "auto",
            overscrollBehavior: "contain",
            position: "relative",
            "> .ai-runtime-custom-component-renderer": {
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          <AgentView />

          <AgentSettingsDialog />
        </ScrollView>
      </Stack>
    </Suspense>
  );
}

function AgentView() {
  const { aid } = useEntryAgent();
  const { appearancePage } = useAppearances();

  return (
    <CustomComponentRenderer
      aid={aid}
      output={appearancePage.outputSettings}
      componentId={appearancePage.componentId}
      properties={appearancePage.componentProperties}
      props={appearancePage.componentProps}
    />
  );
}

function SessionsBar() {
  const { locale } = useLocaleContext();

  const { sessions, loaded, createSession, setCurrentSessionId, currentSessionId } = useSessions(
    (s) =>
      pick(s, ["sessions", "loaded", "createSession", "setCurrentSessionId", "currentSessionId"]),
  );

  const setOpen = useDebugDialog((s) => s.setOpen);

  const newSession = async () => {
    try {
      const session = await createSession({});
      setCurrentSessionId(session.id);
    } catch (error) {
      Toast.error(error.message);
      throw error;
    }
  };

  return (
    <Stack p={2} direction="row" alignItems="center" gap={2}>
      {loaded && !sessions?.length ? (
        <LoadingButton onClick={newSession}>New Session</LoadingButton>
      ) : (
        <>
          <Select
            variant="standard"
            disableUnderline
            size="small"
            autoWidth
            placeholder="Select a session"
            displayEmpty
            value={currentSessionId || ""}
            onChange={(e) => setCurrentSessionId(e.target.value)}
            sx={{
              maxWidth: 200,
              [`.${selectClasses.select}`]: {
                py: 0.5,
                "&:focus": {
                  background: "transparent",
                },
              },
            }}
          >
            <MenuItem disabled value="">
              <Typography fontStyle="italic" color="text.secondary">
                Select session
              </Typography>
            </MenuItem>

            {sessions?.map((session) => (
              <MenuItem key={session.id} value={session.id}>
                {session.name || (
                  <RelativeTime
                    value={session.updatedAt}
                    type="absolute"
                    locale={locale}
                    withoutSuffix={undefined}
                    from={undefined}
                    to={undefined}
                    tz={undefined}
                    relativeRange={undefined}
                  />
                )}
              </MenuItem>
            ))}
          </Select>

          <Tooltip title="New session">
            <LoadingButton onClick={newSession} sx={{ minWidth: 32, minHeight: 32, p: 0 }}>
              <Icon icon={PlusIcon} fontSize={18} />
            </LoadingButton>
          </Tooltip>
        </>
      )}

      <Box flex={1} />

      <LoadingButton onClick={() => setOpen?.(true)} sx={{ minWidth: 32, minHeight: 32, p: 0 }}>
        <Icon icon={WandIcon} fontSize={18} />
      </LoadingButton>

      {currentSessionId && (
        <Suspense>
          <SessionProvider sessionId={currentSessionId}>
            <SessionActions />
          </SessionProvider>
        </Suspense>
      )}
    </Stack>
  );
}

function SessionActions() {
  const deleteSession = useSessions((s) => s.deleteSession);
  const { clearSession, sessionId } = useSession((s) => pick(s, "clearSession", "sessionId"));

  if (!sessionId) return null;

  return (
    <>
      <Tooltip title="Clean messages">
        <LoadingButton onClick={clearSession} sx={{ minWidth: 32, minHeight: 32, p: 0 }}>
          <Icon icon={MessageXIcon} fontSize={18} />
        </LoadingButton>
      </Tooltip>

      <Tooltip title="Delete current session">
        <LoadingButton
          onClick={() => deleteSession({ sessionId })}
          color="error"
          sx={{ minWidth: 32, minHeight: 32, p: 0 }}
        >
          <Icon icon={TrashIcon} fontSize={18} />
        </LoadingButton>
      </Tooltip>
    </>
  );
}
