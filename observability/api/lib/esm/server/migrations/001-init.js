export default {
    hash: "20250608-init-trace",
    sql: [
        `CREATE TABLE IF NOT EXISTS Trace (
      id TEXT PRIMARY KEY NOT NULL,
      rootId TEXT,
      parentId TEXT,
      name TEXT,
      startTime INTEGER NOT NULL,
      endTime INTEGER NOT NULL,
      status TEXT NOT NULL,
      attributes TEXT NOT NULL,
      links TEXT,
      events TEXT,
      userId TEXT,
      sessionId TEXT
    );`,
        "CREATE INDEX IF NOT EXISTS idx_trace_rootId ON Trace (rootId);",
        "CREATE INDEX IF NOT EXISTS idx_trace_parentId ON Trace (parentId);",
    ],
};
