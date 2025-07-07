export default {
  hash: "202507071830-add-action",
  sql: [
    `ALTER TABLE Trace ADD COLUMN action INTEGER;`,
    "CREATE INDEX IF NOT EXISTS idx_trace_action ON Trace(action) WHERE action IS NOT NULL;",
  ],
};
