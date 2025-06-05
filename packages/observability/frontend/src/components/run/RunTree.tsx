import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { parseDuration } from "../../utils/latency.ts";
import type { RunData } from "./types.ts";

function formatRunMeta(run: RunData) {
  const parts: string[] = [];
  if (run.output?.model) {
    parts.push(run.output.model);
  }
  const inputTokens = run.output?.usage?.inputTokens;
  const outputTokens = run.output?.usage?.outputTokens;
  const tokenParts: string[] = [];
  if (typeof inputTokens === "number") {
    tokenParts.push(`${inputTokens} input tokens`);
  }
  if (typeof outputTokens === "number") {
    tokenParts.push(`${outputTokens} output tokens`);
  }
  if (tokenParts.length > 0) {
    parts.push(tokenParts.join(", "));
  }
  const duration = parseDuration(run.startedAt, run.endedAt);
  parts.push(`[${duration}]`);
  return parts.join(", ");
}

export function RunTree({
  run,
  level = 0,
  isLast = true,
  onSelect,
}: {
  run: RunData;
  level?: number;
  isLast?: boolean;
  onSelect?: (run: RunData) => void;
}) {
  const fontSize = 15;
  const lineColor = "#888";
  const lineWidth = 2;
  const indent = 20;
  const children = run.children || [];

  return (
    <Box sx={{ position: "relative", ml: level === 0 ? 0 : 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          position: "relative",
          minHeight: 28,
          cursor: onSelect ? "pointer" : undefined,
        }}
        onClick={
          onSelect
            ? (e) => {
                e.stopPropagation();
                onSelect(run);
              }
            : undefined
        }
      >
        {level > 0 && (
          <Box
            sx={{
              position: "relative",
              width: indent,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                left: (indent - lineWidth) / 2,
                top: 0,
                bottom: isLast ? "50%" : 0,
                width: lineWidth,
                bgcolor: lineColor,
                height: isLast ? "50%" : "100%",
                borderRadius: 1,
              }}
            />
            <Box
              sx={{
                width: indent,
                height: lineWidth,
                bgcolor: lineColor,
                borderRadius: 1,
                position: "absolute",
                left: (indent - lineWidth) / 2,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
          </Box>
        )}
        <Typography fontSize={fontSize} sx={{ ml: level > 0 ? 0.5 : 0 }}>
          {run.name || "Unknown"}
          <Box component="span" sx={{ ml: 1, color: "#888" }}>
            {formatRunMeta(run)}
          </Box>
        </Typography>
      </Box>
      {children.length > 0 && (
        <Box>
          {children.map((child, idx) => (
            <RunTree
              run={child}
              level={(level || 0) + 1}
              isLast={idx === children.length - 1}
              key={child.id || idx}
              onSelect={onSelect}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
