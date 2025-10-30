import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import Toast from "@arcblock/ux/lib/Toast";
import DownloadIcon from "@mui/icons-material/Download";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { useState } from "react";
import { joinURL } from "ufo";
import { origin } from "../utils/index.ts";

interface DownloadProps {
  selectedIds: string[];
  onReset: () => void;
}

const Download = ({ selectedIds, onReset }: DownloadProps) => {
  const { t } = useLocaleContext();
  const [downloading, setDownloading] = useState(false);

  const handleDownloadSelected = async () => {
    if (!selectedIds || selectedIds.length === 0) {
      Toast.error(t("noSelectedData"));
      return;
    }

    try {
      setDownloading(true);
      const res = await fetch(joinURL(origin, "/api/trace/download"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      const now = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
      a.download = `traces-selected-${now}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      Toast.success(t("downloadSuccess"));
    } catch (error) {
      Toast.error((error as Error)?.message || t("downloadFailed"));
    } finally {
      setDownloading(false);
      onReset();
    }
  };

  return (
    <Tooltip title={t("downloadSelected")}>
      <span>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadSelected}
          disabled={downloading || selectedIds.length === 0}
          sx={{ height: 36 }}
        >
          {downloading ? t("downloading") : `${t("download")} (${selectedIds.length})`}
        </Button>
      </span>
    </Tooltip>
  );
};

export default Download;
