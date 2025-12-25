# eval - 评估 Agent

`aigne eval` 命令用于使用数据集评估 Agent 的性能，支持自定义评估器和并发执行。

## 命令格式

```bash
aigne eval [path] [agent] --dataset <file> [options]
```

## 参数说明

### 位置参数

- **`[path]`**（可选）：Agent 目录路径或项目 URL
  - 默认值：`.`（当前目录）
  
- **`[agent]`**（可选）：要评估的 Agent 名称

### 必需选项

- **`--dataset <file>`**：数据集文件路径
  - 支持 JSON、CSV 等格式
  - 包含评估用的输入和期望输出

### 可选选项

- **`--evaluator <name>`**：评估器 Agent 名称
  - 使用自定义 Agent 进行评估
  - 如果未指定，使用默认的 LLM 评估器
  
- **`--concurrency <number>`**：并发级别
  - 默认值：`1`
  - 控制同时评估的样本数量
  
- **`--output <file>`, `-o`**：输出文件路径
  - 将评估结果保存到文件
  - 支持 CSV 格式

## 使用示例

### 基本用法

评估当前目录的 Agent：

```bash
aigne eval --dataset test-data.json
```

### 指定 Agent

评估特定的 Agent：

```bash
aigne eval . chatbot --dataset qa-dataset.json
```

### 使用自定义评估器

使用自定义的评估器 Agent：

```bash
aigne eval --agent chatbot --dataset dataset.json --evaluator my-evaluator
```

### 并发执行

提高评估速度，使用并发执行：

```bash
aigne eval --dataset large-dataset.json --concurrency 5
```

### 保存结果

将评估结果保存到 CSV 文件：

```bash
aigne eval --dataset dataset.json --output results.csv
```

### 组合使用

```bash
aigne eval ./my-agent chatbot \
  --dataset benchmark.json \
  --evaluator quality-checker \
  --concurrency 3 \
  --output evaluation-results.csv
```

## 数据集格式

### JSON 格式

```json
[
  {
    "input": "What is AIGNE?",
    "expected": "AIGNE is an AI agent framework"
  },
  {
    "input": "How to install AIGNE CLI?",
    "expected": "Use npm install -g @aigne/cli"
  }
]
```

### CSV 格式

```csv
input,expected
"What is AIGNE?","AIGNE is an AI agent framework"
"How to install AIGNE CLI?","Use npm install -g @aigne/cli"
```

字段说明：
- **input**：发送给 Agent 的输入文本
- **expected**：期望的输出或参考答案
- 可以包含其他自定义字段

## 评估流程

<!-- afs:image id="img-006" key="eval-command-flow" desc="Evaluation command workflow: load dataset → run agent on each sample → evaluate responses → generate report → save results" -->

`aigne eval` 命令的执行流程：

1. **加载数据集**：从文件读取评估数据
2. **初始化 Agent**：准备要评估的 Agent
3. **初始化评估器**：准备评估器（LLM 或自定义）
4. **运行评估**：
   - 对每个样本运行 Agent
   - 使用评估器评估响应质量
   - 并发处理（如果设置）
5. **生成报告**：汇总评估结果
6. **保存结果**：输出到控制台或文件

## 评估器

### 默认 LLM 评估器

使用 LLM 自动评估响应质量：

- 比较 Agent 响应与期望输出
- 评估准确性、相关性、完整性
- 给出评分和反馈

### 自定义评估器

创建自定义评估器 Agent：

```yaml
# aigne.yaml
agents:
  - name: my-evaluator
    model: openai:gpt-4o
    description: 自定义评估器
    instructions: |
      你是一个评估助手。比较实际响应和期望输出，评分 0-100。
      输出格式：{"score": 85, "feedback": "..."}
```

使用自定义评估器：

```bash
aigne eval --dataset data.json --evaluator my-evaluator
```

## 评估指标

### 输出指标

评估完成后，会显示以下指标：

- **总样本数**：数据集中的样本数量
- **平均分数**：所有样本的平均评分
- **通过率**：达到阈值的样本比例
- **错误数**：评估过程中的错误数量
- **总时间**：评估耗时

### 控制台输出示例

```
Evaluation Results
==================
Total Samples: 10
Average Score: 87.5
Pass Rate: 90% (9/10)
Failed: 1
Total Time: 45.2s

Details:
✓ Sample 1: 95 (Excellent response)
✓ Sample 2: 88 (Good coverage)
✗ Sample 3: 45 (Missing key information)
...
```

