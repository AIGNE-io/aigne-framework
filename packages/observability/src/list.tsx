import TableSearch from "@arcblock/ux/lib/Datatable/TableSearch";
import Empty from "@arcblock/ux/lib/Empty";
import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import RelativeTime from "@arcblock/ux/lib/RelativeTime";
import { ToastProvider } from "@arcblock/ux/lib/Toast";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { useRafInterval } from "ahooks";
import useDocumentVisibility from "ahooks/lib/useDocumentVisibility";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { joinURL, withQuery } from "ufo";
import CustomDateRangePicker from "./components/date-picker.tsx";
import RunDetailDrawer from "./components/run/RunDetailDrawer.tsx";
import type { TraceData } from "./components/run/types.ts";
import SwitchComponent from "./components/switch.tsx";
import { watchSSE } from "./utils/event.ts";
import { origin } from "./utils/index.ts";
import { parseDuration } from "./utils/latency.ts";

interface TracesResponse {
  data: TraceData[];
  total: number;
}

interface SearchState {
  page: number;
  pageSize: number;
  searchText: string;
  dateRange: [Date, Date];
}

export default function List() {
  const { t } = useLocaleContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const documentVisibility = useDocumentVisibility();
  const [live, setLive] = useState(false);

  const [search, setSearch] = useState<SearchState>({
    page: 1,
    pageSize: 20,
    searchText: "",
    dateRange: [
      dayjs().subtract(1, "month").startOf("day").toDate(),
      dayjs().endOf("day").toDate(),
    ],
  });

  const [traces, setTraces] = useState<TraceData[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTrace, setSelectedTrace] = useState<TraceData | null>(null);

  const fetchTraces = async ({
    page,
    pageSize,
    searchText = "",
    dateRange,
  }: { page: number; pageSize: number; searchText?: string; dateRange?: [Date, Date] }) => {
    setLoading(true);
    try {
      const res = await fetch(
        withQuery(joinURL(origin, "/api/trace/tree"), {
          page,
          pageSize,
          searchText,
          startDate: dateRange?.[0]?.toISOString() ?? "",
          endDate: dateRange?.[1]?.toISOString() ?? "",
        }),
      ).then((r) => r.json() as Promise<TracesResponse>);
      const formatted: TraceData[] = res.data.map((trace) => ({
        ...trace,
        startTime: Number(trace.startTime),
        endTime: Number(trace.endTime),
      }));
      setTraces(formatted);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (documentVisibility === "visible") {
      fetchTraces({
        page: search.page - 1,
        pageSize: search.pageSize,
        searchText: search.searchText,
        dateRange: search.dateRange,
      });
    }
  }, [search.page, search.pageSize, search.searchText, search.dateRange, documentVisibility]);

  useRafInterval(() => {
    if (!live) return;
    if (window.blocklet?.prefix) return;

    fetch(joinURL(origin, "/api/trace/tree/stats"))
      .then((res) => res.json() as Promise<{ data: { total: number } }>)
      .then(({ data }) => {
        if (data?.total && data.total !== total) {
          fetchTraces({ page: 0, pageSize: search.pageSize });
        }
      });
  }, 3000);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const abortController = new AbortController();
    (async () => {
      const res = await watchSSE({ signal: abortController.signal });
      const reader = res.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value?.type === "event") {
          fetchTraces({ page: 0, pageSize: search.pageSize });
        }
      }
    })();

    return () => {
      abortController.abort();
    };
  }, [search.pageSize]);

  const columns: GridColDef<TraceData>[] = [
    { field: "id", headerName: "ID", width: 160 },
    { field: "name", headerName: t("agentName"), minWidth: 150 },
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
      align: "right",
      headerAlign: "right",
      valueGetter: (_, row) => parseDuration(row.startTime, row.endTime),
    },
    {
      field: "status",
      headerName: t("status"),
      minWidth: 100,
      align: "center",
      headerAlign: "center",
      renderCell: ({ row }) => (
        <Chip
          label={row.status?.code === 1 ? t("success") : t("failed")}
          size="small"
          color={row.status?.code === 1 ? "success" : "error"}
          variant="outlined"
          sx={{ height: 21, ml: 1 }}
        />
      ),
    },
    {
      field: "startTime",
      headerName: t("startedAt"),
      minWidth: 160,
      align: "right",
      headerAlign: "right",
      renderCell: ({ row }) =>
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
      align: "right",
      headerAlign: "right",
      renderCell: ({ row }) =>
        row.endTime ? (
          <RelativeTime value={row.endTime} type="absolute" format="YYYY-MM-DD HH:mm:ss" />
        ) : (
          "-"
        ),
    },
  ];

  const onDateRangeChange = (value: [Date, Date]) => {
    setSearch((x) => ({ ...x, dateRange: value, page: 1 }));
  };

  return (
    <ToastProvider>
      <Box
        sx={{
          ".striped-row": {
            backgroundColor: "action.hover",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
          <TableSearch
            options={{
              searchPlaceholder: t("search"),
              searchDebounceTime: 600,
            }}
            search={search.searchText}
            searchText={search.searchText}
            searchTextUpdate={(text) => setSearch((x) => ({ ...x, searchText: text }))}
            searchClose={() => setSearch((x) => ({ ...x, searchText: "" }))}
            onSearchOpen={() => {}}
          />

          <Box key="date-picker" sx={{ mx: 1 }}>
            <CustomDateRangePicker value={search.dateRange} onChange={onDateRangeChange} />
          </Box>

          <Box sx={{ display: "flex" }}>
            <SwitchComponent live={live} setLive={setLive} />
          </Box>
        </Box>

        <DataGrid
          rows={traces}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 20, 50]}
          pagination
          paginationModel={{ page: search.page - 1, pageSize: search.pageSize }}
          onPaginationModelChange={(model) => {
            setSearch((x) => ({ ...x, page: model.page + 1, pageSize: model.pageSize }));
          }}
          rowCount={total}
          rowHeight={40}
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? "" : "striped-row"
          }
          paginationMode="server"
          onRowClick={({ row }) => {
            setSelectedTrace(row);
            setSearchParams((prev) => {
              prev.set("traceId", row.id);
              return prev;
            });
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
                }}
              >
                <Empty>{t("noData")}</Empty>
              </Box>
            ),
            noResultsOverlay: () => (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <Empty>{t("noData")}</Empty>
              </Box>
            ),
          }}
        />
      </Box>

      <RunDetailDrawer
        open={!!searchParams.get("traceId")}
        traceId={searchParams.get("traceId")}
        trace={selectedTrace}
        onClose={() => {
          setSelectedTrace(null);
          setSearchParams((prev) => {
            prev.delete("traceId");
            return prev;
          });
        }}
      />
    </ToastProvider>
  );
}
