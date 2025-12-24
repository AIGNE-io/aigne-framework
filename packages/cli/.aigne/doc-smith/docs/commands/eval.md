# eval - 性能评估

> **前置条件**:
> - [命令参考](../commands.md) - 了解所有可用命令
> - [test](./test.md) - 了解如何测试 agent

## 概述

`eval` 命令用于评估 AIGNE agent 的性能和准确性。通过运行预定义的测试数据集，系统化地评估 agent 的响应质量、准确率和其他关键指标。

## 语法

```bash
aigne eval [path] [agent] [options]
```

## 参数

### path

- **类型**: 字符串（可选）
- **默认值**: `.` (当前目录)
- **描述**: agents 目录的路径或 AIGNE 项目的 URL

### agent

- **类型**: 字符串（必需）
- **描述**: 要评估的 agent 名称

### dataset

- **类型**: 字符串（必需）
- **描述**: 数据集文件的路径

支持的格式：
- CSV
- JSON
- JSONL

### evaluator

- **类型**: 字符串（可选）
- **描述**: 用于评估的 evaluator 名称

可以使用另一个 agent 作为评估器，对响应质量进行评判。

### output, -o

- **类型**: 字符串（可选）
- **描述**: 评估结果输出文件路径

如指定，结果将保存为 CSV 文件。

### concurrency

- **类型**: 数字
- **默认值**: `1`
- **描述**: 并发执行的评估任务数量

提高并发可以加速评估，但会增加 API 调用成本。

## 使用示例

### 基本用法

#### 评估 agent

```bash
aigne eval myAgent --dataset test-data.csv
```

#### 指定项目路径

```bash
aigne eval --path path/to/agents myAgent --dataset data.csv
```

#### 保存评估结果

```bash
aigne eval myAgent --dataset data.csv --output results.csv
```

### 高级用法

#### 使用自定义评估器

```bash
aigne eval myAgent --dataset data.csv --evaluator judgeAgent
```

#### 并发评估

```bash
aigne eval myAgent --dataset data.csv --concurrency 5
```

同时运行 5 个评估任务，加速评估过程。

#### 组合所有选项

```bash
aigne eval \
  --path ./agents \
  myAgent \
  --dataset eval-data.jsonl \
  --evaluator qualityJudge \
  --concurrency 3 \
  --output evaluation-results.csv
```

## 数据集格式

### CSV 格式

```csv
input,expected_output,metadata
"What is 2+2?","4","{\"category\": \"math\"}"
"What is the capital of France?","Paris","{\"category\": \"geography\"}"
```

必需字段：
- `input`: 输入消息
- `expected_output`: 期望的输出（可选，用于自动评估）

### JSON 格式

```json
[
  {
    "input": "What is 2+2?",
    "expected_output": "4",
    "metadata": {
      "category": "math"
    }
  },
  {
    "input": "What is the capital of France?",
    "expected_output": "Paris",
    "metadata": {
      "category": "geography"
    }
  }
]
```

### JSONL 格式

```jsonl
{"input": "What is 2+2?", "expected_output": "4"}
{"input": "What is the capital of France?", "expected_output": "Paris"}
```

## 评估流程

### 1. 数据加载

从指定的数据集文件加载测试用例。

### 2. Agent 运行

对每个测试用例运行目标 agent，记录：
- 实际输出
- 响应时间
- Token 使用量
- 错误信息（如有）

### 3. 评估

使用评估器（LLM 或规则）对响应进行评分：
- 准确性
- 相关性
- 完整性
- 格式正确性

### 4. 报告生成

生成评估报告，包括：
- 总体统计
- 各项指标
- 失败案例
- 性能分析

## 评估指标

### 默认指标

- **准确率 (Accuracy)**: 正确响应的比例
- **响应时间 (Response Time)**: 平均响应时间
- **成本 (Cost)**: API 调用总成本
- **成功率 (Success Rate)**: 成功执行的比例

### 自定义评估器

使用 LLM 作为评估器时，可以评估：
- 响应质量
- 语言流畅度
- 逻辑一致性
- 创造性

## 输出示例

### 控制台输出

```bash
$ aigne eval myAgent --dataset test-data.csv

Running evaluation...
Progress: 10/50 (20%)
Progress: 25/50 (50%)
Progress: 50/50 (100%)

Evaluation Results:
==================
Total Cases:     50
Successful:      47 (94%)
Failed:          3 (6%)
Avg Response:    1.2s
Total Cost:      $0.45

Accuracy:        94%
Precision:       0.92
Recall:          0.95
F1 Score:        0.93
```

### CSV 输出

生成的 CSV 文件包含：

