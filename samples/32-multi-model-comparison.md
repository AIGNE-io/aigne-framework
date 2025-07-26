# Multi-Model AI Comparison

Compare responses from different AI providers to find the best model for your use case.

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { AnthropicChatModel } from "@aigne/anthropic";
import { GeminiChatModel } from "@aigne/gemini";
import { DeepSeekChatModel } from "@aigne/deepseek";

// Setup different AI providers
const models = {
  openai: new AIGNE({ model: new OpenAIChatModel({ model: "gpt-4o" }) }),
  anthropic: new AIGNE({ model: new AnthropicChatModel({ model: "claude-3-5-sonnet-20241022" }) }),
  gemini: new AIGNE({ model: new GeminiChatModel({ model: "gemini-1.5-pro" }) }),
  deepseek: new AIGNE({ model: new DeepSeekChatModel({ model: "deepseek-chat" }) }),
};

const testAgent = AIAgent.from({
  instructions: "Solve this coding problem step by step",
  inputKey: "problem",
});

async function compareModels(problem: string) {
  console.log("🔬 Comparing AI models for:", problem);
  console.log("=" .repeat(50));

  const results = {};

  for (const [provider, aigne] of Object.entries(models)) {
    console.log(`\n🤖 Testing ${provider.toUpperCase()}...`);

    const startTime = Date.now();

    try {
      const result = await aigne.invoke(testAgent, { problem });
      const duration = Date.now() - startTime;

      results[provider] = {
        success: true,
        response: result.problem,
        duration,
        length: result.problem.length,
      };

      console.log(`✅ ${provider}: ${duration}ms (${result.problem.length} chars)`);

    } catch (error) {
      results[provider] = {
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
      };

      console.log(`❌ ${provider}: Failed - ${error.message}`);
    }
  }

  // Analysis
  console.log("\n📊 COMPARISON RESULTS:");
  console.log("=" .repeat(50));

  const successful = Object.entries(results).filter(([_, r]) => r.success);

  if (successful.length > 0) {
    const fastest = successful.reduce((a, b) => a[1].duration < b[1].duration ? a : b);
    const longest = successful.reduce((a, b) => a[1].length > b[1].length ? a : b);

    console.log(`🏆 Fastest: ${fastest[0]} (${fastest[1].duration}ms)`);
    console.log(`📝 Most detailed: ${longest[0]} (${longest[1].length} chars)`);
  }

  return results;
}

// Test with different types of problems
const codingProblem = "Write a function to find the longest palindromic substring in a string";
const mathProblem = "Explain the mathematical concept behind neural network backpropagation";

await compareModels(codingProblem);
await compareModels(mathProblem);
```

## Twitter Post #1

🏆 AI model showdown with AIGNE!

Compare providers side-by-side:
🥊 OpenAI vs Anthropic vs Gemini ⚡ Speed & quality metrics 💰 Cost-effectiveness analysis 📊 Automatic benchmarking

Find the perfect model for your use case with data-driven decisions!

#AIGNE #ArcBlock #MultiModel

## Twitter Post #2

This example shows multi-model comparison:

• Test multiple AI providers simultaneously
• Compare speed, quality, and cost metrics
• Automatic benchmarking and analysis
• Data-driven model selection

Find your perfect AI model! 🏆

## Twitter Post #3

📖 https://www.arcblock.io/docs/aigne-framework

#AIGNE #ArcBlock #MultiModel
