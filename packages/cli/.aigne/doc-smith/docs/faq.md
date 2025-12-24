# 常见问题

本节收集了 `@aigne/cli` 使用过程中的常见问题和解决方案。

## 安装和设置

### Q: 安装后找不到 aigne 命令

A: 检查全局安装路径是否在 PATH 中：

```bash
# 查看安装位置
npm list -g @aigne/cli

# 查看 PATH
echo $PATH

# 如果需要，添加到 PATH
export PATH="$PATH:$(npm prefix -g)/bin"
```

### Q: 安装失败，提示权限错误

A: 使用管理员权限或配置 npm 使用用户目录：

```bash
# 方法 1：使用 sudo（不推荐）
sudo npm install -g @aigne/cli

# 方法 2：配置 npm 前缀（推荐）
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install -g @aigne/cli
```

### Q: 如何更新到最新版本？

A: 使用 npm 更新：

```bash
# 更新到最新版本
npm update -g @aigne/cli

# 或重新安装
npm install -g @aigne/cli@latest

# 验证版本
aigne --version
```

## API 配置

### Q: "API key is required" 错误

A: 确保已设置 API 密钥：

```bash
# 临时设置
export OPENAI_API_KEY=sk-xxx
aigne run

# 永久设置（添加到 ~/.bashrc 或 ~/.zshrc）
echo 'export OPENAI_API_KEY=sk-xxx' >> ~/.bashrc
source ~/.bashrc

# 或使用 .env 文件
echo 'OPENAI_API_KEY=sk-xxx' > .env
aigne run
```

### Q: 如何使用自定义 API 端点？

A: 设置 API URL 环境变量：

```bash
# OpenAI 兼容端点
export OPENAI_API_URL=https://your-api.example.com/v1
export OPENAI_API_KEY=your-key
aigne run
```

### Q: 如何切换不同的模型？

A: 使用 `--model` 选项或环境变量：

```bash
# 命令行指定
aigne run --model openai:gpt-4

# 环境变量
export MODEL=anthropic:claude-3-5-sonnet-20241022
aigne run

# 配置文件
# aigne.yaml
model: openai:gpt-4o-mini
```

## 运行问题

### Q: 代理启动失败，提示 "Entry file not found"

A: 确保项目根目录包含 `aigne.yaml`：

```bash
# 检查文件是否存在
ls -la aigne.yaml

# 如果不存在，创建一个基本的配置
cat > aigne.yaml << 'EOF'
name: my-agent
agents:
  - name: chatAgent
    systemPrompt: "你是一个友好的助手。"
EOF
```

### Q: 运行时提示 "Agent not found"

A: 检查代理名称是否正确：

```bash
# 查看项目中的所有代理
cat aigne.yaml | grep "name:"

# 指定正确的代理名称
aigne run correct-agent-name
```

### Q: 代理响应很慢

A: 可能的原因和解决方案：

1. **网络问题**：检查网络连接和代理设置
2. **模型选择**：某些模型响应较慢，尝试切换模型
3. **并发限制**：检查 API 提供商的速率限制
4. **日志级别**：降低日志级别提高性能

```bash
# 使用更快的模型
aigne run --model openai:gpt-4o-mini

# 降低日志级别
aigne run --log-level error
```

### Q: 如何调试代理行为？

A: 使用详细日志和可观察性工具：

```bash
# 启用详细日志
aigne run --verbose

# 启动可观察性服务器
aigne observe

# 在另一个终端运行代理
aigne run

# 在浏览器查看详细信息
open http://localhost:7890
```

## 部署问题

### Q: deploy 命令失败，提示 "Blocklet CLI not found"

A: 安装 Blocklet CLI：

```bash
npm install -g @blocklet/cli

# 验证安装
blocklet --version
```

### Q: MCP 服务器无法访问

A: 检查以下几点：

```bash
# 1. 检查服务是否运行
ps aux | grep aigne

# 2. 检查端口是否被占用
lsof -i :3000

# 3. 检查防火墙设置
# macOS
sudo pfctl -s rules

# Linux
sudo iptables -L

# 4. 尝试其他端口
aigne serve-mcp --port 8080
```

### Q: 如何在后台运行 MCP 服务器？

A: 使用进程管理工具：

```bash
# 使用 PM2
npm install -g pm2
pm2 start aigne --name mcp-server -- serve-mcp
pm2 save
pm2 startup

# 使用 nohup
nohup aigne serve-mcp > server.log 2>&1 &

# 使用 screen
screen -S mcp-server
aigne serve-mcp
# 按 Ctrl+A 然后 D 分离会话
```

## 测试和评估

### Q: test 命令没有输出

A: 确保存在测试文件：

```bash
# 检查测试文件
ls test/*.test.js

# 如果没有，创建测试文件
mkdir -p test
cat > test/example.test.js << 'EOF'
import { test } from 'node:test';
import assert from 'node:assert';

test('示例测试', () => {
  assert.strictEqual(1 + 1, 2);
});
EOF

# 运行测试
aigne test
```

### Q: eval 命令提示 "Dataset file does not exist"

A: 检查数据集文件路径：

```bash
# 使用绝对路径
aigne eval . myAgent --dataset /absolute/path/to/data.json

# 或相对于当前目录的路径
aigne eval . myAgent --dataset ./test-data.json
```

### Q: 评估结果不准确

A: 改进评估设置：

