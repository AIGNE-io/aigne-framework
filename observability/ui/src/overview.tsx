import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import { CallMade, InfoOutlined, TrendingUp } from "@mui/icons-material";
import { Box, Card, CardContent, Grid, styled, Tooltip, Typography } from "@mui/material";
import useRequest from "ahooks/lib/useRequest";
import BigNumber from "bignumber.js";
import prettyMs from "pretty-ms";
import { joinURL } from "ufo";
import Metric from "./components/metric.js";
import formatNumber from "./utils/format-number.ts";
import { origin } from "./utils/index.js";

export interface UsageSummaryProps {
  title?: string;
  totalCount?: number;
  successCount?: number;
  failCount?: number;
  totalToken?: number;
  totalCost?: number;
  totalDuration?: number;
  maxLatency?: number;
  minLatency?: number;
  avgLatency?: number;
  llmSuccessCount?: number;
  llmTotalCount?: number;
  llmTotalDuration?: number;
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

export function SummaryCard({
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

function UsageSummary({
  totalToken = 0,
  totalCost = 0,
  totalCount = 0,
  successCount = 0,
  title = undefined,
  totalDuration = 0,
  llmTotalCount = 0,
  llmSuccessCount = 0,
  llmTotalDuration = 0,
}: UsageSummaryProps) {
  const { t, locale } = useLocaleContext();

  const metrics = [
    {
      title: t("analytics.totalToken"),
      value: formatNumber(new BigNumber(totalToken || 0).dp(2).toNumber(), locale),
      icon: <CallMade color="primary" />,
    },
    {
      title: t("analytics.totalCost"),
      value: `$${Number(totalCost || 0).toFixed(6)}`,
      icon: <TrendingUp color="success" />,
    },
    {
      title: t("analytics.totalCount"),
      value: `${totalCount}<small>${t("analytics.active")} ${successCount}</small>`,
      icon: <TrendingUp color="success" />,
    },
    {
      title: t("analytics.totalDuration"),
      value: prettyMs(totalDuration),
      icon: <TrendingUp color="success" />,
    },
    {
      title: t("analytics.llmTotalCount"),
      value: `${llmTotalCount}<small>${t("analytics.active")} ${llmSuccessCount}</small>`,
      icon: <TrendingUp color="success" />,
    },
    {
      title: t("analytics.llmTotalDuration"),
      value: prettyMs(llmTotalDuration),
      icon: <TrendingUp color="success" />,
    },
  ];

  return (
    <Div>
      <Box className="section">
        {title && (
          <Typography className="section__header" color="textPrimary" component="h2">
            {title}
          </Typography>
        )}
        <Grid className="page-metrics" container spacing={5}>
          {metrics.map(({ icon, ...x }) => (
            <Grid
              key={x.title}
              sx={{ small: { ml: 0.5 } }}
              size={{
                xl: 1.5,
                lg: 3,
                md: 4,
                sm: 6,
                xs: 6,
              }}
            >
              <Metric {...x} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Div>
  );
}

export default () => {
  const { t } = useLocaleContext();
  const { data: usageSummary } = useRequest(async () => {
    try {
      const res = await fetch(joinURL(origin, "/api/trace/tree/summary"));
      return res.json() as Promise<UsageSummaryProps>;
    } catch {
      return { totalToken: 0, totalCost: 0 };
    }
  });

  return (
    <UsageSummary
      title={t("overview")}
      totalToken={usageSummary?.totalToken}
      totalCost={usageSummary?.totalCost}
      totalCount={usageSummary?.totalCount}
      successCount={usageSummary?.successCount}
      totalDuration={usageSummary?.totalDuration}
      llmTotalCount={usageSummary?.llmTotalCount}
      llmSuccessCount={usageSummary?.llmSuccessCount}
      llmTotalDuration={usageSummary?.llmTotalDuration}
    />
  );
};

const Div = styled(Typography)`
  .section {
    display: flex;
    flex-direction: column;
    margin-bottom: 64px;

    .section__header {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 24px;
    }
  }
`;
