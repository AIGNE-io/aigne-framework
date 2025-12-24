# 使用场景

本节提供常见使用场景的完整示例和最佳实践。

## 场景 1：快速原型开发

快速创建和测试新的代理想法。

### 步骤

```bash
# 1. 创建项目
aigne create chatbot-prototype
cd chatbot-prototype

# 2. 运行代理测试
aigne run

# 3. 根据反馈调整
# 编辑 aigne.yaml 修改 system_prompt 等配置

# 4. 重新测试
aigne run
```

### 技巧

- 使用详细日志观察代理行为：`aigne run --verbose`
- 快速切换不同模型：`aigne run --model openai:gpt-4o-mini`
- 使用环境变量避免重复输入配置

## 场景 2：本地开发调试

在本地环境开发和调试代理功能。

### 完整工作流

```bash
# 开发环境设置
export OPENAI_API_KEY=sk-xxx
export LOG_LEVEL=debug

# 启动可观察性服务（终端 1）
aigne observe

# 运行代理（终端 2）
aigne run --verbose

# 查看实时日志和性能数据
open http://localhost:7890
```

### 调试技巧

```bash
# 使用不同日志级别
aigne run --log-level debug    # 详细日志
aigne run --log-level info     # 一般信息
aigne run --log-level warn     # 仅警告

# 使用测试数据集
aigne eval . myAgent --dataset test-cases.json
```

## 场景 3：远程代理运行

从 URL 直接运行托管的代理，无需本地克隆。

### 示例

```bash
# 从 GitHub 运行
aigne run https://github.com/user/agent-repo/archive/main.tar.gz

# 从私有服务器运行
aigne run https://my-server.com/agents/customer-support.tar.gz

# 缓存位置
ls ~/.aigne/github.com/user/agent-repo/
```

### 适用场景

- 快速测试开源代理
- 运行团队共享的代理
- CI/CD 环境中使用固定版本

## 场景 4：团队协作开发

多人团队协同开发代理应用。

### 项目结构

```
team-agent/
├── .env.example        # 环境变量模板
├── aigne.yaml          # 主配置
├── agents/
│   ├── customer-support.yaml
│   ├── data-analyst.yaml
│   └── code-reviewer.yaml
├── shared/
│   └── tools.js        # 共享工具
└── test/
    └── agents.test.js  # 测试
```

### 工作流

```bash
# 开发者 A：负责客户支持代理
git checkout -b feature/customer-support
# 编辑 agents/customer-support.yaml
aigne run customer-support
aigne test

# 开发者 B：负责数据分析代理
git checkout -b feature/data-analyst
# 编辑 agents/data-analyst.yaml
aigne run data-analyst
aigne eval . data-analyst --dataset test-data.json

# 合并前测试所有代理
aigne test
```

### 最佳实践

```yaml
# .env.example - 提供环境变量模板
OPENAI_API_KEY=your-key-here
MODEL=openai:gpt-4o-mini
LOG_LEVEL=info
```

```bash
# 使用 Git 钩子自动测试
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
aigne test || exit 1
EOF
chmod +x .git/hooks/pre-commit
```

## 场景 5：MCP 服务集成

将代理作为 MCP 服务暴露给其他应用使用。

### 部署 MCP 服务

```bash
# 开发环境
aigne serve-mcp --port 3000

# 生产环境（使用 PM2）
pm2 start aigne --name mcp-server -- serve-mcp --host 0.0.0.0 --port 3000
pm2 save
```

### 客户端集成

```javascript
// client.js
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

const transport = new SSEClientTransport(
  new URL('http://localhost:3000/mcp')
);

const client = new Client(
  { name: 'my-app', version: '1.0.0' },
  { capabilities: {} }
);

await client.connect(transport);

// 调用代理
const result = await client.callTool({
  name: 'myAgent',
  arguments: { input: 'Hello' }
});

console.log(result);
```

### 反向代理配置

```nginx
# nginx.conf
server {
    listen 80;
    server_name api.example.com;

    location /mcp {
        proxy_pass http://localhost:3000/mcp;
        proxy_http_version 1.1;
        proxy_buffering off;
    }
}
```

## 场景 6：生产环境部署

将代理部署到生产环境并持续运行。

### Blocklet 部署

```bash
# 部署到 Blocklet Server
aigne deploy --path ./agent --endpoint https://prod-server.com

# 查看部署状态
blocklet status my-agent

# 查看日志
blocklet logs my-agent
```

### Docker 部署

```dockerfile
# Dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install -g @aigne/cli
EXPOSE 3000

CMD ["aigne", "serve-mcp", "--host", "0.0.0.0"]
```

```bash
# 构建镜像
docker build -t my-agent:1.0.0 .

# 运行容器
docker run -d \
  --name my-agent \
  -p 3000:3000 \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  my-agent:1.0.0

# 查看日志
docker logs -f my-agent
```

### Kubernetes 部署

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aigne-agent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: aigne-agent
  template:
    metadata:
      labels:
        app: aigne-agent
    spec:
      containers:
      - name: agent
        image: my-agent:1.0.0
        ports:
        - containerPort: 3000
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: agent-secrets
              key: openai-api-key
---
apiVersion: v1
kind: Service
metadata:
  name: aigne-agent-service
spec:
  selector:
    app: aigne-agent
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

