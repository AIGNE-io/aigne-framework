import { AIGNEHubChatModel } from "../src/aigne-hub-model.js";

const model = new AIGNEHubChatModel({
  accessKey: "blocklet-zC8uZzjvL9Ht3VUuzA6aN1M9dB2MRHEtdTkb4aPcivpBf",
  model: "openai/gpt-4o-mini",
});

model.invoke({ messages: [{ role: "user", content: "Hello, world!" }] }).then((res) => {
  console.log(res);
});
