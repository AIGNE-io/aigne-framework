import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import Editor from "@monaco-editor/react";
import CheckIcon from "@mui/icons-material/Check";
import CopyAllIcon from "@mui/icons-material/CopyAll";
import DownloadIcon from "@mui/icons-material/Download";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useState } from "react";

function getLocalizedFilename(prefix = "data", locale = "en-US") {
  const now = new Date();

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const formatted = new Intl.DateTimeFormat(locale, {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .format(now)
    .replace(/[/:,]/g, "-")
    .replace(/\s+/, "_");

  const offset = -now.getTimezoneOffset() / 60;
  const offsetLabel = offset >= 0 ? `UTC+${offset}` : `UTC${offset}`;

  return `${prefix}-${formatted}-${offsetLabel}.json`;
}

export default function JsonView({ value: data }: { value: any }) {
  const [copied, setCopied] = useState(false);
  const { t, locale } = useLocaleContext();

  const jsonString = typeof data === "string" ? data : JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = getLocalizedFilename("data", locale);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box
      sx={{
        p: 2,
        m: 0,
        height: "100%",
        backgroundColor: "#1e1e1e",
        userSelect: "text",
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 36,
          zIndex: 10001,
          display: "flex",
          gap: 0.5,
        }}
      >
        <Tooltip title={copied ? t("copyJson") : t("copyJson")}>
          <IconButton
            size="small"
            onClick={handleCopy}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            {copied ? <CheckIcon fontSize="small" /> : <CopyAllIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Tooltip title={t("downloadJson")}>
          <IconButton
            size="small"
            onClick={handleDownload}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Editor
        path={`${jsonString.slice(0, 5)}}.json`}
        height="100%"
        language="json"
        theme="vs-dark"
        value={jsonString}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          wordWrap: "on",
        }}
      />
    </Box>
  );
}
