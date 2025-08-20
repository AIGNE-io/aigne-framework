import { Box, Typography } from "@mui/material";
import MarkdownPreview from "@uiw/react-markdown-preview";

import type { ImageData, LinkData } from "../libs/db.ts";

const markdownComponents = {
  a: (props: any) => <span>{props.children}</span>,
};

interface MessageBubbleProps {
  id: string;
  message: string;
  isUser: boolean;
  isLast: boolean;
  links?: LinkData[];
  images?: ImageData[];
}

function MessageBubble({ message, isUser }: MessageBubbleProps) {
  // 提取 tab 标记
  const tabRegex = /<tab:\s*([^>]+)>/g;

  // 移除消息中的 tab 标记
  const cleanMessage = message.replace(tabRegex, "");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        pb: 2.5,
        pt: 2.5,
        position: "relative",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: isUser ? "row-reverse" : "row",
          alignItems: "flex-start",
          width: "100%",
          gap: 1,
        }}
      >
        <Box style={{ maxWidth: isUser ? "79%" : "100%", alignSelf: "flex-start" }} sx={{}}>
          <Box
            sx={{
              width: "100%",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 1,
            }}
          >
            <Box
              sx={{
                flex: 1,
                overflow: "hidden",
                display: "inline-block",
                width: "100%",
                "& .wmde-markdown": {
                  backgroundColor: "transparent",
                  color: "text.primary",
                  fontSize: "1rem",
                  lineHeight: 1.75,
                  "& pre": {
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    padding: "8px 12px",
                    margin: "8px 0",
                    borderRadius: "6px",
                  },
                  "& code": {
                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                    padding: "2px 4px",
                    borderRadius: "4px",
                    fontSize: "0.9em",
                    color: "text.primary",
                  },
                  "& h1, & h2, & h3, & h4, & h5, & h6": {
                    margin: "12px 0 4px",
                    borderBottom: "none",
                    padding: 0,
                    color: "text.primary",
                  },
                  "& ul, & ol": {
                    paddingLeft: "32px",
                    margin: "4px 0",
                  },
                  "& ol": {
                    "& li::marker": {
                      fontVariantNumeric: "tabular-nums",
                      minWidth: "24px",
                      textAlign: "right",
                    },
                  },
                  "& li + li": {
                    margin: "2px 0",
                  },
                  "& p": {
                    margin: "4px 0",
                    color: "text.primary",
                  },
                  "& a": {
                    color: "#82aaff",
                  },
                  "& table": {
                    margin: "8px 0",
                    "& th, & td": {
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      padding: "4px 8px",
                      color: "text.primary",

                      background: "transparent !important",
                    },
                    "& tr": {
                      background: "transparent !important",
                    },
                  },
                  "& blockquote": {
                    borderLeft: "4px solid rgba(130, 170, 255, 0.4)",
                    margin: "8px 0",
                    padding: "0 8px",
                    color: "rgba(255, 255, 255, 0.8)",
                  },
                  "& hr": {
                    margin: "12px 0",
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "& answer": {
                    fontSize: "1.15rem",
                    fontWeight: "bold",
                    display: "block",
                    margin: "8px 0",
                    color: "text.primary",
                  },
                },
              }}
            >
              {isUser ? (
                <Typography
                  variant="body1"
                  sx={{ wordBreak: "break-word", fontSize: "0.95rem", color: "text.primary" }}
                >
                  {message}
                </Typography>
              ) : (
                <MarkdownPreview
                  style={{ wordBreak: "break-word" }}
                  source={cleanMessage}
                  components={markdownComponents}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default MessageBubble;
