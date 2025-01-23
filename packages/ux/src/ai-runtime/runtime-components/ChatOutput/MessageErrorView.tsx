import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import { Alert, Box } from "@mui/material";

import MarkdownRenderer from "../../components/MarkdownRenderer";

export default function MessageErrorView({
  error,
  sx,
}: { error: any; sx?: any }) {
  const { t } = useLocaleContext();

  if (!error) return null;

  if (error.status === 401) {
    return (
      <Box className="ai-chat-message-error">
        <Box className="message-response">
          <MarkdownRenderer>{t("requireLogin")}</MarkdownRenderer>
        </Box>
      </Box>
    );
  }

  return (
    <Alert
      className="ai-chat-message-error"
      severity="error"
      sx={{ mr: 5, ...sx }}
    >
      {error.message}
    </Alert>
  );
}
