import { Box, CircularProgress, Stack, alpha } from "@mui/material";
import { useEffect } from "react";
import { useScrollToBottom } from "react-scroll-to-bottom";

import CustomComponentRenderer from "../../components/CustomComponentRenderer/CustomComponentRenderer";
import SimpleLayout from "../../components/Layout/SimpleLayout";
import { useActiveAgent } from "../../contexts/ActiveAgent";
import {
  type ComponentPreferencesBase,
  ComponentPreferencesProvider,
  useComponentPreferences,
} from "../../contexts/ComponentPreferences";
import { CurrentAgentProvider } from "../../contexts/CurrentAgent";
import { useEntryAgent } from "../../contexts/EntryAgent";
import { useSession } from "../../contexts/Session";
import { useProfile } from "../../hooks/use-appearances";
import BackgroundImage from "./BackgroundImage";
import InputsView from "./InputsView";
import MessagesView from "./MessagesView";

export interface SimpleChatPreferences extends ComponentPreferencesBase {
  divider?: boolean;
  hideUserInputs?: boolean;
  hideAgentAvatar?: boolean;
  backgroundImage?: { url?: string; width?: number; height?: number };
  hideInputs?: boolean;
}

export default function SimpleChat({
  ...preferences
}: {} & SimpleChatPreferences) {
  return (
    <ComponentPreferencesProvider {...preferences}>
      <BackgroundImage />
      <SimpleChatView />
    </ComponentPreferencesProvider>
  );
}

function SimpleChatView() {
  const preferences = useComponentPreferences<SimpleChatPreferences>();
  const { aid: activeAid } = useActiveAgent();

  const { running, loading } = useSession((s) => ({
    running: s.running,
    loading: s.loading,
  }));

  const scrollToBottom = useScrollToBottom();

  // auto scroll to bottom when new message is sent
  useEffect(() => {
    if (running) scrollToBottom({ behavior: "smooth" });
  }, [scrollToBottom, running]);

  return (
    <SimpleLayout>
      <CurrentAgentProvider aid={activeAid}>
        <HeaderView />

        {loading ? (
          <Box textAlign="center" my={10}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            <MessagesView
              className="aigne-outputs aigne-simple-chat-outputs"
              flexGrow={1}
              pb={10}
              px={{ xs: 2, sm: 3 }}
            />

            {!preferences?.hideInputs && (
              <InputsView
                className="aigne-inputs aigne-simple-chat-inputs"
                collapsible
                sx={{
                  position: "sticky",
                  bottom: 0,
                  zIndex: 10,
                  borderRadius: 1,
                  bgcolor: (theme) =>
                    alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: "blur(16px)",
                }}
              />
            )}
          </>
        )}
      </CurrentAgentProvider>
    </SimpleLayout>
  );
}

function HeaderView() {
  const { aid } = useEntryAgent();
  const profile = useProfile({ aid });

  const preferences = useComponentPreferences<SimpleChatPreferences>();
  const hasBg = !!preferences?.backgroundImage?.url;

  return (
    <Stack px={4} sx={{ color: hasBg ? "white" : undefined }}>
      <CustomComponentRenderer
        aid={aid}
        output={profile.outputSettings}
        componentId={profile.appearance.componentId}
        properties={profile.appearance.componentProperties}
        props={profile.appearance.componentProps}
      />
    </Stack>
  );
}
