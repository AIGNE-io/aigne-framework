import { cx } from "@emotion/css";
import { Stack, type StackProps } from "@mui/material";

export default function SimpleLayout({ ...props }: StackProps) {
  return (
    <Stack
      flexGrow={1}
      maxWidth="md"
      width="100%"
      mx="auto"
      {...props}
      className={cx("aigne-layout aigne-layout-simple", props.className)}
    />
  );
}
