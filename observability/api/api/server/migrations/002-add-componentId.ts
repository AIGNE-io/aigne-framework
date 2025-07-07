export default {
  hash: "20250706-add-componentId",
  sql: [`ALTER TABLE Trace ADD COLUMN componentId TEXT DEFAULT NULL;`],
};
