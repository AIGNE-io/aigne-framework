import {useLocaleContext} from "@arcblock/ux/lib/Locale/context"
import Box from "@mui/material/Box"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import Typography from "@mui/material/Typography"
import {useMemo, useState} from "react"
import type {RunData} from "./types.ts"

export default function TraceDetailPanel({run}: {run?: RunData | null}) {
  const [tab, setTab] = useState(0)
  const {t} = useLocaleContext()

  const value = useMemo(() => {
    if (tab === 0) {
      return run?.attributes?.input
    }

    if (tab === 1) {
      return run?.attributes?.output
    }

    if (tab === 2) {
      return run?.status?.message
    }

    return null
  }, [tab, run?.attributes?.input, run?.attributes?.output, run?.status?.message])

  if (!run) {
    return null
  }

  return (
    <Box sx={{p: 2, height: "100%", overflowY: "auto"}}>
      <Typography fontWeight={600} fontSize={20} mb={2}>
        {run?.name}
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="inherit" indicatorColor="primary">
        <Tab label={t("input")} />
        <Tab label={t("output")} />
        {run.status?.code === 2 && <Tab label={t("errorMessage")} />}
      </Tabs>

      <Box mt={2}>
        <Box
          component="pre"
          sx={{
            backgroundColor: "#1e1e1e",
            color: "common.white",
            p: 2,
            borderRadius: 2,
            overflowX: "auto",
          }}>
          <Box>{JSON.stringify(value, null, 2)}</Box>
        </Box>
      </Box>
    </Box>
  )
}
