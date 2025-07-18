import { flatten } from "flat";

export default flatten({
  agentName: "Agent 名称",
  input: "输入",
  output: "输出",
  status: "状态",
  startedAt: "开始时间",
  endedAt: "结束时间",
  latency: "执行时间",
  noData: "暂无数据",
  loading: "加载中...",
  success: "成功",
  failed: "失败",
  errorMessage: "错误信息",
  inputTokens: "输入 Tokens",
  outputTokens: "输出 Tokens",
  totalTokens: "总 Tokens",
  tokens: "Tokens",
  count: "次数",
  timestamp: "时间",
  duration: "执行时间",
  dashboardTitle: "AIGNE 数据分析",
  dashboardDescription: "Web 界面来管理您的 AIGNE Agent",
  traces: "Trace 列表",
  metadata: "Metadata",
  startTime: "开始时间",
  endTime: "结束时间",
  model: "模型",
  agentTag: "Agent 类型",
  liveUpdatesOn: "实时更新开启",
  liveUpdatesOff: "实时更新关闭",
  copied: "已复制",
  thisWeek: "本周",
  lastWeek: "上周",
  last7Days: "最近 7 天",
  thisMonth: "本月",
  lastMonth: "上个月",
  thisYear: "今年",
  lastYear: "去年",
  userContext: "用户信息",
  memories: "记忆",
  models: {
    details: "模型详情",
    mode: "模式",
    maxInputTokens: "最大输入 Tokens",
    maxOutputTokens: "最大输出 Tokens",
    maxTokens: "最大 Tokens",
    inputCostPerToken: "输入每个 Token 成本",
    outputCostPerToken: "输出每个 Token 成本",
    provider: "提供商",
    supports: "支持",
    functionCalling: "Function Calling",
    toolChoice: "Tool Choice",
  },
  search: "搜索",
  pending: "进行中",
  component: "组件",
  selectComponent: "选择组件",
  clear: "清除",
  noOptions: "无选项",
  user: "用户信息",
  common: {
    confirm: "确定",
    cancel: "取消",
  },
  delete: {
    restConfirmTitle: "删除 Trace",
    restConfirmDesc: "确定要删除所有 Trace 吗？",
  },
});
