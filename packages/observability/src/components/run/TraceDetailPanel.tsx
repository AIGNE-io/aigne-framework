import InfoRow from "@arcblock/ux/lib/InfoRow";
import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import RelativeTime from "@arcblock/ux/lib/RelativeTime";
import Tag from "@arcblock/ux/lib/Tag";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import Decimal from "decimal.js";
import { isUndefined, omitBy } from "lodash";
import { useMemo, useState } from "react";
import ReactJson from "react-json-view";
import useGetTokenPrice from "../../hooks/get-token-price.ts";
import { parseDuration } from "../../utils/latency.ts";
import { AgentTag } from "./AgentTag.tsx";
import type { TraceData } from "./types.ts";

export default function TraceDetailPanel({ trace }: { trace?: TraceData | null }) {
  const [tab, setTab] = useState("input");
  const { t } = useLocaleContext();
  const getPrices = useGetTokenPrice();

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
            <InfoRowBox valueComponent="div" nameFormatter={(v) => v} nameWidth={80} name="ID">
              <Box sx={{ textAlign: "right" }}>{trace?.id}</Box>
            </InfoRowBox>

            <InfoRowBox
              valueComponent="div"
              nameFormatter={(v) => v}
              nameWidth={80}
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
              nameWidth={80}
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
              nameWidth={80}
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
                nameWidth={80}
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
                nameWidth={80}
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
                nameWidth={80}
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
                nameWidth={80}
                name={t("model")}
              >
                <Box sx={{ textAlign: "right" }}>
                  <Tag>{model}</Tag>
                </Box>
              </InfoRowBox>
            )}
          </Box>
        </Box>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="inherit" indicatorColor="primary">
        {tabs.map((t) => (
          <Tab key={t.value} label={t.label} value={t.value} />
        ))}
      </Tabs>

      <Box mt={2} sx={{ flex: 1, height: 0, overflow: "auto" }}>
        <Box
          sx={{
            backgroundColor: "#1e1e1e",
            p: 2,
            borderRadius: 2,
            overflowX: "auto",
            color: "common.white",

            "& .string-value": {
              whiteSpace: "pre-line",
              wordBreak: "break-word",
            },
          }}
        >
          {value === undefined || value === null ? (
            <Typography color="grey.500" sx={{ fontSize: 14 }}>
              {t("noData")}
            </Typography>
          ) : typeof value === "object" ? (
            <ReactJson
              src={value}
              name={false}
              collapsed={3}
              enableClipboard={false}
              displayDataTypes={false}
              style={{ background: "none", color: "inherit", fontSize: 14 }}
              theme="monokai"
            />
          ) : (
            <Typography sx={{ whiteSpace: "pre-wrap" }} component="pre">
              {String(value)}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

const InfoRowBox = styled(InfoRow)`
  margin-bottom: 0;
  max-width: 400px;
  width: 100%;

  .info-row__name {
    font-size: 11px;
    color: ${({ theme }) => theme.palette.text.secondary};
  }

  .info-row__value {
    font-size: 13px;
    color: ${({ theme }) => theme.palette.text.primary};
    font-weight: 400;
  }
`;
