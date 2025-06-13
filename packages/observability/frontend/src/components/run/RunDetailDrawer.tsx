import Box from "@mui/material/Box"
import Drawer from "@mui/material/Drawer"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import Typography from "@mui/material/Typography"
import {useEffect, useState} from "react"
import {parseDuration} from "../../utils/latency.ts"
import {RunTree} from "./RunTree.tsx"
import type {RunData} from "./types.ts"

interface RunDetailDrawerProps {
  open: boolean
  onClose: () => void
  run: RunData | null
}

export default function RunDetailDrawer({open, onClose, run}: RunDetailDrawerProps) {
  const [tabValue, setTabValue] = useState(0)
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

    return (
      <Box sx={{height: "100%", display: "flex", flexDirection: "column"}}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            px: 4,
            pt: 4,
            pb: 2,
          }}>
          <Box sx={{textAlign: "center"}}>
            <Typography fontWeight={500}>Agent Call Count</Typography>
            <Typography>{stats.count}</Typography>
          </Box>
          <Box sx={{textAlign: "center"}}>
            <Typography fontWeight={500}>Total Input Tokens</Typography>
            <Typography>{stats.inputTokens}</Typography>
          </Box>
          <Box sx={{textAlign: "center"}}>
            <Typography fontWeight={500}>Total Output Tokens</Typography>
            <Typography>{stats.outputTokens}</Typography>
          </Box>
          <Box sx={{textAlign: "center"}}>
            <Typography fontWeight={500}>Latency</Typography>
            <Typography>{parseDuration(run.startTime, run.endTime)}</Typography>
          </Box>
        </Box>
        <Box sx={{borderBottom: "1px solid #bbb", mx: 2}} />

        <Box sx={{flex: 1, display: "flex", minHeight: 0}}>
          <Box
            sx={{
              width: 360,
              py: 4,
              px: 2,
              borderRight: "1px solid #bbb",
              minWidth: 300,
            }}>
            <RunTree run={run} onSelect={setSelectedRun} />
          </Box>

          <Box sx={{flex: 1, p: 4, minWidth: 0}}>
            <Typography fontWeight={600} fontSize={20} mb={2}>
              {selectedRun?.name}
            </Typography>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{mb: 2}}>
              <Tab label="Call" />
              <Tab label="Metadata" />
            </Tabs>
            <Box sx={{borderBottom: "1px solid #bbb", mb: 2}} />
            <Typography fontWeight={500} mb={1}>
              Input
            </Typography>
            <Box
              sx={{
                border: "1px solid #bbb",
                borderRadius: 4,
                minHeight: 80,
                mb: 3,
                px: 2,
                py: 2,
              }}>
              {JSON.stringify(selectedRun?.attributes.input, null, 2)}
            </Box>
            <Typography fontWeight={500} mb={1}>
              Output
            </Typography>
            <Box
              sx={{
                border: "1px solid #bbb",
                borderRadius: 4,
                minHeight: 80,
                px: 2,
                py: 2,
                whiteSpace: "pre-wrap",
              }}>
              {JSON.stringify(selectedRun?.attributes.output, null, 2)}
            </Box>
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
      PaperProps={{sx: {width: 900, p: 0, boxSizing: "border-box"}}}>
      {renderContent()}
    </Drawer>
  )
}
