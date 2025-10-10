import dayjs from "@abtnode/util/lib/dayjs";
import TableSearch from "@arcblock/ux/lib/Datatable/TableSearch";
import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import Toast, { ToastProvider } from "@arcblock/ux/lib/Toast";
import TuneIcon from "@mui/icons-material/Tune";
import { useMediaQuery } from "@mui/material";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import useDocumentVisibility from "ahooks/lib/useDocumentVisibility";
import useLocalStorageState from "ahooks/lib/useLocalStorageState";
import useRafInterval from "ahooks/lib/useRafInterval";
import useRequest from "ahooks/lib/useRequest";
import { useEffect, useImperativeHandle, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { joinURL, withQuery } from "ufo";
import type { SearchState } from "../components/blocklet-comp.tsx";
import RunDetailDrawer from "../components/run/trace-detail-drawer.tsx";
import type { TraceData } from "../components/run/types.ts";
import { watchSSE } from "../utils/event.ts";
import { origin } from "../utils/index.ts";
import DesktopSearch from "./search/desktop.tsx";
import MobileSearch from "./search/mobile.tsx";
import Table from "./table.tsx";

interface ListRef {
  refetch: () => void;
}

interface TracesResponse {
  data: TraceData[];
  total: number;
}

const List = ({ ref }: { ref?: React.RefObject<ListRef | null> }) => {
  const isBlocklet = !!window.blocklet?.prefix;
  const { t } = useLocaleContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const documentVisibility = useDocumentVisibility();
  const [live, setLive] = useState(false);
  const isMobile = useMediaQuery((x) => x.breakpoints.down("md"));
  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => setOpen(newOpen);

  const [page, setPage] = useLocalStorageState("observability-page", {
    defaultValue: { page: 1, pageSize: 20 },
  });

  const [search, setSearch] = useState<SearchState>({
    componentId: "",
    searchText: "",
    dateRange: [dayjs().subtract(1, "week").startOf("day").toDate(), dayjs().endOf("day").toDate()],
  });

  const [traces, setTraces] = useState<TraceData[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTrace, setSelectedTrace] = useState<TraceData | null>(null);

  const { data: components } = useRequest(async () => {
    const res = await fetch(joinURL(origin, "/api/trace/tree/components"));
    return res.json() as Promise<{ data: string[] }>;
  });

  const onDelete = async (items: string[]) => {
    try {
      await fetch(joinURL(origin, "/api/trace/tree"), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: items }),
      });
    } catch (error) {
      Toast.error((error as Error)?.message);
    } finally {
      fetchTraces({
        page: 0,
        pageSize: page.pageSize,
        searchText: search.searchText,
        dateRange: search.dateRange,
      });
    }
  };

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  useEffect(() => {
    setPage({ page: 1, pageSize: page.pageSize });
  }, [search.searchText, search.dateRange, live, search.componentId]);

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

  useEffect(() => {
    fetch(joinURL(origin, "/model-prices.json"))
      .then((res) => res.json())
      .then((data) => {
        // @ts-ignore
        window.modelPrices = data;
      });
  }, []);

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

  const onDateRangeChange = (value: [Date, Date]) => {
    setSearch((x) => ({ ...x, dateRange: value, page: 1 }));
  };

  const handleSearchApply = () => {
    setOpen(false);
    setLoading(true);

    fetchTraces({
      page: 0,
      pageSize: page.pageSize,
      searchText: search.searchText,
      dateRange: search.dateRange,
    });
  };

  const handleSearchReset = () => {
    setSearch({
      componentId: "",
      searchText: "",
      dateRange: [
        dayjs().subtract(1, "month").startOf("day").toDate(),
        dayjs().endOf("day").toDate(),
      ],
    });
    setLive(false);
  };

  return (
    <ToastProvider>
      <Box sx={{ ".striped-row": { backgroundColor: "action.hover" } }}>
        <Box
          sx={{
            my: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: !isMobile ? "flex-end" : "space-between",
            gap: 1,

            ".search-always-open": isMobile
              ? {
                  flex: 1,
                  ".toolbar-search-area.toolbar-btn-show": {
                    width: "100%",
                  },
                }
              : {},
          }}
        >
          <TableSearch
            options={{
              searchPlaceholder: t("search"),
              searchDebounceTime: 600,
              searchAlwaysOpen: isMobile,
            }}
            search={search.searchText}
            searchText={search.searchText}
            searchTextUpdate={(text: string) => setSearch((x) => ({ ...x, searchText: text }))}
            searchClose={() => setSearch((x) => ({ ...x, searchText: "" }))}
          />

          {isMobile ? (
            <IconButton onClick={toggleDrawer(true)}>
              <TuneIcon />
            </IconButton>
          ) : (
            <DesktopSearch
              components={components || { data: [] }}
              search={search}
              setSearch={setSearch}
              onDateRangeChange={onDateRangeChange}
              live={live}
              setLive={setLive}
              fetchTraces={fetchTraces}
              page={page}
            />
          )}
        </Box>

        <Table
          traces={traces}
          total={total}
          loading={loading}
          page={page}
          setPage={setPage}
          isLive={live}
          onRowClick={(row) => {
            setSelectedTrace(row);
            setSearchParams((prev) => {
              prev.set("traceId", row.id);
              return prev;
            });
          }}
          onDelete={onDelete}
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

      <Drawer
        anchor="right"
        open={open}
        onClose={toggleDrawer(false)}
        sx={{ "& .MuiDrawer-paper": { width: isMobile ? "100%" : 320 } }}
      >
        <MobileSearch
          handleSearchReset={handleSearchReset}
          handleSearchApply={handleSearchApply}
          toggleDrawer={toggleDrawer}
          components={components || { data: [] }}
          search={search}
          setSearch={setSearch}
          onDateRangeChange={onDateRangeChange}
          live={live}
          setLive={setLive}
        />
      </Drawer>
    </ToastProvider>
  );
};

export default List;
