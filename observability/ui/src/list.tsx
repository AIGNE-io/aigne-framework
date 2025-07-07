import dayjs from "@abtnode/util/lib/dayjs";
import TableSearch from "@arcblock/ux/lib/Datatable/TableSearch";
import Empty from "@arcblock/ux/lib/Empty";
import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import RelativeTime from "@arcblock/ux/lib/RelativeTime";
import { ToastProvider } from "@arcblock/ux/lib/Toast";
import UserCard from "@arcblock/ux/lib/UserCard";
import { CardType, InfoType } from "@arcblock/ux/lib/UserCard/types";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import type { GridColDef } from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";
import useDocumentVisibility from "ahooks/lib/useDocumentVisibility";
import useLocalStorageState from "ahooks/lib/useLocalStorageState";
import useRafInterval from "ahooks/lib/useRafInterval";
import useRequest from "ahooks/lib/useRequest";
import { compact } from "lodash";
import { useEffect, useImperativeHandle, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { joinURL, withQuery } from "ufo";
import CustomDateRangePicker from "./components/date-picker.tsx";
import RunDetailDrawer from "./components/run/RunDetailDrawer.tsx";
import type { TraceData } from "./components/run/types.ts";
import Status from "./components/status.tsx";
import SwitchComponent from "./components/switch.tsx";
import { watchSSE } from "./utils/event.ts";
import { origin } from "./utils/index.ts";
import { parseDuration } from "./utils/latency.ts";

interface ListRef {
  refetch: () => void;
}

interface TracesResponse {
  data: TraceData[];
  total: number;
}

interface SearchState {
  componentId: string;
  searchText: string;
  dateRange: [Date, Date];
}

const List = ({ ref }: { ref?: React.RefObject<ListRef | null> }) => {
  const isBlocklet = !!window.blocklet?.prefix;
  const { t } = useLocaleContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const documentVisibility = useDocumentVisibility();
  const [live, setLive] = useState(false);

  const [page, setPage] = useLocalStorageState("observability-page", {
    defaultValue: {
      page: 1,
      pageSize: 20,
    },
  });

  const [search, setSearch] = useState<SearchState>({
    componentId: "",
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

  const { data: components } = useRequest(async () => {
    const res = await fetch(joinURL(origin, "/api/trace/tree/components"));
    return res.json() as Promise<{ data: string[] }>;
  });

  const fetchTraces = async ({
    page,
    pageSize,
    searchText = "",
    dateRange,
  }: {
    page: number;
    pageSize: number;
    searchText?: string;
    dateRange?: [Date, Date];
  }) => {
    try {
      const res = await fetch(
        withQuery(joinURL(origin, "/api/trace/tree"), {
          page,
          pageSize,
          searchText,
          startDate: dateRange?.[0]?.toISOString() ?? "",
          endDate: dateRange?.[1]?.toISOString() ?? "",
          componentId: search.componentId,
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  useEffect(() => {
    if (documentVisibility === "visible") {
      setLoading(true);
      fetchTraces({
        page: page.page - 1,
        pageSize: page.pageSize,
        searchText: search.searchText,
        dateRange: search.dateRange,
      });
    }
  }, [
    page.page,
    page.pageSize,
    search.searchText,
    search.dateRange,
    documentVisibility,
    search.componentId,
  ]);

  useRafInterval(() => {
    if (!live) return;
    if (isBlocklet) return;

    fetch(joinURL(origin, "/api/trace/tree/stats"))
      .then((res) => res.json() as Promise<{ data: { lastTraceChanged: boolean } }>)
      .then(({ data }) => {
        if (data?.lastTraceChanged) {
          fetchTraces({ page: 0, pageSize: page.pageSize });
        }
      });
  }, 3000);

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  useImperativeHandle(
    ref,
    () => ({
      refetch: () => {
        setTotal(0);
        setTraces([]);
        fetchTraces({ page: 0, pageSize: page.pageSize });
      },
    }),
    [page.pageSize],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  useEffect(() => {
    const abortController = new AbortController();
    (async () => {
      const res = await watchSSE({ signal: abortController.signal });
      const reader = res.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value?.type === "event") {
          fetchTraces({ page: 0, pageSize: page.pageSize });
        }
      }
    })();

    return () => {
      abortController.abort();
    };
  }, [page.pageSize]);

  const columns: GridColDef<TraceData>[] = compact([
    { field: "id", headerName: "ID", width: 160, sortable: false },
    { field: "name", headerName: t("agentName"), minWidth: 150, sortable: false },
    {
      field: "input",
      headerName: t("input"),
      flex: 1,
      minWidth: 120,
      valueGetter: (_, row) => JSON.stringify(row.attributes?.input),
      sortable: false,
    },
    {
      field: "output",
      headerName: t("output"),
      flex: 1,
      minWidth: 120,
      valueGetter: (_, row) => JSON.stringify(row.attributes?.output),
      sortable: false,
    },
    {
      field: "latency",
      headerName: t("latency"),
      minWidth: 100,
      align: "right",
      headerAlign: "right",
      valueGetter: (_, row) => parseDuration(row.startTime, row.endTime),
      sortable: false,
    },
    {
      field: "status",
      headerName: t("status"),
      minWidth: 150,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: ({ row }) => {
        const map: Record<
          number,
          { color: "default" | "error" | "warning" | "success"; label: string }
        > = {
          0: {
            color: "warning",
            label: t("pending"),
          },
          1: {
            color: "success",
            label: t("success"),
          },
          2: {
            color: "error",
            label: t("failed"),
          },
        };

        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              height: !isBlocklet ? 40 : 52,
            }}
          >
            {row.status?.code === 0 ? (
              <Status />
            ) : (
              <Box sx={{ width: 6, height: 6, borderRadius: "50%" }} />
            )}

            <Chip
              label={map[row.status?.code as keyof typeof map]?.label ?? t("unknown")}
              size="small"
              color={map[row.status?.code as keyof typeof map]?.color ?? "default"}
              variant="outlined"
              sx={{ height: 21 }}
            />
          </Box>
        );
      },
    },
    // @ts-ignore
    isBlocklet
      ? {
          field: "userId",
          headerName: t("user"),
          minWidth: 260,
          renderCell: ({ row }) => {
            if (row.userId) {
              return (
                <Box sx={{ height: 44, my: 0.5, span: { display: "flex", alignItems: "center" } }}>
                  <UserCard
                    showDid
                    did={row.userId}
                    cardType={CardType.Detailed}
                    infoType={InfoType.Minimal}
                    sx={{ border: 0, padding: 0 }}
                  />
                </Box>
              );
            }

            return null;
          },
        }
      : undefined,
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
  ]);

  if (isBlocklet) {
    columns.unshift({
      field: "component",
      headerName: t("component"),
      minWidth: 150,
      sortable: false,
      renderCell: ({ row }) => {
        if (!row.componentId) return "";

        const component = window.blocklet.componentMountPoints?.find(
          (c) => c.did === row.componentId,
        );

        return <Chip label={component?.title ?? component?.name} size="small" />;
      },
    });
  }

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
            searchTextUpdate={(text: string) => setSearch((x) => ({ ...x, searchText: text }))}
            searchClose={() => setSearch((x) => ({ ...x, searchText: "" }))}
            onSearchOpen={() => {}}
          />

          {isBlocklet && (
            <Autocomplete
              size="small"
              sx={{ minWidth: 240 }}
              options={components?.data || []}
              value={search.componentId || null}
              onChange={(_, value) => setSearch((x) => ({ ...x, componentId: value || "" }))}
              getOptionLabel={(option) => {
                if (!option) return "";
                const comp = window.blocklet.componentMountPoints?.find((c) => c.did === option);
                return comp?.title ?? comp?.name ?? option;
              }}
              renderInput={(params) => <TextField {...params} placeholder={t("selectComponent")} />}
              renderOption={(props, option) => {
                const comp = window.blocklet.componentMountPoints?.find((c) => c.did === option);
                return (
                  <li {...props} key={option}>
                    {comp?.title ?? comp?.name ?? option}
                  </li>
                );
              }}
              clearOnEscape
              clearText={t("clear")}
              noOptionsText={t("noOptions")}
            />
          )}

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
          pageSizeOptions={[10, 20, 50, 100]}
          pagination
          paginationModel={{ page: page.page - 1, pageSize: page.pageSize }}
          onPaginationModelChange={(model) => {
            setPage((x) => ({ ...x, page: model.page + 1, pageSize: model.pageSize }));
          }}
          rowCount={total}
          rowHeight={isBlocklet ? 52 : 40}
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
          disableColumnFilter
          disableColumnMenu
          disableColumnResize
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
};
export default List;
