import InfoRow from "@arcblock/ux/lib/InfoRow";
import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import RelativeTime from "@arcblock/ux/lib/RelativeTime";
import Tag from "@arcblock/ux/lib/Tag";
import Toast from "@arcblock/ux/lib/Toast";
import type { SxProps } from "@mui/material";
import { useMediaQuery } from "@mui/material";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { styled } from "@mui/material/styles";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Decimal from "decimal.js";
import { isUndefined, omitBy } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { joinURL } from "ufo";
import useGetTokenPrice from "../../hooks/get-token-price.ts";
import { origin } from "../../utils/index.ts";
import { parseDuration } from "../../utils/latency.ts";
import JsonView from "../json-view.tsx";
import ModelInfoTip from "../model-tip.tsx";
import { AgentTag } from "./agent-tag.tsx";
import type { TraceData } from "./types.ts";

export default function TraceDetailPanel({
  trace: originalTrace,
  sx,
}: {
  trace?: TraceData | null;
  sx?: SxProps;
}) {
  const [tab, setTab] = useState("input");
  const { t } = useLocaleContext();
  const getPrices = useGetTokenPrice();
  const [trace, setTrace] = useState<TraceData | undefined | null>(originalTrace);
  const isMobile = useMediaQuery((x) => x.breakpoints.down("md"));
  const [isLoading, setIsLoading] = useState(false);
  const hasError = trace?.status?.code === 2;
  const hasUserContext =
    trace?.attributes?.userContext && Object.keys(trace?.attributes?.userContext).length > 0;
  const hasMemories = trace?.attributes?.memories && trace?.attributes?.memories.length > 0;
  const model = trace?.attributes?.output?.model;

  const init = async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);

      const start = Date.now();

      const res = await fetch(joinURL(origin, `/api/trace/tree/children/${originalTrace?.id}`), {
        signal,
      }).then((res) => res.json());

      const duration = Date.now() - start;
      const remaining = Math.max(0, 1000 - duration);

      await new Promise((resolve, reject) => {
        const timer = setTimeout(resolve, remaining);
        signal?.addEventListener("abort", () => {
          clearTimeout(timer);
          reject(new DOMException("Aborted", "AbortError"));
        });
      });

      setTrace(res.data);
    } catch (error: any) {
      if (error.name !== "AbortError") {
        Toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  useEffect(() => {
    if (!originalTrace?.id) return;

    const controller = new AbortController();
    init(controller.signal);

    return () => {
      controller.abort();
    };
  }, [originalTrace]);

  const value = useMemo(() => {
    if (tab === "input") {
      return trace?.attributes?.input;
    }

    if (tab === "output") {
      const { model: _model, usage: _usage, ...rest } = trace?.attributes?.output || {};
      return rest;
    }

    if (tab === "metadata") {
      return omitBy({ model: model, usage: trace?.attributes?.output?.usage }, isUndefined);
    }

    if (tab === "errorMessage") {
      return trace?.status?.message;
    }

    if (tab === "userContext") {
      return trace?.attributes?.userContext;
    }

    if (tab === "memories") {
      return trace?.attributes?.memories;
    }

    return null;
  }, [
    tab,
    model,
    trace?.attributes?.input,
    trace?.attributes?.output,
    trace?.status?.message,
    trace?.attributes?.userContext,
    trace?.attributes?.memories,
  ]);

  const prices = useMemo(() => {
    const { inputCost, outputCost } = getPrices({
      model,
      inputTokens: trace?.attributes?.output?.usage?.inputTokens || 0,
      outputTokens: trace?.attributes?.output?.usage?.outputTokens || 0,
    });

    return {
      inputCost: inputCost.gt(new Decimal(0)) ? `($${inputCost.toString()})` : null,
      outputCost: outputCost.gt(new Decimal(0)) ? `($${outputCost.toString()})` : null,
      totalCost: inputCost.add(outputCost).gt(new Decimal(0))
        ? `($${inputCost.add(outputCost).toString()})`
        : null,
    };
  }, [model, trace?.attributes?.output?.usage, getPrices]);

  const tabs = [
    { label: t("input"), value: "input" },
    { label: t("output"), value: "output" },
    ...(hasError ? [{ label: t("errorMessage"), value: "errorMessage" }] : []),
    ...(hasUserContext ? [{ label: t("userContext"), value: "userContext" }] : []),
    ...(hasMemories ? [{ label: t("memories"), value: "memories" }] : []),
    { label: t("metadata"), value: "metadata" },
  ];

  if (!trace) return null;

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <CircularProgress />
      </Box>
    );
  }

  const inputTokens = trace.attributes.output?.usage?.inputTokens || 0;
  const outputTokens = trace.attributes.output?.usage?.outputTokens || 0;

  return (
    <Box sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column", ...sx }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography sx={{ fontSize: 20, color: "text.primary" }}>{`${trace?.name}`}</Typography>
        <AgentTag agentTag={trace?.attributes?.agentTag} model={trace?.attributes?.output?.model} />
      </Box>
      <Box sx={{ my: 1 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 0 : 6,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", flex: 1 }}>
            <InfoRowBox valueComponent="div" nameFormatter={(v) => v} nameWidth={110} name="ID">
              <Box sx={{ textAlign: "right" }}>{trace?.id}</Box>
            </InfoRowBox>

            <InfoRowBox
              valueComponent="div"
              nameFormatter={(v) => v}
              nameWidth={110}
              name={t("startTime")}
            >
              <Box sx={{ textAlign: "right" }}>
                {trace?.startTime && (
                  <RelativeTime
                    value={trace?.startTime}
                    type="absolute"
                    format="YYYY-MM-DD HH:mm:ss"
                  />
                )}
              </Box>
            </InfoRowBox>

            <InfoRowBox
              valueComponent="div"
              nameFormatter={(v) => v}
              nameWidth={110}
              name={t("endTime")}
            >
              <Box sx={{ textAlign: "right" }}>
                {trace?.endTime && (
                  <RelativeTime
                    value={trace?.endTime}
                    type="absolute"
                    format="YYYY-MM-DD HH:mm:ss"
                  />
                )}
              </Box>
            </InfoRowBox>

            <InfoRowBox
              valueComponent="div"
              nameFormatter={(v) => v}
              nameWidth={110}
              name={t("duration")}
            >
              <Box sx={{ textAlign: "right" }}>
                {trace?.startTime &&
                  trace?.endTime &&
                  `${parseDuration(trace.startTime, trace.endTime)}`}
              </Box>
            </InfoRowBox>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flex: 1 }}>
            {!!inputTokens && (
              <InfoRowBox
                valueComponent="div"
                nameFormatter={(v) => v}
                nameWidth={110}
                name={t("inputTokens")}
              >
                <Box sx={{ textAlign: "right" }}>
                  {inputTokens} {prices?.inputCost}
                </Box>
              </InfoRowBox>
            )}

            {!!outputTokens && (
              <InfoRowBox
                valueComponent="div"
                nameFormatter={(v) => v}
                nameWidth={110}
                name={t("outputTokens")}
              >
                <Box sx={{ textAlign: "right" }}>
                  {outputTokens} {prices?.outputCost}
                </Box>
              </InfoRowBox>
            )}

            {outputTokens + inputTokens > 0 && (
              <InfoRowBox
                valueComponent="div"
                nameFormatter={(v) => v}
                nameWidth={110}
                name={t("totalTokens")}
              >
                <Box sx={{ textAlign: "right" }}>
                  {outputTokens + inputTokens} {prices?.totalCost}
                </Box>
              </InfoRowBox>
            )}

            {!!model && (
              <InfoRowBox
                valueComponent="div"
                nameFormatter={(v) => v}
                nameWidth={110}
                name={t("model")}
              >
                <Box
                  sx={{
                    textAlign: "right",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    justifyContent: "flex-end",
                  }}
                >
                  <Tooltip
                    slotProps={{
                      tooltip: {
                        sx: { bgcolor: "common.white", color: "common.black", boxShadow: 4 },
                      },
                    }}
                    title={
                      (window as any).modelPrices?.[model] ? (
                        <ModelInfoTip
                          modelInfo={{
                            ...(window as any).modelPrices?.[model],
                            model,
                          }}
                        />
                      ) : undefined
                    }
                  >
                    <Tag sx={{ cursor: "pointer" }}>{model}</Tag>
                  </Tooltip>
                </Box>
              </InfoRowBox>
            )}
          </Box>
        </Box>
      </Box>
      <Box sx={{ position: "relative" }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          textColor="inherit"
          indicatorColor="primary"
        >
          {tabs.map((t) => (
            <Tab key={t.value} label={t.label} value={t.value} />
          ))}
        </Tabs>
      </Box>
      <Box
        sx={{
          mt: 2,
          flex: 1,
          height: 0,
          overflow: "hidden",
          position: "relative",
          backgroundColor: "#1e1e1e",
          borderRadius: 2,
        }}
      >
        {!isLoading ? (
          <Box sx={{ color: "common.white", height: "100%" }}>
            {value === undefined || value === null ? (
              <Typography sx={{ color: "grey.500", fontSize: 14, p: 2 }}>{t("noData")}</Typography>
            ) : typeof value === "object" ? (
              <JsonView value={value} />
            ) : (
              <Typography sx={{ whiteSpace: "break-spaces", p: 2, fontSize: 14 }} component="pre">
                {JSON.stringify(value, null, 2)}
              </Typography>
            )}
          </Box>
        ) : (
          <Box
            sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}
          >
            <CircularProgress />
          </Box>
        )}
      </Box>
    </Box>
  );
}

const InfoRowBox = styled(InfoRow)`
  margin-bottom: 8px;
  width: 100%;
  flex-direction: row !important;
  align-items: center !important;

  .info-row__name {
    font-size: 13px;
    color: ${({ theme }) => theme.palette.text.primary};
  }

  .info-row__value {
    font-size: 13px;
    font-weight: 400;
    color: ${({ theme }) => theme.palette.text.secondary};
  }
`;
