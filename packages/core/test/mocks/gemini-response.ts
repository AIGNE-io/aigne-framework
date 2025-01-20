export const geminiTextResponse = [
  {
    candidates: [
      {
        content: {
          parts: [
            {
              text: "你好",
            },
          ],
          role: "model",
        },
      },
    ],
    usageMetadata: {
      promptTokenCount: 10,
      totalTokenCount: 10,
    },
    modelVersion: "gemini-1.5-pro-002",
  },
  {
    candidates: [
      {
        content: {
          parts: [
            {
              text: "，世界。",
            },
          ],
          role: "model",
        },
        finishReason: "STOP",
      },
    ],
    usageMetadata: {
      promptTokenCount: 10,
      candidatesTokenCount: 5,
      totalTokenCount: 15,
    },
    modelVersion: "gemini-1.5-pro-002",
  },
];

export const geminiJsonResponse = [
  {
    candidates: [
      {
        content: {
          parts: [
            {
              functionCall: {
                name: "get_weather",
                args: {
                  location: "San Francisco",
                },
              },
            },
          ],
          role: "model",
        },
        finishReason: "STOP",
      },
    ],
    usageMetadata: {
      promptTokenCount: 69,
      candidatesTokenCount: 6,
      totalTokenCount: 75,
    },
    modelVersion: "gemini-1.5-pro-002",
  },
];
