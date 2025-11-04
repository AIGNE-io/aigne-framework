import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import Editor, { type OnMount } from "@monaco-editor/react";
import Box from "@mui/material/Box";
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import PreviewDialog from "./preview-dialog.tsx";

export interface JsonViewRef {
  foldAll: () => void;
  unfoldAll: () => void;
}

interface JsonViewProps {
  value: any;
  wordWrap?: "on" | "off";
  truncateStrings?: boolean;
}

const truncateString = (str: string, maxLength = 200): string => {
  if (str.length <= maxLength * 2) return str;

  return `${str.slice(0, maxLength)}......${str.slice(-maxLength)}`;
};

const truncateJsonValues = (obj: any, truncateMap: Map<string, string> = new Map()): any => {
  if (typeof obj === "string") {
    const truncated = truncateString(obj);
    if (truncated !== obj) {
      truncateMap.set(truncated, obj);
    }
    return truncated;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => truncateJsonValues(item, truncateMap));
  }

  if (obj && typeof obj === "object") {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = truncateJsonValues(value, truncateMap);
    }
    return result;
  }

  return obj;
};

const unescapeJsonString = (str: string): string => {
  try {
    return JSON.parse(`"${str}"`);
  } catch {
    return str;
  }
};

const JsonView = forwardRef<JsonViewRef, JsonViewProps>(
  ({ value: data, wordWrap = "on", truncateStrings = false }, ref) => {
    const { t } = useLocaleContext();
    const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
    const [dialogContent, setDialogContent] = useState("");
    const truncateMapRef = useRef<Map<string, string>>(new Map());

    const processedData = useMemo(() => {
      if (!truncateStrings) return data;
      truncateMapRef.current.clear();
      return truncateJsonValues(data, truncateMapRef.current);
    }, [data, truncateStrings]);

    const jsonString = useMemo(
      () =>
        typeof processedData === "string" ? processedData : JSON.stringify(processedData, null, 2),
      [processedData],
    );

    const handleEditorMount: OnMount = useCallback(
      (editor, _monaco) => {
        editorRef.current = editor;

        editor.addAction({
          id: "view-value-as-markdown",
          label: t("jsonView.viewAsMarkdown"),
          contextMenuGroupId: "9_cutcopypaste",
          contextMenuOrder: 1.6,
          run: (ed) => {
            const position = ed.getPosition();
            if (!position) return;

            const lineContent = ed.getModel()?.getLineContent(position.lineNumber);
            if (!lineContent) return;

            const match = lineContent.match(/:\s*(.+?)(,?\s*)$/);
            if (match) {
              let value = match[1].trim();
              value = value.replace(/,\s*$/, "");
              if (
                (value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))
              ) {
                value = value.slice(1, -1);
                value = unescapeJsonString(value);
              }

              if (truncateMapRef.current?.has(value)) {
                const originalValue = truncateMapRef.current.get(value);
                if (originalValue) {
                  setDialogContent(originalValue);
                  return;
                }
              }

              setDialogContent(value);
            } else {
              setDialogContent(lineContent.trim());
            }
          },
        });
      },
      [t],
    );

    useImperativeHandle(ref, () => ({
      foldAll: () => {
        const foldAllAction = editorRef.current?.getAction("editor.foldAll");
        if (foldAllAction) {
          foldAllAction.run();
        }
      },
      unfoldAll: () => {
        const unfoldAllAction = editorRef.current?.getAction("editor.unfoldAll");
        if (unfoldAllAction) {
          unfoldAllAction.run();
        }
      },
    }));

    return (
      <>
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
            path="viewer.json"
            height="100%"
            language="json"
            theme="vs-dark"
            value={jsonString}
            onMount={handleEditorMount}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              wordWrap,
              contextmenu: true,
              folding: true,
            }}
          />
        </Box>

        <PreviewDialog
          open={!!dialogContent}
          content={dialogContent}
          onClose={() => setDialogContent("")}
        />
      </>
    );
  },
);

export default JsonView;
