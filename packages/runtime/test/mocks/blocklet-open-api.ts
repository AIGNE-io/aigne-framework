export const BlockletOpenAPIResponse = {
  openapi: "3.1.0",
  info: {
    title: "Local Development",
    description: "Local Development",
    version: "1.0.0",
  },
  tags: [
    {
      name: "Discuss Kit",
      description:
        "Discuss Kit offers highly customizable and combinable components for everything you need to decentralize communication.",
    },
    {
      name: "Search Kit",
      description: "A blazingly fast search solution for blocklets",
    },
  ],
  paths: {
    "/api/v1/sdk/posts": {
      get: {
        summary: "List posts",
        "x-summary-zh": "获取帖子列表",
        deprecated: false,
        description: "List posts",
        "x-description-zh": "获取帖子列表",
        tags: ["Discuss Kit"],
        parameters: [
          {
            name: "type",
            in: "query",
            description: "The type of the posts",
            required: false,
            example: "blog",
            schema: {
              type: "string",
              enum: ["discussion", "blog", "doc"],
              "x-apifox": {
                enumDescriptions: {
                  discussion: "discussions",
                  blog: "blog posts",
                  doc: "documentation",
                },
              },
              default: "blog",
            },
          },
          {
            name: "locale",
            in: "query",
            description: "The locale of the posts",
            required: false,
            example: "en",
            schema: {
              type: "string",
              default: "en",
              examples: ["en", "zh"],
            },
          },
          {
            name: "page",
            in: "query",
            description: "The page number",
            required: false,
            example: 1,
            schema: {
              type: "integer",
            },
          },
          {
            name: "size",
            in: "query",
            description: "The number of posts per page",
            required: false,
            example: 20,
            schema: {
              type: "integer",
            },
          },
          {
            name: "sort",
            in: "query",
            description: "The sort order of the posts",
            required: false,
            example: "-createdAt",
            schema: {
              type: "string",
              enum: ["createdAt", "-createdAt"],
              "x-apifox": {
                enumDescriptions: {
                  createdAt: "",
                  "-createdAt": "",
                },
              },
              default: "-createdAt",
            },
          },
          {
            name: "labels",
            in: "query",
            description: "The labels of the posts",
            required: false,
            example: ["did"],
            schema: {
              type: "array",
              items: {
                type: "string",
              },
              nullable: true,
            },
          },
        ],
        responses: {
          "200": {
            description: "成功",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {},
                      },
                    },
                    meta: {
                      type: "object",
                      properties: {
                        total: {
                          type: "integer",
                        },
                      },
                      required: ["total"],
                    },
                  },
                  required: ["data", "meta"],
                },
              },
            },
          },
        },
        security: [],
        "x-id": "z8iZmkm7LkbPqB6WD8FZGBft2BJLusokLg4ne",
        "x-did": "z8ia1WEiBZ7hxURf6LwH21Wpg99vophFwSJdu",
        "x-path": "/api/v1/sdk/posts",
        "x-method": "get",
      },
    },
    "/api/v1/sdk/posts/{id}": {
      get: {
        summary: "Get a post",
        "x-summary-zh": "获取帖子信息",
        deprecated: false,
        description: "Get a specific post",
        "x-description-zh": "获取指定帖子信息",
        tags: ["Discuss Kit"],
        parameters: [
          {
            name: "id",
            in: "path",
            description: "The id or slug of the post",
            required: true,
            example: "15bcb4e7-8bd9-4759-b60b-ae826534057a",
            schema: {
              type: "string",
            },
          },
          {
            name: "locale",
            in: "query",
            description: "The locale of the post",
            required: false,
            example: "en",
            schema: {
              type: "string",
              default: "en",
              examples: ["en", "zh"],
            },
          },
          {
            name: "stripFormatting",
            in: "query",
            description: "Whether to strip the formatting of the post content",
            required: false,
            example: "false",
            schema: {
              type: "boolean",
            },
          },
        ],
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {},
                },
              },
            },
            headers: {},
          },
        },
        security: [],
        "x-id": "z8iZtpsBN1MFQJrconhQMHPouYvoMJBF3CfkQ",
        "x-did": "z8ia1WEiBZ7hxURf6LwH21Wpg99vophFwSJdu",
        "x-path": "/api/v1/sdk/posts/{id}",
        "x-method": "get",
      },
    },
    "/api/call/blog/publish": {
      post: {
        summary: "Publish Blog Post",
        "x-summary-zh": "发布博客文章",
        description: "Publish Blog Post",
        tags: ["Discuss Kit"],
        parameters: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["translations"],
                properties: {
                  translations: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["title", "content", "locale"],
                      properties: {
                        title: {
                          type: "string",
                        },
                        content: {
                          type: "string",
                        },
                        locale: {
                          type: "string",
                        },
                      },
                    },
                    minItems: 1,
                  },
                  publishTime: {
                    type: "string",
                  },
                  boardId: {
                    type: "string",
                    default: "blog-default",
                  },
                  cover: {
                    type: "string",
                  },
                  labels: {
                    type: "string",
                  },
                  needReview: {
                    type: "boolean",
                    default: false,
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                    },
                    slug: {
                      type: "string",
                    },
                  },
                  required: ["id", "slug"],
                },
              },
            },
          },
        },
        security: [],
        "x-id": "z8ia3QmhQ5kGYtJBFM3jbrsaRafHf5HXU7JAs",
        "x-did": "z8ia1WEiBZ7hxURf6LwH21Wpg99vophFwSJdu",
        "x-path": "/api/call/blog/publish",
        "x-method": "post",
      },
    },
  },
};

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
