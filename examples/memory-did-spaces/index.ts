import { DIDSpacesMemory } from "@aigne/agent-library/did-spaces-memory/index.js";
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel as Model } from "@aigne/openai";
import dotenv from "dotenv-flow";
import { writeFileSync } from "fs";

dotenv.config({ silent: true });

const aigne = new AIGNE({
  model: new Model({
    apiKey: process.env.OPENAI_API_KEY!,
    model: "gpt-4o-mini",
  }),
});

const agent = AIAgent.from({
  instructions: `You are a crypto analyst with memory. Give brief answers only.

- Remember user details
- Answer in 20 words or less
- Show facts only, no explanations`,
  memory: new DIDSpacesMemory({
    url: process.env.DID_SPACES_URL!,
    auth: {
      authorization: process.env.DID_SPACES_AUTHORIZATION!,
    },
  }),
  inputKey: "message",
});

// Test DID Spaces Memory functionality
const result1 = await aigne.invoke(agent, {
  message: `I'm John, doctor, like Bitcoin`,
});
console.log(result1.message);

const result2 = await aigne.invoke(agent, {
  message: `My favorite crypto?`,
});
console.log(result2.message);

const result3 = await aigne.invoke(agent, {
  message: `What is my work?`,
});
console.log(result3.message);

// Save results to markdown file
const filename = `memory-did-spaces-results.md`;
const content = `# Memory DID Spaces Test Results\n\n${result1.message}\n\n${result2.message}\n\n${result3.message}`;
writeFileSync(filename, content, "utf8");
