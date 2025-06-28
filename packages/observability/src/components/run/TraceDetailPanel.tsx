import InfoRow from "@arcblock/ux/lib/InfoRow";
import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import RelativeTime from "@arcblock/ux/lib/RelativeTime";
import Tag from "@arcblock/ux/lib/Tag";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import Decimal from "decimal.js";
import { isUndefined, omitBy } from "lodash";
import { useMemo, useState } from "react";
import useGetTokenPrice from "../../hooks/get-token-price.ts";
import useSwitchView from "../../hooks/switch-view.tsx";
import { parseDuration } from "../../utils/latency.ts";
import JsonView from "../json-view.tsx";
import ModelInfoTip from "../model-tip.tsx";
import RenderView from "../render-view.tsx";
import YamlView from "../yaml-view.tsx";
import { AgentTag } from "./AgentTag.tsx";
import type { TraceData } from "./types.ts";

export default function TraceDetailPanel({ trace }: { trace?: TraceData | null }) {
  const [tab, setTab] = useState("input");
  const { t } = useLocaleContext();
  const getPrices = useGetTokenPrice();
  const { view, renderView } = useSwitchView();

  const hasError = trace?.status?.code === 2;
  const hasUserContext =
    trace?.attributes?.userContext && Object.keys(trace?.attributes?.userContext).length > 0;
  const hasMemories = trace?.attributes?.memories && trace?.attributes?.memories.length > 0;
  const model = trace?.attributes?.output?.model;

  const value = useMemo(() => {
    if (tab === "input") {
      return trace?.attributes?.input;
    }

    if (tab === "output") {
      const { model, usage, ...rest } = trace?.attributes?.output || {};
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

  if (!trace) {
    return null;
  }

  const inputTokens = trace.attributes.output?.usage?.inputTokens || 0;
  const outputTokens = trace.attributes.output?.usage?.outputTokens || 0;

  const mapViews = {
    json: JsonView,
    yaml: YamlView,
    rendered: RenderView,
  };

  const ComponentView = mapViews[view as keyof typeof mapViews] || JsonView;

  return (
    <Box sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography fontSize={20} color="text.primary">
          {`${trace?.name}`}
        </Typography>

        <AgentTag agentTag={trace?.attributes?.agentTag} />
      </Box>

      <Box sx={{ my: 1 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            columnGap: "48px",
            rowGap: "4px",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <InfoRowBox valueComponent="div" nameFormatter={(v) => v} nameWidth={120} name="ID">
              <Box sx={{ textAlign: "right" }}>{trace?.id}</Box>
            </InfoRowBox>

            <InfoRowBox
              valueComponent="div"
              nameFormatter={(v) => v}
              nameWidth={120}
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
              nameWidth={120}
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
              nameWidth={120}
              name={t("duration")}
            >
              <Box sx={{ textAlign: "right" }}>
                {trace?.startTime &&
                  trace?.endTime &&
                  `${parseDuration(trace.startTime, trace.endTime)}`}
              </Box>
            </InfoRowBox>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            {!!inputTokens && (
              <InfoRowBox
                valueComponent="div"
                nameFormatter={(v) => v}
                nameWidth={120}
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
                nameWidth={120}
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
                nameWidth={120}
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
                nameWidth={120}
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
                  <Tag>{model}</Tag>

                  {(window as any)._modelPricesAndContextWindow?.[model] && (
                    <Tooltip
                      slotProps={{
                        tooltip: {
                          sx: { bgcolor: "common.white", color: "common.black", boxShadow: 4 },
                        },
                      }}
                      title={
                        <ModelInfoTip
                          modelInfo={{
                            ...(window as any)._modelPricesAndContextWindow?.[model],
                            model,
                          }}
                        />
                      }
                    >
                      <InfoIcon sx={{ color: "text.secondary", fontSize: 18, cursor: "pointer" }} />
                    </Tooltip>
                  )}
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
        mt={2}
        sx={{
          flex: 1,
          height: 0,
          overflow: "auto",
          position: "relative",
          backgroundColor: "#1e1e1e",
          borderRadius: 2,
        }}
      >
        <Box sx={{ position: "absolute", top: 15, right: 15, zIndex: 1000 }}>{renderView()}</Box>

        <Box sx={{ overflowX: "auto", color: "common.white" }}>
          {value === undefined || value === null ? (
            <Typography color="grey.500" sx={{ fontSize: 14, p: 2 }}>
              {t("noData")}
            </Typography>
          ) : typeof value === "object" ? (
            <ComponentView value={value} />
          ) : (
            <Typography sx={{ whiteSpace: "break-spaces", p: 2 }} component="pre">
              {JSON.stringify(value, null, 2)}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

const InfoRowBox = styled(InfoRow)`
  margin-bottom: 8px;
  max-width: 400px;
  width: 100%;

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
