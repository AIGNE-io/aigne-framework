import FolderIcon from "@mui/icons-material/Folder";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import {
  AppBar,
  Box,
  Breadcrumbs,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useNavigate, useParams } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { getFileIcon, isImage } from "../fileIcons.tsx";
import type { AFSEntry } from "../types.ts";
import type { DisplayEntry } from "../utils.ts";
import { formatDate, formatSize, toDisplayEntry } from "../utils.ts";
import { FileTree } from "./FileTree.tsx";
import { FileViewer } from "./FileViewer.tsx";

const DRAWER_WIDTH = 280;

// Helper function to detect file language for syntax highlighting
function getLanguageFromPath(path: string, _mimeType?: string): string {
  const ext = path.split(".").pop()?.toLowerCase();

  // Map of extensions to Prism language identifiers
  const languageMap: Record<string, string> = {
    js: "javascript",
    jsx: "jsx",
    ts: "typescript",
    tsx: "tsx",
    py: "python",
    rb: "ruby",
    java: "java",
    c: "c",
    cpp: "cpp",
    cs: "csharp",
    go: "go",
    rs: "rust",
    php: "php",
    html: "html",
    css: "css",
    scss: "scss",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    xml: "xml",
    sql: "sql",
    sh: "bash",
    bash: "bash",
    md: "markdown",
    txt: "text",
  };

  return languageMap[ext || ""] || "text";
}

// Helper function to check if content is markdown
function isMarkdown(path: string, mimeType?: string): boolean {
  return path.endsWith(".md") || path.endsWith(".markdown") || mimeType === "text/markdown";
}

// Helper function to check if content is JSON
function isJSON(path: string, mimeType?: string, content?: any): boolean {
  // Check file extension
  if (path.endsWith(".json") || mimeType === "application/json") {
    return true;
  }

  // Check if content is already an object (not string)
  if (content && typeof content === "object" && !Array.isArray(content)) {
    return true;
  }

  return false;
}

