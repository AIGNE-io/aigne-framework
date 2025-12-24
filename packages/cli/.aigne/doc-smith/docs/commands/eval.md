# eval - 评估代理

`eval` 命令用于评估 AIGNE 代理的性能和质量，通过数据集和评估器进行自动化测试。

## 语法

```bash
aigne eval [path] [agent] --dataset <dataset-file> [options]
```

## 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `path` | string | 否 | 代理目录路径 |
| `agent` | string | 是 | 要评估的代理名称 |
| `dataset` | string | 是 | 数据集文件路径 |

## 选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `--evaluator` | string | - | 评估器代理名称 |
| `--concurrency` | number | `1` | 并发执行数量 |
| `--output`, `-o` | string | - | 结果输出文件路径（CSV 格式） |

## 使用方式

### 基本用法

```bash
aigne eval . myAgent --dataset ./test-data.json
```

### 指定评估器

```bash
aigne eval . myAgent \
  --dataset ./test-data.json \
  --evaluator evaluatorAgent
```

### 设置并发数

```bash
aigne eval . myAgent \
  --dataset ./test-data.json \
  --concurrency 5
```

### 导出结果

```bash
aigne eval . myAgent \
  --dataset ./test-data.json \
  --output ./results.csv
```

## 数据集格式

数据集文件应为 JSON 或 JSONL 格式，包含测试用例：

### JSON 格式

```json
[
  {
    "input": "你好",
    "expected": "你好！我能帮你什么吗？"
  },
  {
    "input": "今天天气怎么样？",
    "expected": "抱歉，我无法获取实时天气信息。"
  }
]
```

### JSONL 格式

```jsonl
{"input": "你好", "expected": "你好！我能帮你什么吗？"}
{"input": "今天天气怎么样？", "expected": "抱歉，我无法获取实时天气信息。"}
```

### 复杂数据集

```json
[
  {
    "input": "计算 2 + 2",
    "expected": "4",
    "metadata": {
      "category": "math",
      "difficulty": "easy"
    }
  },
  {
    "input": "解释量子计算",
    "expected": "量子计算利用量子力学原理...",
    "metadata": {
      "category": "science",
      "difficulty": "hard"
    }
  }
]
```

## 评估指标

`eval` 命令会计算以下指标：

### 自动指标

- **成功率**：成功执行的测试用例比例
- **平均响应时间**：代理响应的平均时间
- **Token 使用**：总 Token 消耗

### LLM 评估指标

如果指定评估器，还会计算：

- **准确性**：回答是否正确
- **相关性**：回答是否与问题相关
- **完整性**：回答是否完整
- **质量评分**：综合质量分数（0-100）

## 评估器代理

评估器是一个特殊的代理，用于判断代理输出的质量。

### 创建评估器

```yaml
# evaluator.yaml
name: evaluator
model: openai:gpt-4
system_prompt: |
  你是一个评估助手，负责评估代理的回答质量。
  请根据以下标准评分（0-100）：
  1. 准确性：回答是否正确
  2. 相关性：回答是否相关
  3. 完整性：回答是否完整
  
  输出格式：
  {
    "score": 85,
    "accuracy": 90,
    "relevance": 85,
    "completeness": 80,
    "feedback": "回答准确但略显简短"
  }
```

## 示例

### 示例 1：基本评估

```bash
# 创建数据集
cat > test-data.json << 'EOF'
[
  {"input": "你好", "expected": "你好！"},
  {"input": "再见", "expected": "再见！"}
]
EOF

# 运行评估
aigne eval . chatAgent --dataset test-data.json
```

输出：

```
Evaluating chatAgent...
Progress: [====================] 100% | 2/2

Results:
  Success Rate: 100%
  Avg Response Time: 1.2s
  Total Token Usage: 150
```

### 示例 2：使用评估器

```bash
aigne eval . chatAgent \
  --dataset test-data.json \
  --evaluator qualityChecker
```

输出包含质量分数：

```
Evaluating chatAgent with qualityChecker...
Progress: [====================] 100% | 10/10

Results:
  Success Rate: 100%
  Avg Response Time: 1.5s
  Avg Quality Score: 85.5
  Token Usage: 1,200
```

### 示例 3：并发评估

