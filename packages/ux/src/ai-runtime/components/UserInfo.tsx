import Avatar from "@arcblock/ux/lib/Avatar";
import DID from "@arcblock/ux/lib/DID";
import { Box, Stack, type StackProps, Typography, type TypographyProps } from "@mui/material";
import dayjs from "dayjs";
import { type ReactNode, useMemo } from "react";

export default function UserInfo({
  avatar,
  showDID,
  did,
  name,
  time,
  children,
  reverse,
  UserNameProps,
  ...restProps
}: StackProps & {
  avatar?: string;
  showDID?: boolean;
  did?: string;
  name?: string;
  time?: string;
  children?: ReactNode;
  reverse?: boolean;
  UserNameProps?: TypographyProps;
} & StackProps) {
  return (
    <Stack
      className="user-info"
      alignItems="center"
      direction={reverse ? "row-reverse" : "row"}
      gap={1.5}
      {...restProps}
    >
      {(avatar || did) && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            maxHeight: 44,
          }}
        >
          <Avatar
            size={40}
            did={did!}
            variant="circle"
            shape="circle"
            // @ts-ignore
            src={avatar}
          />
        </Box>
      )}

      <Box flex={1} width={0}>
        <UserName
          {...UserNameProps}
          sx={{
            justifyContent: reverse ? "flex-end" : "flex-start",
            ...UserNameProps?.sx,
          }}
        >
          {name || ""}
          {time && (
            <UserTime
              time={time}
              sx={{
                fontSize: 12,
                lineHeight: "24px",
                opacity: 0.8,
              }}
            />
          )}
        </UserName>

        {/* @ts-ignore */}
        {showDID && did && (
          <Box component={DID} did={did} copyable={false} size={14} responsive sx={{ mt: -0.25 }} />
        )}

        <Box flex={1}>{children}</Box>
      </Box>
    </Stack>
  );
}

export function UserName({
  children,
  sx,
  ...restProps
}: TypographyProps & { children: ReactNode }) {
  return (
    <Typography
      component="div"
      noWrap
      sx={{
        fontSize: 14,
        lineHeight: "24px",
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        gap: 1,
        ...sx,
      }}
      {...restProps}
    >
      {children}
    </Typography>
  );
}

export function UserTime({ time, ...restProps }: TypographyProps & { time: string }) {
  const formattedTime = useMemo(() => {
    const date = dayjs(time);
    if (!date.isValid()) return undefined;

    return date.isSame(dayjs(), "date") ? date.format("HH:mm") : date.format("YYYY-MM-DD HH:mm");
  }, [time]);

  if (!formattedTime) return null;

  return (
    <Typography key="user-time" {...restProps}>
      {formattedTime}
    </Typography>
  );
}
