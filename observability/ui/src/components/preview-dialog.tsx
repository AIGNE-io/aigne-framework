import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import Editor from "@monaco-editor/react";
import CloseIcon from "@mui/icons-material/Close";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import { useState } from "react";

interface PreviewDialogProps {
  open: boolean;
  content: string;
  onClose: () => void;
}
const backgroundColor = "#1e1e1e";

export default function PreviewDialog({ open, content, onClose }: PreviewDialogProps) {
  const { t } = useLocaleContext();
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={isFullscreen ? false : "lg"}
      fullWidth
      fullScreen={isFullscreen}
      PaperProps={{ sx: { height: isFullscreen ? "100vh" : "80vh", backgroundColor } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#fff",
        }}
      >
        {t("jsonView.preview")}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton color="inherit" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label={t("jsonView.close")}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0, backgroundColor }}>
        <Editor
          path="preview.md"
          height="100%"
          language="markdown"
          theme="vs-dark"
          value={content}
          options={{
            minimap: { enabled: false },
            wordWrap: "on",
            readOnly: true,
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
