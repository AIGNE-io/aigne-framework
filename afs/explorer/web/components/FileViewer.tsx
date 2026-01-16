import CloseIcon from "@mui/icons-material/Close";
import { AppBar, Box, Dialog, IconButton, Paper, Toolbar, Typography } from "@mui/material";
import type { AFSEntry } from "../types.ts";
import { formatSize } from "../utils.ts";

interface FileViewerProps {
  file: AFSEntry;
  onClose: () => void;
}

export function FileViewer({ file, onClose }: FileViewerProps) {
  const renderContent = () => {
    if (!file.content) {
      return (
        <Typography color="text.secondary" align="center">
          No content available
        </Typography>
      );
    }

    // Try to detect content type
    const isJson =
      file.name.endsWith(".json") ||
      file.mimeType === "application/json" ||
      (typeof file.content === "object" && file.content !== null);

    const isYaml = file.name.endsWith(".yaml") || file.name.endsWith(".yml");

    if (isJson) {
      const content = typeof file.content === "string" ? JSON.parse(file.content) : file.content;
      return (
        <Box
          component="pre"
          sx={{
            p: 2,
            overflow: "auto",
            bgcolor: "grey.100",
            borderRadius: 1,
            fontSize: "0.875rem",
            fontFamily: "monospace",
          }}
        >
          {JSON.stringify(content, null, 2)}
        </Box>
      );
    }

    if (isYaml || typeof file.content === "string") {
      return (
        <Box
          component="pre"
          sx={{
            p: 2,
            overflow: "auto",
            bgcolor: "grey.100",
            borderRadius: 1,
            fontSize: "0.875rem",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {String(file.content)}
        </Box>
      );
    }

    return (
      <Box
        component="pre"
        sx={{
          p: 2,
          overflow: "auto",
          bgcolor: "grey.100",
          borderRadius: 1,
          fontSize: "0.875rem",
          fontFamily: "monospace",
        }}
      >
        {JSON.stringify(file.content, null, 2)}
      </Box>
    );
  };

  return (
    <Dialog fullScreen open onClose={onClose}>
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            {file.name}
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Paper sx={{ mb: 2, p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Path:</strong> {file.path}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Type:</strong> {file.mimeType || file.type}
          </Typography>
          {file.size !== undefined && (
            <Typography variant="body2" color="text.secondary">
              <strong>Size:</strong> {formatSize(file.size)}
            </Typography>
          )}
          {file.createdAt && (
            <Typography variant="body2" color="text.secondary">
              <strong>Created:</strong> {new Date(file.createdAt).toLocaleString()}
            </Typography>
          )}
        </Paper>

        {renderContent()}
      </Box>
    </Dialog>
  );
}
