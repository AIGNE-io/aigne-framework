import {
  LocaleProvider,
  useLocaleContext,
} from "@arcblock/ux/lib/Locale/context";
import { Icon } from "@iconify/react";
import {
  Box,
  type BoxProps,
  type IconButtonProps,
  MenuItem,
  useTheme,
} from "@mui/material";
import { useCallback } from "react";
import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  RedditIcon,
  RedditShareButton,
  TelegramIcon,
  TelegramShareButton,
  WeiboIcon,
  WeiboShareButton,
  XIcon,
  TwitterShareButton as XShareButton,
} from "react-share";

import { translations } from "../locales";
import MenuButton from "./MenuButton";

interface SocialShareMenuProps extends BoxProps {
  url?: string;
  content: string;
  MenuProps?: any;
  disableCopyLink?: boolean;
}

interface SocialShareButtonsProps extends SocialShareMenuProps {
  itemSx?: BoxProps["sx"];
  onClick?: () => void;
  bgFill?: string;
  iconFill?: string;
  sx?: BoxProps["sx"];
}

const getFormattedUrl = (url: string) => {
  // remove page & sessionId query params
  const urlObj = new URL(url);
  urlObj.searchParams.delete("page");
  urlObj.searchParams.delete("sessionId");
  return urlObj.toString();
};

export default function SocialShare(
  props: SocialShareMenuProps &
    SocialShareButtonsProps & {
      type?: "menu" | "buttons";
    },
) {
  const { type = "menu", ...restProps } = props;

  const { locale } = useLocaleContext();

  const renderContent = useCallback(() => {
    // @ts-ignore
    if (type === "buttons") {
      return <SocialShareButtons {...restProps} />;
    }
    // @ts-ignore
    return <SocialShareMenu {...restProps} />;
  }, [type, restProps]);

  return (
    // @ts-ignore
    <LocaleProvider
      translations={translations}
      locale={locale}
      fallbackLocale="en"
    >
      {renderContent()}
    </LocaleProvider>
  );
}

export function SocialShareMenu({
  url = getFormattedUrl(window.location.href),
  content,
  children = <Icon icon="tabler:share" />,
  MenuProps,
  disableCopyLink = false,
  ...restProps
}: SocialShareMenuProps & IconButtonProps) {
  const theme = useTheme();
  const { t } = useLocaleContext();

  const itemIconSx = {
    width: 22,
    height: 22,
    border: 1,
    borderColor: theme.palette.text.secondary,
    borderRadius: 0.75,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const buttonSx = {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    minWidth: 120,
    lineHeight: "1!important",
    width: "100%",
    border: "none",
    bgcolor: "transparent",
  };

  const iconProps = {
    bgStyle: { fill: "#fff" },
    iconFillColor: theme.palette.text.secondary,
    style: {
      borderRadius: "6px",
    },
  };

  return (
    <MenuButton
      MenuProps={{
        ...MenuProps,
        sx: {
          li: { p: 0, button: { px: "8px !important", py: "4px !important" } },
        },
      }}
      menus={[
        <MenuItem key="shareOnX">
          <Box component={XShareButton} url={url} title={content} sx={buttonSx}>
            <Box component={XIcon} sx={itemIconSx} round {...iconProps} />
            <span>{t("socialShare.shareToX")}</span>
          </Box>
        </MenuItem>,
        <MenuItem key="shareOnTelegram">
          <Box
            component={TelegramShareButton}
            url={url}
            title={content}
            sx={buttonSx}
          >
            <Box
              component={TelegramIcon}
              sx={itemIconSx}
              round
              {...iconProps}
            />
            <span>{t("socialShare.shareToTelegram")}</span>
          </Box>
        </MenuItem>,
        <MenuItem key="shareOnReddit">
          <Box
            component={RedditShareButton}
            url={url}
            title={content}
            sx={buttonSx}
          >
            <Box component={RedditIcon} sx={itemIconSx} round {...iconProps} />
            <span>{t("socialShare.shareToReddit")}</span>
          </Box>
        </MenuItem>,
        <MenuItem key="shareOnWeibo">
          <Box
            component={WeiboShareButton}
            url={url}
            title={content}
            sx={buttonSx}
          >
            <Box component={WeiboIcon} sx={itemIconSx} round {...iconProps} />
            <span>{t("socialShare.shareToWeibo")}</span>
          </Box>
        </MenuItem>,
        <MenuItem key="shareOnFacebook">
          <Box component={FacebookShareButton} url={url} sx={buttonSx}>
            <Box
              component={FacebookIcon}
              sx={itemIconSx}
              round
              {...iconProps}
            />
            <span>{t("socialShare.shareToFacebook")}</span>
          </Box>
        </MenuItem>,
        <MenuItem key="shareOnLinkedin">
          <Box
            component={LinkedinShareButton}
            url={url}
            summary={content}
            sx={buttonSx}
          >
            <Box
              component={LinkedinIcon}
              sx={itemIconSx}
              round
              {...iconProps}
            />
            <span>{t("socialShare.shareToLinkedin")}</span>
          </Box>
        </MenuItem>,
        !disableCopyLink && (
          <MenuItem key="copyToClipboard">
            <Box
              component="button"
              sx={buttonSx}
              onClick={() => {
                window.navigator.clipboard.writeText(url);
              }}
            >
              {/* @ts-ignore */}
              <Box sx={itemIconSx} round {...iconProps}>
                <Icon icon="tabler:link" />
              </Box>
              <span>{t("socialShare.copyLink")}</span>
            </Box>
          </MenuItem>
        ),
      ].filter(Boolean)}
      {...restProps}
    >
      {children}
    </MenuButton>
  );
}

export function SocialShareButtons({
  url = getFormattedUrl(window.location.href),
  content,
  sx,
  itemSx,
  onClick,
  bgFill,
  iconFill,
  ...rest
}: SocialShareButtonsProps) {
  const mergedSx: BoxProps["sx"] = [
    { display: "flex", alignItems: "center", gap: 0.5, lineHeight: 1 },
    ...(Array.isArray(sx) ? sx : [sx]),
  ];
  const mergedItemSx: BoxProps["sx"] = [
    { width: { xs: 24, sm: 28 }, height: { xs: 24, sm: 28 }, borderRadius: 1 },
    ...(Array.isArray(itemSx) ? itemSx : [itemSx]),
  ];
  const iconProps = {
    bgStyle: { fill: bgFill || "#bbb" },
    iconFillColor: iconFill || "#fff",
  };

  return (
    <Box sx={mergedSx} {...rest}>
      <XShareButton url={url} title={content}>
        <Box component={XIcon} sx={mergedItemSx} {...iconProps} />
      </XShareButton>

      <TelegramShareButton url={url} title={content}>
        <Box component={TelegramIcon} sx={mergedItemSx} {...iconProps} />
      </TelegramShareButton>

      <RedditShareButton url={url} title={content}>
        <Box component={RedditIcon} sx={mergedItemSx} {...iconProps} />
      </RedditShareButton>

      <WeiboShareButton url={url} title={content}>
        <Box component={WeiboIcon} sx={mergedItemSx} {...iconProps} />
      </WeiboShareButton>

      <FacebookShareButton url={url}>
        <Box component={FacebookIcon} sx={mergedItemSx} {...iconProps} />
      </FacebookShareButton>

      <LinkedinShareButton url={url} summary={content}>
        <Box component={LinkedinIcon} sx={mergedItemSx} {...iconProps} />
      </LinkedinShareButton>
    </Box>
  );
}
