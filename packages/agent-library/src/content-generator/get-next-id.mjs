export default function getNextId() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return {
    nextId: result,
  };
}

getNextId.output_schema = {
  type: "object",
  properties: {
    nextId: {
      type: "string",
    },
  },
};

getNextId.description = "获取一个随机且唯一的 id";