```bash
# 并发 10 个请求
aigne eval . chatAgent \
  --dataset large-dataset.json \
  --concurrency 10
```

### 示例 4：导出详细结果

```bash
aigne eval . chatAgent \
  --dataset test-data.json \
  --evaluator qualityChecker \
  --output results.csv

# 查看结果
cat results.csv
```

CSV 输出示例：

```csv
input,output,expected,score,accuracy,relevance,completeness,response_time
"你好","你好！有什么可以帮助你的？","你好！",95,100,95,90,1.2
"再见","再见！祝你有美好的一天！","再见！",90,95,90,85,1.1
```

## 评估最佳实践

### 1. 构建高质量数据集

```json
[
  {
    "input": "解释什么是机器学习",
    "expected": "机器学习是人工智能的一个分支...",
    "metadata": {
      "category": "definition",
      "source": "教科书",
      "difficulty": "medium"
    }
  }
]
```

### 2. 使用分层数据集

按难度或类别组织测试用例：

```bash
# 评估简单问题
aigne eval . agent --dataset easy-questions.json

# 评估中等难度
aigne eval . agent --dataset medium-questions.json

# 评估困难问题
aigne eval . agent --dataset hard-questions.json
```

### 3. 持续评估

在 CI/CD 中集成评估：

```yaml
# .github/workflows/eval.yml
name: Evaluate Agent

on: [push]

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install -g @aigne/cli
      - run: |
          aigne eval . agent \
            --dataset test-data.json \
            --output results.csv
      - uses: actions/upload-artifact@v3
        with:
          name: evaluation-results
          path: results.csv
```

### 4. 基准测试

建立性能基准：

```bash
# 基准评估
aigne eval . agent \
  --dataset benchmark.json \
  --output baseline.csv

# 后续对比
aigne eval . agent-v2 \
  --dataset benchmark.json \
  --output v2-results.csv

# 对比结果
diff baseline.csv v2-results.csv
```

## 评估器模式

### 简单评估器

基于规则的评估：

```yaml
name: simple-evaluator
system_prompt: |
  判断输出是否包含预期内容。
  如果包含，返回 score: 100，否则返回 score: 0。
```

### 详细评估器

多维度评估：

```yaml
name: detailed-evaluator
model: openai:gpt-4
system_prompt: |
  从以下维度评估（各0-100分）：
  1. 准确性：事实是否正确
  2. 完整性：信息是否完整
  3. 清晰度：表达是否清晰
  4. 专业性：用语是否专业
  
  返回 JSON 格式评分和详细反馈。
```

### 对比评估器

比较多个输出：

```yaml
name: comparison-evaluator
system_prompt: |
  比较代理输出和预期输出，找出差异。
  评估输出是否：
  - 传达了相同的意思
  - 使用了恰当的语气
  - 提供了额外价值
```

## 性能优化

### 并发控制

根据 API 限制调整并发数：

```bash
# OpenAI 限制较高
aigne eval . agent --dataset data.json --concurrency 10

# 自托管模型可以更高
aigne eval . agent --dataset data.json --concurrency 50
```

### 批处理

对大数据集分批评估：

```bash
# 分割数据集
split -l 100 large-dataset.json batch-

# 分批评估
for batch in batch-*; do
  aigne eval . agent --dataset "$batch" --output "results-$batch.csv"
done

# 合并结果
cat results-*.csv > final-results.csv
```

## 常见问题

### Q: 如何创建好的测试数据集？

A: 
1. 覆盖常见使用场景
2. 包含边界情况
3. 测试错误处理
4. 保持真实性

### Q: 评估器需要特殊配置吗？

A: 评估器是普通代理，但应该：
1. 使用更强大的模型（如 GPT-4）
2. 提供清晰的评分标准
3. 返回结构化输出

### Q: 如何解读评估结果？

A: 关注：
- 成功率趋势
- 响应时间稳定性
- 质量分数分布
- 错误类型模式

## 下一步

- 查看 [test 命令](/commands/test.md) 了解单元测试
- 查看 [observe 命令](/commands/observe.md) 了解运行监控
- 阅读 AIGNE Framework 文档了解代理优化

---

**相关命令：**
- [run](/commands/run.md) - 运行代理
- [test](/commands/test.md) - 单元测试
- [observe](/commands/observe.md) - 监控运行
