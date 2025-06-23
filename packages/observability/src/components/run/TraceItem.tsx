import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import { Box, Card, LinearProgress, Tooltip, Typography } from "@mui/material";
import type { ReactElement } from "react";
import { parseDurationMs } from "../../utils/latency.ts";
import { AgentTag } from "./AgentTag.tsx";
import type { RunData } from "./types.ts";

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
  const widthPercent = (duration / totalDuration) * 100;
  const marginLeftPercent = (start / totalDuration) * 100;
  const { t } = useLocaleContext();

  const getBorderColor = () => {
    if (status === 1) {
      if (selected) {
        return "primary.main";
      }

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
        display="flex"
        alignItems="center"
        flexWrap="nowrap"
        justifyContent="space-between"
        gap={1}
      >
        <Typography
          sx={{
            flex: 1,
            minWidth: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </Typography>

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
  run?: RunData;
  agentTag?: string;
  status?: {
    code: number;
    message: string;
  };
};

export function annotateTraceSteps({
  steps,
  start = 0,
  selectedRun,
}: {
  steps: RunData[];
  start: number;
  selectedRun?: RunData | null;
}): TraceStep[] {
  let current = start;

  return steps.map((step, index) => {
    const isSameStartTimeWithNextStep =
      steps[index + 1] &&
      steps[index + 1].startTime &&
      step.startTime &&
      Math.abs(step.startTime - (steps[index + 1].startTime ?? 0)) <= 1;

    const annotated: TraceStep = {
      ...step,
      selected: step.id === selectedRun?.id,
      start: current,
      duration: parseDurationMs(step.startTime, step.endTime),
      children: step.children
        ? annotateTraceSteps({ steps: step.children, start: current, selectedRun })
        : undefined,
      run: step,
      agentTag: step.attributes?.agentTag,
    };

    if (!isSameStartTimeWithNextStep) {
      current += annotated.duration;
    }

    return annotated;
  });
}

export function renderTraceItems({
  items,
  totalDuration,
  depth = 0,
  onSelect,
}: {
  items: TraceStep[];
  totalDuration: number;
  depth?: number;
  onSelect?: (step?: RunData) => void;
}): ReactElement[] {
  return items.flatMap((item) => [
    <TraceItem
      key={item.name + (item.start ?? 0)}
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
      ? renderTraceItems({ items: item.children, totalDuration, depth: depth + 1, onSelect })
      : []),
  ]);
}

export default function TraceItemList({
  steps,
  onSelect,
  selectedRun,
}: {
  steps: RunData[];
  onSelect?: (step?: RunData) => void;
  selectedRun?: RunData | null;
}) {
  const annotatedSteps = annotateTraceSteps({ steps, start: 0, selectedRun });
  const { t } = useLocaleContext();

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" gap={1} mb={2}>
        <Typography
          sx={{
            flex: 1,
            minWidth: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          fontWeight={500}
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
        items: annotatedSteps,
        totalDuration: annotatedSteps[0].duration,
        depth: 0,
        onSelect,
      })}
    </Box>
  );
}
