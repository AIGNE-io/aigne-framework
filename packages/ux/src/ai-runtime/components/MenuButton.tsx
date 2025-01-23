import { MoreHoriz as MoreHorizIcon } from "@mui/icons-material";
import { Box, IconButton, type IconButtonProps, Menu } from "@mui/material";
import type React from "react";
import { useState } from "react";

interface Props extends IconButtonProps {
  sx?: any;
  menus?: React.ReactNode | (() => React.ReactNode);
  MenuProps?: any;
  children?: React.ReactNode;
}

export default function MenuButton({
  sx,
  menus,
  children,
  MenuProps,
  ...restProps
}: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={sx}>
      <IconButton onClick={handleClick} {...restProps}>
        {children || <MoreHorizIcon />}
      </IconButton>

      <Menu
        disableScrollLock
        MenuListProps={{
          sx: {
            p: 0.5,
            ".MuiMenuItem-root": {
              minWidth: 120,
              fontSize: 14,
              lineHeight: 1.5,
              fontWeight: "medium",
              borderRadius: 0.5,
            },
          },
        }}
        slotProps={{
          paper: {
            sx: {
              border: 1,
              borderColor: "divider",
              boxShadow:
                "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
            },
          },
        }}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={open}
        onClick={handleClose}
        onClose={handleClose}
        {...MenuProps}
      >
        {typeof menus === "function" ? menus() : menus}
      </Menu>
    </Box>
  );
}
