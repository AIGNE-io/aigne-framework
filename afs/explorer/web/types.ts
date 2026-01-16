export interface AFSEntry {
  id: string;
  path: string;
  name: string;
  type: "file" | "directory";
  content?: any;
  size?: number;
  mimeType?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
}

export interface AFSModule {
  name: string;
  path: string;
  description?: string;
  accessMode?: "readonly" | "readwrite";
}

export interface AFSListResult {
  data: AFSEntry[];
  message?: string;
}

export interface AFSReadResult {
  data?: AFSEntry;
  message?: string;
}

export interface AFSSearchResult {
  data: AFSEntry[];
  message?: string;
}
