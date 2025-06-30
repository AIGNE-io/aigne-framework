export default function getNextId() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const idSet = new Set();
  while (idSet.size < 20) {
    let result = "";
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    idSet.add(result);
  }
  return {
    nextIds: Array.from(idSet),
  };
}

getNextId.output_schema = {
  type: "object",
  properties: {
    nextIds: {
      type: "array",
      items: { type: "string" },
    },
  },
};

getNextId.description = "获取二十个随机且唯一的 id";
