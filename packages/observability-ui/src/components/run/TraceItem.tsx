import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import { Box, Card, LinearProgress, Tooltip, Typography } from "@mui/material";
import type { ReactElement } from "react";
import { parseDurationMs } from "../../utils/latency.js";
import Status from "../status.js";
import { AgentTag } from "./AgentTag.js";
import type { TraceData } from "./types.js";

type TraceItemProps = {
  name: string;
  duration: number;
  start: number;
  totalDuration: number;
  selected?: boolean;
  depth?: number;
  onSelect?: () => void;
  status?: number;
  agentTag?: string;
};

function TraceItem({
  name,
  duration,
  start,
  totalDuration,
  selected,
  depth = 0,
  onSelect,
  status,
  agentTag,
}: TraceItemProps) {
  const widthPercent = Math.min((duration / totalDuration) * 100 || 0, 100);
  const marginLeftPercent = (start / totalDuration) * 100;
  const { t } = useLocaleContext();

  const getBorderColor = () => {
    if (selected) {
      return "primary.main";
    }

    if (status === 0) {
      return "warning.light";
    }

    if (status === 1) {
      return "transparent";
    }

    return "error.main";
  };

  return (
    <Card
      sx={{
        cursor: "pointer",
        px: 2,
        py: 1,
        mb: 1,
        ml: depth * 2,
        overflow: "hidden",
        transition: "all 0.2s ease-in-out",
        border: "1px solid transparent",
        borderColor: getBorderColor(),
      }}
      onClick={() => onSelect?.()}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "nowrap",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 0 }}>
          <Typography sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {name}
          </Typography>

          {status === 0 && <Status />}
        </Box>

        <Box sx={{ mr: 2 }}>
          <AgentTag agentTag={agentTag} />
        </Box>

        <Typography variant="caption" sx={{ minWidth: 60, flexShrink: 0, ml: "auto", mr: 1 }}>
          {duration}s
        </Typography>

        <Box
          sx={{
            width: "100%",
            maxWidth: "200px",
            minWidth: "100px",
            position: "relative",
            height: 10,
            borderRadius: 5,
            overflow: "visible",
          }}
        >
          <Tooltip title={`${t("duration")}: ${duration}s`}>
            <Box
              sx={{
                position: "absolute",
                left: `${marginLeftPercent}%`,
                width: `${widthPercent}%`,
                height: "100%",
              }}
            >
              <LinearProgress
                variant="determinate"
                value={100}
                sx={{ height: "100%", borderRadius: 5 }}
              />
            </Box>
          </Tooltip>
        </Box>
      </Box>
    </Card>
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
    const totalDuration = children ? childrenTotal : duration;
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
  totalDuration,
  depth = 0,
  onSelect,
}: {
  traceId: string;
  items: TraceStep[];
  totalDuration: number;
  depth?: number;
  onSelect?: (step?: TraceData) => void;
}): ReactElement<any>[] {
  return items.flatMap((item) => [
    <TraceItem
      key={`${item.name}-${item.duration}-${item.agentTag}-${traceId}`}
      name={item.name}
      duration={item.duration}
      start={item.start ?? 0}
      totalDuration={totalDuration}
      selected={item.selected}
      depth={depth}
      status={item.status?.code}
      agentTag={item.agentTag}
      onSelect={() => onSelect?.(item.run)}
    />,
    ...(item.children
      ? renderTraceItems({
          traceId,
          items: item.children,
          totalDuration,
          depth: depth + 1,
          onSelect,
        })
      : []),
  ]);
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
  const traceSteps = formatTraceStepsAndTotalDuration({ steps, start: 0, selectedTrace });
  const { t } = useLocaleContext();

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          mb: 2,
        }}
      >
        <Typography
          sx={{
            fontWeight: 500,
            flex: 1,
            minWidth: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {t("agentName")}
        </Typography>

        <Box
          sx={{
            width: "100%",
            maxWidth: "200px",
            position: "relative",
            borderRadius: 5,
            fontWeight: 500,
          }}
        >
          {t("duration")}
        </Box>
      </Box>
      {renderTraceItems({
        traceId,
        items: traceSteps,
        totalDuration: traceSteps[0]?.totalDuration ?? 0,
        depth: 0,
        onSelect,
      })}
    </Box>
  );
}
