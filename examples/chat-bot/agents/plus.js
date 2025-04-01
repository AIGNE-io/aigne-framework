export default function plus({ a, b }) {
  return {
    sum: a + b,
  };
}

plus.description = "This agent calculates the sum of two numbers.";

plus.input_schema = {
  type: "object",
  properties: {
    a: { type: "number", description: "First number" },
    b: { type: "number", description: "Second number" },
  },
  required: ["a", "b"],
};

plus.output_schema = {
  type: "object",
  properties: {
    sum: { type: "number", description: "Sum of the two numbers" },
  },
  required: ["sum"],
};
