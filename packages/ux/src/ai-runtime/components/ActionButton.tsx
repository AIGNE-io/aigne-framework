import { Icon } from "@iconify/react";
import type { LoadingButtonProps } from "@mui/lab";
import { Box, Tooltip, type TooltipProps } from "@mui/material";
import { type ReactNode, useRef, useState } from "react";

import LoadingButton from "./LoadingButton";

export default function ActionButton({
  tip,
  tipSucceed,
  title,
  titleSucceed,
  icon,
  iconSucceed,
  autoReset,
  placement = "top",
  ...props
}: {
  tip?: ReactNode;
  tipSucceed?: ReactNode;
  title?: ReactNode;
  titleSucceed?: ReactNode;
  icon?: ReactNode;
  iconSucceed?: ReactNode;
  autoReset?: boolean;
  placement?: TooltipProps["placement"];
  target?: string;
} & Omit<Partial<LoadingButtonProps>, "title">) {
  const [active, setActive] = useState(false);
  const [error, setError] = useState<Error>();

  const timer = useRef<number>(0);

  const onClose = () => {
    setError(undefined);

    if (autoReset) {
      timer.current = window.setTimeout(() => {
        setActive(false);
      }, 3000);
    }
  };

  const onOpen = () => {
    clearTimeout(timer.current);
  };

  const realIcon = active ? iconSucceed : icon;

  const toolTipTitleText = error ? (
    <Box color="error">{error.message}</Box>
  ) : (
    (active && tipSucceed) || tip
  );
  const buttonText = active ? titleSucceed : title;

  return (
    <Tooltip
      title={toolTipTitleText}
      disableInteractive
      placement={placement}
      onClose={onClose}
      onOpen={onOpen}
    >
      <span>
        <LoadingButton
          startIcon={
            realIcon && (typeof realIcon === "string" ? <Icon icon={realIcon} /> : realIcon)
          }
          loadingPosition={realIcon ? "start" : undefined}
          {...props}
          onClick={async (e: any) => {
            if (!props.onClick) return;
            try {
              await props.onClick(e);
              setActive(true);
            } catch (error) {
              setError(error);
            }
          }}
        >
          {buttonText}
        </LoadingButton>
      </span>
    </Tooltip>
  );
}
