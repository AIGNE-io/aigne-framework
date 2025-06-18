import {Chip, Tooltip} from "@mui/material"
import tinycolor from "tinycolor2"

const agentTagColors = {
  OrchestratorAgent: {
    color: "#0d47a1", // 更深的蓝色
    backgroundColor: "#e3f2fd",
  },
  FunctionAgent: {
    color: "#4a148c", // 更深的紫色
    backgroundColor: "#f3e5f5",
  },
  AIAgent: {
    color: "#1b5e20", // 更深的绿色
    backgroundColor: "#e8f5e9",
  },
  ChatModelAgent: {
    color: "#7A4F01", // 更深的橙棕色
    backgroundColor: "#fffde7",
  },
  MCPAgent: {
    color: "#7A0000", // 更深的红色
    backgroundColor: "#ffebee",
  },
  MCPBaseAgent: {
    color: "#880e4f", // 更深的红色
    backgroundColor: "#ffebee",
  },
  MCPToolAgent: {
    color: "#880e4f", // 更深的洋红色
    backgroundColor: "#fce4ec",
  },
  MCPPromptAgent: {
    color: "#3e2723", // 更深的棕色
    backgroundColor: "#efebe9",
  },
  MCPResourceAgent: {
    color: "#006064", // 更深的青色
    backgroundColor: "#e0f7fa",
  },
  TeamAgent: {
    color: "#263238", // 更深的蓝灰色
    backgroundColor: "#eceff1",
  },
  MemoryAgent: {
    color: "#3e2723", // 更深的棕色
    backgroundColor: "#efebe9",
  },
  MemoryRecorderAgent: {
    color: "#4e342e", // 更深的棕色
    backgroundColor: "#efebe9",
  },
  MemoryRetrieverAgent: {
    color: "#4e342e", // 更深的灰棕色
    backgroundColor: "#f5f5f5",
  },
  ClientAgent: {
    color: "#01579b", // 更深的浅蓝色
    backgroundColor: "#e1f5fe",
  },
}

export const AgentTag = ({agentTag}: {agentTag?: string}) => {
  if (!agentTag) return null

  const agentColors = Object.entries(agentTagColors).reduce(
    (acc, [key, value]) => {
      acc[key] = {
        color: value.color,
        backgroundColor: tinycolor(value.color).lighten(70).toHexString(),
      }
      return acc
    },
    {} as Record<string, {color: string; backgroundColor: string}>
  )

  return (
    <Tooltip title={agentTag}>
      <Chip
        label={agentTag}
        size="small"
        variant="outlined"
        sx={{
          height: 21,
          width: "150px",
          backgroundColor: `${agentColors[agentTag as keyof typeof agentColors]?.backgroundColor} !important`,
          color: `${agentColors[agentTag as keyof typeof agentColors]?.color} !important`,
          border: 0,
        }}
      />
    </Tooltip>
  )
}
