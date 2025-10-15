import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
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
}: TraceItemProps) {
  return (
    <Box
      sx={{
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
        borderRadius: 1,
        "&:hover": {
          backgroundColor: selected ? "action.selected" : "action.hover",
          transform: "translateX(4px)",
          boxShadow: selected ? 0 : "0 2px 8px rgba(0, 0, 0, 0.08)",
        },
      }}
      onClick={() => onSelect?.()}
    >
      <Box sx={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0, gap: 1 }}>
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
          }}
        >
          {name}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <AgentTag agentTag={agentTag} model={model} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 80 }}>
          <AccessTimeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          <Typography variant="body2" sx={{ color: "text.secondary", fontSize: 13 }}>
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
}: {
  steps: TraceData[];
  start: number;
  selectedTrace?: TraceData | null;
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
    const isParallel = (children || []).every((c) => c.start === current);
    const maxDuration = Math.max(
      ...(children || []).map((c) => c.totalDuration ?? c.duration),
      duration,
    );
    const totalDuration = isParallel ? maxDuration : children ? childrenTotal : duration;
    const annotated = {
      ...step,
      selected: step.id === selectedTrace?.id,
      start: current,
      duration,
      children,
      run: step,
      agentTag: step.attributes?.agentTag,
      totalDuration,
    };

    if (!isSameStartTimeWithNextStep) {
      current += annotated.duration;
    }

    return annotated;
  });
}

export function renderTraceItems({
  traceId,
  items,
  depth = 0,
  onSelect,
  expandedItems,
  onToggleExpand,
  parentPath = "",
}: {
  traceId: string;
  items: TraceStep[];
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
      />,
      ...(hasChildren && isExpanded && item.children
        ? renderTraceItems({
            traceId,
            items: item.children,
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
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
          pb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
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
          depth: 0,
          onSelect,
          expandedItems,
          onToggleExpand: toggleExpand,
        })}
      </Box>
    </Box>
  );
}
