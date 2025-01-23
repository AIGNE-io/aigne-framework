import Empty from "@arcblock/ux/lib/Empty";
import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import RelativeTime from "@arcblock/ux/lib/RelativeTime";
import { CustomComponentRenderer } from "@blocklet/pages-kit/components";
import { Icon } from "@iconify/react";
import { Masonry } from "@mui/lab";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  Stack,
  ThemeProvider,
  Tooltip,
  Typography,
  createTheme,
  useTheme,
} from "@mui/material";
import pick from "lodash/pick";
import {
  type RefObject,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { AgentErrorView } from "../../components/AgentErrorBoundary";
import { useActiveAgent } from "../../contexts/ActiveAgent";
import { useAgent } from "../../contexts/Agent";
import { CurrentAgentProvider } from "../../contexts/CurrentAgent";
import { CurrentMessageProvider } from "../../contexts/CurrentMessage";
import { useEntryAgent } from "../../contexts/EntryAgent";
import {
  type MessageItem,
  SessionProvider,
  useSession,
} from "../../contexts/Session";
import { useSessions } from "../../contexts/Sessions";
import { useAppearances } from "../../hooks/use-appearances";
import mapRight from "../../utils/map-right";
import { CodeRenderByMessageMemo as CodeRenderByMessage } from "./components/CodePreview";
import ConfirmDialog from "./components/ConfirmDialog";
import Loading from "./components/Loading";
import UserQuestion from "./components/UserQuestion";
import { V0RuntimeProvider, useV0RuntimeContext } from "./contexts/V0Runtime";
import { getLineClamp } from "./utils";

const sliderWidth = 200;

function V0Page({
  textColor = "#333",
  primaryColor = "#333",
}: { textColor?: string; primaryColor?: string }) {
  const inheritedTheme = useTheme();

  const theme = useMemo(() => {
    let { primary } = inheritedTheme.palette;
    try {
      if (primaryColor) {
        primary = inheritedTheme.palette.augmentColor({
          color: { main: primaryColor },
        });
      }
    } catch (error) {
      console.error("augment primary color error", { error });
    }

    return createTheme(inheritedTheme, {
      palette: { primary, textColor, background: { block: "#f6f6f6" } },
      shape: {
        borderRadius: 8,
      },
    });
  }, [inheritedTheme, primaryColor, textColor]);

  const currentSessionId = useSession((s) => s.sessionId);
  const error = useSession((s) => s.error);

  const { aid: activeAid } = useActiveAgent();

  const { isMobile } = useV0RuntimeContext();

  return (
    <ThemeProvider theme={theme}>
      <CurrentAgentProvider aid={activeAid}>
        <Box flex={1}>
          <Container
            sx={{
              height: "100%",
              textAlign: "center",
              pt: 3,
              gap: 2,
              display: "flex",
              flexDirection: "column",
              position: "relative",
              ".code-preview-wrapper": {},
            }}
          >
            <Box
              sx={{
                flex: 1,
                height:
                  !isMobile && currentSessionId
                    ? "calc(100% - 48px - 16px - 16px)"
                    : "unset",
              }}
            >
              {currentSessionId ? <V0DetailRender /> : <V0ListRender />}
            </Box>

            {error && <AgentErrorView error={error} />}

            <Box
              sx={{
                position: "sticky",
                bottom: 0,
                backgroundColor: "white",
                py: 2,
                pt: currentSessionId ? 0 : 2,
                zIndex: 1100,
              }}
            >
              <AgentInputRender />
            </Box>
          </Container>
        </Box>
      </CurrentAgentProvider>
    </ThemeProvider>
  );
}

export default function Page() {
  return (
    <V0RuntimeProvider>
      <V0Page />
    </V0RuntimeProvider>
  );
}

function V0ListRender() {
  const ConfirmDialogRef = useRef<any>(undefined);
  const { sessions: sessionsList, loading } = useSessions((s) => s);

  const { isMobile } = useV0RuntimeContext();
  const agent = useAgent({ aid: useEntryAgent().aid });
  const { t } = useLocaleContext();

  return (
    <Box key="list-render" flex={1}>
      <Typography
        variant="h2"
        color="textColor"
        sx={{ fontWeight: "bold", mt: isMobile ? 3 : 6 }}
      >
        {agent?.project?.name || t("v0.title")}
      </Typography>
      <Typography
        variant="h5"
        color="textColor"
        sx={{
          ...getLineClamp(5),
          mt: 2,
        }}
      >
        {agent?.project?.description || t("v0.description")}
      </Typography>

      {loading ? (
        <Loading
          sx={{
            position: "relative",
            height: "40vh",
            width: "100%",
          }}
        />
      ) : (
        <Box
          sx={{
            mt: isMobile ? 4 : 8,
            display: "flex",
            alignContent: "center",
            justifyContent: "center",
          }}
        >
          {sessionsList?.length ? (
            <Masonry
              key="masonry-list"
              columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
              sequential
              spacing={2}
            >
              {sessionsList?.map((item) => (
                <Suspense
                  key={item.id}
                  fallback={
                    <Stack alignItems="center" justifyContent="center" my={4}>
                      <CircularProgress size={24} />
                    </Stack>
                  }
                >
                  <SessionProvider sessionId={item.id}>
                    <ItemView
                      key={item.id}
                      ConfirmDialogRef={ConfirmDialogRef}
                    />
                  </SessionProvider>
                </Suspense>
              ))}
            </Masonry>
          ) : (
            <Box
              sx={{
                mt: 12,
              }}
            >
              <Empty>{t("v0.noData")}</Empty>
            </Box>
          )}

          <ConfirmDialog ref={ConfirmDialogRef} />
        </Box>
      )}
    </Box>
  );
}

function ItemView({
  ConfirmDialogRef,
}: { ConfirmDialogRef: RefObject<{ open?: Function }> }) {
  const { t } = useLocaleContext();
  const { setCurrentSessionId, deleteSession } = useSessions((s) =>
    pick(s, "setCurrentSessionId", "deleteSession"),
  );
  const { session, latestMessage } = useSession((s) => ({
    session: s.session,
    latestMessage: s.messages?.at(0),
  }));

  if (!session) return null;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Box
        sx={{
          border: 2,
          borderRadius: 1,
          borderColor: "background.block",
          backgroundColor: "background.block",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.3s",
          overflow: "hidden",
          // minHeight: sliderWidth,
          // maxHeight: '50vh',
          height: 300,
          "&:hover": {
            borderColor: "primary.main",
          },
        }}
        onClick={() => {
          setCurrentSessionId(session.id);
        }}
      >
        <CodeRenderByMessage
          zoom={0.5}
          message={latestMessage}
          sx={{
            pointerEvents: "none",
          }}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <UserQuestion question={session.name} />
        {/* actions */}
        <Box>
          {/* delete */}
          <IconButton
            color="error"
            size="small"
            onClick={() => {
              ConfirmDialogRef?.current?.open?.({
                title: t("v0.deleteSessionTitle", { name: session.name! }),
                children: <Box>{t("v0.deleteSessionTip")}</Box>,
                onConfirm: async () => {
                  await deleteSession({
                    sessionId: session.id,
                  });
                },
                onConfirmProps: {
                  color: "error",
                  children: t("delete"),
                },
                onCancelProps: {
                  color: "inherit",
                },
              });
            }}
          >
            <Icon icon="tabler:trash" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

function V0DetailRender() {
  const { setCurrentSessionId } = useSessions((s) =>
    pick(s, "setCurrentSessionId"),
  );
  const { messages: messagesListOriginal, loading } = useSession((s) =>
    pick(s, "messages", "loading"),
  );
  const {
    currentMessageTaskId,
    setCurrentMessageTaskId,
    propertiesValueMap,
    isMobile,
  } = useV0RuntimeContext();
  const [sliderOpenInMobile, setSliderOpenInMobile] = useState(!isMobile);
  const { t } = useLocaleContext();

  // FIXME: 现在临时把 error 的消息隐藏了，后续需要优化
  const messagesList =
    messagesListOriginal?.filter(
      (message, index) =>
        (!message?.error && message?.outputs?.objects?.length) ||
        message.id === currentMessageTaskId ||
        index === 0,
    ) ?? [];
  const currentMessage = messagesList.find(
    (message) => message.id === currentMessageTaskId,
  );

  useEffect(() => {
    if (messagesList.length) {
      const latestMessage = messagesList?.at(0);

      // no currentMessageTaskId or has new message
      if (
        !currentMessageTaskId ||
        (currentMessageTaskId === latestMessage?.id && messagesList.length > 1)
      ) {
        // @ts-ignore
        setCurrentMessageTaskId(latestMessage.id);
      }
    }
  }, [messagesList, currentMessageTaskId]);

  const sliderOpen = isMobile ? sliderOpenInMobile : true;

  const sliderWrapperSx = {
    height: isMobile ? "unset" : "100%",
    backgroundColor: "background.block",
    borderRadius: 1,
    p: 2,
    position: "relative",
  };

  return (
    <Box
      flex={1}
      sx={{
        display: "flex",
        gap: 2,
        height: "100%",
        flexDirection: isMobile ? "column" : "row",
      }}
    >
      <Box
        key="slider"
        sx={{
          width: isMobile ? "100%" : sliderWidth,
          gap: 2,
          display: "flex",
          flexDirection: "column",
          ...(isMobile ? {} : { ...sliderWrapperSx }),
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            size="small"
            startIcon={<Icon icon="tabler:chevron-left" />}
            onClick={() => {
              setCurrentMessageTaskId(undefined);
              setCurrentSessionId("");
            }}
            sx={{
              backgroundColor: "white",
              width: isMobile ? "auto" : "100%",
            }}
          >
            {t("back")}
          </Button>

          {/* isMobile 下，点击向上向下按钮，支持展开和收起 slider */}
          {isMobile ? (
            <Button
              startIcon={
                <Icon
                  icon={
                    sliderOpenInMobile
                      ? "tabler:chevron-up"
                      : "tabler:chevron-down"
                  }
                />
              }
              size="small"
              onClick={() => setSliderOpenInMobile(!sliderOpenInMobile)}
            >
              {sliderOpenInMobile ? t("v0.hideSlider") : t("v0.showSlider")}
            </Button>
          ) : null}

          {loading && (
            <Loading
              sx={{
                position: "absolute",
                zIndex: 99999,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                margin: "auto",
                background: "rgba(255, 255, 255, 0.8)",
                opacity: 0.8,
                borderRadius: 1,
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                ...(isMobile
                  ? {
                      width: "40px",
                      height: "40px",
                    }
                  : {
                      width: "80px",
                      height: "80px",
                    }),
              }}
            />
          )}
        </Box>

        {sliderOpen && (
          <Stack
            spacing={2}
            direction={isMobile ? "row" : "column"}
            sx={{
              ...(isMobile
                ? {
                    overflowY: "hidden",
                    overflowX: "auto",
                    ...sliderWrapperSx,
                  }
                : {
                    overflowY: "auto",
                    overflowX: "hidden",
                  }),
              // scrollbarWidth: 'thin',
              // scrollbarColor: 'grey transparent',
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            {mapRight(messagesList, (item, i) => {
              const { inputs: parameters, id: taskId, updatedAt } = item;
              const isCurrent = taskId === (currentMessageTaskId || undefined);

              return (
                <Box
                  key={taskId}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <Box
                    key={taskId}
                    id={taskId} // for scroll to
                    onClick={() => {
                      // @ts-ignore
                      setCurrentMessageTaskId(item.id);
                    }}
                    sx={{
                      cursor: "pointer",
                      color: "textColor",
                      borderRadius: 1,
                      border: 1,
                      borderColor: isCurrent
                        ? "primary.main"
                        : "background.block",
                      backgroundColor: "white",
                      position: "relative",
                      transition: "all 0.3s",
                      "&:hover": {
                        borderColor: "primary.main",
                      },
                      ...(isMobile
                        ? {
                            width: sliderWidth / 2,
                            height: sliderWidth / 2,
                          }
                        : {
                            minHeight: sliderWidth / 2,
                            maxHeight: "50vh",
                          }),
                    }}
                  >
                    <CodeRenderByMessage
                      zoom={0.25}
                      message={item}
                      sx={{
                        pointerEvents: "none",
                      }}
                      propertiesValueMap={propertiesValueMap}
                    />
                    <Tooltip
                      key={taskId}
                      placement="right"
                      arrow
                      PopperProps={
                        {
                          // disablePortal: true,
                        }
                      }
                      TransitionProps={{
                        timeout: {
                          appear: 500,
                          enter: 500,
                          exit: 0,
                        },
                      }}
                      title={
                        <Box>
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: "white",
                            }}
                          >
                            {parameters?.question}
                          </Typography>

                          <Box
                            sx={{
                              fontSize: 12,
                              opacity: 0.75,
                            }}
                          >
                            {/* @ts-ignore */}
                            <RelativeTime value={updatedAt} />
                          </Box>
                        </Box>
                      }
                    >
                      <Chip
                        label={`V${messagesList.length - i - 1}`}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontWeight: 500,
                          fontSize: 10,
                          height: 20,
                          position: "absolute",
                          bottom: 4,
                          right: 4,
                          backgroundColor: "background.block",
                          borderColor: isCurrent ? "primary.main" : "textColor",
                          color: isCurrent ? "primary.main" : "textColor",
                          borderRadius: 1,
                        }}
                      />
                    </Tooltip>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>

      <Box
        sx={{
          borderRadius: 1,
          backgroundColor: "background.block",
          flex: 1,
          maxWidth: isMobile ? "100%" : `calc(100% - ${sliderWidth}px - 16px)`,
        }}
      >
        {currentMessage && <AgentOutputRender message={currentMessage} />}
      </Box>
    </Box>
  );
}

function AgentInputRender() {
  const { appearanceInput } = useAppearances();

  if (!appearanceInput?.componentId) return null;

  return (
    <Suspense>
      <CustomComponentRenderer
        componentId={appearanceInput.componentId}
        properties={appearanceInput.componentProperties}
      />
    </Suspense>
  );
}

function AgentOutputRender({ message }: { message: MessageItem }) {
  const { appearanceOutput } = useAppearances();

  if (!appearanceOutput?.componentId || !message) return null;

  return (
    <CurrentAgentProvider aid={message.aid}>
      <CurrentMessageProvider message={message}>
        <Suspense>
          <CustomComponentRenderer
            key={message.id}
            componentId={appearanceOutput.componentId}
            properties={appearanceOutput.componentProperties}
            fallbackRender={AgentErrorView}
          />
        </Suspense>
      </CurrentMessageProvider>
    </CurrentAgentProvider>
  );
}
