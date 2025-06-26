import { CopyButton } from "@arcblock/ux/lib/ClickToCopy";
import Datatable, { getDurableData } from "@arcblock/ux/lib/Datatable";
import Empty from "@arcblock/ux/lib/Empty";
import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import RelativeTime from "@arcblock/ux/lib/RelativeTime";
import { ToastProvider } from "@arcblock/ux/lib/Toast";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { joinURL, withQuery } from "ufo";
import CustomDateRangePicker from "./components/date-picker.tsx";
import RunDetailDrawer from "./components/run/RunDetailDrawer.tsx";
import type { TraceData } from "./components/run/types.ts";
import SwitchComponent from "./components/switch.tsx";
import { watchSSE } from "./utils/event.ts";
import { origin } from "./utils/index.ts";
import { parseDuration } from "./utils/latency.ts";

const durableKey = "traces-list";

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

export default function App() {
  const { t } = useLocaleContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const tableDurableData = getDurableData(durableKey) as {
    searchText?: string;
    rowsPerPage?: number;
    dateRange?: [Date, Date];
  };
  const [search, setSearch] = useState<SearchState>({
    page: 1,
    pageSize: tableDurableData.rowsPerPage || 20,
    searchText: tableDurableData.searchText || "",
    dateRange: tableDurableData.dateRange || [
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
    fetchTraces({
      page: search.page - 1,
      pageSize: search.pageSize,
      searchText: search.searchText,
      dateRange: search.dateRange,
    });
  }, [search.page, search.pageSize, search.searchText, search.dateRange]);

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

  const columns = useMemo(
    () => [
      {
        label: "ID",
        name: "id",
        width: 100,
        options: {
          customBodyRender: (_: unknown, { rowIndex }: { rowIndex: number }) => {
            const row = traces[rowIndex];
            return (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {row.id}
                <CopyButton content={row.id} style={{ color: "#666" }} />
              </Box>
            );
          },
        },
      },
      { label: t("agentName"), name: "name" },
      {
        label: t("input"),
        name: "input",
        options: {
          customBodyRender: (_: unknown, { rowIndex }: { rowIndex: number }) => {
            const row = traces[rowIndex];
            return (
              <Box
                sx={{
                  maxWidth: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {JSON.stringify(row.attributes.input)}
              </Box>
            );
          },
        },
      },
      {
        label: t("output"),
        name: "output",
        options: {
          customBodyRender: (_: unknown, { rowIndex }: { rowIndex: number }) => {
            const row = traces[rowIndex];
            return (
              <Box
                sx={{
                  maxWidth: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {JSON.stringify(row.attributes.output)}
              </Box>
            );
          },
        },
      },
      {
        label: t("latency"),
        name: "latency",
        width: 100,
        options: {
          customBodyRender: (_: unknown, { rowIndex }: { rowIndex: number }) => {
            const row = traces[rowIndex];
            return parseDuration(row.startTime, row.endTime);
          },
        },
      },
      {
        label: t("status"),
        name: "status",
        width: 100,
        options: {
          customBodyRender: (_: unknown, { rowIndex }: { rowIndex: number }) => {
            const row = traces[rowIndex];
            return (
              <Chip
                label={row.status?.code === 1 ? t("success") : t("failed")}
                color={row.status?.code === 1 ? "success" : "error"}
                size="small"
                variant="outlined"
              />
            );
          },
        },
      },
      {
        label: t("startedAt"),
        name: "startTime",
        width: 160,
        options: {
          align: "right",
          headerAlign: "right",
          customBodyRender: (val: number) =>
            val ? <RelativeTime value={val} type="absolute" format="YYYY-MM-DD HH:mm:ss" /> : "-",
        },
      },
      {
        label: t("endedAt"),
        name: "endTime",
        width: 160,
        options: {
          align: "right",
          headerAlign: "right",
          customBodyRender: (val: number) =>
            val ? <RelativeTime value={val} type="absolute" format="YYYY-MM-DD HH:mm:ss" /> : "-",
        },
      },
    ],
    [traces, t],
  );

  const onTableChange = ({
    page,
    rowsPerPage,
    searchText,
  }: { page: number; rowsPerPage: number; searchText: string }) => {
    if (search.pageSize !== rowsPerPage) {
      setSearch((x) => ({ ...x, searchText: "", pageSize: rowsPerPage, page: 1 }));
    } else if (search.page !== page + 1) {
      setSearch((x) => ({ ...x, searchText: "", page: page + 1 }));
    } else if (search.searchText !== searchText) {
      setSearch((x) => ({ ...x, searchText, page: 1 }));
    }
  };

  const onDateRangeChange = (value: [Date, Date]) => {
    setSearch((x) => ({ ...x, dateRange: value, page: 1 }));
  };

  return (
    <ToastProvider>
      <Datatable
        durable={durableKey}
        data={traces}
        columns={columns}
        options={{
          sort: false,
          download: false,
          filter: false,
          print: false,
          viewColumns: false,
          page: search.page - 1,
          rowsPerPage: search.pageSize,
          count: total,
          searchDebounceTime: 600,
          onRowClick: (_: unknown, { dataIndex }: { dataIndex: number }) => {
            const trace = traces[dataIndex];
            setSelectedTrace(trace);
            setSearchParams((prev) => {
              prev.set("traceId", trace.id);
              return prev;
            });
          },
        }}
        loading={loading}
        emptyNode={<Empty>{t("noData")}</Empty>}
        onChange={(state: any) => {
          onTableChange({
            page: state.page,
            rowsPerPage: state.rowsPerPage,
            searchText: state.searchText || "",
          });
        }}
        customButtons={[
          // @ts-ignore
          window.blocklet?.prefix && (
            <Box sx={{ display: "flex" }}>
              <SwitchComponent />
            </Box>
          ),
        ]}
        customPreButtons={[
          // @ts-ignore
          <Box key="date-picker" sx={{ mx: 1 }}>
            <CustomDateRangePicker value={search.dateRange} onChange={onDateRangeChange} />
          </Box>,
        ]}
      />

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
