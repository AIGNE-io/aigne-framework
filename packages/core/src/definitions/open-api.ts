import type { DataType } from "./data-type";
import type { DataTypeSchema } from "./data-type-schema";

export interface BaseAuthConfig {
  type: "bearer" | "basic";

  token: string;

  in?: "header" | "query" | "cookie";

  /**
   * The key to use for the token. Default `Authorization` in header and `token` in query and cookie.
   */
  key?: string;
}

export interface CustomAuthConfig {
  type: "custom";
  auth: () => Promise<AuthResult> | AuthResult;
}

export type AuthConfig = BaseAuthConfig | CustomAuthConfig;

export type AuthType = AuthConfig["type"];

export type AuthResult = Pick<FetchRequest, "headers" | "query" | "cookies">;

type HTTPMethodLowercase =
  | "get"
  | "post"
  | "put"
  | "delete"
  | "patch"
  | "head"
  | "options";

export type HTTPMethod =
  | Uppercase<HTTPMethodLowercase>
  | Lowercase<HTTPMethodLowercase>;

export type ParameterLocation = "path" | "query" | "body" | "header" | "cookie";

export type OpenAPIDataType = DataType & { in?: ParameterLocation };

export type OpenAPIDataTypeSchema = DataTypeSchema & { in?: ParameterLocation };

export type FetchRequest = {
  url: string;

  method: HTTPMethod;

  query?: Record<string, string | number | boolean>;

  headers?: Record<string, string>;

  cookies?: Record<string, string>;

  body?: Record<string, any>;
};
