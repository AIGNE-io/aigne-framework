import {useLocaleContext} from "@arcblock/ux/lib/Locale/context"
import {Box, Chip, LinearProgress, Tooltip, Typography} from "@mui/material"
import type {JSX} from "react"
import {parseDurationMs} from "../../utils/latency.ts"
import type {RunData} from "./types.ts"

type TraceItemProps = {
  name: string
  duration: number
  start: number
  totalDuration: number
  selected?: boolean
  depth?: number
  onSelect?: () => void
  status?: number
}

function TraceItem({
  name,
  duration,
  start,
  totalDuration,
  selected,
  depth = 0,
  onSelect,
  status,
}: TraceItemProps) {
  const widthPercent = (duration / totalDuration) * 100
  const marginLeftPercent = (start / totalDuration) * 100
  const {t} = useLocaleContext()

  return (
    <Box
      sx={{
        cursor: "pointer",
        backgroundColor: "#2e2e2e",
        p: 2,
        borderRadius: 1,
        mb: 1,
        border: selected ? "2px solid #4a9eff" : "2px solid transparent",
        ml: depth * 2,
        overflow: "hidden",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          backgroundColor: "#363636",
        },
      }}
      onClick={() => onSelect?.()}>
      <Box
        display="flex"
        alignItems="center"
        flexWrap="nowrap"
        justifyContent="space-between"
        gap={1}>
        <Typography
          sx={{
            color: "common.white",
            flex: 1,
            minWidth: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          fontWeight="medium">
          {name}
          <Chip
            label={status === 1 ? t("success") : t("failed")}
            size="small"
            color={status === 1 ? "success" : "error"}
            sx={{ml: 1}}
          />
        </Typography>

        <Typography variant="caption" color="common.white" sx={{flexShrink: 0, ml: "auto", mr: 1}}>
          {duration}s
        </Typography>

        <Box
          sx={{
            width: "100%",
            maxWidth: "200px",
            position: "relative",
            height: 10,
            borderRadius: 5,
            overflow: "visible",
          }}>
          <Tooltip title={`${t("latency")}: ${duration}s`}>
            <Box
              sx={{
                position: "absolute",
                left: `${marginLeftPercent}%`,
                width: `${widthPercent}%`,
                height: "100%",
              }}>
              <LinearProgress
                variant="determinate"
                value={100}
                sx={{height: "100%", borderRadius: 5}}
              />
            </Box>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  )
}

type TraceStep = {
  name: string
  duration: number
  selected?: boolean
  children?: TraceStep[]
  start?: number
  run?: RunData
  status?: {
    code: number
    message: string
  }
}

export function annotateTraceSteps({
  steps,
  start = 0,
  selectedRun,
}: {
  steps: RunData[]
  start: number
  selectedRun?: RunData | null
}): TraceStep[] {
  let current = start

  return steps.map(step => {
    const annotated: TraceStep = {
      ...step,
      selected: step.id === selectedRun?.id,
      start: current,
      duration: parseDurationMs(step.startTime, step.endTime),
      children: step.children
        ? annotateTraceSteps({steps: step.children, start: current, selectedRun})
        : undefined,
      run: step,
    }
    current += annotated.duration
    return annotated
  })
}

export function renderTraceItems({
  items,
  totalDuration,
  depth = 0,
  onSelect,
}: {
  items: TraceStep[]
  totalDuration: number
  depth?: number
  onSelect?: (step?: RunData) => void
}): JSX.Element[] {
  return items.flatMap(item => [
    <TraceItem
      key={item.name + (item.start ?? 0)}
      name={item.name}
      duration={item.duration}
      start={item.start ?? 0}
      totalDuration={totalDuration}
      selected={item.selected}
      depth={depth}
      status={item.status?.code}
      onSelect={() => onSelect?.(item.run)}
    />,
    ...(item.children
      ? renderTraceItems({items: item.children, totalDuration, depth: depth + 1, onSelect})
      : []),
  ])
}

export default function TraceItemList({
  steps,
  onSelect,
  selectedRun,
}: {
  steps: RunData[]
  onSelect?: (step?: RunData) => void
  selectedRun?: RunData | null
}) {
  const annotatedSteps = annotateTraceSteps({steps, start: 0, selectedRun})

  return renderTraceItems({
    items: annotatedSteps,
    totalDuration: annotatedSteps[0].duration,
    depth: 0,
    onSelect,
  })
}
