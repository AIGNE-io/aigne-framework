import {useLocaleContext} from "@arcblock/ux/lib/Locale/context"
import Tag from "@arcblock/ux/lib/Tag"
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder"
import TokenIcon from "@mui/icons-material/Token"
import Box from "@mui/material/Box"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import Typography from "@mui/material/Typography"
import {isUndefined, omitBy} from "lodash"
import {useMemo, useState} from "react"
import ReactJson from "react-json-view"
import {parseDuration, parseDurationMs} from "../../utils/latency.ts"
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

      <Box sx={{display: "flex", alignItems: "center", gap: 2, mt: 1, color: "text.secondary"}}>
        {!!parseDurationMs(run.startTime, run.endTime) && (
          <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
            <QueryBuilderIcon fontSize="small" />
            <Typography fontSize={14}>{`${parseDuration(run.startTime, run.endTime)}`}</Typography>
          </Box>
        )}

        {inputTokens + outputTokens > 0 && (
          <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
            <TokenIcon fontSize="small" />
            <Typography fontSize={14}>{`${inputTokens + outputTokens} tokens`}</Typography>
          </Box>
        )}

        {run?.attributes?.output?.model && (
          <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
            <Tag>{run.attributes.output?.model}</Tag>
          </Box>
        )}
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
