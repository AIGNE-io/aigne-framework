export default {
  hash: "20250608-init-trace",
  sql: [
    `CREATE TABLE IF NOT EXISTS Trace (
      id TEXT PRIMARY KEY,
      rootId TEXT,
      parentId TEXT,
      name TEXT,
      status TEXT,
      startedAt INTEGER,
      endedAt INTEGER,
      latency INTEGER,
      input TEXT,
      output TEXT,
      error TEXT,
      userId TEXT,
      sessionId TEXT,
      metadata TEXT
    );`,
    "CREATE INDEX idx_trace_rootId ON Trace (rootId);",
    "CREATE INDEX idx_trace_parentId ON Trace (parentId);",
  ],
};
