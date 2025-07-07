export default {
  hash: "20250707-add-action",
  sql: [`ALTER TABLE Trace ADD COLUMN action INTEGER DEFAULT NULL;`],
};
