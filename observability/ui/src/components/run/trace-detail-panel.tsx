import InfoRow from "@arcblock/ux/lib/InfoRow";
import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import RelativeTime from "@arcblock/ux/lib/RelativeTime";
import Tag from "@arcblock/ux/lib/Tag";
import { Icon } from "@iconify/react";
import CheckIcon from "@mui/icons-material/Check";
import CopyAllIcon from "@mui/icons-material/CopyAll";
import DownloadIcon from "@mui/icons-material/Download";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import WrapTextIcon from "@mui/icons-material/WrapText";
import type { SxProps } from "@mui/material";
import { useMediaQuery } from "@mui/material";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import useLocalStorageState from "ahooks/lib/useLocalStorageState";
import { isUndefined, omitBy } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { joinURL } from "ufo";
import { findModelPrice, getLocalizedFilename, getTraceCostMap } from "../../libs/index.ts";
import { origin } from "../../utils/index.ts";
import { parseDuration } from "../../utils/latency.ts";
import JsonView, { type JsonViewRef } from "../json-view.tsx";
import ModelInfoTip from "../model-tip.tsx";
import { AgentTag } from "./agent-tag.tsx";
import type { TraceData } from "./types.ts";

export default function TraceDetailPanel({
  trace: originalTrace,
  traceInfo,
  sx,
}: {
  trace?: TraceData | null;
  traceInfo: TraceData;
  sx?: SxProps;
}) {
  const [tab, setTab] = useState("input");
  const { t, locale } = useLocaleContext();
  const [trace, setTrace] = useState<TraceData | undefined | null>(originalTrace);
  const isMobile = useMediaQuery((x) => x.breakpoints.down("md"));
  const jsonViewRef = useRef<JsonViewRef>(null);
  const map = useMemo(() => getTraceCostMap(traceInfo), [traceInfo]);

  const [viewSettings, setViewSettings] = useLocalStorageState<{
    wordWrap: "on" | "off";
    truncateStrings: boolean;
  }>("trace-detail-view-settings", {
    defaultValue: { wordWrap: "on", truncateStrings: false },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFolded, setIsFolded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const hasError = trace?.status?.code === 2;
  const hasUserContext =
    trace?.attributes?.userContext && Object.keys(trace?.attributes?.userContext).length > 0;
  const hasMemories = trace?.attributes?.memories && trace?.attributes?.memories.length > 0;
  const output = trace?.attributes?.output;
  const model = output?.model;

  const init = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setIsLoading(true);

        const start = Date.now();

        const res = await fetch(joinURL(origin, `/api/trace/tree/children/${originalTrace?.id}`), {
          signal,
        }).then((res) => res.json());

        const duration = Date.now() - start;
        const remaining = Math.max(0, 1000 - duration);

        await new Promise((resolve, reject) => {
          const timer = setTimeout(resolve, remaining);
          signal?.addEventListener("abort", () => {
            clearTimeout(timer);
            reject(new DOMException("Aborted", "AbortError"));
          });
        });

        setTrace(res.data);
      } finally {
        setIsLoading(false);
        setTab("input");
      }
    },
    [originalTrace?.id],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  useEffect(() => {
    if (!originalTrace?.id) return;

    const controller = new AbortController();
    init(controller.signal);

    return () => {
      controller.abort();
    };
  }, [originalTrace]);

  const value = useMemo(() => {
    if (tab === "input") {
      // New version save to input not attributes
      return trace?.attributes?.input || trace?.input;
    }

    if (tab === "output") {
      const { model: _model, usage: _usage, ...rest } = output || {};
      return rest;
    }

    if (tab === "metadata") {
      return omitBy({ model, usage: output?.usage }, isUndefined);
    }

    if (tab === "errorMessage") {
      return trace?.status?.message;
    }

    if (tab === "userContext") {
      return trace?.attributes?.userContext;
    }

    if (tab === "memories") {
      return trace?.attributes?.memories;
    }

    return null;
  }, [
    tab,
    model,
    trace?.attributes?.input,
    trace?.status?.message,
    trace?.attributes?.userContext,
    trace?.attributes?.memories,
    output,
    trace?.input,
  ]);

  const prices = useMemo(() => {
    if (!trace?.id) {
      return null;
    }

    const costData = map.get(trace.id);
    if (!costData) {
      return null;
    }

    return {
      inputCost: costData.inputCost.toString(),
      outputCost: costData.outputCost.toString(),
      totalCost: costData.totalCost.toString(),
      inputTokens: costData.inputTokens,
      outputTokens: costData.outputTokens,
      totalTokens: costData.totalTokens,
    };
  }, [trace?.id, map]);

  const tabs = useMemo(
    () => [
      { label: t("input"), value: "input" },
      { label: t("output"), value: "output" },
      ...(hasError ? [{ label: t("errorMessage"), value: "errorMessage" }] : []),
      ...(hasUserContext ? [{ label: t("userContext"), value: "userContext" }] : []),
      ...(hasMemories ? [{ label: t("memories"), value: "memories" }] : []),
      { label: t("metadata"), value: "metadata" },
    ],
    [t, hasError, hasUserContext, hasMemories],
  );

  const handleCopy = useCallback(async () => {
    try {
      const jsonString = typeof value === "string" ? value : JSON.stringify(value, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [value]);

  const handleDownload = useCallback(() => {
    const jsonString = typeof value === "string" ? value : JSON.stringify(value, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = getLocalizedFilename("data", locale);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [value, locale]);

  if (!trace) return null;

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: (theme) => `${theme.palette.background.paper}`,
        borderRadius: 1,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        ...(isFullscreen && {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          borderRadius: 0,
          border: "none",
          p: 1,
        }),
        ...sx,
      }}
    >
      {!isFullscreen && (
        <>
          <Box
            sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}
          >
            <Typography sx={{ fontSize: 20, color: "text.primary" }}>{`${trace?.name}`}</Typography>
            <AgentTag agentTag={trace?.attributes?.agentTag} model={output?.model} />
          </Box>
          <Box sx={{ my: 1 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? 0 : 6,
              }}
            >
              <Box
                sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", flex: 1 }}
              >
                <InfoRowBox valueComponent="div" nameFormatter={(v) => v} nameWidth={110} name="ID">
                  <Box sx={{ textAlign: "right" }}>{trace?.id}</Box>
                </InfoRowBox>

                <InfoRowBox
                  valueComponent="div"
                  nameFormatter={(v) => v}
                  nameWidth={110}
                  name={t("startTime")}
                >
                  <Box sx={{ textAlign: "right" }}>
                    {trace?.startTime && (
                      <RelativeTime
                        value={trace?.startTime}
                        type="absolute"
                        format="YYYY-MM-DD HH:mm:ss"
                      />
                    )}
                  </Box>
                </InfoRowBox>

                <InfoRowBox
                  valueComponent="div"
                  nameFormatter={(v) => v}
                  nameWidth={110}
                  name={t("endTime")}
                >
                  <Box sx={{ textAlign: "right" }}>
                    {trace?.endTime && (
                      <RelativeTime
                        value={trace?.endTime}
                        type="absolute"
                        format="YYYY-MM-DD HH:mm:ss"
                      />
                    )}
                  </Box>
                </InfoRowBox>

                <InfoRowBox
                  valueComponent="div"
                  nameFormatter={(v) => v}
                  nameWidth={110}
                  name={t("duration")}
                >
                  <Box sx={{ textAlign: "right" }}>
                    {trace?.startTime &&
                      trace?.endTime &&
                      `${parseDuration(trace.startTime, trace.endTime)}`}
                  </Box>
                </InfoRowBox>
              </Box>

              <Box
                sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flex: 1 }}
              >
                <InfoRowBox
                  valueComponent="div"
                  nameFormatter={(v) => v}
                  nameWidth={110}
                  name={t("inputTokens")}
                >
                  <Box sx={{ textAlign: "right" }}>
                    {prices?.inputTokens || 0} {prices?.inputCost ? `($${prices?.inputCost})` : ""}
                  </Box>
                </InfoRowBox>

                <InfoRowBox
                  valueComponent="div"
                  nameFormatter={(v) => v}
                  nameWidth={110}
                  name={t("outputTokens")}
                >
                  <Box sx={{ textAlign: "right" }}>
                    {prices?.outputTokens || 0}
                    {prices?.outputCost ? `($${prices?.outputCost})` : ""}
                  </Box>
                </InfoRowBox>

                <InfoRowBox
                  valueComponent="div"
                  nameFormatter={(v) => v}
                  nameWidth={110}
                  name={t("totalTokens")}
                >
                  <Box sx={{ textAlign: "right" }}>
                    {(prices?.outputTokens || 0) + (prices?.inputTokens || 0)}
                    {prices?.totalCost ? `($${prices?.totalCost})` : ""}
                  </Box>
                </InfoRowBox>

                {!!model && (
                  <InfoRowBox
                    valueComponent="div"
                    nameFormatter={(v) => v}
                    nameWidth={110}
                    name={t("model")}
                  >
                    <Box
                      sx={{
                        textAlign: "right",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        justifyContent: "flex-end",
                      }}
                    >
                      <Tooltip
                        slotProps={{
                          tooltip: {
                            sx: { bgcolor: "common.white", color: "common.black", boxShadow: 4 },
                          },
                        }}
                        title={
                          findModelPrice(model) ? (
                            <ModelInfoTip modelInfo={{ ...findModelPrice(model), model }} />
                          ) : undefined
                        }
                      >
                        <Tag sx={{ cursor: "pointer" }}>{model}</Tag>
                      </Tooltip>
                    </Box>
                  </InfoRowBox>
                )}
              </Box>
            </Box>
          </Box>
        </>
      )}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: 1,
          borderColor: "divider",
          pl: 2,
          zIndex: 2,
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          textColor="inherit"
          sx={{
            minHeight: 40,
            "& .MuiTab-root": {
              minHeight: 40,
              textTransform: "none",
              fontSize: 14,
              fontWeight: 400,
              py: 1,
              px: 2,
            },
          }}
        >
          {tabs.map((t) => (
            <Tab key={t.value} label={t.label} value={t.value} />
          ))}
        </Tabs>

        <Box sx={{ display: "flex", gap: 0.5, pr: 1, alignItems: "center" }}>
          <Tooltip title={t("wordWrap")}>
            <IconButton
              size="small"
              onClick={() =>
                setViewSettings({
                  ...viewSettings,
                  wordWrap: viewSettings?.wordWrap === "on" ? "off" : "on",
                })
              }
              sx={{
                color: "text.secondary",
                "&:hover": {
                  color: "text.primary",
                },
              }}
            >
              <WrapTextIcon
                fontSize="small"
                sx={{ color: viewSettings?.wordWrap === "on" ? "primary.main" : "text.secondary" }}
              />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("truncateStrings")}>
            <IconButton
              size="small"
              onClick={() =>
                setViewSettings({
                  ...viewSettings,
                  truncateStrings: !viewSettings?.truncateStrings,
                })
              }
              sx={{
                color: "text.secondary",
                "&:hover": {
                  color: "text.primary",
                },
              }}
            >
              <Box
                component={Icon}
                icon="ion:cut"
                sx={{ color: viewSettings?.truncateStrings ? "primary.main" : "text.secondary" }}
              />
            </IconButton>
          </Tooltip>
          <Tooltip title={isFolded ? t("unfoldAll") : t("foldAll")}>
            <IconButton
              size="small"
              onClick={() => {
                if (isFolded) {
                  jsonViewRef.current?.unfoldAll();
                  setIsFolded(false);
                } else {
                  jsonViewRef.current?.foldAll();
                  setIsFolded(true);
                }
              }}
              disabled={!value}
              sx={{
                color: "text.secondary",
                "&:hover": {
                  color: "text.primary",
                },
              }}
            >
              {isFolded ? <UnfoldMoreIcon fontSize="small" /> : <UnfoldLessIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title={copied ? t("copied") : t("copyJson")}>
            <IconButton
              size="small"
              onClick={handleCopy}
              disabled={!value}
              sx={{
                color: "text.secondary",
                "&:hover": {
                  color: "text.primary",
                },
              }}
            >
              {copied ? <CheckIcon fontSize="small" /> : <CopyAllIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title={t("downloadJson")}>
            <IconButton
              size="small"
              onClick={handleDownload}
              disabled={!value}
              sx={{
                color: "text.secondary",
                "&:hover": {
                  color: "text.primary",
                },
              }}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={isFullscreen ? t("exitFullscreen") : t("fullscreen")}>
            <IconButton
              size="small"
              onClick={() => setIsFullscreen(!isFullscreen)}
              sx={{
                color: "text.secondary",
                "&:hover": {
                  color: "text.primary",
                },
              }}
            >
              {isFullscreen ? (
                <FullscreenExitIcon fontSize="small" />
              ) : (
                <FullscreenIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Box
        sx={{
          mt: isFullscreen ? 1 : 2,
          flex: 1,
          height: 0,
          overflow: "hidden",
          position: "relative",
          backgroundColor: "#1e1e1e",
          borderRadius: isFullscreen ? 1 : 2,
        }}
      >
        {!isLoading ? (
          <Box sx={{ color: "common.white", height: "100%" }}>
            {!value ? (
              <Typography sx={{ color: "grey.500", fontSize: 14, p: 2 }}>{t("noData")}</Typography>
            ) : (
              <JsonView
                ref={jsonViewRef}
                value={value}
                wordWrap={viewSettings?.wordWrap || "on"}
                truncateStrings={viewSettings?.truncateStrings || false}
              />
            )}
          </Box>
        ) : (
          <Box
            sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}
          >
            <CircularProgress />
          </Box>
        )}
      </Box>
    </Box>
  );
}

const InfoRowBox = styled(InfoRow)`
  margin-bottom: 8px;
  width: 100%;
  flex-direction: row !important;
  align-items: center !important;

  .info-row__name {
    font-size: 13px;
    color: ${({ theme }) => theme.palette.text.primary};
  }

  .info-row__value {
    font-size: 13px;
    font-weight: 400;
    color: ${({ theme }) => theme.palette.text.secondary};
  }
`;
