import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import RelativeTime from "@arcblock/ux/lib/RelativeTime";
import Toast from "@arcblock/ux/lib/Toast";
import CloseIcon from "@mui/icons-material/Close";
import ShareIcon from "@mui/icons-material/Share";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import type { TraceData } from "./types.ts";

interface RunStatsHeaderProps {
  traceInfo: TraceData;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  inputCost: string | null;
  outputCost: string | null;
  totalCost: string | null;
  count: number;
  latency: string;
  timestamp: number;
  onClose: () => void;
}

export default function RunStatsHeader({
  traceInfo,
  inputTokens,
  outputTokens,
  totalTokens,
  inputCost,
  outputCost,
  totalCost,
  count,
  latency,
  timestamp,
  onClose,
}: RunStatsHeaderProps) {
  const { t } = useLocaleContext();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        px: 2,
        py: 1,
        gap: 1.5,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          transition: "transform 0.3s",
          "&:hover svg": {
            transform: "rotate(90deg)",
            transition: "transform 0.3s",
          },
          "& svg": {
            transition: "transform 0.3s",
          },
        }}
      >
        <CloseIcon />
      </IconButton>

      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {t("inputTokens")}{" "}
        <Typography component="span" sx={{ fontWeight: 600, color: "text.primary", ml: 0.5 }}>
          {inputTokens.toLocaleString()}
        </Typography>
        {inputCost && (
          <Typography component="span" sx={{ color: "text.secondary", ml: 0.5 }}>
            ({inputCost})
          </Typography>
        )}
      </Typography>

      <Typography sx={{ color: "text.secondary" }}>+</Typography>

      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {t("outputTokens")}{" "}
        <Typography component="span" sx={{ fontWeight: 600, color: "text.primary", ml: 0.5 }}>
          {outputTokens.toLocaleString()}
        </Typography>
        {outputCost && (
          <Typography component="span" sx={{ color: "text.secondary", ml: 0.5 }}>
            ({outputCost})
          </Typography>
        )}
      </Typography>

      <Typography sx={{ color: "text.secondary" }}>=</Typography>

      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {t("tokens")}{" "}
        <Typography component="span" sx={{ fontWeight: 600, color: "text.primary", ml: 0.5 }}>
          {totalTokens.toLocaleString()}
        </Typography>
        {totalCost && (
          <Typography component="span" sx={{ color: "text.secondary", ml: 0.5 }}>
            ({totalCost})
          </Typography>
        )}
      </Typography>

      <Box sx={{ flex: 1 }} />

      {traceInfo?.attributes?.metadata?.cliVersion && (
        <Chip
          label={`cli@${traceInfo.attributes?.metadata?.cliVersion}`}
          size="small"
          color={"default"}
          variant="outlined"
          sx={{ height: 21, borderRadius: "4px" }}
        />
      )}

      {traceInfo?.attributes?.metadata?.appName && (
        <Chip
          label={`${traceInfo.attributes?.metadata?.appName}@${traceInfo.attributes?.metadata?.appVersion}`}
          size="small"
          color={"default"}
          variant="outlined"
          sx={{ height: 21, borderRadius: "4px" }}
        />
      )}

      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {t("count")}{" "}
        <Typography component="span" sx={{ fontWeight: 600, color: "text.primary", ml: 0.5 }}>
          {count}
        </Typography>
      </Typography>

      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {t("latency")}{" "}
        <Typography component="span" sx={{ fontWeight: 600, color: "text.primary", ml: 0.5 }}>
          {latency}
        </Typography>
      </Typography>

      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        <RelativeTime value={timestamp} type="all" disableTimezone useShortTimezone />
      </Typography>

      <IconButton
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          Toast.success(t("copied"));
        }}
      >
        <ShareIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
