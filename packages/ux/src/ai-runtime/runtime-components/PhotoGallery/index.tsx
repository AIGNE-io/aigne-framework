import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import { Masonry } from "@mui/lab";
import {
  Box,
  Skeleton,
  Stack,
  type StackProps,
  Typography,
} from "@mui/material";
import { Suspense, memo, useRef } from "react";
import Balancer from "react-wrap-balancer";

import { AgentErrorView } from "../../components/AgentErrorBoundary";
import CustomComponentRenderer from "../../components/CustomComponentRenderer/CustomComponentRenderer";
import SimpleLayout from "../../components/Layout/SimpleLayout";
import LoadingButton from "../../components/LoadingButton";
import { useActiveAgent } from "../../contexts/ActiveAgent";
import {
  type ComponentPreferencesBase,
  ComponentPreferencesProvider,
} from "../../contexts/ComponentPreferences";
import { CurrentAgentProvider } from "../../contexts/CurrentAgent";
import { CurrentMessageProvider } from "../../contexts/CurrentMessage";
import { useEntryAgent } from "../../contexts/EntryAgent";
import { type MessageItem, useSession } from "../../contexts/Session";
import { useAppearances, useProfile } from "../../hooks/use-appearances";
import InputsView from "../SimpleChat/InputsView";
import OpeningMessageView from "../SimplePage/OpeningMessageView";

export interface GalleryLayoutPreferences extends ComponentPreferencesBase {
  resultTitle?: string;
}

export default function PhotoGallery({
  ...preferences
}: GalleryLayoutPreferences) {
  const { aid: activeAid } = useActiveAgent();

  return (
    <ComponentPreferencesProvider {...preferences}>
      <SimpleLayout pb={4}>
        <CurrentAgentProvider aid={activeAid}>
          <HeaderView px={{ xs: 2, sm: 3 }} />

          <OpeningMessageView my={4} px={{ xs: 2, sm: 3 }} />

          <InputsView className="aigne-inputs aigne-photo-wall-inputs" />

          <OutputView
            resultTitle={preferences.resultTitle}
            className="aigne-outputs aigne-photo-wall-outputs"
          />
        </CurrentAgentProvider>
      </SimpleLayout>
    </ComponentPreferencesProvider>
  );
}

function NoOutputs() {
  return (
    <Stack mt={10}>
      <Typography color="text.disabled">
        You haven't generated any pictures yet.
      </Typography>
    </Stack>
  );
}

function OutputView({
  resultTitle,
  ...props
}: { resultTitle?: string } & StackProps) {
  const { t } = useLocaleContext();

  const ref = useRef<HTMLDivElement>(null);

  const {
    error,
    messages = [],
    running,
    loaded,
    noMoreMessage,
    loadMoreMessages,
  } = useSession((s) => s);

  return (
    <Stack
      width="100%"
      alignItems="center"
      px={{ xs: 2, sm: 3 }}
      mt={{ xs: 2, sm: 3 }}
      gap={2}
      {...props}
    >
      {resultTitle && (
        <Typography
          width="100%"
          component="h2"
          fontSize={36}
          fontWeight={700}
          textAlign="center"
        >
          <Balancer>{resultTitle}</Balancer>
        </Typography>
      )}

      {loaded && !messages.length && <NoOutputs />}

      {error && <AgentErrorView error={error} />}

      <Masonry
        ref={ref}
        columns={{ xs: 2, sm: 3, md: 4, lg: 5 }}
        spacing={1}
        sequential
        sx={{
          width: "100%",
          overflow: "hidden",
          "> *": { borderRadius: 1, minHeight: 100 },
        }}
      >
        {running && (
          <Skeleton
            variant="rectangular"
            sx={{
              // FIXME: default using history height
              height: ref.current?.querySelector("*")?.clientHeight ?? 200,
            }}
          />
        )}

        {messages.map((message) => (
          <OutputItemView key={message.id} message={message} />
        ))}
      </Masonry>

      <Box my={4}>
        {!!messages.length && !noMoreMessage && (
          <LoadingButton variant="outlined" onClick={() => loadMoreMessages()}>
            {t("loadMore")}
          </LoadingButton>
        )}
      </Box>
    </Stack>
  );
}

const OutputItemView = memo(({ message }: { message: MessageItem }) => {
  const { appearanceOutput } = useAppearances({ aid: message.aid });

  return (
    <CurrentAgentProvider key={message.id} aid={message.aid}>
      <CurrentMessageProvider message={message}>
        <Suspense>
          <CustomComponentRenderer
            key={message.id}
            aid={message.aid}
            output={appearanceOutput.outputSettings}
            componentId={appearanceOutput.componentId}
            properties={appearanceOutput.componentProperties}
            fallbackRender={AgentErrorView}
          />
        </Suspense>
      </CurrentMessageProvider>
    </CurrentAgentProvider>
  );
});

function HeaderView({ ...props }: StackProps) {
  const { aid } = useEntryAgent();
  const profile = useProfile({ aid });

  return (
    <Stack {...props}>
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
