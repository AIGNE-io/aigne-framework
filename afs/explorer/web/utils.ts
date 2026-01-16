import type { AFSEntry } from "./types.ts";

export interface DisplayEntry extends AFSEntry {
  name: string;
  hasChildren: boolean;
  hasContent: boolean;
  size?: number;
}

/**
 * Convert AFS entry to display entry with name and capabilities
 * In AFS, a node can be both a file (with content) and a directory (with children)
 */
export function toDisplayEntry(entry: AFSEntry): DisplayEntry {
  const path = entry.path;
  // Extract the last segment first, then decode it
  // Branch names with slashes are encoded with ~ (e.g., "feature~new-feature" -> "feature/new-feature")
  const lastSegment = path.split("/").filter(Boolean).pop() || path;
  const name = lastSegment.replace(/~/g, "/");

  // Determine if entry can have children based on metadata.type
  const metadataType = entry.metadata?.type as string | undefined;
  const hasChildren = metadataType !== "file";

  // Check if entry has content (can be viewed as a file)
  const hasContent =
    entry.content !== undefined && entry.content !== null && !Array.isArray(entry.content);

  // Get size from metadata if available
  const size =
    entry.metadata?.size ?? (hasContent ? JSON.stringify(entry.content).length : undefined);

  return {
    ...entry,
    name,
    hasChildren,
    hasContent,
    size,
  };
}

/**
 * Format date for display
 */
export function formatDate(date?: string | Date): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString();
}

/**
 * Format size for display
 */
export function formatSize(size?: number): string {
  if (!size) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}