## 并发控制

### 并发策略

使用 `--concurrency` 选项控制并发级别：

```bash
# 串行执行（默认）
aigne eval --dataset data.json --concurrency 1

# 3 个样本并发
aigne eval --dataset data.json --concurrency 3

# 10 个样本并发（适用于大数据集）
aigne eval --dataset data.json --concurrency 10
```

### 并发注意事项

1. **API 限流**：注意模型提供商的 API 调用限制
2. **成本控制**：并发可能增加 API 调用成本
3. **内存使用**：高并发可能占用更多内存
4. **最佳并发数**：通常设置为 3-5 即可获得较好的性能提升

## 结果输出

### CSV 格式输出

使用 `--output` 保存详细结果到 CSV 文件：

```csv
input,expected,actual,score,feedback,time_ms
"What is AIGNE?","AIGNE is a framework","AIGNE is an AI agent framework",95,"Accurate and complete",1234
"How to install?","npm install","Use npm install -g @aigne/cli",88,"Good but could be more concise",987
```

CSV 文件包含：
- **input**：输入文本
- **expected**：期望输出
- **actual**：实际响应
- **score**：评分
- **feedback**：评估反馈
- **time_ms**：响应时间（毫秒）

### 分析结果

可以使用 Excel、Python、R 等工具分析 CSV 结果：

```python
import pandas as pd

# 读取结果
df = pd.read_csv('results.csv')

# 计算统计信息
print(f"Average Score: {df['score'].mean()}")
print(f"Median Time: {df['time_ms'].median()}ms")
print(f"Pass Rate: {(df['score'] >= 80).sum() / len(df) * 100}%")
```

## 评估场景

### 质量回归测试

在更新 Agent 后验证性能：

```bash
# 评估基线版本
aigne eval --dataset benchmark.json --output baseline.csv

# 更新 Agent 配置或提示词

# 再次评估
aigne eval --dataset benchmark.json --output updated.csv

# 比较结果
```

### 多个 Agent 对比

评估不同 Agent 的性能：

```bash
# 评估 Agent A
aigne eval --agent agent-a --dataset data.json --output agent-a.csv

# 评估 Agent B
aigne eval --agent agent-b --dataset data.json --output agent-b.csv

# 比较结果
```

### 性能基准测试

使用大数据集评估性能：

```bash
aigne eval \
  --dataset large-benchmark.json \
  --concurrency 5 \
  --output benchmark-results.csv
```

## 最佳实践

### 1. 准备高质量数据集

- **多样性**：包含各种类型的输入
- **代表性**：覆盖实际使用场景
- **平衡性**：简单和复杂样本的平衡
- **准确性**：期望输出应该准确和一致

### 2. 选择合适的评估器

- **默认评估器**：适用于一般场景
- **自定义评估器**：需要特定评估标准时使用
- **人工评估**：高风险场景建议人工复核

### 3. 合理使用并发

- 从小并发开始（2-3）
- 监控 API 限流情况
- 根据实际情况调整

### 4. 持续评估

- 定期评估 Agent 性能
- 维护版本化的数据集
- 跟踪性能趋势

## 常见问题

### 数据集格式错误

**问题**：无法加载数据集

**解决方案**：
- 检查文件格式（JSON 或 CSV）
- 验证必需字段（input、expected）
- 确认文件路径正确

### 评估速度慢

**问题**：评估耗时过长

**解决方案**：
- 使用 `--concurrency` 提高并发
- 使用更快的模型
- 减小数据集大小（用于快速测试）

### 评分不准确

**问题**：评估器给出的分数不合理

**解决方案**：
- 创建自定义评估器，明确评分标准
- 调整评估器的系统提示词
- 使用人工抽查验证评估质量

### API 调用限流

**问题**：因 API 限流导致评估失败

**解决方案**：
- 降低并发级别
- 使用 API 密钥的付费计划
- 分批次进行评估

## 导航

### 父主题

- [命令参考](../commands.md) - 返回命令列表

### 相关主题

- [run 命令](./run.md) - 手动测试 Agent
- [test 命令](./test.md) - 运行单元测试
- [observe 命令](./observe.md) - 监控评估过程

### 下一步

- [observe 命令](./observe.md) - 查看评估详情
- [配置说明](../configuration.md) - 配置评估环境
