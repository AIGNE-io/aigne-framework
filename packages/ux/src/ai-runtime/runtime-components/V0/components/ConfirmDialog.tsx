import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import { Icon } from "@iconify/react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  type DialogProps,
  DialogTitle,
  Typography,
} from "@mui/material";
import { forwardRef, useImperativeHandle, useState } from "react";

import LoadingButton from "../../../components/LoadingButton";

type OpenParamsProps = {
  title?: string | undefined;
  children?: React.ReactNode | undefined;
  onConfirm?: () => void | undefined;
  onCancel?: () => void | undefined;
  onConfirmProps?: any | undefined;
  onCancelProps?: any | undefined;
};

interface ConfirmDialogProps extends Omit<DialogProps, "open"> {}

const ConfirmDialog = forwardRef((props: ConfirmDialogProps, ref: any) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openParams, setOpenParams] = useState<OpenParamsProps>({});

  const { t } = useLocaleContext();

  const open = (params: OpenParamsProps) => {
    setOpenParams(params);
    setOpenDialog(true);
  };

  const close = () => {
    setOpenDialog(false);
  };

  useImperativeHandle(
    ref,
    () =>
      ({
        open,
        close,
      }) as {
        open: (params: OpenParamsProps) => void;
        close: () => void;
      },
  );

  const { title, children, onConfirm, onCancel, onConfirmProps, onCancelProps } =
    openParams as OpenParamsProps;

  return (
    <Dialog disableScrollLock onClose={close} fullWidth maxWidth="sm" {...props} open={openDialog}>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography component="h5" sx={{ fontSize: 24, fontWeight: 700 }}>
          {title}
        </Typography>

        <Button
          onClick={close}
          //   variant="text"
          color="inherit"
          disableElevation
          sx={{
            minWidth: 32,
            minHeight: 32,
            p: 0,
            fontSize: 22,
          }}
        >
          <Icon icon="tabler:x" />
        </Button>
      </DialogTitle>
      <DialogContent>{children}</DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pt: 0,
          pb: 2,
        }}
      >
        <Button
          variant="contained"
          color="inherit"
          {...onCancelProps}
          onClick={() => {
            onCancel?.();
            setOpenDialog(false);
          }}
        >
          {onCancelProps?.children || t("cancel")}
        </Button>

        <LoadingButton
          variant="contained"
          {...onConfirmProps}
          onClick={async () => {
            await onConfirm?.();
            setOpenDialog(false);
          }}
        >
          {onConfirmProps?.children || t("submit")}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
});

export default ConfirmDialog;
