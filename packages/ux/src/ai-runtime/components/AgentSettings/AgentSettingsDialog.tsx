import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import Toast from "@arcblock/ux/lib/Toast";
import { LoadingButton } from "@mui/lab";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  type DialogProps,
  DialogTitle,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import {
  type CreateOrUpdateSecretsInput,
  createSecrets,
} from "../../api/secret";
import { useAgent } from "../../contexts/Agent";
import { useEntryAgent } from "../../contexts/EntryAgent";

export interface SettingsDialogState {
  isOpen: boolean;
  open: () => void;
  onClose: () => void;
}

export const settingsDialogState = create<SettingsDialogState>()(
  immer((set) => ({
    isOpen: false,
    open() {
      set((state) => {
        state.isOpen = true;
      });
    },
    onClose() {
      set((state) => {
        state.isOpen = false;
      });
    },
  })),
);

export default function AgentSettingsDialog({
  ...props
}: Omit<DialogProps, "open">) {
  const { t } = useLocaleContext();

  const isOpen = settingsDialogState((state) => state.isOpen);
  const onClose = settingsDialogState((state) => state.onClose);

  const { aid } = useEntryAgent();
  const agent = useAgent({ aid });

  const reload = useAgent({ aid }, (state) => state.load);

  const form = useForm<CreateOrUpdateSecretsInput>({
    defaultValues: {
      secrets: agent.config.secrets.map((i) => ({
        projectId: agent.project.id,
        targetProjectId: i.targetProjectId,
        targetAgentId: i.targetAgentId,
        targetInputKey: i.targetInput.key,
        secret: "",
      })),
    },
  });

  const onSubmit = async (input: CreateOrUpdateSecretsInput) => {
    try {
      await createSecrets({ input });
      await reload();
      Toast.success(t("saved"));
      onClose();
    } catch (error) {
      Toast.error(error.message);
      throw error;
    }
  };

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      {...props}
      open={isOpen}
      onClose={onClose}
      component="form"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <DialogTitle>{t("settings")}</DialogTitle>
      <DialogContent>
        <Stack gap={1}>
          {agent.config.secrets.map(({ targetInput, hasValue }, index) => (
            <Stack key={targetInput.id} gap={0.5}>
              <Typography variant="caption">
                {targetInput.label || targetInput.key}{" "}
                {targetInput.docLink && (
                  <Link href={targetInput.docLink} target="_blank">
                    {t("docLink")}
                  </Link>
                )}
              </Typography>

              <TextField
                autoFocus={index === 0}
                type="password"
                fullWidth
                hiddenLabel
                size="small"
                inputProps={{ maxLength: 100 }}
                placeholder={hasValue ? "******" : targetInput.placeholder}
                {...form.register(`secrets.${index}.secret`, {
                  required: true,
                })}
              />
            </Stack>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("cancel")}</Button>
        <LoadingButton
          type="submit"
          variant="contained"
          loading={form.formState.isSubmitting}
        >
          {t("save")}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
