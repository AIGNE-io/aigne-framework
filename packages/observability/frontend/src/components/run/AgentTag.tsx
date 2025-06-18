import Tag from "@arcblock/ux/lib/Tag"
import {Box, Tooltip} from "@mui/material"

export const AgentTag = ({agentTag}: {agentTag?: string}) => {
  const agentColors = {
    OrchestratorAgent: {
      color: "#1565c0", // 深蓝
      backgroundColor: "#e3f2fd", // 浅蓝背景
    },
    FunctionAgent: {
      color: "#6a1b9a", // 深紫
      backgroundColor: "#f3e5f5", // 浅紫背景
    },
    AIAgent: {
      color: "#2e7d32", // 深绿
      backgroundColor: "#e8f5e9", // 浅绿背景
    },
    ChatModelAgent: {
      color: "#f9a825", // 深黄
      backgroundColor: "#fffde7", // 浅黄背景
    },
    MCPAgent: {
      color: "#c62828", // 深红
      backgroundColor: "#ffebee", // 浅红背景
    },
    MCPBaseAgent: {
      color: "#b71c1c", // 更深红
      backgroundColor: "#ffebee", // 浅红背景
    },
    MCPToolAgent: {
      color: "#ad1457", // 洋红
      backgroundColor: "#fce4ec", // 浅粉背景
    },
    MCPPromptAgent: {
      color: "#6d4c41", // 棕色
      backgroundColor: "#efebe9", // 浅棕背景
    },
    MCPResourceAgent: {
      color: "#00838f", // 青色
      backgroundColor: "#e0f7fa", // 浅青背景
    },
    TeamAgent: {
      color: "#37474f", // 蓝灰
      backgroundColor: "#eceff1", // 浅蓝灰背景
    },
    MemoryAgent: {
      color: "#5d4037", // 棕色
      backgroundColor: "#efebe9", // 浅棕背景
    },
    MemoryRecorderAgent: {
      color: "#8d6e63", // 浅棕
      backgroundColor: "#efebe9", // 浅棕背景
    },
    MemoryRetrieverAgent: {
      color: "#bcaaa4", // 灰棕
      backgroundColor: "#f5f5f5", // 浅灰背景
    },
    ClientAgent: {
      color: "#0277bd", // 浅蓝
      backgroundColor: "#e1f5fe", // 浅蓝背景
    },
  }

  if (!agentTag) return null

  return (
    <Tooltip title={agentTag}>
      <Tag
        sx={{
          width: "150px",
          backgroundColor: `${agentColors[agentTag as keyof typeof agentColors]?.backgroundColor} !important`,
          color: `${agentColors[agentTag as keyof typeof agentColors]?.color} !important`,
        }}>
        <Box
          sx={{
            maxWidth: "150px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
          {agentTag}
        </Box>
      </Tag>
    </Tooltip>
  )
}