export function FileExplorer() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const params = useParams();

  // Get current path from URL params (/* route)
  const currentPath = params["*"] ? `/${params["*"]}` : "/";

  const [entries, setEntries] = useState<DisplayEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPathDetail, setCurrentPathDetail] = useState<AFSEntry | null>(null);
  const [selectedFile, setSelectedFile] = useState<AFSEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [detailTab, setDetailTab] = useState<"raw" | "preview">("preview");

  const loadDirectory = useCallback(async (path: string) => {
    setLoading(true);
    try {
      // Load both current path detail and children list in parallel
      const [listResponse, readResponse] = await Promise.all([
        fetch(`/api/list?path=${encodeURIComponent(path)}&maxDepth=1`),
        fetch(`/api/read?path=${encodeURIComponent(path)}`),
      ]);

      const listData = await listResponse.json();
      const readData = await readResponse.json();

      const rawEntries: AFSEntry[] = listData.data || [];
      // Filter out the current path itself - only show children
      const children = rawEntries.filter((e) => e.path !== path);

      // Sort: directories first, then files, alphabetically within each group
      const displayEntries = children.map(toDisplayEntry).sort((a, b) => {
        const aIsDir = a.metadata?.type === "directory";
        const bIsDir = b.metadata?.type === "directory";

        // If types differ, directories come first
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;

        // Same type, sort alphabetically by name
        return a.name.localeCompare(b.name);
      });

      setEntries(displayEntries);

      // Set current path detail if it has content
      setCurrentPathDetail(readData.data || null);
    } catch (error) {
      console.error("Failed to load directory:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      loadDirectory(currentPath);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/search?path=${encodeURIComponent(currentPath)}&query=${encodeURIComponent(searchQuery)}`,
      );
      const data = await response.json();
      const rawEntries: AFSEntry[] = data.data || [];

      // Sort: directories first, then files, alphabetically within each group
      const displayEntries = rawEntries.map(toDisplayEntry).sort((a, b) => {
        const aIsDir = a.metadata?.type === "directory";
        const bIsDir = b.metadata?.type === "directory";

        // If types differ, directories come first
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;

        // Same type, sort alphabetically by name
        return a.name.localeCompare(b.name);
      });

      setEntries(displayEntries);
      // Clear current path detail during search
      setCurrentPathDetail(null);
    } catch (error) {
      console.error("Failed to search:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPath, searchQuery, loadDirectory]);

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath, loadDirectory]);

  const handleNavigate = (path: string) => {
    navigate(path);
    setSelectedFile(null);
    setSearchQuery("");
  };

  const handleFileClick = async (entry: DisplayEntry) => {
    // entry.path already contains the correct URL-encoded full path
    // Just navigate to it directly
    handleNavigate(entry.path);
  };

  const pathParts = currentPath.split("/").filter(Boolean);

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar>
        <Typography variant="h6" noWrap>
          File Tree
        </Typography>
      </Toolbar>
      <Divider />
      <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
        <FileTree currentPath={currentPath} />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AppBar position="static" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AFS Explorer
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        {/* File Tree Drawer */}
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            overflow: "auto",
            width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          }}
        >
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link
              component="button"
              variant="body1"
              onClick={() => handleNavigate("/")}
              sx={{ cursor: "pointer" }}
            >
              Root
            </Link>
            {pathParts.map((part, index) => {
              const path = `/${pathParts.slice(0, index + 1).join("/")}`;
              const isLast = index === pathParts.length - 1;
              // Decode the part for display (branch names with slashes use ~)
              const displayName = part.replace(/~/g, "/");
              return isLast ? (
                <Typography key={path} color="text.primary">
                  {displayName}
                </Typography>
              ) : (
                <Link
                  key={path}
                  component="button"
                  variant="body1"
                  onClick={() => handleNavigate(path)}
                  sx={{ cursor: "pointer" }}
                >
                  {displayName}
                </Link>
              );
            })}
          </Breadcrumbs>

          {/* Search Bar */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search files and folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            sx={{ mb: 3 }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearch} edge="end">
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* Content */}
          {currentPathDetail?.content && (
            <Paper sx={{ mb: 3 }}>
              <Box sx={{ px: 3, pt: 2, pb: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Content
                </Typography>
                {currentPathDetail.metadata?.mimeType && (
                  <Typography variant="body2" color="text.secondary">
                    Type: {currentPathDetail.metadata?.mimeType}
                  </Typography>
                )}
              </Box>

              <Tabs
                value={detailTab}
                onChange={(_e, newValue) => setDetailTab(newValue)}
                sx={{ borderBottom: 1, borderColor: "divider", px: 3 }}
              >
                <Tab label="Preview" value="preview" />
                <Tab label="Raw" value="raw" />
              </Tabs>

              <Box sx={{ p: 3 }}>
                {detailTab === "preview" ? (
                  <Box
                    sx={{
                      maxHeight: "500px",
                      overflow: "auto",
                    }}
                  >
                    {(() => {
                      const content =
                        typeof currentPathDetail.content === "string"
                          ? currentPathDetail.content
                          : JSON.stringify(currentPathDetail.content, null, 2);

                      // Render images
                      const mimeType = currentPathDetail.metadata?.mimeType as string | undefined;
                      const contentType = currentPathDetail.metadata?.contentType as
                        | string
                        | undefined;
                      if (isImage(currentPath, mimeType)) {
                        // Construct image src based on contentType
                        let imgSrc = content;
                        if (contentType === "base64") {
                          // Content is base64, add data URL prefix
                          imgSrc = `data:${mimeType || "image/png"};base64,${content}`;
                        } else if (mimeType === "image/svg+xml") {
                          // SVG is text content, encode it as data URL
                          imgSrc = `data:image/svg+xml,${encodeURIComponent(content)}`;
                        }

                        return (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              p: 2,
                            }}
                          >
                            <img
                              src={imgSrc}
                              alt={currentPath}
                              style={{
                                maxWidth: "100%",
                                maxHeight: "500px",
                                objectFit: "contain",
                              }}
                            />
                          </Box>
                        );
                      }

                      if (isMarkdown(currentPath, mimeType)) {
                        // Render Markdown
                        return (
                          <Box
                            sx={{
                              "& h1": { fontSize: "2em", fontWeight: "bold", mb: 2 },
                              "& h2": { fontSize: "1.5em", fontWeight: "bold", mb: 1.5 },
                              "& h3": { fontSize: "1.25em", fontWeight: "bold", mb: 1 },
                              "& p": { mb: 2 },
                              "& ul, & ol": { mb: 2, pl: 3 },
                              "& li": { mb: 0.5 },
                              "& code": {
                                bgcolor: "#f5f5f5",
                                px: 0.5,
                                py: 0.25,
                                borderRadius: 0.5,
                                fontSize: "0.875em",
                                color: "#d73a49",
                                fontFamily: "Consolas, Monaco, 'Courier New', monospace",
                              },
                              "& pre": { mb: 2 },
                              "& blockquote": {
                                borderLeft: "4px solid",
                                borderColor: "grey.300",
                                pl: 2,
                                py: 1,
                                mb: 2,
                                color: "text.secondary",
                              },
                              "& a": { color: "primary.main", textDecoration: "none" },
                              "& table": { borderCollapse: "collapse", mb: 2, width: "100%" },
                              "& th, & td": {
                                border: "1px solid",
                                borderColor: "grey.300",
                                px: 1,
                                py: 0.5,
                              },
                              "& th": { bgcolor: "grey.100", fontWeight: "bold" },
                            }}
                          >
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                code({ className, children, ...props }) {
                                  const match = /language-(\w+)/.exec(className || "");
                                  const inline = !match;
                                  const { ref: _, ...restProps } = props as any;
                                  return !inline && match ? (
                                    <SyntaxHighlighter
                                      style={oneLight as any}
                                      language={match[1]}
                                      PreTag="div"
                                      customStyle={
                                        {
                                          backgroundColor: "#fafafa",
                                          border: "1px solid #e0e0e0",
                                          borderRadius: "4px",
                                        } as any
                                      }
                                    >
                                      {String(children).replace(/\n$/, "")}
                                    </SyntaxHighlighter>
                                  ) : (
                                    <code className={className} {...restProps}>
                                      {children}
                                    </code>
                                  );
                                },
                              }}
                            >
                              {content}
                            </ReactMarkdown>
                          </Box>
                        );
                      }

                      if (
                        isJSON(
                          currentPath,
                          currentPathDetail.metadata?.mimeType,
                          currentPathDetail.content,
                        )
                      ) {
                        // Render JSON with syntax highlighting
                        return (
                          <SyntaxHighlighter
                            language="json"
                            style={oneLight}
                            customStyle={{
                              margin: 0,
                              borderRadius: "4px",
                              backgroundColor: "#fafafa",
                              border: "1px solid #e0e0e0",
                            }}
                            showLineNumbers
                          >
                            {content}
                          </SyntaxHighlighter>
                        );
                      }

                      // Syntax highlighting for code files
                      const language = getLanguageFromPath(
                        currentPath,
                        currentPathDetail.metadata?.mimeType,
                      );
                      return (
                        <SyntaxHighlighter
                          language={language}
                          style={oneLight}
                          customStyle={{
                            margin: 0,
                            borderRadius: "4px",
                            backgroundColor: "#fafafa",
                            border: "1px solid #e0e0e0",
                          }}
                          showLineNumbers
                        >
                          {content}
                        </SyntaxHighlighter>
                      );
                    })()}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "grey.50",
                      borderRadius: 1,
                      maxHeight: "500px",
                      overflow: "auto",
                    }}
                  >
                    <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {typeof currentPathDetail.content === "string"
                        ? currentPathDetail.content
                        : JSON.stringify(currentPathDetail.content, null, 2)}
                    </pre>
                  </Box>
                )}
              </Box>
            </Paper>
          )}

          {/* File List */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : entries.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Modified</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow
                      key={entry.path}
                      hover
                      onClick={() => handleFileClick(entry)}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {entry.metadata?.type === "file" ? (
                            getFileIcon(entry.path, entry.metadata?.mimeType as string)
                          ) : (
                            <FolderIcon fontSize="small" color="primary" />
                          )}
                          {entry.name}
                        </Box>
                      </TableCell>
                      <TableCell>{formatSize(entry.size)}</TableCell>
                      <TableCell>{formatDate(entry.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : null}
        </Box>
      </Box>

      {/* File Viewer Dialog */}
      {selectedFile && <FileViewer file={selectedFile} onClose={() => setSelectedFile(null)} />}
    </Box>
  );
}
