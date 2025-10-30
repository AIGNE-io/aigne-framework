import { Chip } from "@mui/material";
import tinycolor from "tinycolor2";

const agentTagColors = {
  OrchestratorAgent: { color: "#0d47a1", backgroundColor: "#e3f2fd" },
  FunctionAgent: { color: "#4a148c", backgroundColor: "#f3e5f5" },
  AIAgent: { color: "#1b5e20", backgroundColor: "#e8f5e9" },
  ChatModelAgent: { color: "#7A4F01", backgroundColor: "#fffde7" },
  MCPAgent: { color: "#7A0000", backgroundColor: "#ffebee" },
  MCPBaseAgent: { color: "#880e4f", backgroundColor: "#ffebee" },
  MCPToolAgent: { color: "#880e4f", backgroundColor: "#fce4ec" },
  MCPPromptAgent: { color: "#3e2723", backgroundColor: "#efebe9" },
  MCPResourceAgent: { color: "#006064", backgroundColor: "#e0f7fa" },
  TeamAgent: { color: "#263238", backgroundColor: "#eceff1" },
  MemoryAgent: { color: "#3e2723", backgroundColor: "#efebe9" },
  MemoryRecorderAgent: { color: "#4e342e", backgroundColor: "#efebe9" },
  MemoryRetrieverAgent: { color: "#4e342e", backgroundColor: "#f5f5f5" },
  ClientAgent: { color: "#01579b", backgroundColor: "#e1f5fe" },
  ImageModelAgent: { color: "#7A4F01", backgroundColor: "#fffde7" },
  VideoModelAgent: { color: "#7A4F01", backgroundColor: "#fffde7" },
};

const agentColors = Object.fromEntries(
  Object.entries(agentTagColors).map(([key, value]) => [
    key,
    {
      color: value.color,
      backgroundColor:
        tinycolor(value.color).lighten(70).toHexString() === "#ffffff"
          ? value.backgroundColor
          : tinycolor(value.color).lighten(70).toHexString(),
    },
  ]),
) as Record<string, { color: string; backgroundColor: string }>;

export const AgentTag = ({ agentTag, model }: { agentTag?: string; model?: string }) => {
  if (!agentTag) return null;

  const replaced = agentTag.replace(/Agent$/g, ""); // 使用正则确保只替换结尾
  const tag = replaced === "ChatModel" ? (model ?? replaced) : replaced;
  const colors = agentColors[agentTag as keyof typeof agentColors];

  return (
    <Chip
      label={tag}
      size="small"
      variant="outlined"
      sx={{
        height: 21,
        width: "120px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        backgroundColor: `${colors?.backgroundColor} !important`,
        color: `${colors?.color} !important`,
        border: 0,
        fontSize: 10,
        borderRadius: "4px",
      }}
    />
  );
};
