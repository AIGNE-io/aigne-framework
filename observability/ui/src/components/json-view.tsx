import Box from "@mui/material/Box";
import ReactJson from "react-json-view";

export default function JsonView({ value }: { value: object }) {
  return (
    <Box
      sx={{ p: 2, m: 0, "& .string-value": { whiteSpace: "pre-line", wordBreak: "break-word" } }}
    >
      <ReactJson
        src={value}
        name={false}
        collapsed={3}
        enableClipboard={false}
        displayDataTypes={false}
        style={{ background: "none", color: "inherit", fontSize: 14 }}
        theme="monokai"
      />
    </Box>
  );
}
