import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ErrorIcon from "@mui/icons-material/Error";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { type ReactElement, useState } from "react";
import { parseDurationMs, parseDurationTime } from "../../utils/latency.ts";
import { AgentTag } from "./agent-tag.tsx";
import type { TraceData } from "./types.ts";

type TraceItemProps = {
  name: string;
  duration: number;
  selected?: boolean;
  depth?: number;
  onSelect?: () => void;
  agentTag?: string;
  model?: string;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  status?: {
    code: number;
    message: string;
  };
  totalDuration: number;
  start: number;
};

function TraceItem({
  name,
  duration,
  selected,
  depth = 0,
  onSelect,
  agentTag,
  model,
  hasChildren,
  isExpanded,
  onToggleExpand,
  status,
  totalDuration,
  start = 0,
}: TraceItemProps) {
  const hasError = status?.code === 2;

  const widthPercent = totalDuration
    ? Math.min(Math.max((duration / totalDuration) * 100 || 0, 0.5), 100)
    : 0;
  let marginLeftPercent = totalDuration ? Math.min((start / totalDuration) * 100, 100) : 0;
  if (marginLeftPercent >= 100) {
    marginLeftPercent -= widthPercent;
  }

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        py: 1,
        px: 0,
        pr: 2,
        pl: 0 + depth * 1,
        my: 0.5,
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        backgroundColor: selected ? "action.selected" : "transparent",
        borderRadius: 0.5,
        overflow: "hidden",

        "&:hover": {
          backgroundColor: selected ? "action.selected" : "action.hover",
        },

        "&::before":
          totalDuration && totalDuration > 0
            ? {
                content: '""',
                position: "absolute",
                left: `${marginLeftPercent}%`,
                top: 0,
                width: `${widthPercent}%`,
                height: "100%",
                backgroundColor: "primary.main",
                opacity: 0.04,
                borderRadius: 0.5,
                zIndex: 0,
              }
            : {},
      }}
      onClick={() => onSelect?.()}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flex: 1,
          minWidth: 0,
          gap: 1,
          position: "relative",
          zIndex: 1,
        }}
      >
        {hasChildren ? (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand?.();
            }}
            sx={{ p: 0 }}
          >
            {isExpanded ? (
              <ExpandMoreIcon sx={{ fontSize: 20 }} />
            ) : (
              <ChevronRightIcon sx={{ fontSize: 20 }} />
            )}
          </IconButton>
        ) : (
          <Box sx={{ width: 20 }} />
        )}

        <Typography
          sx={{
            fontSize: 14,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: hasError ? "error.light" : "inherit",
          }}
        >
          {name}
        </Typography>

        {hasError && (
          <ErrorIcon
            sx={{
              fontSize: 16,
              color: "error.light",
              opacity: 0.8,
              flexShrink: 0,
            }}
          />
        )}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, position: "relative", zIndex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <AgentTag agentTag={agentTag} model={model} />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 80 }}>
          <AccessTimeIcon sx={{ fontSize: 14, color: "text.secondary" }} />
          <Typography variant="body2" sx={{ color: "text.secondary", fontSize: 12 }}>
            {parseDurationTime(duration * 1000)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

type TraceStep = {
  name: string;
  duration: number;
  selected?: boolean;
  children?: TraceStep[];
  start?: number;
  run?: TraceData;
  agentTag?: string;
  totalDuration?: number;
  status?: {
    code: number;
    message: string;
  };
};

export function formatTraceStepsAndTotalDuration({
  steps,
  start = 0,
  selectedTrace,
  parallel = false,
}: {
  steps: TraceData[];
  start: number;
  selectedTrace?: TraceData | null;
  parallel?: boolean;
}): TraceStep[] {
  let current = start;

  return steps.map((step, index) => {
    const isSameStartTimeWithNextStep =
      steps[index + 1] &&
      steps[index + 1].startTime &&
      step.startTime &&
      Math.abs(step.startTime - (steps[index + 1].startTime ?? 0)) <= 1;

    let children: TraceStep[] | undefined;
    let childrenTotal = 0;

    if (step.children?.length) {
      children = formatTraceStepsAndTotalDuration({
        steps: step.children,
        start: current,
        selectedTrace,
      });

      childrenTotal = children.reduce((sum, c) => sum + (c.totalDuration ?? 0), 0);
    }

    const duration = parseDurationMs(step.startTime, step.endTime);
    const isParallel = Boolean(children?.length ? childrenTotal > duration : false);
    const maxDuration = Math.max(
      ...(children || []).map((c) => c.totalDuration ?? c.duration),
      duration,
    );

    if (isParallel) {
      children = formatTraceStepsAndTotalDuration({
        steps: step.children ?? [],
        start: current,
        selectedTrace,
        parallel: isParallel,
      });
    }

    const totalDuration = duration;
    const annotated = {
      maxDuration,

      ...step,
      selected: step.id === selectedTrace?.id,
      start: current,
      duration,
      children,
      run: step,
      agentTag: step.attributes?.agentTag,
      totalDuration,
      status: step.status,
    };

    if (!isSameStartTimeWithNextStep && !parallel) {
      current += annotated.duration;
    }

    return annotated;
  });
}

export function renderTraceItems({
  traceId,
  items,
  totalDuration,
  depth = 0,
  onSelect,
  expandedItems,
  onToggleExpand,
  parentPath = "",
}: {
  traceId: string;
  items: TraceStep[];
  totalDuration: number;
  depth?: number;
  onSelect?: (step?: TraceData) => void;
  expandedItems: Set<string>;
  onToggleExpand: (itemKey: string) => void;
  parentPath?: string;
}): ReactElement<any>[] {
  return items.flatMap((item, index) => {
    const itemPath = parentPath ? `${parentPath}-${index}` : `${index}`;
    const itemKey = item.run?.id || `${traceId}-${itemPath}`;
    const isExpanded = expandedItems.has(itemKey);
    const hasChildren = !!item.children && item.children.length > 0;

    return [
      <TraceItem
        key={itemKey}
        name={item.name}
        duration={item.duration}
        selected={item.selected}
        depth={depth}
        model={item.run?.attributes?.output?.model}
        agentTag={item.agentTag}
        onSelect={() => onSelect?.(item.run)}
        hasChildren={hasChildren}
        isExpanded={isExpanded}
        onToggleExpand={() => onToggleExpand(itemKey)}
        status={item.status}
        totalDuration={totalDuration}
        start={item.start ?? 0}
      />,
      ...(hasChildren && isExpanded && item.children
        ? renderTraceItems({
            traceId,
            items: item.children,
            totalDuration,
            depth: depth + 1,
            onSelect,
            expandedItems,
            onToggleExpand,
            parentPath: itemPath,
          })
        : []),
    ];
  });
}

export default function TraceItemList({
  traceId,
  steps,
  onSelect,
  selectedTrace,
}: {
  traceId: string;
  steps: TraceData[];
  onSelect?: (step?: TraceData) => void;
  selectedTrace?: TraceData | null;
}) {
  const { t } = useLocaleContext();
  const traceSteps = formatTraceStepsAndTotalDuration({ steps, start: 0, selectedTrace });

  const collectAllExpandableKeys = (items: TraceStep[], parentPath = ""): Set<string> => {
    const allKeys = new Set<string>();
    const collectKeys = (items: TraceStep[], parentPath: string) => {
      items.forEach((item, index) => {
        if (item.children && item.children.length > 0) {
          const itemPath = parentPath ? `${parentPath}-${index}` : `${index}`;
          const itemKey = item.run?.id || `${traceId}-${itemPath}`;
          allKeys.add(itemKey);
          collectKeys(item.children, itemPath);
        }
      });
    };
    collectKeys(items, parentPath);
    return allKeys;
  };

  const [expandedItems, setExpandedItems] = useState<Set<string>>(() =>
    collectAllExpandableKeys(traceSteps),
  );

  const toggleExpand = (itemKey: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemKey)) {
        next.delete(itemKey);
      } else {
        next.add(itemKey);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedItems(collectAllExpandableKeys(traceSteps));
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  return (
    <Box>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
          pb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          zIndex: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {t("traceTimeline")}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            size="small"
            startIcon={<UnfoldMoreIcon />}
            onClick={expandAll}
            sx={{ textTransform: "none" }}
          >
            {t("expandAll")}
          </Button>
          <Button
            size="small"
            startIcon={<UnfoldLessIcon />}
            onClick={collapseAll}
            sx={{ textTransform: "none" }}
          >
            {t("collapseAll")}
          </Button>
        </Box>
      </Box>

      <Box>
        {renderTraceItems({
          traceId,
          items: traceSteps,
          totalDuration: traceSteps[0]?.totalDuration ?? 0,
          depth: 0,
          onSelect,
          expandedItems,
          onToggleExpand: toggleExpand,
        })}
      </Box>
    </Box>
  );
}
