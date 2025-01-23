import {
  CircularProgress,
  MenuItem,
  type MenuItemProps,
  Stack,
} from "@mui/material";
import { type MouseEvent, type ReactNode, useState } from "react";

export default function LoadingMenuItem({
  children,
  confirmation,
  ...props
}: MenuItemProps & { confirmation?: ReactNode }) {
  const [clicked, setClicked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: MouseEvent<HTMLLIElement>) => {
    if (loading) return;

    if (!clicked && confirmation) {
      setClicked(true);
      return;
    }
    try {
      setLoading(true);
      await props.onClick?.(e);
    } finally {
      setClicked(false);
      setLoading(false);
    }
  };

  return (
    <MenuItem
      {...props}
      onClick={handleClick}
      sx={{ ...props.sx, display: "flex", alignItems: "center" }}
    >
      {(clicked && confirmation) || children}

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        sx={{ width: 18 }}
      >
        {loading && <CircularProgress size={14} />}
      </Stack>
    </MenuItem>
  );
}
