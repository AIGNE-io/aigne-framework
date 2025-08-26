import { AIGNEHubImageModel } from "../src/aigne-hub-image-model.js";

const model = new AIGNEHubImageModel({
  apiKey: "blocklet-zFntYcRCTtL181sVUmuxTFs1Qm93VYZfHPiyXacy9YokY",
  url: "https://bbqa5fnlqnw3hgxv2tabxswustq7yciminubmojsm5q.did.abtnet.io/",
  model: "dall-e-2",
});

model.invoke({ prompt: "Draw an image about a cat" }).then(console.log);