```bash
# 1. 使用更强大的评估器
aigne eval . agent \
  --dataset data.json \
  --evaluator qualityChecker

# 2. 增加测试样本
# 扩展 data.json，添加更多测试用例

# 3. 多次运行取平均值
for i in {1..5}; do
  aigne eval . agent --dataset data.json --output "run-$i.csv"
done
```

## 性能和优化

### Q: 如何提高代理响应速度？

A: 优化策略：

```bash
# 1. 使用更快的模型
aigne run --model openai:gpt-4o-mini

# 2. 调整温度参数
# aigne.yaml
temperature: 0.1  # 降低随机性，提高速度

# 3. 启用并行工具调用
parallelToolCalls: true

# 4. 使用缓存（如果支持）
# 实施响应缓存机制
```

### Q: 如何减少 Token 消耗？

A: 优化 Token 使用：

```yaml
# aigne.yaml
systemPrompt: |
  简洁地回答问题。  # 缩短系统提示

maxTokens: 500  # 限制最大输出长度
```

```bash
# 监控 Token 使用
aigne observe
open http://localhost:7890
```

### Q: 内存占用过高

A: 优化内存使用：

```bash
# 1. 限制并发数
aigne eval . agent --dataset data.json --concurrency 5

# 2. 清理可观察性数据
sqlite3 ~/.aigne/observability.db "DELETE FROM executions WHERE timestamp < datetime('now', '-7 days')"
sqlite3 ~/.aigne/observability.db "VACUUM"

# 3. 使用 Node.js 内存限制
node --max-old-space-size=4096 $(which aigne) run
```

## Hub 和网络

### Q: 无法连接到 AIGNE Hub

A: 检查网络和认证：

```bash
# 1. 检查网络连接
curl https://hub.aigne.io

# 2. 重新认证
aigne hub remove
aigne hub connect

# 3. 检查代理设置
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=http://proxy.example.com:8080
aigne hub connect
```

### Q: Hub 积分不足

A: 充值或优化使用：

```bash
# 查看积分余额
aigne hub status

# 在输出中找到充值链接
# Payment: https://hub.aigne.io/payment

# 或优化模型使用
aigne run --model openai:gpt-4o-mini  # 使用更经济的模型
```

### Q: 网络请求失败

A: 配置代理和重试：

```bash
# 设置 HTTP 代理
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=http://proxy.example.com:8080
export NO_PROXY=localhost,127.0.0.1

# 或在代码中配置代理
# aigne.yaml
httpProxy: http://proxy.example.com:8080
```

## 数据和隐私

### Q: 如何清理本地数据？

A: 清理缓存和数据库：

```bash
# 清理缓存的远程代理
rm -rf ~/.aigne/

# 保留配置，只清理数据
rm -rf ~/.aigne/observability.db
rm -rf ~/.aigne/*/  # 缓存的项目
```

### Q: 数据是否会被发送到云端？

A: 数据发送情况：

1. **API 请求**：代理输入/输出会发送到 AI 模型提供商
2. **Hub 集成**：使用 Hub 时，使用数据会发送到 Hub 服务
3. **本地数据**：可观察性数据存储在本地 SQLite 数据库

隐私保护：

```bash
# 禁用可观察性
export AIGNE_OBSERVABILITY_ENABLED=false

# 使用自托管模型
export OPENAI_API_URL=https://your-private-llm.com/v1

# 不使用 Hub
# 不运行 aigne hub connect
```

### Q: 如何备份配置和数据？

A: 备份关键文件：

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR=~/aigne-backup-$(date +%Y%m%d)
mkdir -p $BACKUP_DIR

# 备份配置
cp -r ~/.aigne $BACKUP_DIR/

# 备份项目
cp -r /path/to/your/project $BACKUP_DIR/

# 创建压缩包
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR

echo "Backup created: $BACKUP_DIR.tar.gz"
```

## 其他问题

### Q: 命令自动补全如何配置？

A: 配置 shell 自动补全：

```bash
# Bash
aigne --completion bash >> ~/.bashrc
source ~/.bashrc

# Zsh
aigne --completion zsh >> ~/.zshrc
source ~/.zshrc

# Fish
aigne --completion fish > ~/.config/fish/completions/aigne.fish
```

### Q: 如何报告 Bug？

A: 报告 Bug 的步骤：

1. 收集信息：
   ```bash
   aigne --version
   node --version
   npm --version
   ```

2. 重现问题：
   ```bash
   aigne run --verbose 2>&1 | tee error.log
   ```

3. 在 GitHub 提交 Issue：
   - 访问 https://github.com/AIGNE-io/aigne-framework/issues
   - 描述问题、版本信息和错误日志
   - 如果可能，提供最小可重现示例

### Q: 如何贡献代码？

A: 贡献流程：

1. Fork 仓库
2. 克隆到本地
3. 创建分支
4. 提交修改
5. 运行测试
6. 提交 Pull Request

详见：https://github.com/AIGNE-io/aigne-framework/blob/main/CONTRIBUTING.md

## 获取帮助

如果问题未能解决：

1. **查看文档**：https://www.aigne.io/cli
2. **GitHub Issues**：https://github.com/AIGNE-io/aigne-framework/issues
3. **社区讨论**：https://github.com/AIGNE-io/aigne-framework/discussions
4. **联系支持**：support@aigne.io

---

**相关文档：**
- [快速开始](/getting-started.md) - 安装和基本使用
- [配置和环境](/configuration.md) - 详细配置指南
- [命令参考](/commands.md) - 所有命令详解
