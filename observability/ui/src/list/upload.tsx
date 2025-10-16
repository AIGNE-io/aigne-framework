import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import Toast from "@arcblock/ux/lib/Toast";
import UploadIcon from "@mui/icons-material/Upload";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { useRef, useState } from "react";
import { joinURL } from "ufo";
import { origin } from "../utils/index.ts";

interface UploadProps {
  fetchTraces: (params: { page: number; pageSize: number }) => void;
  pageSize: number;
}

const Upload = ({ fetchTraces, pageSize }: UploadProps) => {
  const { t } = useLocaleContext();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const text = await file.text();
      let data: any;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON format");
      }

      const traces = Array.isArray(data) ? data : data.traces;

      if (!traces || !Array.isArray(traces)) {
        throw new Error("Invalid file format: traces array not found");
      }

      const BATCH_SIZE = 1;
      const batches: any[][] = [];
      for (let i = 0; i < traces.length; i += BATCH_SIZE) {
        batches.push(traces.slice(i, i + BATCH_SIZE));
      }

      let totalSuccessCount = 0;
      let totalFailCount = 0;
      let totalSkippedCount = 0;

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const progress = Math.round(((i + 1) / batches.length) * 100);

        Toast.info(t("uploadProgress", { progress, current: i + 1, total: batches.length }));

        const res = await fetch(joinURL(origin, "/api/trace/upload"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ traces: batch }),
        });

        const result = await res.json();

        if (!res.ok) {
          if (result.invalidTraces) {
            throw new Error(
              `${t("batchInvalid", { batch: i + 1 })}: ${result.details}\n${t("invalidIds")}: ${result.invalidTraces.join(", ")}`,
            );
          }
          throw new Error(
            `${t("batchFailed", { batch: i + 1 })}: ${result.error || result.message || t("uploadFailed")}`,
          );
        }

        totalSuccessCount += result.successCount || 0;
        totalFailCount += result.failCount || 0;
        totalSkippedCount += result.skippedCount || 0;
      }

      const successParts = [];
      if (totalSuccessCount > 0) {
        successParts.push(t("uploadSuccessCount", { count: totalSuccessCount }));
      }
      if (totalSkippedCount > 0) {
        successParts.push(t("uploadSkippedCount", { count: totalSkippedCount }));
      }
      if (totalFailCount > 0) {
        successParts.push(t("uploadFailCount", { count: totalFailCount }));
      }

      Toast.success(
        `${t("uploadCompleted")}: ${successParts.join(", ")} (${t("totalBatches", { count: batches.length })})`,
      );

      fetchTraces({ page: 0, pageSize });
    } catch (error) {
      const errorMessage = (error as Error)?.message || t("uploadFailed");
      Toast.error(errorMessage);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <Tooltip title={t("uploadData")}>
        <span>
          <Button
            variant="contained"
            size="small"
            startIcon={<UploadIcon />}
            onClick={handleUploadClick}
            disabled={uploading}
            sx={{ textTransform: "none" }}
          >
            {uploading ? t("uploading") : t("uploadData")}
          </Button>
        </span>
      </Tooltip>
    </>
  );
};

export default Upload;
