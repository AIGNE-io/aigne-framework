import type {
  ParameterObject,
  RequestBodyObject,
  ResponsesObject,
} from "openapi3-ts/oas31";

export * from "openapi3-ts/oas31";

export interface PathItemObject {
  path: string;
  method: string;
  summary?: string;
  description?: string;
  parameters?: ParameterObject[];
  requestBody?: RequestBodyObject;
  responses?: ResponsesObject;
}

export interface DatasetObject extends PathItemObject {
  id: string;
  type: string;
  url?: string;
  name?: string;
  did?: string;
  // 添加索引签名以支持x-summary-和x-description-等自定义字段
  [key: `x-summary-${string}`]: string | undefined;
  [key: `x-description-${string}`]: string | undefined;
}
