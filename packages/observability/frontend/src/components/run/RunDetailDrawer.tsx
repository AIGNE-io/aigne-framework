import Box from "@mui/material/Box"
import Drawer from "@mui/material/Drawer"
import {useEffect, useState} from "react"
import {parseDuration} from "../../utils/latency.ts"
import RunStatsHeader from "./RunStatsHeader.tsx"
import TraceDetailPanel from "./TraceDetailPanel.tsx"
import TraceItemList from "./TraceItem.tsx"
import type {RunData} from "./types.ts"

interface RunDetailDrawerProps {
  open: boolean
  onClose: () => void
  run: RunData | null
}

export default function RunDetailDrawer({open, onClose, run}: RunDetailDrawerProps) {
  const [selectedRun, setSelectedRun] = useState(run)

  useEffect(() => {
    setSelectedRun(run)
  }, [run])

  const getRunStats = (run: RunData | null) => {
    let count = 0
    let inputTokens = 0
    let outputTokens = 0

    function traverse(node: RunData | null) {
      if (!node) return
      count += 1
      if (node.attributes.output?.usage) {
        inputTokens += node.attributes.output?.usage?.inputTokens || 0
        outputTokens += node.attributes.output?.usage?.outputTokens || 0
      }
      if (node.children) node.children.forEach(traverse)
    }
    traverse(run)
    return {count, inputTokens, outputTokens}
  }

  const renderContent = () => {
    if (!run) return null
    const stats = getRunStats(run)
    const totalTokens = stats.inputTokens + stats.outputTokens
    const latency = parseDuration(run.startTime, run.endTime)
    const timestamp = new Date(run.startTime || Date.now()).toLocaleString()

    return (
      <Box sx={{height: "100%", display: "flex", flexDirection: "column"}}>
        <RunStatsHeader
          inputTokens={stats.inputTokens}
          outputTokens={stats.outputTokens}
          tokens={totalTokens}
          count={stats.count}
          latency={latency}
          timestamp={timestamp}
        />

        <Box sx={{flex: 1, display: "flex", minHeight: 0}}>
          <Box
            sx={{
              flex: 1,
              py: 4,
              px: 2,
              borderRight: "1px solid #bbb",
              minWidth: 300,
            }}>
            <TraceItemList
              steps={[run]}
              onSelect={run => setSelectedRun(run ?? null)}
              selectedRun={selectedRun}
            />
          </Box>

          <Box sx={{flex: 1, minWidth: 0}}>
            <TraceDetailPanel run={selectedRun} />
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{sx: {width: "80vw", p: 0, boxSizing: "border-box"}}}>
      {renderContent()}
    </Drawer>
  )
}
