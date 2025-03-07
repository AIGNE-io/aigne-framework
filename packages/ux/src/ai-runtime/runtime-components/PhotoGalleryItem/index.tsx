import { RuntimeOutputVariable } from "@aigne/agent-v1/types";
import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import RelativeTime from "@arcblock/ux/lib/RelativeTime";
import { Icon } from "@iconify/react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  type DialogProps,
  DialogTitle,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { useMemo, useState } from "react";
import { withQuery } from "ufo";
import ActionButton from "../../components/ActionButton";
import ShareActions from "../../components/ShareActions";
import UserInfo from "../../components/UserInfo";
import { useAgent } from "../../contexts/Agent";
import { useCurrentMessage } from "../../contexts/CurrentMessage";
import { isValidInput } from "../../utils/agent-inputs";
import { useSessionContext } from "../../utils/session";

const getLineClamp = (line: number) => ({
  display: "-webkit-box",
  WebkitLineClamp: line,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  overflowWrap: "break-word",
  textOverflow: "ellipsis",
  whiteSpace: "wrap",
});

export default function PhotoGalleryItem() {
  const { message } = useCurrentMessage();
  const [openDialog, setOpenDialog] = useState(false);

  const objects = message.outputs?.objects ?? [];

  const images = objects.flatMap((i) => i?.[RuntimeOutputVariable.images] ?? []);
  if (!images.length && message.error) throw new Error(message.error.message);

  return images.map(({ url }, index) => (
    <Box
      key={url}
      sx={{
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        "&:hover": {
          ".photo-wall-item-alt": {
            opacity: 1,
          },
        },
      }}
      onClick={() => setOpenDialog(true)}
    >
      <Box
        component="img"
        src={withQuery(url, { imageFilter: "resize", w: 500 })}
        alt=""
        width="100%"
        height="100%"
        // 首屏 image 不能用 lazy，会闪烁乱序
        loading={index < 12 ? "eager" : "lazy"}
      />
      <Box
        className="photo-wall-item-alt"
        sx={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          width: "100%",
          height: "100%",
          px: 1.5,
          py: 1,
          display: "flex",
          alignItems: "flex-end",
          fontWeight: 500,
          fontSize: 13,
          color: "white",
          background: "linear-gradient(to bottom, rgba(2, 7, 19, 0) 0%, rgba(2, 7, 19, 0.8) 100%)",
          opacity: 0,
          transition: "opacity 0.3s",
        }}
      >
        <Box
          sx={{
            lineHeight: 1.5,
            ...getLineClamp(3),
          }}
        >
          {message.inputs?.question}
        </Box>
      </Box>

      {openDialog && (
        <PromptDialog
          open
          url={url}
          onClose={(e: Event) => {
            e.stopPropagation();
            e.preventDefault();
            setOpenDialog(false);
          }}
        />
      )}
    </Box>
  ));
}

function RenderSubTitle({ children }: { children: any }) {
  return (
    <Typography variant="caption" sx={{ fontSize: 14 }}>
      {children}
    </Typography>
  );
}

function PromptView() {
  const { message } = useCurrentMessage();
  const agent = useAgent({ aid: message.aid });

  const params = useMemo(
    () =>
      agent.parameters
        ?.filter(isValidInput)
        .map((i) => [i.label?.trim() || i.key, message.inputs?.[i.key]])
        .filter((i) => i[1]),
    [agent.parameters, message.inputs],
  );

  if (params?.length === 1) {
    return params[0]?.[1];
  }

  return params?.map(([key, value]) => (
    <Typography key={key} sx={{ wordWrap: "break-word" }}>
      <Box component="span" sx={{ color: "text.secondary" }}>
        {key}
      </Box>
      &nbsp;&nbsp;
      <span>{value}</span>
    </Typography>
  ));
}

function PromptDialog({ url, ...props }: { url: string } & DialogProps) {
  const { message } = useCurrentMessage();
  const { inputs: parameters } = message;

  const { t } = useLocaleContext();

  const { session: authSession } = useSessionContext();

  const borderRadius = 1;

  return (
    <Dialog
      fullWidth
      maxWidth="xl"
      scroll="paper"
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: "rgba(255, 255, 255, 0.4)",
            backdropFilter: "blur(12px)",
          },
        },
      }}
      {...props}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography component="h5" sx={{ fontSize: 24, fontWeight: 700, color: "primary.main" }}>
          {t("photoWall.dialog.title")}
        </Typography>

        <Box>
          <Button
            onClick={(e) => props.onClose?.(e, "backdropClick")}
            variant="contained"
            disableElevation
            sx={{
              bgcolor: (theme) => alpha(theme.palette.primary.light, 0.2),
              minWidth: 32,
              minHeight: 32,
              p: 0,
              fontSize: 22,
              color: "primary.main",
              ":hover": {
                bgcolor: (theme) => alpha(theme.palette.primary.light, 0.3),
              },
            }}
          >
            <Icon icon="tabler:x" />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack gap={2.5} sx={{ flexDirection: { md: "row" } }}>
          <Stack sx={{ flex: 3, width: { xs: "100%", md: 0 }, gap: 1 }}>
            <Box
              component="img"
              src={url}
              alt=""
              loading="lazy"
              sx={{
                display: "block",
                width: "100%",
                borderRadius,
              }}
            />
          </Stack>

          <Stack sx={{ flex: 2, width: { xs: "100%", md: 0 }, gap: 1 }}>
            {/* author */}
            <RenderSubTitle>{t("photoWall.dialog.author")}</RenderSubTitle>
            {/* FIXME: default is using authSession */}
            <UserInfo
              showDID
              name={authSession.user?.fullName}
              did={authSession.user?.did}
              avatar={authSession.user?.avatar}
            />
            <Box />

            <Box sx={{ fontSize: 14, color: "text.secondary" }}>
              {/* @ts-ignore */}
              <RelativeTime value={message.createdAt} />
            </Box>
            <Box />

            {/* prompt */}
            <RenderSubTitle>{t("photoWall.dialog.prompt")}</RenderSubTitle>
            <Box
              sx={{
                backgroundColor: "background.paper",
                borderRadius,
                p: 1,
                fontSize: 16,
                border: 1,
                borderColor: "divider",
                overflow: "auto",
                maxHeight: { xs: "unset", md: "40vh" },
              }}
            >
              <PromptView />
            </Box>

            <Box>
              <ActionButton
                autoReset
                size="small"
                variant="contained"
                placement="right"
                tip={t("copyToClipboard")}
                title={t("copy")}
                titleSucceed={t("copied")}
                icon="tabler:copy"
                iconSucceed="tabler:copy-check-filled"
                onClick={() => {
                  window.navigator.clipboard.writeText(parameters?.question);
                }}
                sx={{
                  borderRadius,
                }}
              />
            </Box>

            <ShareActions direction="row" justifyContent="flex-end" sx={{ mt: 2 }} />
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
