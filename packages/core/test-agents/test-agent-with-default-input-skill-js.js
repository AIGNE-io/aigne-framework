export default function testAgentWithDefaultInputSkillJS() {
  return {};
}

testAgentWithDefaultInputSkillJS.input_schema = {
  type: "object",
  properties: {
    title: {
      type: "string",
    },
    description: {
      type: "string",
    },
  },
  required: ["title", "description"],
};
