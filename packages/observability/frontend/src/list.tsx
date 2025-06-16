import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import Paper from "@mui/material/Paper"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import {useEffect, useState} from "react"
import {joinURL} from "ufo"

import {useLocaleContext} from "@arcblock/ux/lib/Locale/context"
import RunDetailDrawer from "./components/run/RunDetailDrawer.tsx"
import type {RunData} from "./components/run/types.ts"
import {parseDuration} from "./utils/latency.ts"

interface RunsResponse {
  data: RunData[]
}

const origin = process.env.NODE_ENV === "development" ? "http://localhost:7890" : ""

function App() {
  const [runs, setRuns] = useState<RunData[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedRun, setSelectedRun] = useState<RunData | null>(null)
  const {t} = useLocaleContext()

  useEffect(() => {
    setLoading(true)

    fetch(joinURL(origin, "/api/trace/tree"))
      .then(res => res.json() as Promise<RunsResponse>)
      .then(({data}) => {
        const format = (run: RunData) => ({
          ...run,
          startTime: Number(run.startTime),
          endTime: Number(run.endTime),
        })
        const formatted = data.map(format)
        setRuns(formatted)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const formatTime = (ts?: number) => {
    if (!ts) return "-"
    const d = new Date(ts)
    return d.toLocaleString()
  }

  return (
    <Box sx={{minHeight: "100vh", bgcolor: "#fff", p: 4}}>
      <Paper elevation={0} sx={{borderRadius: 5, p: 3, minHeight: 500, overflow: "hidden"}}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t("agentName")}</TableCell>
                <TableCell>{t("input")}</TableCell>
                <TableCell>{t("output")}</TableCell>
                <TableCell>{t("status")}</TableCell>
                <TableCell>{t("startedAt")}</TableCell>
                <TableCell>{t("endedAt")}</TableCell>
                <TableCell>{t("latency")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    {t("loading")}
                  </TableCell>
                </TableRow>
              ) : runs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    {t("noData")}
                  </TableCell>
                </TableRow>
              ) : (
                runs.map(run => (
                  <TableRow
                    key={run.id}
                    hover
                    style={{cursor: "pointer"}}
                    onClick={() => {
                      setSelectedRun(run)
                      setDrawerOpen(true)
                    }}>
                    <TableCell>{run.name}</TableCell>
                    <TableCell>{JSON.stringify(run.attributes.input)}</TableCell>
                    <TableCell>{JSON.stringify(run.attributes.output)}</TableCell>
                    <TableCell>
                      <Chip
                        label={run.status?.code === 1 ? t("success") : t("failed")}
                        size="small"
                        color={run.status?.code === 1 ? "success" : "error"}
                      />
                    </TableCell>
                    <TableCell sx={{width: 200}}>{formatTime(run.startTime)}</TableCell>
                    <TableCell sx={{width: 200}}>{formatTime(run.endTime)}</TableCell>
                    <TableCell sx={{width: 100}}>
                      {parseDuration(run.startTime, run.endTime)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <RunDetailDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setSelectedRun(null)
        }}
        run={selectedRun}
      />
    </Box>
  )
}

export default App
