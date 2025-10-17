import Editor from "@monaco-editor/react";
import Box from "@mui/material/Box";

export default function JsonView({ value: data }: { value: any }) {
  const jsonString = typeof data === "string" ? data : JSON.stringify(data, null, 2);

  return (
    <Box
      sx={{
        p: 2,
        m: 0,
        height: "100%",
        backgroundColor: "#1e1e1e",
        userSelect: "text",
        position: "relative",
      }}
    >
      <Editor
        path={`${jsonString.slice(0, 5)}}.json`}
        height="100%"
        language="json"
        theme="vs-dark"
        value={jsonString}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          wordWrap: "on",
          contextmenu: false,
        }}
      />
    </Box>
  );
}