## 场景 7：持续集成/部署

在 CI/CD 管道中自动测试和部署代理。

### GitHub Actions

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g @aigne/cli
      
      # 运行测试
      - run: aigne test
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      
      # 评估性能
      - run: |
          aigne eval . myAgent \
            --dataset test-data.json \
            --output results.csv
      
      - uses: actions/upload-artifact@v3
        with:
          name: evaluation-results
          path: results.csv

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install -g @aigne/cli @blocklet/cli
      - run: |
          aigne deploy \
            --path . \
            --endpoint ${{ secrets.DEPLOY_ENDPOINT }}
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - test
  - evaluate
  - deploy

test:
  stage: test
  image: node:18
  script:
    - npm install -g @aigne/cli
    - aigne test
  variables:
    OPENAI_API_KEY: $OPENAI_API_KEY

evaluate:
  stage: evaluate
  image: node:18
  script:
    - npm install -g @aigne/cli
    - aigne eval . myAgent --dataset test-data.json --output results.csv
  artifacts:
    paths:
      - results.csv

deploy:
  stage: deploy
  image: node:18
  only:
    - main
  script:
    - npm install -g @aigne/cli @blocklet/cli
    - aigne deploy --path . --endpoint $DEPLOY_ENDPOINT
```

## 场景 8：性能监控和优化

监控代理性能并进行优化。

### 设置监控

```bash
# 启动可观察性服务器
aigne observe --port 7890

# 在生产环境持久化运行
pm2 start aigne --name observe -- observe --host 0.0.0.0

# 配置数据保留策略
cat > cleanup.sh << 'EOF'
#!/bin/bash
sqlite3 ~/.aigne/observability.db \
  "DELETE FROM executions WHERE timestamp < datetime('now', '-30 days')"
sqlite3 ~/.aigne/observability.db "VACUUM"
EOF

chmod +x cleanup.sh
crontab -e
# 添加：0 2 * * * /path/to/cleanup.sh
```

### 性能分析

```bash
# 使用评估工具进行性能基准测试
aigne eval . myAgent \
  --dataset benchmark.json \
  --concurrency 10 \
  --output baseline.csv

# 优化后对比
aigne eval . myAgent-optimized \
  --dataset benchmark.json \
  --concurrency 10 \
  --output optimized.csv

# 分析差异
python analyze_performance.py baseline.csv optimized.csv
```

## 场景 9：多模型对比

比较不同 AI 模型的表现。

### 评估脚本

```bash
#!/bin/bash
# compare_models.sh

MODELS=(
  "openai:gpt-4o-mini"
  "openai:gpt-4"
  "anthropic:claude-3-5-sonnet-20241022"
)

for model in "${MODELS[@]}"; do
  echo "Evaluating $model..."
  aigne eval . myAgent \
    --dataset test-data.json \
    --model "$model" \
    --output "results-${model//:/}-}.csv"
done

echo "All evaluations complete!"
```

### 结果分析

```python
# analyze.py
import pandas as pd
import matplotlib.pyplot as plt

models = ['gpt-4o-mini', 'gpt-4', 'claude-3-5-sonnet']
results = []

for model in models:
    df = pd.read_csv(f'results-{model}.csv')
    results.append({
        'model': model,
        'avg_score': df['score'].mean(),
        'avg_time': df['response_time'].mean(),
        'success_rate': (df['score'] > 80).mean()
    })

df_results = pd.DataFrame(results)
print(df_results)

# 可视化
df_results.plot(x='model', y=['avg_score', 'success_rate'], kind='bar')
plt.savefig('model_comparison.png')
```

## 场景 10：使用 AIGNE Hub

利用 AIGNE Hub 进行团队协作和资源管理。

### 连接到 Hub

```bash
# 连接到官方 Hub
aigne hub connect

# 查看状态
aigne hub status

# 查看积分余额
aigne hub status | grep Available
```

### 使用 Hub 模型

```bash
# 使用 Hub 提供的模型运行代理
aigne run --model openai:gpt-4 --aigne-hub-url https://hub.aigne.io

# 在配置文件中指定
# aigne.yaml
model: openai:gpt-4
aigneHubUrl: https://hub.aigne.io
```

### 团队管理

```bash
# 切换到团队 Hub
aigne hub connect https://team-hub.company.com
aigne hub use

# 使用团队共享资源
aigne run --model openai:gpt-4

# 查看团队积分使用情况
aigne hub status
```

## 最佳实践总结

### 开发阶段

1. 使用 `--verbose` 详细日志
2. 启动 `observe` 监控性能
3. 编写测试用例
4. 使用 `.env` 文件管理配置

### 测试阶段

1. 运行 `aigne test` 单元测试
2. 使用 `aigne eval` 评估性能
3. 多模型对比测试
4. 压力测试和边界测试

### 部署阶段

1. 使用环境变量存储敏感信息
2. 配置健康检查和监控
3. 实施自动化部署
4. 准备回滚方案

### 运维阶段

1. 持续监控性能指标
2. 定期备份数据
3. 更新依赖和安全补丁
4. 收集用户反馈优化

---

**相关文档：**
- [命令参考](/commands.md) - 所有命令详细说明
- [配置和环境](/configuration.md) - 环境配置选项
- [常见问题](/faq.md) - 故障排查指南
