import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import SendIcon from "@mui/icons-material/Send";
import { IconButton, InputBase, Paper } from "@mui/material";
import { useRef, useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

function ChatInput({ onSend, disabled }: ChatInputProps) {
  const { t } = useLocaleContext();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [rows, setRows] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateRows = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (inputRef.current && containerRef.current) {
      const textArea = inputRef.current;
      const container = containerRef.current;

      // 重置高度以获取正确的 scrollWidth
      textArea.style.height = "20px";

      // 如果内容为空，保持单行
      if (!e.target.value) {
        setRows(1);
        return;
      }

      // 创建一个临时 span 来测量文本宽度
      const span = document.createElement("span");
      span.style.font = window.getComputedStyle(textArea).font;
      span.style.visibility = "hidden";
      span.style.position = "absolute";
      span.style.whiteSpace = "pre";
      span.textContent = e.target.value;
      container.appendChild(span);

      // 获取容器宽度和文本宽度
      const containerWidth = container.clientWidth - 32; // 减去内边距
      const textWidth = span.offsetWidth;

      // 清理临时元素
      container.removeChild(span);

      // 如果文本宽度小于容器宽度，保持单行
      if (textWidth <= containerWidth) {
        setRows(1);
        textArea.style.height = "20px";
        return;
      }

      // 否则，计算需要的行数
      const lineHeight = 20; // 基础行高
      const minRows = 1;
      const maxRows = 5;
      const newRows = Math.min(
        Math.max(minRows, Math.ceil(textArea.scrollHeight / lineHeight)),
        maxRows,
      );

      // 设置新高度
      textArea.style.height = `${newRows * lineHeight}px`;
      setRows(newRows);
    }
  };

  const handleSend = () => {
    if (inputRef.current && inputRef.current.value.trim()) {
      onSend(inputRef.current.value);
      inputRef.current.value = "";
      // 重置高度
      inputRef.current.style.height = "20px";
      setRows(1);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper
      ref={containerRef}
      sx={{
        p: "6px 8px",
        display: "flex",
        alignItems: "flex-start",
        borderRadius: "16px",
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        margin: 0,
        position: "relative",
      }}
    >
      <InputBase
        inputRef={inputRef}
        multiline
        rows={rows}
        maxRows={rows ? undefined : 5}
        onChange={updateRows}
        inputProps={{
          enterKeyHint: "send",
        }}
        sx={{
          ml: 1,
          flex: 1,
          color: "white",
          fontSize: "0.95rem",
          transition: "all 0.2s ease-out",
          "& .MuiInputBase-input": {
            py: 0.75,
            maxHeight: "100px",
            overflowY: "auto",
            lineHeight: "20px",
            transition: "height 0.2s ease-out",
          },
          "& .MuiInputBase-input::placeholder": {
            color: "rgba(255, 255, 255, 0.7)",
            opacity: 0.7,
          },
          "& textarea": {
            transition: "height 0.2s ease-out",
          },
        }}
        placeholder={t("ask_anything")}
        onKeyPress={handleKeyPress}
        disabled={disabled}
      />
      <IconButton
        color="primary"
        sx={{
          p: "6px",
          mt: 0.5,
          color: "white",
          transition: "opacity 0.2s ease-out",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          },
          "&.Mui-disabled": {
            color: "rgba(255, 255, 255, 0.3)",
          },
        }}
        onClick={handleSend}
        disabled={disabled}
      >
        <SendIcon sx={{ fontSize: 20 }} />
      </IconButton>
    </Paper>
  );
}

export default ChatInput;
