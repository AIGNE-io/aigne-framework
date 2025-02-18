import { cx } from "@emotion/css";
import { Stack, type StackProps } from "@mui/material";

export default function DrawerOpenCloseIcon({
  arrowDirection,
  ...props
}: StackProps & { arrowDirection?: "up" | "down" }) {
  return (
    <Stack
      direction="row"
      position="relative"
      {...props}
      className={cx(
        props.className,
        `drawer-open-close-icon-${arrowDirection || "up"}`,
      )}
      sx={{
        p: 1,
        cursor: "pointer",
        ":hover": {
          opacity: 0.7,
        },
        ":before,:after": {
          content: '""',
          display: "block",
          bgcolor: "currentColor",
          width: 22,
          height: 6,
          borderRadius: 100,
          position: "relative",
        },
        ":before": {
          transform: "translateX(2px) rotateZ(-8deg)",
        },
        ":after": {
          transform: "translateX(-2px) rotateZ(8deg)",
        },
        "&.drawer-open-close-icon-down": {
          ":before": {
            transform: "translateX(2px) rotateZ(8deg)",
          },
          ":after": {
            transform: "translateX(-2px) rotateZ(-8deg)",
          },
        },
        ...props.sx,
      }}
    />
  );
}
