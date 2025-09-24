import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import { formatNumber } from "@blocklet/aigne-hub/utils/util";
import { CallMade, InfoOutlined, TrendingUp } from "@mui/icons-material";
import { Box, Card, CardContent, Grid, Tooltip, Typography } from "@mui/material";
import BigNumber from "bignumber.js";

interface UsageSummaryProps {
  totalToken?: number;
  totalCost?: number;
  title?: string;
}

interface SummaryCardProps {
  title: string;
  value: string;
  trend?: string;
  trendDescription?: string;
  tooltip?: React.ReactNode;
  showInfoIcon?: boolean;
  infoTooltip?: string;
}

function SummaryCard({
  title,
  value = "-",
  trend = undefined,
  trendDescription = undefined,
  tooltip = undefined,
  showInfoIcon = false,
  infoTooltip = undefined,
}: SummaryCardProps) {
  const getTrendColor = (trendStr?: string) => {
    if (!trendStr) return "text.secondary";
    const isPositive = trendStr.startsWith("+");
    const isNegative = trendStr.startsWith("-");
    if (isPositive) return "success.main";
    if (isNegative) return "error.main";
    return "text.secondary";
  };

  return (
    <Card
      sx={{
        height: "100%",
        boxShadow: 1,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.default",
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            mb: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "text.primary",
              fontWeight: 600,
            }}
          >
            {title}
          </Typography>
          {showInfoIcon && (
            <Tooltip title={infoTooltip} arrow placement="top">
              <InfoOutlined
                sx={{
                  fontSize: 16,
                  color: "text.secondary",
                  cursor: "help",
                }}
              />
            </Tooltip>
          )}
        </Box>
        <Box>
          {tooltip ? (
            <Tooltip
              title={tooltip}
              slotProps={{
                tooltip: {
                  sx: {
                    maxWidth: "none",
                    backgroundColor: "background.paper",
                    boxShadow: 2,
                    color: "text.primary",
                    p: 0,
                  },
                },
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: "bold",
                  mb: 0.5,
                  cursor: "help",
                  display: "inline-block",
                }}
              >
                {value || "-"}
              </Typography>
            </Tooltip>
          ) : (
            <Typography variant="h3" sx={{ fontWeight: "bold", mb: 0.5 }}>
              {value || "-"}
            </Typography>
          )}
        </Box>

        {trend && (
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
            }}
          >
            <Box component="span" sx={{ color: getTrendColor(trend), fontWeight: 500 }}>
              {trend}
            </Box>
            {trendDescription && ` ${trendDescription}`}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export function UsageSummary({
  totalToken = 0,
  totalCost = 0,
  title = undefined,
}: UsageSummaryProps) {
  const { t } = useLocaleContext();

  const metrics = [
    {
      title: t("analytics.totalToken"),
      value: formatNumber(new BigNumber(totalToken || 0).dp(2).toString()),
      trend: undefined,
      trendDescription: undefined,
      icon: <CallMade color="primary" />,
      color: "primary" as const,
      tooltip: null,
      showInfoIcon: false,
      infoTooltip: undefined,
    },
    {
      title: t("analytics.totalCost"),
      value: `$${formatNumber((totalCost || 0).toFixed(5))}`,
      trend: undefined,
      trendDescription: undefined,
      icon: <TrendingUp color="success" />,
      color: "success" as const,
      tooltip: null,
      showInfoIcon: false,
      infoTooltip: undefined,
    },
  ];

  return (
    <Box>
      {title && (
        <Typography variant="h3" sx={{ fontWeight: "bold", mb: 3 }}>
          {title}
        </Typography>
      )}
      <Grid container spacing={2}>
        {(metrics || []).map(
          (metric) =>
            metric && (
              <Grid key={metric.title} size={{ xs: 12, sm: 6, md: 3 }}>
                <SummaryCard
                  title={metric.title}
                  value={metric.value || "-"}
                  trend={metric.trend}
                  trendDescription={metric.trendDescription}
                  tooltip={metric.tooltip}
                  showInfoIcon={metric.showInfoIcon}
                  infoTooltip={metric.infoTooltip}
                />
              </Grid>
            ),
        )}
      </Grid>
    </Box>
  );
}
