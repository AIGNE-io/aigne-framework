export default {
  hash: "001-init",
  sql: [
    `\
CREATE TABLE "Histories" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "createdAt" DATETIME NOT NULL,
  "updatedAt" DATETIME NOT NULL,
  "path" TEXT,
  "userId" TEXT,
  "sessionId" TEXT,
  "summary" TEXT,
  "metadata" JSON,
  "linkTo" TEXT,
  "content" JSON 
)
`,
  ],
};
