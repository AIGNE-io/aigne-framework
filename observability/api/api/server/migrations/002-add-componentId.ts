export default {
  hash: "202507070000-add-componentId",
  sql: [
    `ALTER TABLE Trace ADD COLUMN componentId TEXT;`,
    "CREATE INDEX IF NOT EXISTS idx_trace_componentId ON Trace(componentId) WHERE componentId IS NOT NULL;",
  ],
};
