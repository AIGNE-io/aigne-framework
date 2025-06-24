import InfoRow from "@arcblock/ux/lib/InfoRow";
import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import RelativeTime from "@arcblock/ux/lib/RelativeTime";
import Tag from "@arcblock/ux/lib/Tag";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { isUndefined, omitBy } from "lodash";
import { useMemo, useState } from "react";
import ReactJson from "react-json-view";
import { parseDuration } from "../../utils/latency.ts";
import { AgentTag } from "./AgentTag.tsx";
import type { RunData } from "./types.ts";

export default function TraceDetailPanel({ run }: { run?: RunData | null }) {
  const [tab, setTab] = useState(0);
  const { t } = useLocaleContext();

  const hasError = run?.status?.code === 2;
  const value = useMemo(() => {
    if (tab === 0) {
      return run?.attributes?.input;
    }

    if (tab === 1) {
      return run?.attributes?.output;
    }

    if (tab === 2) {
      return omitBy(
        {
          model: run?.attributes?.output?.model,
          inputTokens: run?.attributes?.output?.usage?.inputTokens,
          outputTokens: run?.attributes?.output?.usage?.outputTokens,
        },
        isUndefined,
      );
    }

    if (tab === 3) {
      return run?.status?.message;
    }

    return null;
  }, [tab, run?.attributes?.input, run?.attributes?.output, run?.status?.message]);

  const tabs = [
    { label: t("input"), value: 0 },
    { label: t("output"), value: 1 },
    { label: t("metadata"), value: 2 },
    ...(hasError ? [{ label: t("errorMessage"), value: 2 }] : []),
  ];

  if (!run) {
    return null;
  }

  const inputTokens = run.attributes.output?.usage?.inputTokens || 0;
  const outputTokens = run.attributes.output?.usage?.outputTokens || 0;

  return (
    <Box sx={{ p: 2, height: "100%", overflowY: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography fontSize={20} color="text.primary">
          {`${run?.name}`}
        </Typography>
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
          <InfoRowBox valueComponent="div" nameFormatter={(v) => v} nameWidth={80} name="ID">
            <Box sx={{ textAlign: "right" }}>{run?.id}</Box>
          </InfoRowBox>

          {!!run?.attributes?.agentTag && (
            <InfoRowBox
              valueComponent="div"
              nameFormatter={(v) => v}
              nameWidth={80}
              name={t("agentTag")}
            >
              <Box sx={{ textAlign: "right" }}>
                <AgentTag agentTag={run?.attributes?.agentTag} />
              </Box>
            </InfoRowBox>
          )}

          {!!inputTokens && (
            <InfoRowBox
              valueComponent="div"
              nameFormatter={(v) => v}
              nameWidth={80}
              name={t("inputTokens")}
            >
              <Box sx={{ textAlign: "right" }}>{inputTokens}</Box>
            </InfoRowBox>
          )}

          {!!outputTokens && (
            <InfoRowBox
              valueComponent="div"
              nameFormatter={(v) => v}
              nameWidth={80}
              name={t("outputTokens")}
            >
              <Box sx={{ textAlign: "right" }}>{outputTokens}</Box>
            </InfoRowBox>
          )}

          {outputTokens + inputTokens > 0 && (
            <InfoRowBox
              valueComponent="div"
              nameFormatter={(v) => v}
              nameWidth={80}
              name={t("totalTokens")}
            >
              <Box sx={{ textAlign: "right" }}>{outputTokens + inputTokens}</Box>
            </InfoRowBox>
          )}

          <InfoRowBox
            valueComponent="div"
            nameFormatter={(v) => v}
            nameWidth={80}
            name={t("startTime")}
          >
            <Box sx={{ textAlign: "right" }}>
              {run?.startTime && (
                <RelativeTime value={run?.startTime} type="absolute" format="YYYY-MM-DD HH:mm:ss" />
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
              {run?.startTime && run?.endTime && `${parseDuration(run.startTime, run.endTime)}`}
            </Box>
          </InfoRowBox>

          {!!run?.attributes?.output?.model && (
            <InfoRowBox
              valueComponent="div"
              nameFormatter={(v) => v}
              nameWidth={80}
              name={t("model")}
            >
              <Box sx={{ textAlign: "right" }}>
                <Tag>{run?.attributes?.output?.model}</Tag>
              </Box>
            </InfoRowBox>
          )}
        </Box>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="inherit" indicatorColor="primary">
        {tabs.map((t) => (
          <Tab key={t.value} label={t.label} />
        ))}
      </Tabs>

      <Box mt={2}>
        <Box
          component="pre"
          sx={{
            backgroundColor: "#1e1e1e",
            p: 2,
            borderRadius: 2,
            overflowX: "auto",
            color: "common.white",
          }}
        >
          {value === undefined || value === null ? (
            <Typography color="grey.500">{t("noData")}</Typography>
          ) : typeof value === "object" ? (
            <ReactJson
              src={value}
              name={false}
              collapsed={3}
              enableClipboard={true}
              displayDataTypes={false}
              style={{ background: "none", color: "inherit", fontSize: 14 }}
              theme="monokai"
            />
          ) : (
            <Typography sx={{ whiteSpace: "pre-wrap" }}>{String(value)}</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

const InfoRowBox = styled(InfoRow)`
  margin-bottom: 0;

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
