import Avatar from "@arcblock/ux/lib/Avatar";
import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import { CustomComponentRenderer } from "@blocklet/pages-kit/components";
import { Icon } from "@iconify/react";
import { ArrowBackIosNewRounded } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  ClickAwayListener,
  Dialog,
  DialogContent,
  DialogTitle,
  Fab,
  Grow,
  IconButton,
  ListItemIcon,
  Popper,
  type PopperProps,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { type ReactNode, Suspense, useRef, useState } from "react";

import PopperMenuButton from "../../components/PopperMenuButton";
import LoadingMenuItem from "../../components/PopperMenuButton/LoadingMenuItem";
import ScrollView from "../../components/ScrollView";
import { useEntryAgent } from "../../contexts/EntryAgent";
import { RuntimeProvider } from "../../contexts/Runtime";
import { useSession } from "../../contexts/Session";
import { useAppearances, useProfile } from "../../hooks/use-appearances";

export interface ChatBotProps {
  aid: string;
  working?: boolean;
}

export default function ChatBotButton({ aid, working }: ChatBotProps) {
  return (
    <RuntimeProvider aid={aid} working={working}>
      <ChatBotContent />
    </RuntimeProvider>
  );
}

function ChatBotContent() {
  const anchorEl = useRef<HTMLDivElement>(null);

  const { aid } = useEntryAgent();
  const { appearancePage } = useAppearances({ aid });
  const profile = useProfile({ aid });

  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ position: "fixed", bottom: 32, right: 16, zIndex: "modal" }}>
      <Fab
        sx={{ width: 44, height: 44, boxShadow: open ? 0 : undefined }}
        onClick={() => setOpen(true)}
      >
        <Avatar
          size={44}
          did={window.blocklet?.appId!}
          variant="circle"
          shape="circle"
          // @ts-ignore
          src={profile.avatar}
        />
      </Fab>

      <Stack width="100%" ref={anchorEl} />

      {anchorEl.current && (
        <ResponsiveChatBotContainer
          anchorEl={anchorEl.current}
          open={open}
          onClose={() => setOpen(false)}
        >
          <ScrollView
            initialScrollBehavior="auto"
            component={Stack}
            sx={{
              overscrollBehavior: "contain",
              height: "100%",
              width: "100%",
              overflow: "auto",
              ".aigne-layout": {
                px: 2,
              },
            }}
          >
            <Suspense
              fallback={
                <Stack flexGrow={1} alignItems="center" justifyContent="center">
                  <CircularProgress size={24} />
                </Stack>
              }
            >
              <CustomComponentRenderer
                componentId={appearancePage.componentId}
                properties={appearancePage.componentProperties}
                props={{ hideHeaderMenuButton: true }}
              />
            </Suspense>
          </ScrollView>
        </ResponsiveChatBotContainer>
      )}
    </Box>
  );
}

function ResponsiveChatBotContainer({
  open,
  anchorEl,
  children,
  onClose,
}: {
  open: boolean;
  anchorEl: PopperProps["anchorEl"];
  children: ReactNode;
  onClose: () => void;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { aid } = useEntryAgent();
  const profile = useProfile({ aid });

  if (isMobile) {
    return (
      <ChatBotDialog title={profile.name} open={open} onClose={onClose}>
        {children}
      </ChatBotDialog>
    );
  }

  return (
    <ChatBotPopper anchorEl={anchorEl} title={profile.name} open={open} onClose={onClose}>
      {children}
    </ChatBotPopper>
  );
}

function ChatBotPopper({
  title,
  anchorEl,
  open,
  children,
  onClose,
}: {
  title?: string;
  anchorEl: PopperProps["anchorEl"];
  open: boolean;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <Popper
      anchorEl={anchorEl}
      open={open}
      disablePortal
      placement="top-end"
      transition
      sx={{
        zIndex: "modal",
        maxWidth: 500,
        maxHeight: "min(calc(100vh - 128px), 1000px)",
        width: 500,
        height: "90vh",
      }}
    >
      {({ TransitionProps }) => (
        <ClickAwayListener
          onClickAway={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose?.();
          }}
        >
          <Grow {...TransitionProps} style={{ transformOrigin: "right bottom" }} timeout={350}>
            <Stack
              sx={{
                height: "100%",
                boxShadow: 1,
                position: "relative",
                background: "white",
                borderRadius: 1,
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                borderBottom={1}
                borderColor="divider"
                p={2}
                gap={2}
              >
                <Typography variant="h6" noWrap sx={{ flex: 1, width: 1 }}>
                  {title}
                </Typography>

                <ChatMenuButton />

                <Button sx={{ minWidth: 28, minHeight: 28, p: 0 }} onClick={onClose}>
                  <Icon icon="tabler:x" fontSize={24} color="rgba(75, 85, 99, 1)" />
                </Button>
              </Stack>

              {children}
            </Stack>
          </Grow>
        </ClickAwayListener>
      )}
    </Popper>
  );
}

function ChatBotDialog({
  title,
  open,
  children,
  onClose,
}: {
  title?: string;
  open: boolean;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <DialogTitle sx={{ px: 1 }}>
        <Stack direction="row" alignItems="center" gap={2}>
          <IconButton size="small" onClick={onClose}>
            <ArrowBackIosNewRounded fontSize="inherit" />
          </IconButton>

          <Typography variant="h6" noWrap sx={{ flex: 1, width: 1 }}>
            {title}
          </Typography>

          <ChatMenuButton />
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }} dividers>
        {children}
      </DialogContent>
    </Dialog>
  );
}

function ChatMenuButton() {
  const { t } = useLocaleContext();
  const clearSession = useSession((s) => s.clearSession);

  return (
    <PopperMenuButton
      component={IconButton}
      PopperProps={{ placement: "bottom-end", sx: { zIndex: "snackbar" } }}
      menus={
        <LoadingMenuItem onClick={async () => clearSession()}>
          <ListItemIcon>
            <Icon icon="mingcute:broom-line" />
          </ListItemIcon>
          {t("clearSession")}
        </LoadingMenuItem>
      }
    >
      <Icon icon="tabler:dots" />
    </PopperMenuButton>
  );
}
