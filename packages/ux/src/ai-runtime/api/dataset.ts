import { joinURL, withQuery } from "ufo";

import { AI_STUDIO_DID } from "../constants";
import { request } from "./request";

export interface Knowledge {
  id: string;
  name?: string;
  description?: string;
}

export async function getKnowledge({
  datasetId: knowledgeId,
}: { datasetId: string }): Promise<Knowledge> {
  const url = joinURL("/api/datasets/", knowledgeId);
  const result = await request<Knowledge>({ blocklet: AI_STUDIO_DID, url });
  if (!result) throw new Error("Collection not found!");

  return result;
}

export async function getKnowledgeList({
  projectId,
}: { projectId: string }): Promise<Array<Knowledge>> {
  const url = withQuery("/api/datasets", { projectId });
  return request({ blocklet: AI_STUDIO_DID, url });
}

export async function createKnowledge({
  projectId,
  name,
  description,
}: {
  projectId: string;
  name: string;
  description?: string;
}) {
  return request({
    blocklet: AI_STUDIO_DID,
    method: "POST",
    url: "/api/datasets",
    body: { projectId, name, description },
  });
}

export async function updateKnowledge(
  knowledgeId: string,
  input: Pick<Knowledge, "name" | "description">,
): Promise<Knowledge> {
  return request({
    blocklet: AI_STUDIO_DID,
    method: "PUT",
    url: joinURL("/api/datasets", knowledgeId),
    body: input,
  });
}

export async function deleteKnowledge(knowledgeId: string): Promise<void> {
  const url = joinURL("/api/datasets", knowledgeId);
  return request({ blocklet: AI_STUDIO_DID, method: "DELETE", url });
}

export interface Document {
  id: string;
  name?: string;
}

export async function deleteDocument(knowledgeId: string, documentId: string): Promise<void> {
  return request({
    blocklet: AI_STUDIO_DID,
    method: "DELETE",
    url: joinURL("/api/datasets", knowledgeId, "documents", documentId),
  });
}

export async function getDocuments(
  knowledgeId: string,
): Promise<{ items: Array<Document>; total: number }> {
  return request({
    blocklet: AI_STUDIO_DID,
    url: joinURL("/api/datasets", knowledgeId, "documents"),
  });
}

export async function getDocument(
  knowledgeId: string,
  documentId: string,
): Promise<{ document: Document }> {
  const result = await request<{ document: Document }>({
    blocklet: AI_STUDIO_DID,
    url: joinURL("/api/datasets", knowledgeId, "documents", documentId),
  });
  if (!result?.document) throw new Error("Document not found!");

  return result;
}

export async function createDocument(
  knowledgeId: string,
  type: "text" | "file",
  input: { name: string; content: string } | File,
) {
  if (type === "file") return createDocumentFile(knowledgeId, input as File);

  return request({
    blocklet: AI_STUDIO_DID,
    method: "POST",
    url: joinURL("/api/datasets", knowledgeId, "documents", type),
    body: input,
  });
}

export async function createDocumentFile(knowledgeId: string, file: File) {
  const form = new FormData();
  form.append("data", file);
  form.append("type", "file");
  form.append("filename", file.name);

  return request({
    blocklet: AI_STUDIO_DID,
    method: "POST",
    url: joinURL("/api/datasets", knowledgeId, "documents/file"),
    body: form,
  });
}

export async function updateDocument(
  knowledgeId: string,
  documentId: string,
  type: "text",
  input: { name: string; content: string },
) {
  return request({
    blocklet: AI_STUDIO_DID,
    method: "PUT",
    url: joinURL("/api/datasets", knowledgeId, "documents", documentId, type),
    body: input,
  });
}
