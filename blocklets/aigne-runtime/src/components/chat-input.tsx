import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import SendIcon from "@mui/icons-material/Send";
import { Box, IconButton, Input, InputAdornment } from "@mui/material";
import { useRef, useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

function ChatInput({ onSend, disabled }: ChatInputProps) {
  const { t } = useLocaleContext();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [prompt, setPrompt] = useState("");

  const handleSend = () => {
    setTimeout(() => {
      onSend(prompt);
      setPrompt("");
    }, 50);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={{ display: "flex", gap: 1, alignItems: "center" }}
      component="form"
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
    >
      <Input
        inputRef={inputRef}
        fullWidth
        disableUnderline
        value={prompt}
        multiline
        maxRows={10}
        placeholder={t("ask_anything")}
        sx={{ py: 0.8, px: 1, boxShadow: 2, borderRadius: 1 }}
        onKeyDown={handleKeyPress}
        disabled={disabled}
        onChange={(e) => setPrompt(e.target.value)}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              onClick={handleSend}
              size="small"
              type="submit"
              disabled={disabled}
            >
              <SendIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </InputAdornment>
        }
      />
    </Box>
  );
}

export default ChatInput;
