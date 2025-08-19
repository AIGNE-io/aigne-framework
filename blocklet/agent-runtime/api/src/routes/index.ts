import { AIGNEHubChatModel, loadModel } from "@aigne/aigne-hub";
import { AIGNE } from "@aigne/core";
import { loadAIGNEFile } from "@aigne/core/loader/index.js";
import { AIGNEHTTPServer } from "@aigne/transport/http-server/server.js";
import { Router } from "express";

const router = Router();

router.get("/health", (req, res) => {
  res.send(`component ${req.component.meta?.title ?? req.component.meta?.name} is running`);
});

router.post("/chat", async (req, res) => {
  const { aigne } = await loadAIGNEFile(req.mainDir).catch(() => ({
    aigne: null,
  }));
  const modelFromPath = `${aigne?.model?.provider ?? "openai"}/${aigne?.model?.name ?? "gpt-5-mini"}`;
  const model = await AIGNEHubChatModel.load({ model: modelFromPath });
  const engine = await AIGNE.load(req.mainDir, { model, loadModel });
  const aigneServer = new AIGNEHTTPServer(engine);
  await aigneServer.invoke(req, res, {
    userContext: { userId: req.user?.did },
  });
});

router.get("/chat/agent", async (req, res) => {
  const { aigne } = await loadAIGNEFile(req.mainDir).catch(() => ({
    aigne: null,
  }));
  res.json({ data: aigne?.agents?.[0] });
});

export default router;
