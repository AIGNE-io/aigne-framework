import Empty from "@arcblock/ux/lib/Empty"
import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import {DataGrid} from "@mui/x-data-grid"
import type {GridColDef} from "@mui/x-data-grid"
import {useEffect, useState} from "react"
import {joinURL, withQuery} from "ufo"

import {useLocaleContext} from "@arcblock/ux/lib/Locale/context"
import RelativeTime from "@arcblock/ux/lib/RelativeTime"
import RunDetailDrawer from "./components/run/RunDetailDrawer.tsx"
import type {RunData} from "./components/run/types.ts"
import {watchSSE} from "./utils/event.ts"
import {origin} from "./utils/index.js"
import {parseDuration} from "./utils/latency.ts"

interface RunsResponse {
  data: RunData[]
  total: number
}

const page = 0
const pageSize = 20

function App() {
  const {t} = useLocaleContext()
  const [runs, setRuns] = useState<RunData[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedRun, setSelectedRun] = useState<RunData | null>(null)
  const [paginationModel, setPaginationModel] = useState({page, pageSize})
  const [total, setTotal] = useState(0)

  const fetchRuns = async ({page, pageSize}: {page: number; pageSize: number}) => {
    fetch(withQuery(joinURL(origin, "/api/trace/tree"), {page, pageSize}))
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
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const abortController = new AbortController()

    ;(async () => {
      const res = await watchSSE({
        signal: abortController.signal,
      })
      const reader = res.getReader()

      while (true) {
        const {done, value} = await reader.read()
        if (done) {
          break
        }

        if (value) {
          switch (value.type) {
            case "event": {
              fetchRuns({page: 0, pageSize: paginationModel.pageSize})
              break
            }
            case "error": {
              console.log("error", value)
              break
            }
            default:
              console.warn("Unsupported event", value)
          }
        }
      }
    })()

    return () => {
      abortController.abort()
    }
  }, [paginationModel.pageSize])

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    setLoading(true)

    fetchRuns({page: paginationModel.page, pageSize: paginationModel.pageSize})
  }, [paginationModel.page, paginationModel.pageSize])

  const columns: GridColDef<RunData>[] = [
    {field: "id", headerName: "ID", width: 160},
    {field: "name", headerName: t("agentName"), minWidth: 150},
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
          variant="outlined"
          sx={{height: 21}}
        />
      ),
    },
    {
      field: "startTime",
      headerName: t("startedAt"),
      minWidth: 160,
      renderCell: ({row}) =>
        row.startTime ? (
          <RelativeTime value={row.startTime} type="absolute" format="YYYY-MM-DD HH:mm:ss" />
        ) : (
          "-"
        ),
    },
    {
      field: "endTime",
      headerName: t("endedAt"),
      minWidth: 160,
      renderCell: ({row}) =>
        row.endTime ? (
          <RelativeTime value={row.endTime} type="absolute" format="YYYY-MM-DD HH:mm:ss" />
        ) : (
          "-"
        ),
    },
  ]

  return (
    <>
      <Box
        sx={{
          ".striped-row": {
            backgroundColor: "action.hover",
          },
        }}>
        <DataGrid
          rows={runs}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 20, 50]}
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={total}
          rowHeight={40}
          getRowClassName={params =>
            params.indexRelativeToCurrentPage % 2 === 0 ? "" : "striped-row"
          }
          paginationMode="server"
          onRowClick={({row}) => {
            setSelectedRun(row)
            setDrawerOpen(true)
          }}
          disableRowSelectionOnClick
          sx={{
            cursor: "pointer",
            minHeight: 500,
          }}
          slots={{
            noRowsOverlay: () => (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}>
                <Empty>{t("noData")}</Empty>
              </Box>
            ),
          }}
        />
      </Box>

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
