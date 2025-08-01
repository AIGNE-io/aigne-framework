## 验证评估 Agent 是否能按预期进行打分

为了验证评估 Agent 能给出合理的评估结果，来指导我们优化评估的 Agent，人工整理差、中、优三个等级的数据源，验证评估 Agent 能按预期给出评估。

### Bad

使用 structure-bad.yaml 作为输入调用 evaluation.yaml Agent。

输入中存在以下的问题：
- 主题不明确，特意在首页和关于页面添加其他公司相关的介绍
- 每一个技术要点都有一个独立的页面，结构不合理
- Blocklet 基石程序存在重复的页面
- 不满足用户要求，用户要求 5 个页面，结果中有 10 个页面

运行 Agent:

``` bash
aigne run --entry-agent "evaluation" --input "@mock-inputs/evaluation-test-inputs/structure-bad.yaml" --input-evaluationDimensions "@prompts/structure-evaluation-dimensions.md" --format yaml
```

运行结果（精简版本）：

## 打分总结
本次评估针对用户为开发者设计的 ArcBlock 相关站点结构规划进行。用户明确要求站点页面总数不能超过五个，且结构需清晰、易于理解，同时满足 SEO 要求。待评估的站点结构列出了 10 个页面，这直接违反了用户最核心的数量限制要求。此外，平铺的 10 个技术概念页面结构对于开发者理解 ArcBlock 平台各组件之间的关系、学习如何使用平台进行开发（用户期望的目标）来说，缺乏逻辑性和引导性，不利于用户体验和内容消化。整体而言，该结构规划在满足用户关键要求和提供良好用户体验方面存在严重缺陷。

*** 总体打分：2 **

测试总结：
- 基本符合预期，打分很低，输入中特意存在的问题，只有主题不明确没有被指出，考虑到有 10 个页面，只有两个页面提了其他公司，整体上并没有偏离主题，也算是合理的。

### general


### General

使用 structure-general.yaml 作为输入调用 evaluation.yaml Agent。

输入中存在以下的问题：
- 遗漏了 去中心化订阅网关 相关的信息
- 大量概念被放在了一个页面展示
- 

运行 Agent:

``` bash
aigne run --entry-agent "evaluation" --input "@mock-inputs/evaluation-test-inputs/structure-general.yaml" --input-evaluationDimensions "@prompts/structure-evaluation-dimensions.md" --format yaml
```

运行结果（精简版本）:
## 打分总结

本次评估针对 ArcBlock 站点结构规划草案，重点考察其对开发者受众的适配度、内容的结构化呈现、完整性以及对用户特定要求的满足程度。整体来看，规划基本涵盖了平台核心内容，并遵守了页面数量的限制。
然而，在内容架构的深度、 SEO 要求的具体落实以及核心功能覆盖的完整性方面存在明显不足，这可能影响站点对开发者的吸引力及搜索可见性。

*** 总体打分：3 ***

测试总结：
- 这个版本基本上每个维度的得分都比上一高，但是受限于最多五个页面，整体结构上是有缺陷的。

### Good

使用 structure-good.yaml 作为输入调用 evaluation.yaml Agent。

去除了用户要求中的五个页面的限制，结构可以更灵活的规划，展示内容更全面，每个节点展示的信息颗粒度更合适。
以开发者为目标用户，首页作为入口，引导用户了解平台的核心功能，吸引用户使用 ArcBlock 平台，并提供了完善的开发者支持。


运行 Agent:

``` bash
aigne run --entry-agent "evaluation" --input "@mock-inputs/evaluation-test-inputs/structure-good.yaml" --input-evaluationDimensions "@prompts/structure-evaluation-dimensions.md" --format yaml
```

运行结果（精简版）：
## 打分总结
这份站点结构规划对于面向开发者的 ArcBlock 平台站点来说是优秀的。结构清晰，层级关系合理，完整覆盖了平台的核心功能和开发者所需的信息，并且充分考虑了SEO和用户认知习惯。
每个页面都有明确的主题和唯一的路径，为后续的内容填充和开发奠定了良好的基础。整体设计符合高标准要求。

*** 总体打分：5 ***


