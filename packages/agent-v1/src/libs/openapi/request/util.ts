import type { DatasetObject, RequestBodyObject } from "../types";
import convertSchemaToObject from "../util/convert-schema";

export const getRequestConfig = (
  pathItem: DatasetObject,
  requestData: { [key: string]: any },
  options?: { params: { [key: string]: any }; data: { [key: string]: any } },
) => {
  let url = pathItem.path || "";
  const config: {
    url: string;
    method: string;
    headers: { [key: string]: any };
    params: { [key: string]: any };
    data: { [key: string]: any };
    body: { [key: string]: any };
    cookies: { [key: string]: any };
  } = {
    method: pathItem.method,
    url,
    headers: {},
    params: options?.params || {},
    data: options?.data || {},
    cookies: {},
    body: {},
  };

  const data = { ...requestData };
  const requestBodyData = { ...data };

  for (const parameter of pathItem.parameters || []) {
    if (Object.prototype.hasOwnProperty.call(data, parameter.name)) {
      const value = data[parameter.name];
      switch (parameter.in) {
        case "path":
          url = url.replace(`{${parameter.name}}`, encodeURIComponent(value));
          break;
        case "query":
          config.params[parameter.name] = value;
          break;
        case "header":
          config.headers[parameter.name] = value;
          break;
        case "cookie":
          config.cookies[parameter.name] = value;
          break;
        default:
          throw new Error("Unsupported parameter type");
      }

      delete requestBodyData[parameter.name];
    }
  }

  if (
    ["POST", "PUT", "PATCH"].includes(pathItem.method.toUpperCase()) &&
    pathItem.requestBody
  ) {
    config.headers["Content-Type"] = getContentType(pathItem.requestBody);
    config.data = getRequestBody(pathItem.requestBody, requestBodyData || {});
  }

  config.url = url;
  config.body = requestBodyData;
  return config;
};

function getContentType(requestBody: RequestBodyObject): string {
  if (requestBody?.content) {
    const [firstMediaType] = Object.keys(requestBody.content);
    return firstMediaType || "application/json";
  }

  return "application/json";
}

function getRequestBody(
  requestBody: RequestBodyObject,
  requestBodyData: { [key: string]: any },
): any {
  if (requestBody?.content) {
    const contentType = getContentType(requestBody);
    const mediaTypeObject = requestBody.content[contentType];

    if (mediaTypeObject?.schema) {
      switch (contentType) {
        case "application/json":
          return JSON.stringify(requestBodyData);
        case "application/x-www-form-urlencoded":
          return serializeFormEncoded(requestBodyData);
        case "multipart/form-data": {
          // eslint-disable-next-line no-case-declarations
          const formData = new FormData();
          Object.keys(requestBodyData).forEach((key) => {
            const value = requestBodyData[key];
            if (Array.isArray(value)) {
              value.forEach((item, index) =>
                formData.append(`${key}[${index}]`, item),
              );
            } else if (typeof value === "object" && value !== null) {
              Object.keys(value).forEach((subKey) => {
                formData.append(`${key}[${subKey}]`, value[subKey]);
              });
            } else {
              formData.append(key, value);
            }
          });
          return formData;
        }
        default:
          throw new Error(`Unsupported content type: ${contentType}`);
      }
    }
  }

  return requestBodyData;
}

function serializeFormEncoded(data: any) {
  return Object.keys(data)
    .map((key) => {
      const value = data[key];
      if (typeof value === "object" && value !== null) {
        return serializeNestedObject(key, value);
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join("&");
}

function serializeNestedObject(parentKey: string, obj: any): string {
  return Object.keys(obj)
    .map((key) => {
      const value = obj[key];
      const fullKey = `${parentKey}[${key}]`;
      if (typeof value === "object" && value !== null) {
        return serializeNestedObject(fullKey, value);
      }
      return `${encodeURIComponent(fullKey)}=${encodeURIComponent(value)}`;
    })
    .join("&");
}

export function extractRequestBodyParameters(
  requestBody?: RequestBodyObject,
): { name: string; value: any; description?: string }[] {
  if (!requestBody || !requestBody.content) {
    return [];
  }

  const contentType = getContentType(requestBody);
  const mediaTypeObject = requestBody.content[contentType];

  if (!mediaTypeObject || !mediaTypeObject.schema) {
    console.warn(`No schema available for content type: ${contentType}`);
    return [];
  }

  const { schema } = mediaTypeObject;
  const schemaObject = convertSchemaToObject(schema);
  return (
    Object.entries(schemaObject).map(([key, value]: [string, any]) => ({
      name: key,
      ...value,
    })) || []
  );
}

export function getAllParameters(
  dataset: DatasetObject,
): { name: string; description?: string; type?: string }[] {
  const requestBody = extractRequestBodyParameters(dataset?.requestBody);
  const datasetParameters = [
    ...(dataset?.parameters ?? []).map((i) => ({
      ...i,
      type: (i.schema as { type: string })?.type,
    })),
    ...(requestBody ?? []),
  ];
  return datasetParameters;
}

export function getRequiredFields(dataset: DatasetObject) {
  const parameterFields =
    dataset.parameters
      ?.filter((param) => param.required)
      .map((param) => param.name) || [];

  const requestBodyFields = Object.values(
    dataset.requestBody?.content || {},
  ).flatMap((mediaObject) => (mediaObject.schema as any)?.required || []);

  return [...new Set([...parameterFields, ...requestBodyFields])];
}
