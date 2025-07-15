export default {
  hash: "001-init",
  sql: [
    `\
CREATE TABLE "Memories" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "createdAt" DATETIME NOT NULL,
  "updatedAt" DATETIME NOT NULL,
  "sessionId" TEXT,
  "content" JSON NOT NULL
)
`,
    `\
CREATE VIRTUAL TABLE "Memories_fts" USING fts5(
  id UNINDEXED,
  content
)
`,
  ],
};
