import {
  type LoadingButtonProps,
  LoadingButton as MuiLoadingButton,
} from "@mui/lab";
import { type MouseEvent, forwardRef, useCallback, useState } from "react";

const LoadingButton = forwardRef<
  HTMLButtonElement,
  Partial<LoadingButtonProps>
>(({ onClick, ...props }, ref) => {
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      try {
        setLoading(true);
        await onClick?.(e);
      } finally {
        setLoading(false);
      }
    },
    [onClick],
  );

  return (
    <MuiLoadingButton
      ref={ref}
      {...props}
      loading={props.loading || loading}
      onClick={handleClick}
    />
  );
});

export default LoadingButton;
