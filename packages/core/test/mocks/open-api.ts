export const openAPITestInputs = {
  id: {
    type: "string",
    required: true,
    in: "path",
  },
  message: {
    type: "string",
    required: true,
    in: "query",
  },
  message1: {
    type: "string",
    required: true,
    in: "cookie",
  },
  message2: {
    type: "string",
    required: true,
    in: "header",
  },
} as const;

export const openAPITestOutputs = {
  url: {
    type: "string",
    required: true,
  },
  method: {
    type: "string",
    required: true,
  },
  query: {
    type: "object",
    required: true,
  },
  headers: {
    type: "object",
    required: true,
  },
  cookies: {
    type: "object",
    required: true,
  },
  body: {
    type: "object",
    required: true,
  },
} as const;
