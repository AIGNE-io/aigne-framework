export default function getCurrentTime() {
  return {
    currentTime: new Date().toISOString(),
  };
}

getCurrentTime.output_schema = {
  type: "object",
  properties: {
    currentTime: {
      type: "string",
    },
  },
};

getCurrentTime.description = "获取当前时间";
