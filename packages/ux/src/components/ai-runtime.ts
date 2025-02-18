import { BuiltinModulesGlobalVariableName } from "@blocklet/pages-kit/types/builtin";
import * as aiRuntime from "../ai-runtime";

// 使用最新的 ai-runtime package 替换 pages-kit，已支持 @blocklet/ai-runtime/front 中新增的 api
(globalThis as any)[BuiltinModulesGlobalVariableName].modules[
  "@blocklet/pages-kit/builtin/async/ai-runtime"
] = aiRuntime;

export * from "../ai-runtime";
