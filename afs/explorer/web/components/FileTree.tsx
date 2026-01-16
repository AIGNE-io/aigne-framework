import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FolderIcon from "@mui/icons-material/Folder";
import { Box, CircularProgress, Typography } from "@mui/material";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFileIcon } from "../fileIcons.tsx";
import type { AFSEntry } from "../types.ts";
import { toDisplayEntry } from "../utils.ts";

interface FileTreeProps {
  currentPath: string;
}

interface TreeNode {
  id: string;
  name: string;
  path: string;
  hasChildren: boolean;
  children?: TreeNode[];
  loaded?: boolean;
  loading?: boolean; // Track if node is currently loading children
  metadata?: Record<string, any>; // Include metadata for icon display
}

export function FileTree({ currentPath }: FileTreeProps) {
  const navigate = useNavigate();
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load root directory with 2 levels
  const loadRoot = useCallback(async () => {
    setLoading(true);
    try {
      // Load 2 levels at once
      const response = await fetch("/api/list?path=/&maxDepth=2");
      const data = await response.json();
      const entries: AFSEntry[] = data.data || [];

      // Build a tree structure from flat list
      const pathMap = new Map<string, TreeNode>();
      const rootNodes: TreeNode[] = [];
      const firstLevelPaths: string[] = [];

      // First pass: create all nodes
      for (const entry of entries) {
        const displayEntry = toDisplayEntry(entry);
        const node: TreeNode = {
          id: displayEntry.path,
          name: displayEntry.name,
          path: displayEntry.path,
          hasChildren: displayEntry.hasChildren,
          children: [],
          loaded: false,
          metadata: displayEntry.metadata,
        };
        pathMap.set(displayEntry.path, node);
      }

      // Second pass: organize into tree structure
      for (const entry of entries) {
        const node = pathMap.get(entry.path)!;
        const pathParts = entry.path.split("/").filter(Boolean);

        if (pathParts.length === 1) {
          // First level - direct child of root
          rootNodes.push(node);
          firstLevelPaths.push(entry.path);
        } else if (pathParts.length === 2) {
          // Second level - child of first level
          const parentPath = `/${pathParts[0]}`;
          const parentNode = pathMap.get(parentPath);
          if (parentNode) {
            parentNode.children!.push(node);
          }
        }
      }

      // Mark first level nodes as loaded since we already have their children
      for (const path of firstLevelPaths) {
        const node = pathMap.get(path);
        if (node) {
          node.loaded = true;
          // Update hasChildren based on actual children (only if it was marked as having children)
          if (node.hasChildren) {
            node.hasChildren = node.children!.length > 0;
          }
          // Sort children: directories first, then alphabetically
          if (node.children) {
            node.children.sort((a, b) => {
              const aEntry = entries.find((e) => e.path === a.path);
              const bEntry = entries.find((e) => e.path === b.path);
              const aIsDir = aEntry?.metadata?.type === "directory";
              const bIsDir = bEntry?.metadata?.type === "directory";

              if (aIsDir && !bIsDir) return -1;
              if (!aIsDir && bIsDir) return 1;
              return a.name.localeCompare(b.name);
            });
          }
        }
      }

      // Sort root nodes: directories first, then alphabetically
      rootNodes.sort((a, b) => {
        const aEntry = entries.find((e) => e.path === a.path);
        const bEntry = entries.find((e) => e.path === b.path);
        const aIsDir = aEntry?.metadata?.type === "directory";
        const bIsDir = bEntry?.metadata?.type === "directory";

        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        return a.name.localeCompare(b.name);
      });

      setTree(rootNodes);
      setExpanded(firstLevelPaths);
    } catch (error) {
      console.error("Failed to load root:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load children for a directory
  const loadChildren = useCallback(async (path: string): Promise<TreeNode[]> => {
    try {
      const response = await fetch(`/api/list?path=${encodeURIComponent(path)}&maxDepth=1`);
      const data = await response.json();
      const entries: AFSEntry[] = data.data || [];

      // Filter out the current path itself - only keep actual children
      const children = entries.filter((e) => e.path !== path);

      const displayEntries = children.map(toDisplayEntry);

      // Use hasChildren from displayEntry (based on metadata.type)
      const nodes = displayEntries.map((e) => ({
        id: e.path,
        name: e.name,
        path: e.path,
        hasChildren: e.hasChildren,
        children: [],
        loaded: false,
        metadata: e.metadata,
      }));

      // Sort: directories first, then alphabetically
      nodes.sort((a, b) => {
        const aEntry = displayEntries.find((e) => e.path === a.path);
        const bEntry = displayEntries.find((e) => e.path === b.path);
        const aIsDir = aEntry?.metadata?.type === "directory";
        const bIsDir = bEntry?.metadata?.type === "directory";

        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        return a.name.localeCompare(b.name);
      });

      return nodes;
    } catch (error) {
      console.error(`Failed to load children for ${path}:`, error);
      return [];
    }
  }, []);

  // Update tree with loaded children
  const updateTreeNode = useCallback(
    (nodes: TreeNode[], nodeId: string, children: TreeNode[]): TreeNode[] => {
      return nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            children,
            loaded: true,
            loading: false, // Stop loading
            // Only update hasChildren if it was marked as having children initially
            // (files with type="file" should keep hasChildren=false)
            hasChildren: node.hasChildren ? children.length > 0 : false,
          };
        }
        if (node.children && node.children.length > 0) {
          return { ...node, children: updateTreeNode(node.children, nodeId, children) };
        }
        return node;
      });
    },
    [],
  );

  // Set loading state for a node
  const setNodeLoading = useCallback(
    (nodes: TreeNode[], nodeId: string, loading: boolean): TreeNode[] => {
      return nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, loading };
        }
        if (node.children && node.children.length > 0) {
          return { ...node, children: setNodeLoading(node.children, nodeId, loading) };
        }
        return node;
      });
    },
    [],
  );

  // Helper to find node in tree
  const findNode = useCallback((nodes: TreeNode[], targetId: string): TreeNode | null => {
    for (const node of nodes) {
      if (node.id === targetId) return node;
      if (node.children) {
        const found = findNode(node.children, targetId);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // Handle node toggle (expand/collapse)
  const handleToggle = useCallback(
    (_event: React.SyntheticEvent, nodeIds: string[]) => {
      // Filter out nodes whose parent is not expanded
      const filteredNodeIds = nodeIds.filter((nodeId) => {
        const pathParts = nodeId.split("/").filter(Boolean);
        if (pathParts.length <= 1) return true;

        for (let i = 1; i < pathParts.length; i++) {
          const parentPath = `/${pathParts.slice(0, i).join("/")}`;
          if (!nodeIds.includes(parentPath)) return false;
        }
        return true;
      });

      // Update expanded state and find newly expanded nodes
      setExpanded((prev) => {
        const newlyExpanded = filteredNodeIds.filter((id) => !prev.includes(id));

        // Load children for newly expanded nodes
        if (newlyExpanded.length > 0) {
          setTree((currentTree) => {
            for (const nodeId of newlyExpanded) {
              const node = findNode(currentTree, nodeId);
              if (node && !node.loaded && !node.loading) {
                const treeWithLoading = setNodeLoading(currentTree, nodeId, true);
                loadChildren(node.path).then((children) => {
                  setTree((prevTree) => updateTreeNode(prevTree, nodeId, children));
                });
                return treeWithLoading;
              }
            }
            return currentTree;
          });
        }

        return filteredNodeIds;
      });
    },
    [findNode, loadChildren, setNodeLoading, updateTreeNode],
  );

  // Handle node click
  const handleSelect = useCallback(
    (_event: React.SyntheticEvent, nodeId: string) => {
      navigate(nodeId);
    },
    [navigate],
  );

  // Render tree item recursively
  const renderTree = (nodes: TreeNode[]) => {
    return nodes.map((node) => (
      <TreeItem
        key={node.id}
        itemId={node.id}
        label={
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: 16 }}>
            {node.metadata?.type === "file" ? (
              getFileIcon(node.path, node.metadata?.mimeType as string, "inherit")
            ) : (
              <FolderIcon fontSize="inherit" color="primary" />
            )}
            <Typography
              variant="body2"
              sx={{
                py: 0.5,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {node.name}
            </Typography>
          </Box>
        }
        slots={{
          // Show loading spinner when loading, otherwise use default icons
          expandIcon: node.loading ? () => <CircularProgress size={16} /> : undefined,
        }}
      >
        {node.children && node.children.length > 0 ? (
          renderTree(node.children)
        ) : node.hasChildren && !node.loaded ? (
          // Render invisible placeholder to trigger expand icon
          <TreeItem
            key={`${node.id}-placeholder`}
            itemId={`${node.id}-placeholder`}
            label=""
            sx={{ height: 0, overflow: "hidden" }}
          />
        ) : null}
      </TreeItem>
    ));
  };

  useEffect(() => {
    loadRoot();
  }, [loadRoot]);

  // Auto-expand to current path
  useEffect(() => {
    if (currentPath && currentPath !== "/") {
      const pathParts = currentPath.split("/").filter(Boolean);
      const expandPaths: string[] = [];
      // Only expand parent paths, not the current path itself
      // (the current path might be a file with no children)
      for (let i = 0; i < pathParts.length - 1; i++) {
        expandPaths.push(`/${pathParts.slice(0, i + 1).join("/")}`);
      }

      if (expandPaths.length === 0) return; // Nothing to expand

      setExpanded((prev) => {
        // Check if any path needs to be added
        const hasNewPaths = expandPaths.some((path) => !prev.includes(path));
        if (!hasNewPaths) {
          return prev; // Don't update if all paths are already expanded
        }
        const newExpanded = [...new Set([...prev, ...expandPaths])];
        return newExpanded;
      });
    }
  }, [currentPath]);

  // Clean up expanded list: remove nodes that have been loaded and have no children
  useEffect(() => {
    setExpanded((prev) => {
      const validIds = prev.filter((nodeId) => {
        const node = findNode(tree, nodeId);
        // Keep node if it's not in tree, not loaded yet, or has children
        return !node || !node.loaded || node.hasChildren;
      });
      // Only update if something changed
      return validIds.length !== prev.length ? validIds : prev;
    });
  }, [tree, findNode]);

  if (loading && tree.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <SimpleTreeView
      expandedItems={expanded}
      selectedItems={currentPath}
      onExpandedItemsChange={(event, itemIds) => {
        if (event) handleToggle(event, itemIds);
      }}
      onSelectedItemsChange={(event, itemId) => {
        if (event && itemId) handleSelect(event, itemId as string);
      }}
      sx={{ flexGrow: 1, overflowY: "auto" }}
      slots={{
        collapseIcon: ExpandMoreIcon,
        expandIcon: ChevronRightIcon,
      }}
    >
      {renderTree(tree)}
    </SimpleTreeView>
  );
}
