import useLocalStorageState from "ahooks/lib/useLocalStorageState";
import dayjs from "dayjs";
import { createContext, useContext, useMemo, useState } from "react";
import { joinURL, withQuery } from "ufo";
import type { SearchState } from "../components/blocklet-comp.tsx";
import type { TraceData } from "../components/run/types.ts";
import { origin } from "../utils/index.ts";

interface TracesResponse {
  data: TraceData[];
  total: number;
}

interface TraceContextType {
  traces: TraceData[];
  total: number;
  loading: boolean;
  page: { page: number; pageSize: number };
  search: SearchState;
  setPage: (value: { page: number; pageSize: number }) => void;
  setSearch: React.Dispatch<React.SetStateAction<SearchState>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setTraces: React.Dispatch<React.SetStateAction<TraceData[]>>;
  setTotal: React.Dispatch<React.SetStateAction<number>>;
  fetchTraces: (
    {
      page,
      pageSize,
      searchText,
      dateRange,
      showImportedOnly,
    }: {
      page: number;
      pageSize: number;
      searchText?: string;
      dateRange?: [Date, Date];
      showImportedOnly?: boolean;
    },
    signal?: AbortSignal,
  ) => Promise<void>;
}

const TraceContext = createContext<TraceContextType | null>(null);

export function TraceProvider({ children }: { children: React.ReactNode }) {
  const [page, setPage] = useLocalStorageState("observability-page", {
    defaultValue: { page: 1, pageSize: 20 },
  });

  const [search, setSearch] = useState<SearchState>({
    componentId: "",
    searchText: "",
    dateRange: [dayjs().subtract(1, "week").startOf("day").toDate(), dayjs().endOf("day").toDate()],
    showImportedOnly: false,
  });

  const [traces, setTraces] = useState<TraceData[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTraces = async (
    {
      page,
      pageSize,
      searchText = "",
      dateRange,
      showImportedOnly,
    }: {
      page: number;
      pageSize: number;
      searchText?: string;
      dateRange?: [Date, Date];
      showImportedOnly?: boolean;
    },
    signal?: AbortSignal,
  ) => {
    try {
      const res = await fetch(
        withQuery(joinURL(origin, "/api/trace/tree"), {
          page,
          pageSize,
          searchText,
          startDate: dateRange?.[0]?.toISOString() ?? "",
          endDate: dateRange?.[1]?.toISOString() ?? "",
          componentId: search.componentId,
          showImportedOnly: showImportedOnly ?? search.showImportedOnly ?? false,
        }),
        { signal },
      ).then((r) => r.json() as Promise<TracesResponse>);
      const formatted: TraceData[] = res.data.map((trace) => ({
        ...trace,
        startTime: Number(trace.startTime),
        endTime: Number(trace.endTime),
      }));
      setTraces(formatted);
      setTotal(res.total);
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") {
        console.error("Failed to fetch traces:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      traces,
      total,
      loading,
      page,
      search,
      setPage,
      setSearch,
      setLoading,
      setTraces,
      setTotal,
      fetchTraces,
    }),
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    [traces, total, loading, page, search, setPage, fetchTraces],
  );

  return <TraceContext.Provider value={value}>{children}</TraceContext.Provider>;
}

export function useTraceContext() {
  const context = useContext(TraceContext);

  if (!context) {
    throw new Error("useTraceContext must be used within TraceProvider");
  }

  return context;
}
