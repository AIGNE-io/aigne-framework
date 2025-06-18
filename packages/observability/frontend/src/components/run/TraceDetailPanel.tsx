import InfoRow from "@arcblock/ux/lib/InfoRow"
import {useLocaleContext} from "@arcblock/ux/lib/Locale/context"
import RelativeTime from "@arcblock/ux/lib/RelativeTime"
import Tag from "@arcblock/ux/lib/Tag"
import styled from "@emotion/styled"
import Box from "@mui/material/Box"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import Typography from "@mui/material/Typography"
import {isUndefined, omitBy} from "lodash"
import {useMemo, useState} from "react"
import ReactJson from "react-json-view"
import {parseDuration} from "../../utils/latency.ts"
import {AgentTag} from "./AgentTag.tsx"
import type {RunData} from "./types.ts"

export default function TraceDetailPanel({run}: {run?: RunData | null}) {
  const [tab, setTab] = useState(0)
  const {t} = useLocaleContext()

  const hasError = run?.status?.code === 2
  const value = useMemo(() => {
    if (tab === 0) {
      return run?.attributes?.input
    }

    if (tab === 1) {
      return run?.attributes?.output
    }

    if (tab === 2) {
      return omitBy(
        {
          model: run?.attributes?.output?.model,
          inputTokens: run?.attributes?.output?.usage?.inputTokens,
          outputTokens: run?.attributes?.output?.usage?.outputTokens,
        },
        isUndefined
      )
    }

    if (tab === 3) {
      return run?.status?.message
    }

    return null
  }, [tab, run?.attributes?.input, run?.attributes?.output, run?.status?.message])

  const tabs = [
    {label: t("input"), value: 0},
    {label: t("output"), value: 1},
    {label: t("metadata"), value: 2},
    ...(hasError ? [{label: t("errorMessage"), value: 2}] : []),
  ]

  if (!run) {
    return null
  }

  const inputTokens = run.attributes.output?.usage?.inputTokens || 0
  const outputTokens = run.attributes.output?.usage?.outputTokens || 0

  return (
    <Box sx={{p: 2, height: "100%", overflowY: "auto"}}>
      <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
        <Typography fontWeight={600} fontSize={20} color="text.primary">
          {`${run?.name}`}
        </Typography>
      </Box>

      <Box sx={{mt: 2}}>
        <Box sx={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"}}>
          <InfoRowBox valueComponent="div" nameFormatter={v => v} nameWidth={120} name="ID">
            <Box sx={{textAlign: "right", fontSize: 14}}>{run?.id}</Box>
          </InfoRowBox>

          <InfoRowBox valueComponent="div" nameFormatter={v => v} nameWidth={120} name="Agent Type">
            <Box sx={{textAlign: "right", fontSize: 14}}>
              <AgentTag agentTag={run?.attributes?.agentTag} />
            </Box>
          </InfoRowBox>

          {!!inputTokens && (
            <InfoRowBox
              valueComponent="div"
              nameFormatter={v => v}
              nameWidth={120}
              name="Input Tokens">
              <Box sx={{textAlign: "right", fontSize: 14}}>{inputTokens}</Box>
            </InfoRowBox>
          )}

          {!!outputTokens && (
            <InfoRowBox
              valueComponent="div"
              nameFormatter={v => v}
              nameWidth={120}
              name="Output Tokens">
              <Box sx={{textAlign: "right", fontSize: 14}}>{outputTokens}</Box>
            </InfoRowBox>
          )}

          {outputTokens + inputTokens > 0 && (
            <InfoRowBox
              valueComponent="div"
              nameFormatter={v => v}
              nameWidth={120}
              name="Total Tokens">
              <Box sx={{textAlign: "right", fontSize: 14}}>{outputTokens + inputTokens}</Box>
            </InfoRowBox>
          )}

          <InfoRowBox valueComponent="div" nameFormatter={v => v} nameWidth={120} name="Start Time">
            <Box sx={{textAlign: "right", fontSize: 14}}>
              {run?.startTime && (
                <RelativeTime value={run?.startTime} type="all" disableTimezone useShortTimezone />
              )}
            </Box>
          </InfoRowBox>

          <InfoRowBox valueComponent="div" nameFormatter={v => v} nameWidth={120} name="Duration">
            <Box sx={{textAlign: "right", fontSize: 14}}>
              {run?.startTime && run?.endTime && `${parseDuration(run.startTime, run.endTime)}`}
            </Box>
          </InfoRowBox>

          {!!run?.attributes?.output?.model && (
            <InfoRowBox valueComponent="div" nameFormatter={v => v} nameWidth={120} name="Model">
              <Box sx={{textAlign: "right", fontSize: 14}}>
                <Tag>{run?.attributes?.output?.model}</Tag>
              </Box>
            </InfoRowBox>
          )}
        </Box>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="inherit" indicatorColor="primary">
        {tabs.map(t => (
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
          }}>
          {value === undefined || value === null ? (
            <Typography color="grey.500">{t("noData")}</Typography>
          ) : typeof value === "object" ? (
            <ReactJson
              src={value}
              name={false}
              collapsed={3}
              enableClipboard={true}
              displayDataTypes={false}
              style={{background: "none", color: "inherit", fontSize: 14}}
              theme="monokai"
            />
          ) : (
            <Typography sx={{whiteSpace: "pre-wrap"}}>{String(value)}</Typography>
          )}
        </Box>
      </Box>
    </Box>
  )
}

const InfoRowBox = styled(InfoRow)({
  marginBottom: 0,

  ".info-row__name": {
    fontSize: 13,
    color: "#6e6e6e",
  },

  ".info-row__value": {
    fontSize: 13,
    color: "#222",
  },
})