```csv
input,expected_output,actual_output,score,response_time_ms,tokens_used,cost,success
"What is 2+2?","4","4",1.0,1234,50,0.001,true
"Capital of France?","Paris","Paris, the capital city of France",0.9,1456,75,0.0015,true
```

## 使用评估器 Agent

### 创建评估器

```yaml
# evaluator.yml
name: qualityJudge
description: Evaluate response quality
model: openai:gpt-4
prompt: |
  You are an expert evaluator. Given an input, expected output, and actual output,
  rate the quality of the actual output on a scale of 0-1.

  Input: {{input}}
  Expected: {{expected_output}}
  Actual: {{actual_output}}

  Provide a score between 0 and 1.
```

### 使用评估器

```bash
aigne eval myAgent --dataset data.csv --evaluator qualityJudge
```

## 性能优化

### 并发控制

```bash
# 低并发（更稳定）
aigne eval myAgent --dataset data.csv --concurrency 1

# 高并发（更快）
aigne eval myAgent --dataset data.csv --concurrency 10
```

注意事项：
- 高并发会增加 API 请求速率
- 可能触发速率限制
- 成本会同时产生

### 批处理

对于大型数据集，考虑分批评估：

```bash
# 评估前 100 条
aigne eval myAgent --dataset data.csv --limit 100

# 评估 100-200 条
aigne eval myAgent --dataset data.csv --offset 100 --limit 100
```

## 分析评估结果

### 查看失败案例

```bash
# 筛选失败的案例
grep "false" evaluation-results.csv

# 或使用专门的分析工具
aigne analyze --results evaluation-results.csv --show-failures
```

### 统计分析

```python
import pandas as pd

# 读取结果
df = pd.read_csv('evaluation-results.csv')

# 计算统计信息
print(f"Average Score: {df['score'].mean()}")
print(f"Success Rate: {df['success'].sum() / len(df)}")
print(f"Total Cost: ${df['cost'].sum():.2f}")
```

## 最佳实践

### 1. 创建多样化的测试集

包含不同类型的输入：
- 常见场景
- 边界情况
- 错误输入
- 复杂查询

### 2. 使用版本控制

跟踪评估结果的变化：

```bash
# 保存带时间戳的结果
aigne eval myAgent --dataset data.csv \
  --output results-$(date +%Y%m%d).csv
```

### 3. 定期评估

在 CI/CD 中集成评估：

```yaml
# .github/workflows/eval.yml
name: Evaluate

on:
  schedule:
    - cron: '0 0 * * *'  # 每天运行

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: aigne eval myAgent --dataset data.csv
```

### 4. 设置基准

建立性能基准，跟踪改进：

```bash
# 第一次评估（设置基准）
aigne eval myAgent --dataset data.csv --output baseline.csv

# 后续评估（与基准比较）
aigne eval myAgent --dataset data.csv --output current.csv
diff baseline.csv current.csv
```

## 常见问题

### 数据集文件未找到

```
Error: Dataset file does not exist
```

解决方法：
1. 检查文件路径是否正确
2. 确认文件存在
3. 使用绝对路径

### Agent 未找到

```
Error: Entry agent does not exist
```

解决方法：
1. 确认 agent 名称正确
2. 检查项目路径
3. 验证 agent 配置文件

### 评估器加载失败

```
Error: Evaluator agent not found
```

解决方法：
1. 确认评估器 agent 存在
2. 检查评估器配置
3. 尝试不使用评估器运行

## 技术细节

### 源码位置

实现文件：`src/commands/eval.ts:27`

关键组件：
- `FileDataset` - 数据集加载器
- `DefaultRunnerWithConcurrency` - 并发运行器
- `LLMEvaluator` - LLM 评估器
- `ConsoleReporter` / `CsvReporter` - 报告生成器

### 评估管道

```typescript
await runEvaluationPipeline({
  dataset,        // 测试数据
  runner,         // Agent 运行器
  evaluators,     // 评估器列表
  reporters,      // 报告器列表
  options: { concurrency }
});
```

## 下一步

评估完成后，可以：

1. [observe](./observe.md) - 深入分析运行数据
2. [deploy](./deploy.md) - 部署性能良好的 agent
3. [test](./test.md) - 针对问题编写更多测试

## 相关命令

- [test](./test.md) - 功能测试
- [run](./run.md) - 交互式测试
- [observe](./observe.md) - 性能监控

## 参考

- [命令参考](../commands.md) - 返回命令列表
- [基本工作流程](../workflow.md#6-性能评估) - 评估在开发流程中的位置
- [配置](../configuration.md) - 评估相关配置
