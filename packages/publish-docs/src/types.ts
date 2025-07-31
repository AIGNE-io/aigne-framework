export interface PublishResult {
  success: boolean;
  docs?: unknown[];
  boardId?: string;
  docsUrl?: string;
  error?: string;
}
