import { Box } from "@mui/material";
import yaml from "js-yaml";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function YamlView({ value }: { value: object }) {
  const yamlText = yaml.dump(value);

  return (
    <Box component="pre" sx={{ whiteSpace: "break-spaces", p: 2, m: 0 }}>
      {/* @ts-ignore */}
      <SyntaxHighlighter
        language="yaml"
        style={atomDark}
        wrapLines={true}
        wrapLongLines={true} // 自动换行
        customStyle={{
          borderRadius: "8px",
          fontSize: "0.9rem",
          wordBreak: "break-word",
          whiteSpace: "break-spaces",
          padding: 0,
          margin: 0,
        }}
      >
        {yamlText}
      </SyntaxHighlighter>
    </Box>
  );
}
