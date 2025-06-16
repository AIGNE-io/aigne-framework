import {useLocaleContext} from "@arcblock/ux/lib/Locale/context"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

interface StatsItemProps {
  label: string
  value: string | number
}

function StatsItem({label, value}: StatsItemProps) {
  return (
    <Box
      sx={{
        textAlign: "center",
        px: 2,
        minWidth: 120,
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
      }}>
      <Typography variant="body2" color="text.secondary" sx={{fontWeight: 500}}>
        {label}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          fontFamily: "monospace",
          fontWeight: 500,
        }}>
        {value}
      </Typography>
    </Box>
  )
}

interface RunStatsHeaderProps {
  inputTokens: number
  outputTokens: number
  tokens: number
  count: number
  latency: string
  timestamp: string
}

export default function RunStatsHeader({
  inputTokens,
  outputTokens,
  count,
  tokens,
  latency,
  timestamp,
}: RunStatsHeaderProps) {
  const {t} = useLocaleContext()
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        px: 3,
        py: 1.5,
        bgcolor: "background.paper",
        borderBottom: theme => `1px solid ${theme.palette.divider}`,
        gap: 1,
      }}>
      <StatsItem label={t("inputTokens")} value={inputTokens} />
      <Typography sx={{color: "text.secondary"}}>+</Typography>
      <StatsItem label={t("outputTokens")} value={outputTokens} />
      <Typography sx={{color: "text.secondary"}}>=</Typography>
      <StatsItem label={t("tokens")} value={tokens} />
      <Box sx={{flex: 1}} />
      <StatsItem label={t("count")} value={count} />
      <StatsItem label={t("latency")} value={latency} />
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{pl: 2, borderLeft: theme => `1px solid ${theme.palette.divider}`}}>
        {timestamp}
      </Typography>
    </Box>
  )
}
