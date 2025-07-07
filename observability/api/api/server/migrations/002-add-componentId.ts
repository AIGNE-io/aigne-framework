export default {
  hash: "20250707-add-componentId",
  sql: [
    `ALTER TABLE Trace ADD COLUMN componentId TEXT;`,
    "CREATE INDEX IF NOT EXISTS idx_trace_componentId ON Trace(componentId) WHERE componentId IS NOT NULL;",
  ],
};
