import { expect, spyOn, test } from "bun:test";
import { AIAgent, AIGNE, ProcessMode, TeamAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { z } from "zod";

test("Example TeamAgent: sequential", async () => {
  // #region example-agent-sequential

  // #region example-agent-sequential-create-agent

  const translatorAgent = AIAgent.from({
    name: "translator",
    inputSchema: z.object({
      content: z.string().describe("The text content to translate"),
    }),
    instructions: "Translate the text to Chinese:\n{{content}}",
    outputKey: "translation",
  });

  const prettierAgent = AIAgent.from({
    name: "prettier",
    inputSchema: z.object({
      translation: z.string().describe("The translated text"),
    }),
    instructions: "Prettier the following text:\n{{translation}}",
    outputKey: "formatted",
  });

  const teamAgent = TeamAgent.from({
    name: "sequential-team",
    mode: ProcessMode.sequential,
    skills: [translatorAgent, prettierAgent],
  });

  // #endregion example-agent-sequential-create-agent

  // #region example-agent-sequential-invoke
  const model = new OpenAIChatModel();
  const aigne = new AIGNE({ model });

  spyOn(model, "process")
    .mockReturnValueOnce({
      text: "AIGNE 是一个构建人工智能代理的优秀框架。",
    })
    .mockReturnValueOnce({
      text: "AIGNE 是一个出色的人工智能代理构建框架。",
    });

  const result = await aigne.invoke(teamAgent, {
    content: "AIGNE is a great framework to build AI agents.",
  });
  console.log(result);
  // Output:
  // {
  //   translation: "AIGNE 是一个构建人工智能代理的优秀框架。",
  //   formatted: "AIGNE 是一个出色的人工智能代理构建框架。",
  // }
  expect(result).toEqual({
    translation: "AIGNE 是一个构建人工智能代理的优秀框架。",
    formatted: "AIGNE 是一个出色的人工智能代理构建框架。",
  });
  // #endregion example-agent-sequential-invoke

  // #endregion example-agent-sequential
});

test("Example TeamAgent: parallel", async () => {
  // #region example-agent-parallel

  // #region example-agent-parallel-create-agent

  const featureAnalyzer = AIAgent.from({
    name: "feature-analyzer",
    inputSchema: z.object({
      product: z.string().describe("The product description to analyze"),
    }),
    instructions: `\
You are a product analyst. Given a product description, identify and list the key features of the product.
Be specific and focus only on the features. Format as bullet points.

Product description:
{{product}}`,
    outputKey: "features",
  });

  const audienceAnalyzer = AIAgent.from({
    name: "audience-analyzer",
    inputSchema: z.object({
      product: z.string().describe("The product description to analyze"),
    }),
    instructions: `\
You are a market researcher. Given a product description, identify the target audience for this product.
Consider demographics, interests, needs, and pain points. Format as bullet points.

Product description:
{{product}}`,
    outputKey: "audience",
  });

  const analysisTeam = TeamAgent.from({
    name: "analysis-team",
    skills: [featureAnalyzer, audienceAnalyzer],
    mode: ProcessMode.parallel,
  });

  // #endregion example-agent-parallel-create-agent

  // #region example-agent-parallel-invoke
  const model = new OpenAIChatModel();
  const aigne = new AIGNE({ model });

  spyOn(model, "process")
    .mockReturnValueOnce({
      text: "- No-code platform\n- Generative AI capabilities\n- App engine functionality\n- Easy integration",
    })
    .mockReturnValueOnce({
      text: "- Business professionals\n- Non-technical users\n- Organizations seeking AI solutions\n- Developers looking for rapid prototyping",
    })
    .mockReturnValueOnce({
      text: "Introducing AIGNE, the revolutionary No-code Generative AI Apps Engine that transforms how businesses implement AI solutions. With its intuitive platform, AIGNE empowers non-technical users and business professionals to harness the power of generative AI without writing a single line of code. The engine offers seamless integration capabilities while dramatically reducing development time, making sophisticated AI technology accessible to everyone. Whether you're an organization seeking innovative AI solutions or a developer looking for rapid prototyping tools, AIGNE's flexible and customizable framework adapts to your unique needs. Say goodbye to complex coding and hello to simplified AI implementation that democratizes access to cutting-edge technology.",
    });

  const result = await aigne.invoke(analysisTeam, {
    product: "AIGNE is a No-code Generative AI Apps Engine",
  });

  console.log(result);
  // Output would include:
  // {
  //   features: "- No-code platform\n- Generative AI capabilities\n- App engine functionality\n- Easy integration",
  //   audience: "- Business professionals\n- Non-technical users\n- Organizations seeking AI solutions\n- Developers looking for rapid prototyping",
  // }

  expect(result).toEqual({
    features:
      "- No-code platform\n- Generative AI capabilities\n- App engine functionality\n- Easy integration",
    audience:
      "- Business professionals\n- Non-technical users\n- Organizations seeking AI solutions\n- Developers looking for rapid prototyping",
  });
  // #endregion example-agent-parallel-invoke

  // #endregion example-agent-parallel
});
