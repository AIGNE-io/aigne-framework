import ArticleIcon from "@mui/icons-material/Article";
import AudioFileIcon from "@mui/icons-material/AudioFile";
import CodeIcon from "@mui/icons-material/Code";
import DescriptionIcon from "@mui/icons-material/Description";
import ImageIcon from "@mui/icons-material/Image";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import JavascriptIcon from "@mui/icons-material/Javascript";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import VideoFileIcon from "@mui/icons-material/VideoFile";

/**
 * Check if path/mimeType represents an image file
 */
export function isImage(path: string, mimeType?: string): boolean {
  const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp", ".svg", ".ico"];
  const lowerPath = path.toLowerCase();
  return (
    imageExtensions.some((ext) => lowerPath.endsWith(ext)) ||
    mimeType?.startsWith("image/") ||
    false
  );
}

/**
 * Get file icon based on extension and mimeType
 */
export function getFileIcon(path: string, mimeType?: string, size: "small" | "inherit" = "small") {
  const ext = path.split(".").pop()?.toLowerCase();

  // Images
  if (isImage(path, mimeType)) {
    return <ImageIcon fontSize={size} color="info" />;
  }

  // PDF
  if (ext === "pdf" || mimeType === "application/pdf") {
    return <PictureAsPdfIcon fontSize={size} color="error" />;
  }

  // Documents
  if (["doc", "docx", "odt", "rtf"].includes(ext || "")) {
    return <DescriptionIcon fontSize={size} color="primary" />;
  }

  // Markdown
  if (["md", "markdown"].includes(ext || "") || mimeType === "text/markdown") {
    return <ArticleIcon fontSize={size} color="action" />;
  }

  // JavaScript/TypeScript
  if (["js", "jsx", "ts", "tsx", "mjs", "cjs"].includes(ext || "")) {
    return <JavascriptIcon fontSize={size} sx={{ color: "#f7df1e" }} />;
  }

  // Code files
  if (
    [
      "py",
      "java",
      "c",
      "cpp",
      "h",
      "hpp",
      "cs",
      "go",
      "rs",
      "php",
      "rb",
      "swift",
      "kt",
      "scala",
    ].includes(ext || "")
  ) {
    return <CodeIcon fontSize={size} color="secondary" />;
  }

  // Web files
  if (["html", "css", "scss", "sass", "less"].includes(ext || "")) {
    return <CodeIcon fontSize={size} color="primary" />;
  }

  // Config/Data files
  if (["json", "yaml", "yml", "xml", "toml", "ini", "conf", "config"].includes(ext || "")) {
    return <ArticleIcon fontSize={size} color="warning" />;
  }

  // Video files
  if (
    ["mp4", "avi", "mov", "mkv", "wmv", "flv", "webm"].includes(ext || "") ||
    mimeType?.startsWith("video/")
  ) {
    return <VideoFileIcon fontSize={size} color="secondary" />;
  }

  // Audio files
  if (
    ["mp3", "wav", "flac", "aac", "ogg", "m4a", "wma"].includes(ext || "") ||
    mimeType?.startsWith("audio/")
  ) {
    return <AudioFileIcon fontSize={size} color="success" />;
  }

  // Text files
  if (["txt", "log", "csv", "tsv"].includes(ext || "") || mimeType?.startsWith("text/")) {
    return <DescriptionIcon fontSize={size} />;
  }

  // Default file icon
  return <InsertDriveFileIcon fontSize={size} />;
}
