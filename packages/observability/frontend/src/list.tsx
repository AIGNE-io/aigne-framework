import Chip from "@mui/material/Chip"
import Paper from "@mui/material/Paper"
import {useEffect, useState} from "react"
import {joinURL, withQuery} from "ufo"
import {DataGrid} from "@mui/x-data-grid"
import type {GridColDef} from "@mui/x-data-grid"

import {useLocaleContext} from "@arcblock/ux/lib/Locale/context"
import RunDetailDrawer from "./components/run/RunDetailDrawer.tsx"
import type {RunData} from "./components/run/types.ts"
import {parseDuration} from "./utils/latency.ts"
import RelativeTime from "@arcblock/ux/lib/RelativeTime"

interface RunsResponse {
  data: RunData[]
  total: number
}

const origin = process.env.NODE_ENV === "development" ? "http://localhost:7890" : ""

function App() {
  const {t} = useLocaleContext()
  const [runs, setRuns] = useState<RunData[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedRun, setSelectedRun] = useState<RunData | null>(null)
  const [paginationModel, setPaginationModel] = useState({page: 0, pageSize: 10})
  const [total, setTotal] = useState(0)

  useEffect(() => {
    setLoading(true)

    fetch(
      withQuery(joinURL(origin, "/api/trace/tree"), {
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
      })
    )
      .then(res => res.json() as Promise<RunsResponse>)
      .then(({data, total: totalCount}) => {
        const format = (run: RunData) => ({
          ...run,
          startTime: Number(run.startTime),
          endTime: Number(run.endTime),
        })
        const formatted = data.map(format)
        setRuns(formatted)
        setLoading(false)
        setTotal(totalCount)
      })
      .catch(() => setLoading(false))
  }, [paginationModel.page, paginationModel.pageSize])

  const columns: GridColDef<RunData>[] = [
    {field: "id", headerName: "ID", flex: 1, minWidth: 120},
    {field: "name", headerName: t("agentName"), flex: 1, minWidth: 120},
    {
      field: "input",
      headerName: t("input"),
      flex: 1,
      minWidth: 120,
      valueGetter: (_, row) => JSON.stringify(row.attributes?.input),
    },
    {
      field: "output",
      headerName: t("output"),
      flex: 1,
      minWidth: 120,
      valueGetter: (_, row) => JSON.stringify(row.attributes?.output),
    },
    {
      field: "latency",
      headerName: t("latency"),
      minWidth: 100,
      valueGetter: (_, row) => parseDuration(row.startTime, row.endTime),
    },
    {
      field: "status",
      headerName: t("status"),
      minWidth: 100,
      renderCell: ({row}) => (
        <Chip
          label={row.status?.code === 1 ? t("success") : t("failed")}
          size="small"
          color={row.status?.code === 1 ? "success" : "error"}
        />
      ),
    },
    {
      field: "startTime",
      headerName: t("startedAt"),
      minWidth: 160,
      renderCell: ({row}) => (row.startTime ? <RelativeTime value={row.startTime} /> : "-"),
    },
    {
      field: "endTime",
      headerName: t("endedAt"),
      minWidth: 160,
      renderCell: ({row}) => (row.endTime ? <RelativeTime value={row.endTime} /> : "-"),
    },
  ]

  return (
    <>
      <Paper elevation={0}>
        <DataGrid
          rows={runs}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 20, 50]}
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={total}
          paginationMode="server"
          onRowClick={({row}) => {
            setSelectedRun(row)
            setDrawerOpen(true)
          }}
          disableRowSelectionOnClick
          disableColumnFilter
          disableColumnMenu
          sx={{cursor: "pointer"}}
        />
      </Paper>

      <RunDetailDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setSelectedRun(null)
        }}
        run={selectedRun}
      />
    </>
  )
}

export default App
