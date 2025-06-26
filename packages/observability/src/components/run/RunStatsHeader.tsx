import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import RelativeTime from "@arcblock/ux/lib/RelativeTime";
import Toast from "@arcblock/ux/lib/Toast";
import CloseIcon from "@mui/icons-material/Close";
import ShareIcon from "@mui/icons-material/Share";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

interface StatsItemProps {
  label: string;
  value: string | number;
}

function StatsItem({ label, value }: StatsItemProps) {
  return (
    <Box
      sx={{
        textAlign: "center",
        px: 2,
        minWidth: 120,
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
      }}
    >
      <Typography variant="body2" color="text.primary">
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontFamily: "monospace", color: "text.secondary" }}>
        {value}
      </Typography>
    </Box>
  );
}

interface RunStatsHeaderProps {
  inputTokens: number;
  outputTokens: number;
  tokens: number;
  count: number;
  latency: string;
  timestamp: string;
  onClose: () => void;
}

export default function RunStatsHeader({
  inputTokens,
  outputTokens,
  count,
  tokens,
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
        px: 3,
        py: 1.5,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        gap: 1,
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

      <Divider orientation="vertical" flexItem />

      <StatsItem label={t("inputTokens")} value={inputTokens} />
      <Typography>+</Typography>
      <StatsItem label={t("outputTokens")} value={outputTokens} />
      <Typography>=</Typography>
      <StatsItem label={t("tokens")} value={tokens} />
      <Box sx={{ flex: 1 }} />
      <StatsItem label={t("count")} value={count} />
      <StatsItem label={t("latency")} value={latency} />

      <Divider orientation="vertical" flexItem />

      <Typography variant="body2" sx={{ pl: 2 }}>
        <RelativeTime value={timestamp} type="all" disableTimezone useShortTimezone />
      </Typography>

      <Box>
        <IconButton
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            Toast.success(t("copied"));
          }}
        >
          <ShareIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}
