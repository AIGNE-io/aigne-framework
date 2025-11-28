# Changelog

## [1.69.2](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.69.2-beta.1...core-v1.69.2) (2025-11-28)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/afs bumped to 1.2.2
    * @aigne/afs-history bumped to 1.1.1
    * @aigne/observability-api bumped to 0.11.11
    * @aigne/platform-helpers bumped to 0.6.5

## [1.69.2-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.69.2-beta...core-v1.69.2-beta.1) (2025-11-28)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.11.11-beta.1

## [1.69.2-beta](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.69.1...core-v1.69.2-beta) (2025-11-28)


### Bug Fixes

* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/afs bumped to 1.2.2-beta
    * @aigne/afs-history bumped to 1.1.1-beta
    * @aigne/observability-api bumped to 0.11.11-beta
    * @aigne/platform-helpers bumped to 0.6.5-beta

## [1.69.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.69.1-beta...core-v1.69.1) (2025-11-28)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.11.10

## [1.69.1-beta](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.69.0...core-v1.69.1-beta) (2025-11-24)


### Bug Fixes

* **observability:** prevent OOM by optimizing trace data storage strategy ([#767](https://github.com/AIGNE-io/aigne-framework/issues/767)) ([acd6476](https://github.com/AIGNE-io/aigne-framework/commit/acd6476936423c2186cb633086177541b0c0b558))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.11.10-beta

## [1.69.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.69.0-beta.2...core-v1.69.0) (2025-11-21)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/afs-history bumped to 1.1.0
    * @aigne/observability-api bumped to 0.11.9

## [1.69.0-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.69.0-beta.1...core-v1.69.0-beta.2) (2025-11-19)


### Features

* **models:** support gemini 3.x thinking level and thoughtSignature ([#760](https://github.com/AIGNE-io/aigne-framework/issues/760)) ([243f2d4](https://github.com/AIGNE-io/aigne-framework/commit/243f2d457792a20ba2b87378576092e6f88e319c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.11.9-beta.3

## [1.69.0-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.68.3-beta.1...core-v1.69.0-beta.1) (2025-11-18)


### Features

* add dynamic model options resolution with getter pattern ([#708](https://github.com/AIGNE-io/aigne-framework/issues/708)) ([5ed5085](https://github.com/AIGNE-io/aigne-framework/commit/5ed5085203763c70194853c56edc13acf56d81c6))
* add ImageModel/ImageAgent support ([#383](https://github.com/AIGNE-io/aigne-framework/issues/383)) ([96a2093](https://github.com/AIGNE-io/aigne-framework/commit/96a209368d91d98f47db6de1e404640368a86fa8))
* add includeAllStepsOutput option to control TeamAgent sequential streaming behavior ([#305](https://github.com/AIGNE-io/aigne-framework/issues/305)) ([0817475](https://github.com/AIGNE-io/aigne-framework/commit/08174751316b940a70463e71971a19a18b92667b))
* add modalities support for chat model ([#454](https://github.com/AIGNE-io/aigne-framework/issues/454)) ([70d1bf6](https://github.com/AIGNE-io/aigne-framework/commit/70d1bf631f4e711235d89c6df8ee210a19179b30))
* add reasoningEffort option for chat model ([#680](https://github.com/AIGNE-io/aigne-framework/issues/680)) ([f69d232](https://github.com/AIGNE-io/aigne-framework/commit/f69d232d714d4a3e4946bdc8c6598747c9bcbd57))
* add thinking support to Gemini chat models ([#650](https://github.com/AIGNE-io/aigne-framework/issues/650)) ([09b828b](https://github.com/AIGNE-io/aigne-framework/commit/09b828ba668d90cc6aac68a5e8190adb146b5e45))
* add user context support to prompt template variables ([#649](https://github.com/AIGNE-io/aigne-framework/issues/649)) ([a02d9b4](https://github.com/AIGNE-io/aigne-framework/commit/a02d9b412878050b8c1e32127b505c0346f19bba))
* **afs:** add basic AFS(AIGNE File System) support ([#505](https://github.com/AIGNE-io/aigne-framework/issues/505)) ([ac2a18a](https://github.com/AIGNE-io/aigne-framework/commit/ac2a18a82470a2f31c466f329386525eb1cdab6d))
* **afs:** add configurable history injection to AFS system ([#611](https://github.com/AIGNE-io/aigne-framework/issues/611)) ([689b5d7](https://github.com/AIGNE-io/aigne-framework/commit/689b5d76d8cc82f548e8be74e63f18e7a6216c31))
* **afs:** add module system fs for afs ([#594](https://github.com/AIGNE-io/aigne-framework/issues/594)) ([83c7b65](https://github.com/AIGNE-io/aigne-framework/commit/83c7b6555d21c606a5005eb05f6686882fb8ffa3))
* **agents:** add async memory recording option ([#385](https://github.com/AIGNE-io/aigne-framework/issues/385)) ([573acdb](https://github.com/AIGNE-io/aigne-framework/commit/573acdb617434e6699b2e07db942e6336706d27f))
* allow inserting agent-hub credits manually ([#315](https://github.com/AIGNE-io/aigne-framework/issues/315)) ([e3e4d1f](https://github.com/AIGNE-io/aigne-framework/commit/e3e4d1ff0d9d3fef33bb41d85e99735d4dd76cb7))
* **blocklet:** support agent runtime blocklet ([#396](https://github.com/AIGNE-io/aigne-framework/issues/396)) ([baaae69](https://github.com/AIGNE-io/aigne-framework/commit/baaae691d552b7c7d313c4964a135a1b245943f9))
* **cli:** add `--model` option for aigne applications ([#302](https://github.com/AIGNE-io/aigne-framework/issues/302)) ([5d63743](https://github.com/AIGNE-io/aigne-framework/commit/5d63743b8a47be64fd49245983f4f2f9da3197a0))
* **cli:** add alias support for agent ([#297](https://github.com/AIGNE-io/aigne-framework/issues/297)) ([fa166ab](https://github.com/AIGNE-io/aigne-framework/commit/fa166ab66d19e89ddd32c34e1470450eb4fbdbbd))
* **cli:** add chat mode support for cli ([#389](https://github.com/AIGNE-io/aigne-framework/issues/389)) ([d7dc138](https://github.com/AIGNE-io/aigne-framework/commit/d7dc138719dd638ddb12c4625abdf42746baf35d))
* **cli:** add inquirer/prompts integrations for cli ([#286](https://github.com/AIGNE-io/aigne-framework/issues/286)) ([33af756](https://github.com/AIGNE-io/aigne-framework/commit/33af7567fe2e7f9fb4b1633127e1d54fd65cb2a8))
* **cli:** add metadata traces including CLI version, app name, and version ([#646](https://github.com/AIGNE-io/aigne-framework/issues/646)) ([c64bd76](https://github.com/AIGNE-io/aigne-framework/commit/c64bd761ba4c9f3854be5feee208c711bff7a170))
* **cli:** add retry functionality and improve error handling for AIGNE Hub ([#348](https://github.com/AIGNE-io/aigne-framework/issues/348)) ([672c93a](https://github.com/AIGNE-io/aigne-framework/commit/672c93abbba8b4b234f6d810536ff4b603a97e1e))
* **cli:** add searchable checkbox component with dynamic filtering ([#426](https://github.com/AIGNE-io/aigne-framework/issues/426)) ([1a76fe7](https://github.com/AIGNE-io/aigne-framework/commit/1a76fe7c2f7d91bc4041dfcd73850b39a18a036b))
* **cli:** support aigne hub connect and model use ([#267](https://github.com/AIGNE-io/aigne-framework/issues/267)) ([8e5a32a](https://github.com/AIGNE-io/aigne-framework/commit/8e5a32afc64593137153d7407bde13837312ac70))
* **cli:** support custom task title of agent in cli ([#328](https://github.com/AIGNE-io/aigne-framework/issues/328)) ([128d75f](https://github.com/AIGNE-io/aigne-framework/commit/128d75fb42ca470b47a2793d79c92d7bb64cfedb))
* **cli:** support define nested commands for sub apps ([#568](https://github.com/AIGNE-io/aigne-framework/issues/568)) ([0693b80](https://github.com/AIGNE-io/aigne-framework/commit/0693b807e0f8d335010e6ad00763b07cf095e65b))
* **cli:** support dynamic download and execution of doc-smith app ([#293](https://github.com/AIGNE-io/aigne-framework/issues/293)) ([4c40077](https://github.com/AIGNE-io/aigne-framework/commit/4c40077bacef076bc4b098879e948ef866218e39))
* **cli:** support hide or collapse task for agents in CLI ([#381](https://github.com/AIGNE-io/aigne-framework/issues/381)) ([05b372d](https://github.com/AIGNE-io/aigne-framework/commit/05b372d431a862f7cdfa2a90bb4b7b2379bf97ab))
* **core:** add `keepTextInToolUses` option for AI Agent ([#585](https://github.com/AIGNE-io/aigne-framework/issues/585)) ([6c6be9e](https://github.com/AIGNE-io/aigne-framework/commit/6c6be9eee8e96294921b676a1982a18c93b2f66d))
* **core:** add `toolCallsConcurrency` support for AI agent ([#598](https://github.com/AIGNE-io/aigne-framework/issues/598)) ([84df406](https://github.com/AIGNE-io/aigne-framework/commit/84df406bfa9e3bdf159509f4b9cf2301ec80b155))
* **core:** add automatic JSON parsing and validation for structured outputs ([#548](https://github.com/AIGNE-io/aigne-framework/issues/548)) ([9077f93](https://github.com/AIGNE-io/aigne-framework/commit/9077f93856865915aaf5e8caa5638ef0b7f05b1e))
* **core:** add concurrency support for team agent ([#323](https://github.com/AIGNE-io/aigne-framework/issues/323)) ([5743260](https://github.com/AIGNE-io/aigne-framework/commit/57432603a45208ad3503b9fc4c64f07c8151f9ee))
* **core:** add json/yaml stringify filters for prompt template ([#685](https://github.com/AIGNE-io/aigne-framework/issues/685)) ([4e414bf](https://github.com/AIGNE-io/aigne-framework/commit/4e414bf5a43d0677fb16fcdceacaed501542ee85))
* **core:** add multi-roles instructions support for agent yaml ([#538](https://github.com/AIGNE-io/aigne-framework/issues/538)) ([97bf77f](https://github.com/AIGNE-io/aigne-framework/commit/97bf77f96b5f69321539311159010499eb3b1b25))
* **core:** add priority support for agent hooks ([#358](https://github.com/AIGNE-io/aigne-framework/issues/358)) ([9196141](https://github.com/AIGNE-io/aigne-framework/commit/91961413aea171048a6afae87ffc8dc53e20fca8))
* **core:** add reflection mode support to TeamAgent ([#273](https://github.com/AIGNE-io/aigne-framework/issues/273)) ([4e2dad6](https://github.com/AIGNE-io/aigne-framework/commit/4e2dad687c1caefa231c7a7620651d060f8c8b9d))
* **core:** add tson.stringify filter for prompt template ([#725](https://github.com/AIGNE-io/aigne-framework/issues/725)) ([c88e71c](https://github.com/AIGNE-io/aigne-framework/commit/c88e71c245a3eaa8a2d60f25c75368bced35fde2))
* **core:** support config reflection for TeamAgent in yaml file ([#276](https://github.com/AIGNE-io/aigne-framework/issues/276)) ([e6296a8](https://github.com/AIGNE-io/aigne-framework/commit/e6296a8aff313e8209c4fbb2878e7869cc672576))
* **core:** support custom default input value for agent ([#258](https://github.com/AIGNE-io/aigne-framework/issues/258)) ([352ac70](https://github.com/AIGNE-io/aigne-framework/commit/352ac70400fb7e28cc36c4f6dc9c591b0d64e546))
* **core:** support define hooks for agent in yaml ([#260](https://github.com/AIGNE-io/aigne-framework/issues/260)) ([c388e82](https://github.com/AIGNE-io/aigne-framework/commit/c388e8216134271af4d9c7def70862ea3c354c7f))
* enhance AI agent streaming with thinking mode support ([#343](https://github.com/AIGNE-io/aigne-framework/issues/343)) ([bea2a39](https://github.com/AIGNE-io/aigne-framework/commit/bea2a39a2610c2fe58e46ad612b5103726159ab9))
* enhance task title functionality to support dynamic generation ([#346](https://github.com/AIGNE-io/aigne-framework/issues/346)) ([fff098c](https://github.com/AIGNE-io/aigne-framework/commit/fff098c9828beca9d99e4b2ebaebdf6b92efb84e))
* improve image model architecture and file handling ([#527](https://github.com/AIGNE-io/aigne-framework/issues/527)) ([4db50aa](https://github.com/AIGNE-io/aigne-framework/commit/4db50aa0387a1a0f045ca11aaa61613e36ca7597))
* **memory:** support did space memory adapter ([#229](https://github.com/AIGNE-io/aigne-framework/issues/229)) ([6f69b64](https://github.com/AIGNE-io/aigne-framework/commit/6f69b64e98b963db9d6ab5357306b445385eaa68))
* **models:** add retry mechanism for network errors and structured output validation errors ([#418](https://github.com/AIGNE-io/aigne-framework/issues/418)) ([52bc9ee](https://github.com/AIGNE-io/aigne-framework/commit/52bc9eec5f4f4fa3c3f26881c405f4f89dad01c9))
* **model:** support video model ([#647](https://github.com/AIGNE-io/aigne-framework/issues/647)) ([de81742](https://github.com/AIGNE-io/aigne-framework/commit/de817421ef1dd3246d0d8c51ff12f0a855658f9f))
* support custom extra model options in agent yaml file ([#586](https://github.com/AIGNE-io/aigne-framework/issues/586)) ([6d82115](https://github.com/AIGNE-io/aigne-framework/commit/6d82115e0763385c7e44ea152867c0d4a9e0a301))
* support custom model for every agents ([#472](https://github.com/AIGNE-io/aigne-framework/issues/472)) ([0bda78a](https://github.com/AIGNE-io/aigne-framework/commit/0bda78a2ebf537e953d855882d68cb37d94d1d10))
* support custom prefer input file type ([#469](https://github.com/AIGNE-io/aigne-framework/issues/469)) ([db0161b](https://github.com/AIGNE-io/aigne-framework/commit/db0161bbac52542c771ee2f40f361636b0668075))
* support custom reflection error message ([#589](https://github.com/AIGNE-io/aigne-framework/issues/589)) ([856348e](https://github.com/AIGNE-io/aigne-framework/commit/856348e889890051d7149b4093161f6ba8636273))
* support define function agent by yaml ([#668](https://github.com/AIGNE-io/aigne-framework/issues/668)) ([2fde8cc](https://github.com/AIGNE-io/aigne-framework/commit/2fde8cc44b213fc2d4c20d91c3c8a8b3c2eb140e))
* support google model and skip check mode when connected to Hub ([#300](https://github.com/AIGNE-io/aigne-framework/issues/300)) ([e992c0f](https://github.com/AIGNE-io/aigne-framework/commit/e992c0f3335a7c512fa807d5b8ad10c9c3bf2351))
* support mount mcp agent into AFS ([#740](https://github.com/AIGNE-io/aigne-framework/issues/740)) ([6d474fc](https://github.com/AIGNE-io/aigne-framework/commit/6d474fc05845a15e2c3e8fa97727b409bdd70945))


### Bug Fixes

* add disabled observability env ([#453](https://github.com/AIGNE-io/aigne-framework/issues/453)) ([3e01107](https://github.com/AIGNE-io/aigne-framework/commit/3e01107deb07d3e4eb6fbe49a7b39919fa412df1))
* add fetch utility with timeout and enhanced error handling ([#694](https://github.com/AIGNE-io/aigne-framework/issues/694)) ([c2d4076](https://github.com/AIGNE-io/aigne-framework/commit/c2d4076ec590150d2751591a4f723721f78381e9))
* add missing dependencies ([#280](https://github.com/AIGNE-io/aigne-framework/issues/280)) ([5da315e](https://github.com/AIGNE-io/aigne-framework/commit/5da315e29dc02818293e74ad159294f137e2c7f7))
* add options for system message reordering and merging ([#624](https://github.com/AIGNE-io/aigne-framework/issues/624)) ([8ca466d](https://github.com/AIGNE-io/aigne-framework/commit/8ca466d49d1e4ed08bc90922f39c0d3ed60c4fd5))
* add prefer input file type option for image model ([#536](https://github.com/AIGNE-io/aigne-framework/issues/536)) ([3cba8a5](https://github.com/AIGNE-io/aigne-framework/commit/3cba8a5562233a1567b49b6dd5c446c0760f5c4c))
* add taskTitle to observability traces and fix GPT-5/o1 model parameters ([#700](https://github.com/AIGNE-io/aigne-framework/issues/700)) ([30b513b](https://github.com/AIGNE-io/aigne-framework/commit/30b513b46ab5edb58a37f29e566e311bbb389f44))
* allow custom user messages and prevent duplicate user content ([#632](https://github.com/AIGNE-io/aigne-framework/issues/632)) ([6c883b2](https://github.com/AIGNE-io/aigne-framework/commit/6c883b2d57a65e9b46232cece91fc6aa1de03aba))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* **cli:** force reimport of agent modules with cache busting ([#392](https://github.com/AIGNE-io/aigne-framework/issues/392)) ([c372cb9](https://github.com/AIGNE-io/aigne-framework/commit/c372cb9600a9d78ad1808a045bcddfc285e9c6f0))
* **cli:** improve CLI prompts and output handling ([#318](https://github.com/AIGNE-io/aigne-framework/issues/318)) ([681ee79](https://github.com/AIGNE-io/aigne-framework/commit/681ee79e9b18aed5a977a0a418c2d9df20a7297c))
* **cli:** log only once in loadAIGNE ([#357](https://github.com/AIGNE-io/aigne-framework/issues/357)) ([6e6d968](https://github.com/AIGNE-io/aigne-framework/commit/6e6d96814fbc87f210522ae16daf94c1f84f311a))
* **cli:** only auto-reinstall on agent loading errors ([#702](https://github.com/AIGNE-io/aigne-framework/issues/702)) ([52f61a4](https://github.com/AIGNE-io/aigne-framework/commit/52f61a47537f2be8763f7bd45b8baea94cf43e60))
* **cli:** prevent multiple simultaneous buy credits prompts ([#363](https://github.com/AIGNE-io/aigne-framework/issues/363)) ([b8fb459](https://github.com/AIGNE-io/aigne-framework/commit/b8fb459261fe327bcc9bfb4d163e66863cb797ec))
* **cli:** print pretty error message for cli ([#249](https://github.com/AIGNE-io/aigne-framework/issues/249)) ([d68e0f7](https://github.com/AIGNE-io/aigne-framework/commit/d68e0f7151259a05696de77d9f00793b6f5b36b2))
* **cli:** reduce memory usage of AIGNE CLI ([#411](https://github.com/AIGNE-io/aigne-framework/issues/411)) ([9c36969](https://github.com/AIGNE-io/aigne-framework/commit/9c369699d966d37abf2d6a1624eac3d2fda4123b))
* **core:** add `include_input_in_output` option for agent definition ([#575](https://github.com/AIGNE-io/aigne-framework/issues/575)) ([9e28b72](https://github.com/AIGNE-io/aigne-framework/commit/9e28b729963faa8bea90ee42fde855868889396d))
* **core:** add input_file_key support for agent yaml ([#597](https://github.com/AIGNE-io/aigne-framework/issues/597)) ([63414a3](https://github.com/AIGNE-io/aigne-framework/commit/63414a3d46c74c686e7f033c224ca6175bea8c3f))
* **core:** add nullish or nullable support for output schema ([#482](https://github.com/AIGNE-io/aigne-framework/issues/482)) ([bf80c29](https://github.com/AIGNE-io/aigne-framework/commit/bf80c29e10d3fef654c830df8dc7f3b7939fa58d))
* **core:** add optional memory context toggle for AI agent ([#350](https://github.com/AIGNE-io/aigne-framework/issues/350)) ([92322cc](https://github.com/AIGNE-io/aigne-framework/commit/92322ccaf6f2b6e4440d47a7631589061c351d64))
* **core:** added support for URL file type handling, expanding the range of supported file formats ([#671](https://github.com/AIGNE-io/aigne-framework/issues/671)) ([fea4519](https://github.com/AIGNE-io/aigne-framework/commit/fea45197e87cf7b19499c48b41626062824d1355))
* **core:** agent should not emit error event if retried ([#583](https://github.com/AIGNE-io/aigne-framework/issues/583)) ([04edcbf](https://github.com/AIGNE-io/aigne-framework/commit/04edcbfd71aa2746dad98140e20e0b718701fa0a))
* **core:** auto merge multiple system messages ([#619](https://github.com/AIGNE-io/aigne-framework/issues/619)) ([e9e62c0](https://github.com/AIGNE-io/aigne-framework/commit/e9e62c03c45f5a9b75d44a07588b2b179e262aad))
* **core:** auto retry LLM request for tool not found error ([#590](https://github.com/AIGNE-io/aigne-framework/issues/590)) ([3283daa](https://github.com/AIGNE-io/aigne-framework/commit/3283daa7abb0a44545b27d51645e5868c59a442f))
* **core:** auto trim trailing whitespace for AIAgent with structuredStreamMode enabled ([#334](https://github.com/AIGNE-io/aigne-framework/issues/334)) ([342eb49](https://github.com/AIGNE-io/aigne-framework/commit/342eb493995809f01da02fca6975ea6e52ecbd3a))
* **core:** change skills loading from Promise.all to sequential for loop ([#704](https://github.com/AIGNE-io/aigne-framework/issues/704)) ([08ac827](https://github.com/AIGNE-io/aigne-framework/commit/08ac8270285bdbafe171705f43ac32654430b745))
* **core:** check agent by structure instead of instanceOf ([826ef6f](https://github.com/AIGNE-io/aigne-framework/commit/826ef6fd4e9603cf51344e8e5b11af644396220e))
* **core:** examples cases that failed when using aigne-hub ([#337](https://github.com/AIGNE-io/aigne-framework/issues/337)) ([0d4a31c](https://github.com/AIGNE-io/aigne-framework/commit/0d4a31c24d9e7d26f00d1accb80719d9ad79a4c6))
* **core:** filter empty memory content ([#312](https://github.com/AIGNE-io/aigne-framework/issues/312)) ([39dd77a](https://github.com/AIGNE-io/aigne-framework/commit/39dd77a68154d51c7a132adccd9f21b8bc461be0))
* **core:** fix error of external schema with array type ([#251](https://github.com/AIGNE-io/aigne-framework/issues/251)) ([bd80921](https://github.com/AIGNE-io/aigne-framework/commit/bd80921bbbe8385645eb7c52fd719ce48d672da9))
* **core:** function agent should use common schema from yaml definition ([#270](https://github.com/AIGNE-io/aigne-framework/issues/270)) ([076a489](https://github.com/AIGNE-io/aigne-framework/commit/076a4896948c397518e99df46c1a443ea43daa64))
* **core:** handle relative path correctly ([#440](https://github.com/AIGNE-io/aigne-framework/issues/440)) ([45a65fe](https://github.com/AIGNE-io/aigne-framework/commit/45a65fea432da44218007e566fe952fa973d8ae2))
* **core:** hide internal prop toolsMap from trace logs ([#335](https://github.com/AIGNE-io/aigne-framework/issues/335)) ([bcec317](https://github.com/AIGNE-io/aigne-framework/commit/bcec317bf436988e5f43af05f649196bdbd6ac55))
* **core:** improve checkArguments error messages and refactor optional schemas ([#726](https://github.com/AIGNE-io/aigne-framework/issues/726)) ([8680f43](https://github.com/AIGNE-io/aigne-framework/commit/8680f43e6ad224eb84948b056c51e80ef8c47e06))
* **core:** improve hook handling in agent and context ([#325](https://github.com/AIGNE-io/aigne-framework/issues/325)) ([c858fec](https://github.com/AIGNE-io/aigne-framework/commit/c858fecb08453c2daca9708f4b8a9c135fac40b0))
* **core:** improve nested prompt file resolution ([#437](https://github.com/AIGNE-io/aigne-framework/issues/437)) ([38b5b13](https://github.com/AIGNE-io/aigne-framework/commit/38b5b1397b7897cddef39d60c8cae2152e37dc5b))
* **core:** improved ImageAgent parameter filtering to reduce redundant parameter passing ([#734](https://github.com/AIGNE-io/aigne-framework/issues/734)) ([f8f7da2](https://github.com/AIGNE-io/aigne-framework/commit/f8f7da21d6e55062da0d2070b3289388ba5e6702))
* **core:** load nested prompt files with relative paths correctly ([#432](https://github.com/AIGNE-io/aigne-framework/issues/432)) ([036ffa7](https://github.com/AIGNE-io/aigne-framework/commit/036ffa72391d3f27870a5022b7964739805a6161))
* **core:** make getCredential async for aigne-hub mount point retrieval ([#372](https://github.com/AIGNE-io/aigne-framework/issues/372)) ([34ce7a6](https://github.com/AIGNE-io/aigne-framework/commit/34ce7a645fa83994d3dfe0f29ca70098cfecac9c))
* **core:** memory leak in AIGNEContext by preventing duplicate signal handler ([#748](https://github.com/AIGNE-io/aigne-framework/issues/748)) ([7f17592](https://github.com/AIGNE-io/aigne-framework/commit/7f175929d78e4289e2d551746b12a73bb5c0eb22))
* **core:** order history entries by time in ascending order ([#736](https://github.com/AIGNE-io/aigne-framework/issues/736)) ([7a3c2c3](https://github.com/AIGNE-io/aigne-framework/commit/7a3c2c32c428026ae7b8025f42ac51c38374915a))
* **core:** remove lodash dependency ensure core support both esm and cjs ([#324](https://github.com/AIGNE-io/aigne-framework/issues/324)) ([d6c2452](https://github.com/AIGNE-io/aigne-framework/commit/d6c2452b660a163c73f2c628ffdc2a12949360b0))
* **core:** replace static import with dynamic import for CommonJS compatibility ([#448](https://github.com/AIGNE-io/aigne-framework/issues/448)) ([6db1e57](https://github.com/AIGNE-io/aigne-framework/commit/6db1e570858fff32f7352143585b98e900f1f71d))
* **core:** resolve nested prompt file correctly ([#434](https://github.com/AIGNE-io/aigne-framework/issues/434)) ([b334092](https://github.com/AIGNE-io/aigne-framework/commit/b334092900c003ca3c22d320e12712fd55c2500c))
* **core:** resolve relative paths correctly in JS agent files ([#732](https://github.com/AIGNE-io/aigne-framework/issues/732)) ([0cb5631](https://github.com/AIGNE-io/aigne-framework/commit/0cb5631e1a1516b796f86a8dafc2341fe0e0810c))
* **core:** share skills/agents from context ([#309](https://github.com/AIGNE-io/aigne-framework/issues/309)) ([88dd849](https://github.com/AIGNE-io/aigne-framework/commit/88dd849954c6f3fb68df238be22be3371c734e6e))
* **core:** support custom `catchToolsError` in yaml agent definition ([#676](https://github.com/AIGNE-io/aigne-framework/issues/676)) ([fe43f5f](https://github.com/AIGNE-io/aigne-framework/commit/fe43f5f32d18d2180abb0717287fc680f1444a0d))
* **core:** support JSON object definitions for agent files ([#730](https://github.com/AIGNE-io/aigne-framework/issues/730)) ([4337def](https://github.com/AIGNE-io/aigne-framework/commit/4337defab694abdbcc118cc7f9151ba4df945478))
* custom queue instead of fastq to compatible with browser ([#640](https://github.com/AIGNE-io/aigne-framework/issues/640)) ([51e0f8f](https://github.com/AIGNE-io/aigne-framework/commit/51e0f8fdeaf26f2765f392218f04a2af4c0d2e1a))
* **gemini:** handle empty responses when files are present ([#648](https://github.com/AIGNE-io/aigne-framework/issues/648)) ([f4e259c](https://github.com/AIGNE-io/aigne-framework/commit/f4e259c5e5c687c347bb5cf29cbb0b5bf4d0d4a1))
* **gemini:** implement retry mechanism for empty responses with structured output fallback ([#638](https://github.com/AIGNE-io/aigne-framework/issues/638)) ([d33c8bb](https://github.com/AIGNE-io/aigne-framework/commit/d33c8bb9711aadddef9687d6cf472a179cd8ed9c))
* handle absolute paths in agent YAML prompt URLs ([#466](https://github.com/AIGNE-io/aigne-framework/issues/466)) ([a07a088](https://github.com/AIGNE-io/aigne-framework/commit/a07a0880728f65fc831578763b62ce5144d1aed8))
* handle optional imageModel in loader function ([#582](https://github.com/AIGNE-io/aigne-framework/issues/582)) ([7d55084](https://github.com/AIGNE-io/aigne-framework/commit/7d550841b6edfc762ef7c188a585d9fc8ffdf4c7))
* input schema of AI agent should includes input key and input file key ([#600](https://github.com/AIGNE-io/aigne-framework/issues/600)) ([b4ca076](https://github.com/AIGNE-io/aigne-framework/commit/b4ca076d6b4a1a1ecb8d4ebb008abd0d7561aadd))
* **models:** add image parameters support for video generation ([#684](https://github.com/AIGNE-io/aigne-framework/issues/684)) ([b048b7f](https://github.com/AIGNE-io/aigne-framework/commit/b048b7f92bd7a532dbdbeb6fb5fa5499bae6b953))
* **models:** aigne hub video params ([#665](https://github.com/AIGNE-io/aigne-framework/issues/665)) ([d00f836](https://github.com/AIGNE-io/aigne-framework/commit/d00f8368422d8e3707b974e1aff06714731ebb28))
* **models:** aigne-hub adapter not working in node.js v21 ([#320](https://github.com/AIGNE-io/aigne-framework/issues/320)) ([2884d00](https://github.com/AIGNE-io/aigne-framework/commit/2884d00b83e153ae7465ef1369fcd22d7c6d43e0))
* **models:** auto retry when got emtpy response from gemini ([#636](https://github.com/AIGNE-io/aigne-framework/issues/636)) ([9367cef](https://github.com/AIGNE-io/aigne-framework/commit/9367cef49ea4c0c87b8a36b454deb2efaee6886f))
* **models:** convert local image to base64 for image model ([#517](https://github.com/AIGNE-io/aigne-framework/issues/517)) ([c0bc971](https://github.com/AIGNE-io/aigne-framework/commit/c0bc971087ef6e1caa641a699aed391a24feb40d))
* **models:** convert local image to base64 for image model ([#517](https://github.com/AIGNE-io/aigne-framework/issues/517)) ([c0bc971](https://github.com/AIGNE-io/aigne-framework/commit/c0bc971087ef6e1caa641a699aed391a24feb40d))
* **models:** improve message structure handling and enable auto-message options ([#657](https://github.com/AIGNE-io/aigne-framework/issues/657)) ([233d70c](https://github.com/AIGNE-io/aigne-framework/commit/233d70cb292b937200fada8434f33d957d766ad6))
* **model:** transform local file to base64 before request llm ([#462](https://github.com/AIGNE-io/aigne-framework/issues/462)) ([58ef5d7](https://github.com/AIGNE-io/aigne-framework/commit/58ef5d77046c49f3c4eed15b7f0cc283cbbcd74a))
* multiple input reminder ([#550](https://github.com/AIGNE-io/aigne-framework/issues/550)) ([0ab858f](https://github.com/AIGNE-io/aigne-framework/commit/0ab858fbe5177f02c1ca6af239b4171a358545df))
* **observability:** uniq index on insert and perf on trace query ([#268](https://github.com/AIGNE-io/aigne-framework/issues/268)) ([bd02d2e](https://github.com/AIGNE-io/aigne-framework/commit/bd02d2ef4dadc3df7e4806746fede2faa5cc50bb))
* prevent template rendering for agent and tool messages ([#572](https://github.com/AIGNE-io/aigne-framework/issues/572)) ([859687e](https://github.com/AIGNE-io/aigne-framework/commit/859687e499b07ffebced8b2cd89d4af676f6a462))
* properly handle SIGINT to flush observability data before exit ([#739](https://github.com/AIGNE-io/aigne-framework/issues/739)) ([99b4503](https://github.com/AIGNE-io/aigne-framework/commit/99b45033d5f3bcc1f830b583f9cca7258b00606f))
* resolve Windows file import URI issues ([#528](https://github.com/AIGNE-io/aigne-framework/issues/528)) ([bf807c5](https://github.com/AIGNE-io/aigne-framework/commit/bf807c5a3563c4423dc82fddff7fba280ef57957))
* should not return local path from aigne hub service ([#460](https://github.com/AIGNE-io/aigne-framework/issues/460)) ([c959717](https://github.com/AIGNE-io/aigne-framework/commit/c95971774f7e84dbeb3313f60b3e6464e2bb22e4))
* standardize AFS skills return format with status and metadata ([#653](https://github.com/AIGNE-io/aigne-framework/issues/653)) ([66b6b00](https://github.com/AIGNE-io/aigne-framework/commit/66b6b005a846ab795e65e9f20b950c854a69ffd2))
* standardize file parameter naming across models ([#534](https://github.com/AIGNE-io/aigne-framework/issues/534)) ([f159a9d](https://github.com/AIGNE-io/aigne-framework/commit/f159a9d6af21ec0e99641996b150560929845845))
* support optional field sturectured output for gemini ([#468](https://github.com/AIGNE-io/aigne-framework/issues/468)) ([70c6279](https://github.com/AIGNE-io/aigne-framework/commit/70c62795039a2862e3333f26707329489bf938de))
* update deps compatibility in CommonJS environment ([#580](https://github.com/AIGNE-io/aigne-framework/issues/580)) ([a1e35d0](https://github.com/AIGNE-io/aigne-framework/commit/a1e35d016405accb51c1aeb6a544503a1c78e912))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/afs-history bumped to 1.1.0-beta.1
    * @aigne/observability-api bumped to 0.11.9-beta.2

## [1.68.3-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.68.3-beta...core-v1.68.3-beta.1) (2025-11-18)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/afs-history bumped to 1.0.3-beta.1
    * @aigne/observability-api bumped to 0.11.9-beta.1

## [1.68.3-beta](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.68.2...core-v1.68.3-beta) (2025-11-17)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/afs-history bumped to 1.0.3-beta
    * @aigne/observability-api bumped to 0.11.9-beta

## [1.68.2](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.68.2-beta...core-v1.68.2) (2025-11-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.11.8

## [1.68.2-beta](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.68.1...core-v1.68.2-beta) (2025-11-15)


### Bug Fixes

* **core:** memory leak in AIGNEContext by preventing duplicate signal handler ([#748](https://github.com/AIGNE-io/aigne-framework/issues/748)) ([7f17592](https://github.com/AIGNE-io/aigne-framework/commit/7f175929d78e4289e2d551746b12a73bb5c0eb22))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.11.8-beta

## [1.68.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.68.1-beta...core-v1.68.1) (2025-11-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/afs bumped to 1.2.1
    * @aigne/afs-history bumped to 1.0.2
    * @aigne/observability-api bumped to 0.11.7
    * @aigne/platform-helpers bumped to 0.6.4

## [1.68.1-beta](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.68.0...core-v1.68.1-beta) (2025-11-15)


### Bug Fixes

* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/afs bumped to 1.2.1-beta
    * @aigne/afs-history bumped to 1.0.2-beta
    * @aigne/observability-api bumped to 0.11.7-beta
    * @aigne/platform-helpers bumped to 0.6.4-beta

## [1.68.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.68.0-beta...core-v1.68.0) (2025-11-14)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/afs bumped to 1.2.0
    * @aigne/afs-history bumped to 1.0.1

## [1.68.0-beta](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.67.0...core-v1.68.0-beta) (2025-11-14)


### Features

* support mount mcp agent into AFS ([#740](https://github.com/AIGNE-io/aigne-framework/issues/740)) ([6d474fc](https://github.com/AIGNE-io/aigne-framework/commit/6d474fc05845a15e2c3e8fa97727b409bdd70945))


### Bug Fixes

* properly handle SIGINT to flush observability data before exit ([#739](https://github.com/AIGNE-io/aigne-framework/issues/739)) ([99b4503](https://github.com/AIGNE-io/aigne-framework/commit/99b45033d5f3bcc1f830b583f9cca7258b00606f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/afs bumped to 1.2.0-beta
    * @aigne/afs-history bumped to 1.0.0

## [1.67.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.67.0-beta.4...core-v1.67.0) (2025-11-12)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/afs bumped to 1.1.2
    * @aigne/observability-api bumped to 0.11.6

## [1.67.0-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.67.0-beta.3...core-v1.67.0-beta.4) (2025-11-12)


### Bug Fixes

* **core:** order history entries by time in ascending order ([#736](https://github.com/AIGNE-io/aigne-framework/issues/736)) ([7a3c2c3](https://github.com/AIGNE-io/aigne-framework/commit/7a3c2c32c428026ae7b8025f42ac51c38374915a))

## [1.67.0-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.67.0-beta.2...core-v1.67.0-beta.3) (2025-11-12)


### Bug Fixes

* **core:** improved ImageAgent parameter filtering to reduce redundant parameter passing ([#734](https://github.com/AIGNE-io/aigne-framework/issues/734)) ([f8f7da2](https://github.com/AIGNE-io/aigne-framework/commit/f8f7da21d6e55062da0d2070b3289388ba5e6702))

## [1.67.0-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.67.0-beta.1...core-v1.67.0-beta.2) (2025-11-12)


### Bug Fixes

* **core:** resolve relative paths correctly in JS agent files ([#732](https://github.com/AIGNE-io/aigne-framework/issues/732)) ([0cb5631](https://github.com/AIGNE-io/aigne-framework/commit/0cb5631e1a1516b796f86a8dafc2341fe0e0810c))
* **core:** support JSON object definitions for agent files ([#730](https://github.com/AIGNE-io/aigne-framework/issues/730)) ([4337def](https://github.com/AIGNE-io/aigne-framework/commit/4337defab694abdbcc118cc7f9151ba4df945478))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.11.6-beta.2

## [1.67.0-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.67.0-beta...core-v1.67.0-beta.1) (2025-11-12)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/afs bumped to 1.1.2-beta
    * @aigne/observability-api bumped to 0.11.6-beta.1

## [1.67.0-beta](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.66.0...core-v1.67.0-beta) (2025-11-11)


### Features

* **core:** add tson.stringify filter for prompt template ([#725](https://github.com/AIGNE-io/aigne-framework/issues/725)) ([c88e71c](https://github.com/AIGNE-io/aigne-framework/commit/c88e71c245a3eaa8a2d60f25c75368bced35fde2))


### Bug Fixes

* **core:** improve checkArguments error messages and refactor optional schemas ([#726](https://github.com/AIGNE-io/aigne-framework/issues/726)) ([8680f43](https://github.com/AIGNE-io/aigne-framework/commit/8680f43e6ad224eb84948b056c51e80ef8c47e06))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.11.6-beta

## [1.66.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.66.0-beta.5...core-v1.66.0) (2025-11-07)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.11.5

## [1.66.0-beta.5](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.66.0-beta.4...core-v1.66.0-beta.5) (2025-11-07)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.11.5-beta.4

## [1.66.0-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.66.0-beta.3...core-v1.66.0-beta.4) (2025-11-06)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.11.5-beta.3

## [1.66.0-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.65.1-beta.3...core-v1.66.0-beta.3) (2025-11-06)


### Features

* add dynamic model options resolution with getter pattern ([#708](https://github.com/AIGNE-io/aigne-framework/issues/708)) ([5ed5085](https://github.com/AIGNE-io/aigne-framework/commit/5ed5085203763c70194853c56edc13acf56d81c6))


### Bug Fixes

* **core:** change skills loading from Promise.all to sequential for loop ([#704](https://github.com/AIGNE-io/aigne-framework/issues/704)) ([08ac827](https://github.com/AIGNE-io/aigne-framework/commit/08ac8270285bdbafe171705f43ac32654430b745))

## [1.65.1-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.65.1-beta.2...core-v1.65.1-beta.3) (2025-11-05)


### Bug Fixes

* add taskTitle to observability traces and fix GPT-5/o1 model parameters ([#700](https://github.com/AIGNE-io/aigne-framework/issues/700)) ([30b513b](https://github.com/AIGNE-io/aigne-framework/commit/30b513b46ab5edb58a37f29e566e311bbb389f44))
* **cli:** only auto-reinstall on agent loading errors ([#702](https://github.com/AIGNE-io/aigne-framework/issues/702)) ([52f61a4](https://github.com/AIGNE-io/aigne-framework/commit/52f61a47537f2be8763f7bd45b8baea94cf43e60))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.11.5-beta.2

## [1.65.1-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.65.1-beta.1...core-v1.65.1-beta.2) (2025-11-04)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.11.5-beta.1

## [1.65.1-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.65.1-beta...core-v1.65.1-beta.1) (2025-11-04)


### Bug Fixes

* add fetch utility with timeout and enhanced error handling ([#694](https://github.com/AIGNE-io/aigne-framework/issues/694)) ([c2d4076](https://github.com/AIGNE-io/aigne-framework/commit/c2d4076ec590150d2751591a4f723721f78381e9))

## [1.65.1-beta](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.65.0...core-v1.65.1-beta) (2025-11-03)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.11.5-beta

## [1.65.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.65.0-beta.5...core-v1.65.0) (2025-10-31)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/afs bumped to 1.1.1
    * @aigne/observability-api bumped to 0.11.4

## [1.65.0-beta.5](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.65.0-beta.4...core-v1.65.0-beta.5) (2025-10-31)


### Features

* **core:** add json/yaml stringify filters for prompt template ([#685](https://github.com/AIGNE-io/aigne-framework/issues/685)) ([4e414bf](https://github.com/AIGNE-io/aigne-framework/commit/4e414bf5a43d0677fb16fcdceacaed501542ee85))


### Bug Fixes

* **models:** add image parameters support for video generation ([#684](https://github.com/AIGNE-io/aigne-framework/issues/684)) ([b048b7f](https://github.com/AIGNE-io/aigne-framework/commit/b048b7f92bd7a532dbdbeb6fb5fa5499bae6b953))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.11.4-beta.2

## [1.65.0-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.65.0-beta.3...core-v1.65.0-beta.4) (2025-10-29)


### Features

* add reasoningEffort option for chat model ([#680](https://github.com/AIGNE-io/aigne-framework/issues/680)) ([f69d232](https://github.com/AIGNE-io/aigne-framework/commit/f69d232d714d4a3e4946bdc8c6598747c9bcbd57))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.11.4-beta.1

## [1.65.0-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.65.0-beta.2...core-v1.65.0-beta.3) (2025-10-28)


### Bug Fixes

* **core:** support custom `catchToolsError` in yaml agent definition ([#676](https://github.com/AIGNE-io/aigne-framework/issues/676)) ([fe43f5f](https://github.com/AIGNE-io/aigne-framework/commit/fe43f5f32d18d2180abb0717287fc680f1444a0d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.11.4-beta

## [1.65.0-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.65.0-beta.1...core-v1.65.0-beta.2) (2025-10-28)


### Bug Fixes

* **core:** added support for URL file type handling, expanding the range of supported file formats ([#671](https://github.com/AIGNE-io/aigne-framework/issues/671)) ([fea4519](https://github.com/AIGNE-io/aigne-framework/commit/fea45197e87cf7b19499c48b41626062824d1355))

## [1.65.0-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.65.0-beta...core-v1.65.0-beta.1) (2025-10-26)


### Features

* support define function agent by yaml ([#668](https://github.com/AIGNE-io/aigne-framework/issues/668)) ([2fde8cc](https://github.com/AIGNE-io/aigne-framework/commit/2fde8cc44b213fc2d4c20d91c3c8a8b3c2eb140e))


### Bug Fixes

* **models:** aigne hub video params ([#665](https://github.com/AIGNE-io/aigne-framework/issues/665)) ([d00f836](https://github.com/AIGNE-io/aigne-framework/commit/d00f8368422d8e3707b974e1aff06714731ebb28))

## [1.65.0-beta](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.64.1-beta...core-v1.65.0-beta) (2025-10-24)


### Features

* **model:** support video model ([#647](https://github.com/AIGNE-io/aigne-framework/issues/647)) ([de81742](https://github.com/AIGNE-io/aigne-framework/commit/de817421ef1dd3246d0d8c51ff12f0a855658f9f))

## [1.64.1-beta](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.64.0...core-v1.64.1-beta) (2025-10-23)


### Bug Fixes

* **models:** improve message structure handling and enable auto-message options ([#657](https://github.com/AIGNE-io/aigne-framework/issues/657)) ([233d70c](https://github.com/AIGNE-io/aigne-framework/commit/233d70cb292b937200fada8434f33d957d766ad6))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/afs bumped to 1.1.1-beta

## [1.64.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.64.0-beta.1...core-v1.64.0) (2025-10-22)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.11.3

## [1.64.0-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.64.0-beta...core-v1.64.0-beta.1) (2025-10-22)


### Bug Fixes

* standardize AFS skills return format with status and metadata ([#653](https://github.com/AIGNE-io/aigne-framework/issues/653)) ([66b6b00](https://github.com/AIGNE-io/aigne-framework/commit/66b6b005a846ab795e65e9f20b950c854a69ffd2))

## [1.64.0-beta](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.63.0...core-v1.64.0-beta) (2025-10-21)


### Features

* add thinking support to Gemini chat models ([#650](https://github.com/AIGNE-io/aigne-framework/issues/650)) ([09b828b](https://github.com/AIGNE-io/aigne-framework/commit/09b828ba668d90cc6aac68a5e8190adb146b5e45))
* add user context support to prompt template variables ([#649](https://github.com/AIGNE-io/aigne-framework/issues/649)) ([a02d9b4](https://github.com/AIGNE-io/aigne-framework/commit/a02d9b412878050b8c1e32127b505c0346f19bba))
* **cli:** add metadata traces including CLI version, app name, and version ([#646](https://github.com/AIGNE-io/aigne-framework/issues/646)) ([c64bd76](https://github.com/AIGNE-io/aigne-framework/commit/c64bd761ba4c9f3854be5feee208c711bff7a170))


### Bug Fixes

* **gemini:** handle empty responses when files are present ([#648](https://github.com/AIGNE-io/aigne-framework/issues/648)) ([f4e259c](https://github.com/AIGNE-io/aigne-framework/commit/f4e259c5e5c687c347bb5cf29cbb0b5bf4d0d4a1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.11.3-beta

## [1.63.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.63.0-beta.12...core-v1.63.0) (2025-10-19)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/afs bumped to 1.1.0
    * @aigne/observability-api bumped to 0.11.2

## [1.63.0-beta.12](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.63.0-beta.11...core-v1.63.0-beta.12) (2025-10-17)


### Bug Fixes

* custom queue instead of fastq to compatible with browser ([#640](https://github.com/AIGNE-io/aigne-framework/issues/640)) ([51e0f8f](https://github.com/AIGNE-io/aigne-framework/commit/51e0f8fdeaf26f2765f392218f04a2af4c0d2e1a))

## [1.63.0-beta.11](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.63.0-beta.10...core-v1.63.0-beta.11) (2025-10-17)


### Bug Fixes

* **gemini:** implement retry mechanism for empty responses with structured output fallback ([#638](https://github.com/AIGNE-io/aigne-framework/issues/638)) ([d33c8bb](https://github.com/AIGNE-io/aigne-framework/commit/d33c8bb9711aadddef9687d6cf472a179cd8ed9c))

## [1.63.0-beta.10](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.63.0-beta.9...core-v1.63.0-beta.10) (2025-10-16)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.11.2-beta.5

## [1.63.0-beta.9](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.63.0-beta.8...core-v1.63.0-beta.9) (2025-10-16)


### Bug Fixes

* allow custom user messages and prevent duplicate user content ([#632](https://github.com/AIGNE-io/aigne-framework/issues/632)) ([6c883b2](https://github.com/AIGNE-io/aigne-framework/commit/6c883b2d57a65e9b46232cece91fc6aa1de03aba))
* **models:** auto retry when got emtpy response from gemini ([#636](https://github.com/AIGNE-io/aigne-framework/issues/636)) ([9367cef](https://github.com/AIGNE-io/aigne-framework/commit/9367cef49ea4c0c87b8a36b454deb2efaee6886f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.11.2-beta.4

## [1.63.0-beta.8](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.63.0-beta.7...core-v1.63.0-beta.8) (2025-10-16)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.11.2-beta.3

## [1.63.0-beta.7](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.63.0-beta.6...core-v1.63.0-beta.7) (2025-10-15)


### Bug Fixes

* add options for system message reordering and merging ([#624](https://github.com/AIGNE-io/aigne-framework/issues/624)) ([8ca466d](https://github.com/AIGNE-io/aigne-framework/commit/8ca466d49d1e4ed08bc90922f39c0d3ed60c4fd5))

## [1.63.0-beta.6](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.63.0-beta.5...core-v1.63.0-beta.6) (2025-10-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.11.2-beta.2

## [1.63.0-beta.5](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.63.0-beta.4...core-v1.63.0-beta.5) (2025-10-13)


### Bug Fixes

* **core:** auto merge multiple system messages ([#619](https://github.com/AIGNE-io/aigne-framework/issues/619)) ([e9e62c0](https://github.com/AIGNE-io/aigne-framework/commit/e9e62c03c45f5a9b75d44a07588b2b179e262aad))

## [1.63.0-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.63.0-beta.3...core-v1.63.0-beta.4) (2025-10-12)


### Features

* **afs:** add configurable history injection to AFS system ([#611](https://github.com/AIGNE-io/aigne-framework/issues/611)) ([689b5d7](https://github.com/AIGNE-io/aigne-framework/commit/689b5d76d8cc82f548e8be74e63f18e7a6216c31))

## [1.63.0-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.63.0-beta.2...core-v1.63.0-beta.3) (2025-10-11)


### Features

* **afs:** add module system fs for afs ([#594](https://github.com/AIGNE-io/aigne-framework/issues/594)) ([83c7b65](https://github.com/AIGNE-io/aigne-framework/commit/83c7b6555d21c606a5005eb05f6686882fb8ffa3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/afs bumped to 1.1.0-beta
    * @aigne/observability-api bumped to 0.11.2-beta.1

## [1.63.0-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.63.0-beta.1...core-v1.63.0-beta.2) (2025-10-09)


### Bug Fixes

* input schema of AI agent should includes input key and input file key ([#600](https://github.com/AIGNE-io/aigne-framework/issues/600)) ([b4ca076](https://github.com/AIGNE-io/aigne-framework/commit/b4ca076d6b4a1a1ecb8d4ebb008abd0d7561aadd))

## [1.63.0-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.63.0-beta...core-v1.63.0-beta.1) (2025-10-09)


### Features

* **core:** add `toolCallsConcurrency` support for AI agent ([#598](https://github.com/AIGNE-io/aigne-framework/issues/598)) ([84df406](https://github.com/AIGNE-io/aigne-framework/commit/84df406bfa9e3bdf159509f4b9cf2301ec80b155))


### Bug Fixes

* **core:** add input_file_key support for agent yaml ([#597](https://github.com/AIGNE-io/aigne-framework/issues/597)) ([63414a3](https://github.com/AIGNE-io/aigne-framework/commit/63414a3d46c74c686e7f033c224ca6175bea8c3f))

## [1.63.0-beta](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.62.0...core-v1.63.0-beta) (2025-10-07)


### Features

* **afs:** add basic AFS(AIGNE File System) support ([#505](https://github.com/AIGNE-io/aigne-framework/issues/505)) ([ac2a18a](https://github.com/AIGNE-io/aigne-framework/commit/ac2a18a82470a2f31c466f329386525eb1cdab6d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/afs bumped to 1.0.0
    * @aigne/observability-api bumped to 0.11.2-beta

## [1.62.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.62.0-beta.6...core-v1.62.0) (2025-10-04)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.11.1

## [1.62.0-beta.6](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.62.0-beta.5...core-v1.62.0-beta.6) (2025-10-03)


### Features

* support custom extra model options in agent yaml file ([#586](https://github.com/AIGNE-io/aigne-framework/issues/586)) ([6d82115](https://github.com/AIGNE-io/aigne-framework/commit/6d82115e0763385c7e44ea152867c0d4a9e0a301))
* support custom reflection error message ([#589](https://github.com/AIGNE-io/aigne-framework/issues/589)) ([856348e](https://github.com/AIGNE-io/aigne-framework/commit/856348e889890051d7149b4093161f6ba8636273))


### Bug Fixes

* **core:** auto retry LLM request for tool not found error ([#590](https://github.com/AIGNE-io/aigne-framework/issues/590)) ([3283daa](https://github.com/AIGNE-io/aigne-framework/commit/3283daa7abb0a44545b27d51645e5868c59a442f))

## [1.62.0-beta.5](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.62.0-beta.4...core-v1.62.0-beta.5) (2025-10-02)


### Features

* **core:** add `keepTextInToolUses` option for AI Agent ([#585](https://github.com/AIGNE-io/aigne-framework/issues/585)) ([6c6be9e](https://github.com/AIGNE-io/aigne-framework/commit/6c6be9eee8e96294921b676a1982a18c93b2f66d))


### Bug Fixes

* **core:** agent should not emit error event if retried ([#583](https://github.com/AIGNE-io/aigne-framework/issues/583)) ([04edcbf](https://github.com/AIGNE-io/aigne-framework/commit/04edcbfd71aa2746dad98140e20e0b718701fa0a))

## [1.62.0-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.62.0-beta.3...core-v1.62.0-beta.4) (2025-10-01)


### Bug Fixes

* handle optional imageModel in loader function ([#582](https://github.com/AIGNE-io/aigne-framework/issues/582)) ([7d55084](https://github.com/AIGNE-io/aigne-framework/commit/7d550841b6edfc762ef7c188a585d9fc8ffdf4c7))
* update deps compatibility in CommonJS environment ([#580](https://github.com/AIGNE-io/aigne-framework/issues/580)) ([a1e35d0](https://github.com/AIGNE-io/aigne-framework/commit/a1e35d016405accb51c1aeb6a544503a1c78e912))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.11.1-beta.2

## [1.62.0-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.62.0-beta.2...core-v1.62.0-beta.3) (2025-10-01)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.11.1-beta.1

## [1.62.0-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.62.0-beta.1...core-v1.62.0-beta.2) (2025-10-01)


### Bug Fixes

* **core:** add `include_input_in_output` option for agent definition ([#575](https://github.com/AIGNE-io/aigne-framework/issues/575)) ([9e28b72](https://github.com/AIGNE-io/aigne-framework/commit/9e28b729963faa8bea90ee42fde855868889396d))

## [1.62.0-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.62.0-beta...core-v1.62.0-beta.1) (2025-10-01)


### Bug Fixes

* prevent template rendering for agent and tool messages ([#572](https://github.com/AIGNE-io/aigne-framework/issues/572)) ([859687e](https://github.com/AIGNE-io/aigne-framework/commit/859687e499b07ffebced8b2cd89d4af676f6a462))

## [1.62.0-beta](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.61.1-beta...core-v1.62.0-beta) (2025-09-30)


### Features

* **cli:** support define nested commands for sub apps ([#568](https://github.com/AIGNE-io/aigne-framework/issues/568)) ([0693b80](https://github.com/AIGNE-io/aigne-framework/commit/0693b807e0f8d335010e6ad00763b07cf095e65b))

## [1.61.1-beta](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.61.0...core-v1.61.1-beta) (2025-09-29)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.11.1-beta

## [1.61.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.61.0-beta.8...core-v1.61.0) (2025-09-27)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.11.0
    * @aigne/platform-helpers bumped to 0.6.3

## [1.61.0-beta.8](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.61.0-beta.7...core-v1.61.0-beta.8) (2025-09-26)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.11.0-beta.1

## [1.61.0-beta.7](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.61.0-beta.6...core-v1.61.0-beta.7) (2025-09-26)


### Bug Fixes

* **core:** check agent by structure instead of instanceOf ([826ef6f](https://github.com/AIGNE-io/aigne-framework/commit/826ef6fd4e9603cf51344e8e5b11af644396220e))

## [1.61.0-beta.6](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.61.0-beta.5...core-v1.61.0-beta.6) (2025-09-26)


### Bug Fixes

* multiple input reminder ([#550](https://github.com/AIGNE-io/aigne-framework/issues/550)) ([0ab858f](https://github.com/AIGNE-io/aigne-framework/commit/0ab858fbe5177f02c1ca6af239b4171a358545df))

## [1.61.0-beta.5](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.61.0-beta.4...core-v1.61.0-beta.5) (2025-09-25)


### Features

* **core:** add automatic JSON parsing and validation for structured outputs ([#548](https://github.com/AIGNE-io/aigne-framework/issues/548)) ([9077f93](https://github.com/AIGNE-io/aigne-framework/commit/9077f93856865915aaf5e8caa5638ef0b7f05b1e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.11.0-beta

## [1.61.0-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.61.0-beta.3...core-v1.61.0-beta.4) (2025-09-25)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.10.5-beta

## [1.61.0-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.61.0-beta.2...core-v1.61.0-beta.3) (2025-09-24)


### Features

* **core:** add multi-roles instructions support for agent yaml ([#538](https://github.com/AIGNE-io/aigne-framework/issues/538)) ([97bf77f](https://github.com/AIGNE-io/aigne-framework/commit/97bf77f96b5f69321539311159010499eb3b1b25))

## [1.61.0-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.61.0-beta.1...core-v1.61.0-beta.2) (2025-09-23)


### Bug Fixes

* add prefer input file type option for image model ([#536](https://github.com/AIGNE-io/aigne-framework/issues/536)) ([3cba8a5](https://github.com/AIGNE-io/aigne-framework/commit/3cba8a5562233a1567b49b6dd5c446c0760f5c4c))

## [1.61.0-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.61.0-beta...core-v1.61.0-beta.1) (2025-09-23)


### Bug Fixes

* standardize file parameter naming across models ([#534](https://github.com/AIGNE-io/aigne-framework/issues/534)) ([f159a9d](https://github.com/AIGNE-io/aigne-framework/commit/f159a9d6af21ec0e99641996b150560929845845))

## [1.61.0-beta](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.60.3...core-v1.61.0-beta) (2025-09-22)


### Features

* improve image model architecture and file handling ([#527](https://github.com/AIGNE-io/aigne-framework/issues/527)) ([4db50aa](https://github.com/AIGNE-io/aigne-framework/commit/4db50aa0387a1a0f045ca11aaa61613e36ca7597))


### Bug Fixes

* resolve Windows file import URI issues ([#528](https://github.com/AIGNE-io/aigne-framework/issues/528)) ([bf807c5](https://github.com/AIGNE-io/aigne-framework/commit/bf807c5a3563c4423dc82fddff7fba280ef57957))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/platform-helpers bumped to 0.6.3-beta

## [1.60.3](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.60.2...core-v1.60.3) (2025-09-18)


### Bug Fixes

* **models:** convert local image to base64 for image model ([#517](https://github.com/AIGNE-io/aigne-framework/issues/517)) ([c0bc971](https://github.com/AIGNE-io/aigne-framework/commit/c0bc971087ef6e1caa641a699aed391a24feb40d))

## [1.60.2](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.60.1...core-v1.60.2) (2025-09-11)


### Bug Fixes

* **core:** add nullish or nullable support for output schema ([#482](https://github.com/AIGNE-io/aigne-framework/issues/482)) ([bf80c29](https://github.com/AIGNE-io/aigne-framework/commit/bf80c29e10d3fef654c830df8dc7f3b7939fa58d))

## [1.60.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.60.0...core-v1.60.1) (2025-09-11)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.10.4

## [1.60.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.59.0...core-v1.60.0) (2025-09-10)


### Features

* support custom model for every agents ([#472](https://github.com/AIGNE-io/aigne-framework/issues/472)) ([0bda78a](https://github.com/AIGNE-io/aigne-framework/commit/0bda78a2ebf537e953d855882d68cb37d94d1d10))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.10.3

## [1.59.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.58.3...core-v1.59.0) (2025-09-09)


### Features

* support custom prefer input file type ([#469](https://github.com/AIGNE-io/aigne-framework/issues/469)) ([db0161b](https://github.com/AIGNE-io/aigne-framework/commit/db0161bbac52542c771ee2f40f361636b0668075))

## [1.58.3](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.58.2...core-v1.58.3) (2025-09-08)


### Bug Fixes

* handle absolute paths in agent YAML prompt URLs ([#466](https://github.com/AIGNE-io/aigne-framework/issues/466)) ([a07a088](https://github.com/AIGNE-io/aigne-framework/commit/a07a0880728f65fc831578763b62ce5144d1aed8))
* support optional field sturectured output for gemini ([#468](https://github.com/AIGNE-io/aigne-framework/issues/468)) ([70c6279](https://github.com/AIGNE-io/aigne-framework/commit/70c62795039a2862e3333f26707329489bf938de))

## [1.58.2](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.58.1...core-v1.58.2) (2025-09-05)


### Bug Fixes

* **model:** transform local file to base64 before request llm ([#462](https://github.com/AIGNE-io/aigne-framework/issues/462)) ([58ef5d7](https://github.com/AIGNE-io/aigne-framework/commit/58ef5d77046c49f3c4eed15b7f0cc283cbbcd74a))

## [1.58.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.58.0...core-v1.58.1) (2025-09-05)


### Bug Fixes

* should not return local path from aigne hub service ([#460](https://github.com/AIGNE-io/aigne-framework/issues/460)) ([c959717](https://github.com/AIGNE-io/aigne-framework/commit/c95971774f7e84dbeb3313f60b3e6464e2bb22e4))

## [1.58.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.57.5...core-v1.58.0) (2025-09-05)


### Features

* add modalities support for chat model ([#454](https://github.com/AIGNE-io/aigne-framework/issues/454)) ([70d1bf6](https://github.com/AIGNE-io/aigne-framework/commit/70d1bf631f4e711235d89c6df8ee210a19179b30))


### Bug Fixes

* add disabled observability env ([#453](https://github.com/AIGNE-io/aigne-framework/issues/453)) ([3e01107](https://github.com/AIGNE-io/aigne-framework/commit/3e01107deb07d3e4eb6fbe49a7b39919fa412df1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.10.2

## [1.57.5](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.57.4...core-v1.57.5) (2025-09-01)


### Bug Fixes

* **core:** replace static import with dynamic import for CommonJS compatibility ([#448](https://github.com/AIGNE-io/aigne-framework/issues/448)) ([6db1e57](https://github.com/AIGNE-io/aigne-framework/commit/6db1e570858fff32f7352143585b98e900f1f71d))

## [1.57.4](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.57.3...core-v1.57.4) (2025-08-30)


### Bug Fixes

* **core:** handle relative path correctly ([#440](https://github.com/AIGNE-io/aigne-framework/issues/440)) ([45a65fe](https://github.com/AIGNE-io/aigne-framework/commit/45a65fea432da44218007e566fe952fa973d8ae2))

## [1.57.3](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.57.2...core-v1.57.3) (2025-08-30)


### Bug Fixes

* **core:** improve nested prompt file resolution ([#437](https://github.com/AIGNE-io/aigne-framework/issues/437)) ([38b5b13](https://github.com/AIGNE-io/aigne-framework/commit/38b5b1397b7897cddef39d60c8cae2152e37dc5b))

## [1.57.2](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.57.1...core-v1.57.2) (2025-08-29)


### Bug Fixes

* **core:** resolve nested prompt file correctly ([#434](https://github.com/AIGNE-io/aigne-framework/issues/434)) ([b334092](https://github.com/AIGNE-io/aigne-framework/commit/b334092900c003ca3c22d320e12712fd55c2500c))

## [1.57.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.57.0...core-v1.57.1) (2025-08-29)


### Bug Fixes

* **core:** load nested prompt files with relative paths correctly ([#432](https://github.com/AIGNE-io/aigne-framework/issues/432)) ([036ffa7](https://github.com/AIGNE-io/aigne-framework/commit/036ffa72391d3f27870a5022b7964739805a6161))

## [1.57.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.56.0...core-v1.57.0) (2025-08-28)


### Features

* **cli:** add searchable checkbox component with dynamic filtering ([#426](https://github.com/AIGNE-io/aigne-framework/issues/426)) ([1a76fe7](https://github.com/AIGNE-io/aigne-framework/commit/1a76fe7c2f7d91bc4041dfcd73850b39a18a036b))

## [1.56.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.55.1...core-v1.56.0) (2025-08-27)


### Features

* **models:** add retry mechanism for network errors and structured output validation errors ([#418](https://github.com/AIGNE-io/aigne-framework/issues/418)) ([52bc9ee](https://github.com/AIGNE-io/aigne-framework/commit/52bc9eec5f4f4fa3c3f26881c405f4f89dad01c9))

## [1.55.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.55.0...core-v1.55.1) (2025-08-26)


### Bug Fixes

* **cli:** reduce memory usage of AIGNE CLI ([#411](https://github.com/AIGNE-io/aigne-framework/issues/411)) ([9c36969](https://github.com/AIGNE-io/aigne-framework/commit/9c369699d966d37abf2d6a1624eac3d2fda4123b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.10.1

## [1.55.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.54.0...core-v1.55.0) (2025-08-21)


### Features

* **blocklet:** support agent runtime blocklet ([#396](https://github.com/AIGNE-io/aigne-framework/issues/396)) ([baaae69](https://github.com/AIGNE-io/aigne-framework/commit/baaae691d552b7c7d313c4964a135a1b245943f9))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.10.0

## [1.54.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.53.0...core-v1.54.0) (2025-08-21)


### Features

* **cli:** add chat mode support for cli ([#389](https://github.com/AIGNE-io/aigne-framework/issues/389)) ([d7dc138](https://github.com/AIGNE-io/aigne-framework/commit/d7dc138719dd638ddb12c4625abdf42746baf35d))


### Bug Fixes

* **cli:** force reimport of agent modules with cache busting ([#392](https://github.com/AIGNE-io/aigne-framework/issues/392)) ([c372cb9](https://github.com/AIGNE-io/aigne-framework/commit/c372cb9600a9d78ad1808a045bcddfc285e9c6f0))

## [1.53.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.52.0...core-v1.53.0) (2025-08-20)


### Features

* add ImageModel/ImageAgent support ([#383](https://github.com/AIGNE-io/aigne-framework/issues/383)) ([96a2093](https://github.com/AIGNE-io/aigne-framework/commit/96a209368d91d98f47db6de1e404640368a86fa8))

## [1.52.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.51.0...core-v1.52.0) (2025-08-20)


### Features

* **agents:** add async memory recording option ([#385](https://github.com/AIGNE-io/aigne-framework/issues/385)) ([573acdb](https://github.com/AIGNE-io/aigne-framework/commit/573acdb617434e6699b2e07db942e6336706d27f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.9.1

## [1.51.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.50.1...core-v1.51.0) (2025-08-18)


### Features

* **cli:** support hide or collapse task for agents in CLI ([#381](https://github.com/AIGNE-io/aigne-framework/issues/381)) ([05b372d](https://github.com/AIGNE-io/aigne-framework/commit/05b372d431a862f7cdfa2a90bb4b7b2379bf97ab))

## [1.50.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.50.0...core-v1.50.1) (2025-08-16)


### Bug Fixes

* **core:** make getCredential async for aigne-hub mount point retrieval ([#372](https://github.com/AIGNE-io/aigne-framework/issues/372)) ([34ce7a6](https://github.com/AIGNE-io/aigne-framework/commit/34ce7a645fa83994d3dfe0f29ca70098cfecac9c))

## [1.50.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.49.1...core-v1.50.0) (2025-08-14)


### Features

* **core:** add priority support for agent hooks ([#358](https://github.com/AIGNE-io/aigne-framework/issues/358)) ([9196141](https://github.com/AIGNE-io/aigne-framework/commit/91961413aea171048a6afae87ffc8dc53e20fca8))


### Bug Fixes

* **cli:** log only once in loadAIGNE ([#357](https://github.com/AIGNE-io/aigne-framework/issues/357)) ([6e6d968](https://github.com/AIGNE-io/aigne-framework/commit/6e6d96814fbc87f210522ae16daf94c1f84f311a))
* **cli:** prevent multiple simultaneous buy credits prompts ([#363](https://github.com/AIGNE-io/aigne-framework/issues/363)) ([b8fb459](https://github.com/AIGNE-io/aigne-framework/commit/b8fb459261fe327bcc9bfb4d163e66863cb797ec))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/platform-helpers bumped to 0.6.2

## [1.49.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.49.0...core-v1.49.1) (2025-08-12)


### Bug Fixes

* **core:** add optional memory context toggle for AI agent ([#350](https://github.com/AIGNE-io/aigne-framework/issues/350)) ([92322cc](https://github.com/AIGNE-io/aigne-framework/commit/92322ccaf6f2b6e4440d47a7631589061c351d64))

## [1.49.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.48.0...core-v1.49.0) (2025-08-12)


### Features

* **cli:** add retry functionality and improve error handling for AIGNE Hub ([#348](https://github.com/AIGNE-io/aigne-framework/issues/348)) ([672c93a](https://github.com/AIGNE-io/aigne-framework/commit/672c93abbba8b4b234f6d810536ff4b603a97e1e))


### Bug Fixes

* **core:** examples cases that failed when using aigne-hub ([#337](https://github.com/AIGNE-io/aigne-framework/issues/337)) ([0d4a31c](https://github.com/AIGNE-io/aigne-framework/commit/0d4a31c24d9e7d26f00d1accb80719d9ad79a4c6))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/platform-helpers bumped to 0.6.1

## [1.48.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.47.0...core-v1.48.0) (2025-08-12)


### Features

* enhance task title functionality to support dynamic generation ([#346](https://github.com/AIGNE-io/aigne-framework/issues/346)) ([fff098c](https://github.com/AIGNE-io/aigne-framework/commit/fff098c9828beca9d99e4b2ebaebdf6b92efb84e))

## [1.47.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.46.1...core-v1.47.0) (2025-08-11)


### Features

* enhance AI agent streaming with thinking mode support ([#343](https://github.com/AIGNE-io/aigne-framework/issues/343)) ([bea2a39](https://github.com/AIGNE-io/aigne-framework/commit/bea2a39a2610c2fe58e46ad612b5103726159ab9))

## [1.46.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.46.0...core-v1.46.1) (2025-08-08)


### Bug Fixes

* **core:** auto trim trailing whitespace for AIAgent with structuredStreamMode enabled ([#334](https://github.com/AIGNE-io/aigne-framework/issues/334)) ([342eb49](https://github.com/AIGNE-io/aigne-framework/commit/342eb493995809f01da02fca6975ea6e52ecbd3a))
* **core:** hide internal prop toolsMap from trace logs ([#335](https://github.com/AIGNE-io/aigne-framework/issues/335)) ([bcec317](https://github.com/AIGNE-io/aigne-framework/commit/bcec317bf436988e5f43af05f649196bdbd6ac55))

## [1.46.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.45.0...core-v1.46.0) (2025-08-06)


### Features

* **cli:** support custom task title of agent in cli ([#328](https://github.com/AIGNE-io/aigne-framework/issues/328)) ([128d75f](https://github.com/AIGNE-io/aigne-framework/commit/128d75fb42ca470b47a2793d79c92d7bb64cfedb))


### Bug Fixes

* **core:** improve hook handling in agent and context ([#325](https://github.com/AIGNE-io/aigne-framework/issues/325)) ([c858fec](https://github.com/AIGNE-io/aigne-framework/commit/c858fecb08453c2daca9708f4b8a9c135fac40b0))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/platform-helpers bumped to 0.6.0

## [1.45.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.44.0...core-v1.45.0) (2025-08-06)


### Features

* **core:** add concurrency support for team agent ([#323](https://github.com/AIGNE-io/aigne-framework/issues/323)) ([5743260](https://github.com/AIGNE-io/aigne-framework/commit/57432603a45208ad3503b9fc4c64f07c8151f9ee))


### Bug Fixes

* **core:** remove lodash dependency ensure core support both esm and cjs ([#324](https://github.com/AIGNE-io/aigne-framework/issues/324)) ([d6c2452](https://github.com/AIGNE-io/aigne-framework/commit/d6c2452b660a163c73f2c628ffdc2a12949360b0))
* **models:** aigne-hub adapter not working in node.js v21 ([#320](https://github.com/AIGNE-io/aigne-framework/issues/320)) ([2884d00](https://github.com/AIGNE-io/aigne-framework/commit/2884d00b83e153ae7465ef1369fcd22d7c6d43e0))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/platform-helpers bumped to 0.5.1

## [1.44.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.43.1...core-v1.44.0) (2025-08-05)


### Features

* allow inserting agent-hub credits manually ([#315](https://github.com/AIGNE-io/aigne-framework/issues/315)) ([e3e4d1f](https://github.com/AIGNE-io/aigne-framework/commit/e3e4d1ff0d9d3fef33bb41d85e99735d4dd76cb7))


### Bug Fixes

* **cli:** improve CLI prompts and output handling ([#318](https://github.com/AIGNE-io/aigne-framework/issues/318)) ([681ee79](https://github.com/AIGNE-io/aigne-framework/commit/681ee79e9b18aed5a977a0a418c2d9df20a7297c))

## [1.43.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.43.0...core-v1.43.1) (2025-08-05)


### Bug Fixes

* **core:** filter empty memory content ([#312](https://github.com/AIGNE-io/aigne-framework/issues/312)) ([39dd77a](https://github.com/AIGNE-io/aigne-framework/commit/39dd77a68154d51c7a132adccd9f21b8bc461be0))

## [1.43.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.42.0...core-v1.43.0) (2025-08-04)


### Features

* add includeAllStepsOutput option to control TeamAgent sequential streaming behavior ([#305](https://github.com/AIGNE-io/aigne-framework/issues/305)) ([0817475](https://github.com/AIGNE-io/aigne-framework/commit/08174751316b940a70463e71971a19a18b92667b))


### Bug Fixes

* **core:** share skills/agents from context ([#309](https://github.com/AIGNE-io/aigne-framework/issues/309)) ([88dd849](https://github.com/AIGNE-io/aigne-framework/commit/88dd849954c6f3fb68df238be22be3371c734e6e))

## [1.42.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.41.0...core-v1.42.0) (2025-08-01)


### Features

* **cli:** add `--model` option for aigne applications ([#302](https://github.com/AIGNE-io/aigne-framework/issues/302)) ([5d63743](https://github.com/AIGNE-io/aigne-framework/commit/5d63743b8a47be64fd49245983f4f2f9da3197a0))
* support google model and skip check mode when connected to Hub ([#300](https://github.com/AIGNE-io/aigne-framework/issues/300)) ([e992c0f](https://github.com/AIGNE-io/aigne-framework/commit/e992c0f3335a7c512fa807d5b8ad10c9c3bf2351))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.9.0
    * @aigne/platform-helpers bumped to 0.5.0

## [1.41.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.40.0...core-v1.41.0) (2025-07-31)


### Features

* **cli:** add alias support for agent ([#297](https://github.com/AIGNE-io/aigne-framework/issues/297)) ([fa166ab](https://github.com/AIGNE-io/aigne-framework/commit/fa166ab66d19e89ddd32c34e1470450eb4fbdbbd))

## [1.40.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.39.0...core-v1.40.0) (2025-07-31)


### Features

* **cli:** support dynamic download and execution of doc-smith app ([#293](https://github.com/AIGNE-io/aigne-framework/issues/293)) ([4c40077](https://github.com/AIGNE-io/aigne-framework/commit/4c40077bacef076bc4b098879e948ef866218e39))

## [1.39.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.38.1...core-v1.39.0) (2025-07-28)


### Features

* **cli:** add inquirer/prompts integrations for cli ([#286](https://github.com/AIGNE-io/aigne-framework/issues/286)) ([33af756](https://github.com/AIGNE-io/aigne-framework/commit/33af7567fe2e7f9fb4b1633127e1d54fd65cb2a8))


### Bug Fixes

* **observability:** uniq index on insert and perf on trace query ([#268](https://github.com/AIGNE-io/aigne-framework/issues/268)) ([bd02d2e](https://github.com/AIGNE-io/aigne-framework/commit/bd02d2ef4dadc3df7e4806746fede2faa5cc50bb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.8.2

## [1.38.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.38.0...core-v1.38.1) (2025-07-24)


### Bug Fixes

* add missing dependencies ([#280](https://github.com/AIGNE-io/aigne-framework/issues/280)) ([5da315e](https://github.com/AIGNE-io/aigne-framework/commit/5da315e29dc02818293e74ad159294f137e2c7f7))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.8.1

## [1.38.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.37.0...core-v1.38.0) (2025-07-24)


### Features

* **cli:** support aigne hub connect and model use ([#267](https://github.com/AIGNE-io/aigne-framework/issues/267)) ([8e5a32a](https://github.com/AIGNE-io/aigne-framework/commit/8e5a32afc64593137153d7407bde13837312ac70))
* **core:** support config reflection for TeamAgent in yaml file ([#276](https://github.com/AIGNE-io/aigne-framework/issues/276)) ([e6296a8](https://github.com/AIGNE-io/aigne-framework/commit/e6296a8aff313e8209c4fbb2878e7869cc672576))

## [1.37.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.36.0...core-v1.37.0) (2025-07-22)


### Features

* **core:** add reflection mode support to TeamAgent ([#273](https://github.com/AIGNE-io/aigne-framework/issues/273)) ([4e2dad6](https://github.com/AIGNE-io/aigne-framework/commit/4e2dad687c1caefa231c7a7620651d060f8c8b9d))


### Bug Fixes

* **core:** function agent should use common schema from yaml definition ([#270](https://github.com/AIGNE-io/aigne-framework/issues/270)) ([076a489](https://github.com/AIGNE-io/aigne-framework/commit/076a4896948c397518e99df46c1a443ea43daa64))

## [1.36.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.35.0...core-v1.36.0) (2025-07-17)


### Features

* **core:** support define hooks for agent in yaml ([#260](https://github.com/AIGNE-io/aigne-framework/issues/260)) ([c388e82](https://github.com/AIGNE-io/aigne-framework/commit/c388e8216134271af4d9c7def70862ea3c354c7f))

## [1.35.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.34.0...core-v1.35.0) (2025-07-17)


### Features

* **core:** support custom default input value for agent ([#258](https://github.com/AIGNE-io/aigne-framework/issues/258)) ([352ac70](https://github.com/AIGNE-io/aigne-framework/commit/352ac70400fb7e28cc36c4f6dc9c591b0d64e546))

## [1.34.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.33.2...core-v1.34.0) (2025-07-15)


### Features

* **memory:** support did space memory adapter ([#229](https://github.com/AIGNE-io/aigne-framework/issues/229)) ([6f69b64](https://github.com/AIGNE-io/aigne-framework/commit/6f69b64e98b963db9d6ab5357306b445385eaa68))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.8.0
    * @aigne/platform-helpers bumped to 0.4.0

## [1.33.2](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.33.1...core-v1.33.2) (2025-07-14)


### Bug Fixes

* **core:** fix error of external schema with array type ([#251](https://github.com/AIGNE-io/aigne-framework/issues/251)) ([bd80921](https://github.com/AIGNE-io/aigne-framework/commit/bd80921bbbe8385645eb7c52fd719ce48d672da9))

## [1.33.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.33.0...core-v1.33.1) (2025-07-14)


### Bug Fixes

* **cli:** print pretty error message for cli ([#249](https://github.com/AIGNE-io/aigne-framework/issues/249)) ([d68e0f7](https://github.com/AIGNE-io/aigne-framework/commit/d68e0f7151259a05696de77d9f00793b6f5b36b2))
* **core:** check if skills is empty before TeamAgent processes ([#250](https://github.com/AIGNE-io/aigne-framework/issues/250)) ([f0fff7e](https://github.com/AIGNE-io/aigne-framework/commit/f0fff7e41512cf06f106a0d7fe03a7d98206f136))
* **deps:** update deps to latest version ([#247](https://github.com/AIGNE-io/aigne-framework/issues/247)) ([3972f88](https://github.com/AIGNE-io/aigne-framework/commit/3972f887a9abff20c26da6b51c1071cbd54c0bf1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.7.2
    * @aigne/platform-helpers bumped to 0.3.1

## [1.33.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.32.2...core-v1.33.0) (2025-07-10)


### Features

* **core:** support external files as agent input/output schema ([#242](https://github.com/AIGNE-io/aigne-framework/issues/242)) ([58f8de6](https://github.com/AIGNE-io/aigne-framework/commit/58f8de63008b78ea1b404ba7721c3a242c330113))

## [1.32.2](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.32.1...core-v1.32.2) (2025-07-09)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.7.1

## [1.32.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.32.0...core-v1.32.1) (2025-07-09)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.7.0

## [1.32.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.31.0...core-v1.32.0) (2025-07-08)


### Features

* **core:** add jinja syntax support for prompt builder ([#230](https://github.com/AIGNE-io/aigne-framework/issues/230)) ([74436a7](https://github.com/AIGNE-io/aigne-framework/commit/74436a7faac0c59a32b0153481386162649f4357))
* support setting component id to different component data ([#226](https://github.com/AIGNE-io/aigne-framework/issues/226)) ([c7b3224](https://github.com/AIGNE-io/aigne-framework/commit/c7b32240e6660f34974615bcb9b91978a1191e3e))


### Bug Fixes

* **core:** ensure output is a record type ([#228](https://github.com/AIGNE-io/aigne-framework/issues/228)) ([dfd9104](https://github.com/AIGNE-io/aigne-framework/commit/dfd910451e5f1f9edd94a719857e36d34fadbe45))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.6.0

## [1.31.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.30.0...core-v1.31.0) (2025-07-04)


### Features

* **core:** add standard userId/sessionId in userContext ([#219](https://github.com/AIGNE-io/aigne-framework/issues/219)) ([58e5804](https://github.com/AIGNE-io/aigne-framework/commit/58e5804cf08b1d2fa6e232646fadd70b5db2e007))
* **core:** add strucutredStreamMode option for AIAgent to support text and json output in one-shot ([#222](https://github.com/AIGNE-io/aigne-framework/issues/222)) ([c0af92b](https://github.com/AIGNE-io/aigne-framework/commit/c0af92b6a020453b047e5bb3782239795839baa8))
* **memory:** add support for AgenticMemory & some improvements for DefaultMemory ([#224](https://github.com/AIGNE-io/aigne-framework/issues/224)) ([f4a08af](https://github.com/AIGNE-io/aigne-framework/commit/f4a08aff935205c62615c060763c835a9579607d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.5.0
    * @aigne/platform-helpers bumped to 0.3.0

## [1.30.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.29.1...core-v1.30.0) (2025-07-03)


### Features

* upgrade dependencies and adapt code to breaking changes ([#216](https://github.com/AIGNE-io/aigne-framework/issues/216)) ([f215ced](https://github.com/AIGNE-io/aigne-framework/commit/f215cedc1a57e321164064c33316e496eae8d25f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.4.0
    * @aigne/platform-helpers bumped to 0.2.0

## [1.29.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.29.0...core-v1.29.1) (2025-07-02)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.3.3

## [1.29.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.28.2...core-v1.29.0) (2025-07-02)


### Features

* support iterate special input call skills for TeamAgent ([#188](https://github.com/AIGNE-io/aigne-framework/issues/188)) ([8cf06d3](https://github.com/AIGNE-io/aigne-framework/commit/8cf06d39172ed59ca93f34d893486f2bb7bd2e5a))

## [1.28.2](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.28.1...core-v1.28.2) (2025-07-01)


### Bug Fixes

* fix: compatible with node 20.0 & polish example defintions ([#209](https://github.com/AIGNE-io/aigne-framework/issues/209)) ([9752b96](https://github.com/AIGNE-io/aigne-framework/commit/9752b96dc54a44c6f710f056fe9205c0f2b0a73e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.3.2

## [1.28.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.28.0...core-v1.28.1) (2025-07-01)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability-api bumped to 0.3.1

## [1.28.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.27.0...core-v1.28.0) (2025-07-01)


### Features

* **example:** use AIGNE cli to run chat-bot example ([#198](https://github.com/AIGNE-io/aigne-framework/issues/198)) ([7085541](https://github.com/AIGNE-io/aigne-framework/commit/708554100692f2a557f7329ea78e46c3c870ce10))

## [1.27.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.26.0...core-v1.27.0) (2025-07-01)


### Features

* **cli:** support HTTPS_PROXY and named path param ([#196](https://github.com/AIGNE-io/aigne-framework/issues/196)) ([04e684e](https://github.com/AIGNE-io/aigne-framework/commit/04e684ee26bc2d79924b0e3cb541cd07a7191804))

## [1.26.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.25.0...core-v1.26.0) (2025-06-30)


### Features

* **ux:** polish tracing ux and update docs ([#193](https://github.com/AIGNE-io/aigne-framework/issues/193)) ([f80b63e](https://github.com/AIGNE-io/aigne-framework/commit/f80b63ecb1cfb00daa9b68330026da839d33f8a2))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability bumped to 0.3.0

## [1.25.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.24.1...core-v1.25.0) (2025-06-29)


### Features

* **observability:** tune trace ux and supoort incremental exporting ([#184](https://github.com/AIGNE-io/aigne-framework/issues/184)) ([d174188](https://github.com/AIGNE-io/aigne-framework/commit/d174188459c77acb09b5ca040972f83abb067587))


### Bug Fixes

* **core:** enable proper tracing for agent calls via message queue ([#191](https://github.com/AIGNE-io/aigne-framework/issues/191)) ([f8a4ce5](https://github.com/AIGNE-io/aigne-framework/commit/f8a4ce5fa54e0e01113b31fefcbd248b163980b2))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability bumped to 0.2.0

## [1.24.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.24.0...core-v1.24.1) (2025-06-26)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability bumped to 0.1.3

## [1.24.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.23.1...core-v1.24.0) (2025-06-26)


### Features

* **transport:** support invoke server side chat model ([#182](https://github.com/AIGNE-io/aigne-framework/issues/182)) ([f81a1bf](https://github.com/AIGNE-io/aigne-framework/commit/f81a1bf883abda1845ccee09b270e5f583e287ab))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability bumped to 0.1.2

## [1.23.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.23.0...core-v1.23.1) (2025-06-25)


### Bug Fixes

* **core:** pass input/output to MemoryAgent directily ([#178](https://github.com/AIGNE-io/aigne-framework/issues/178)) ([3b20e33](https://github.com/AIGNE-io/aigne-framework/commit/3b20e33f1eefc81ac1e009b1afff14fca46644b1))

## [1.23.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.22.0...core-v1.23.0) (2025-06-25)


### Features

* support remember custom fields from message ([#174](https://github.com/AIGNE-io/aigne-framework/issues/174)) ([664069d](https://github.com/AIGNE-io/aigne-framework/commit/664069d343137f69d0c103b2b5eff545ab0051fb))


### Bug Fixes

* **blocklet:** ensure only admins can access traces ([#173](https://github.com/AIGNE-io/aigne-framework/issues/173)) ([9c5cc06](https://github.com/AIGNE-io/aigne-framework/commit/9c5cc06c5841b9684d16c5c60af764d8c98c9c3e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability bumped to 0.1.1

## [1.22.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.21.0...core-v1.22.0) (2025-06-24)


### Features

* support observability for cli and blocklet ([#155](https://github.com/AIGNE-io/aigne-framework/issues/155)) ([5baa705](https://github.com/AIGNE-io/aigne-framework/commit/5baa705a33cfdba1efc5ccbe18674c27513ca97d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability bumped to 0.1.0


## [1.21.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.20.1...core-v1.21.0) (2025-06-20)


### Features

* **cli:** support pass named input to agent by --input-xxx ([#167](https://github.com/AIGNE-io/aigne-framework/issues/167)) ([cda5bb6](https://github.com/AIGNE-io/aigne-framework/commit/cda5bb6baab680787de1a042664fe34c17a84bb1))

## [1.20.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.20.0...core-v1.20.1) (2025-06-19)


### Bug Fixes

* use `inputKey` instead of implicit $message for AIAgent ([#165](https://github.com/AIGNE-io/aigne-framework/issues/165)) ([8b6e589](https://github.com/AIGNE-io/aigne-framework/commit/8b6e5896bba8209fd2eecb0f5b9263618bffdaf8))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/platform-helpers bumped to 0.1.2

## [1.20.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.19.0...core-v1.20.0) (2025-06-17)


### Features

* support return $meta output by enable returnMetadata option ([#163](https://github.com/AIGNE-io/aigne-framework/issues/163)) ([ac73759](https://github.com/AIGNE-io/aigne-framework/commit/ac73759615d44a09fa71b3bfbd3e9356ffe1d2ed))

## [1.19.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.18.6...core-v1.19.0) (2025-06-16)


### Features

* support respond progressing chunks by enable `returnProgressChunks` option for aigne.invoke ([cf4c313](https://github.com/AIGNE-io/aigne-framework/commit/cf4c313ee69f255be799ac196da675b79f69bf76))

## [1.18.6](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.18.5...core-v1.18.6) (2025-06-11)


### Bug Fixes

* **core:** add async generator polyfill for ReadableStream on safari ([#158](https://github.com/AIGNE-io/aigne-framework/issues/158)) ([70ef026](https://github.com/AIGNE-io/aigne-framework/commit/70ef026f413726c369f6a0781efc7f0333735406))
* **core:** exclude nested skills from final tool list in invokable skill ([#156](https://github.com/AIGNE-io/aigne-framework/issues/156)) ([91645f1](https://github.com/AIGNE-io/aigne-framework/commit/91645f12e79110a00f8f2db8ebc19401ddbd5a80))

## [1.18.5](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.18.4...core-v1.18.5) (2025-06-06)


### Bug Fixes

* **core:** should pass memories from invocation options to nested agents ([#153](https://github.com/AIGNE-io/aigne-framework/issues/153)) ([57629a5](https://github.com/AIGNE-io/aigne-framework/commit/57629a5da6cf2a295356dfe32ecbb15154e098fe))

## [1.18.4](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.18.3...core-v1.18.4) (2025-06-05)


### Bug Fixes

* **core:** prioritize returning json chunks ([#151](https://github.com/AIGNE-io/aigne-framework/issues/151)) ([8bf49a1](https://github.com/AIGNE-io/aigne-framework/commit/8bf49a18c083b33d2e0b35e8d0f22f68d9d6effa))

## [1.18.3](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.18.2...core-v1.18.3) (2025-06-05)


### Bug Fixes

* compatible nodejs version &gt;=20 ([#149](https://github.com/AIGNE-io/aigne-framework/issues/149)) ([d5ae9f2](https://github.com/AIGNE-io/aigne-framework/commit/d5ae9f245972e87e70fd87cdd960ade9940f288c))

## [1.18.2](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.18.1...core-v1.18.2) (2025-05-30)


### Bug Fixes

* provide available memories for AIGNE ([#145](https://github.com/AIGNE-io/aigne-framework/issues/145)) ([c5dc960](https://github.com/AIGNE-io/aigne-framework/commit/c5dc9605e0fb7ca60e1f5fa2f0da67ffec00c601))

## [1.18.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.18.0...core-v1.18.1) (2025-05-30)


### Bug Fixes

* respect DEBUG env for logger ([#142](https://github.com/AIGNE-io/aigne-framework/issues/142)) ([f84738a](https://github.com/AIGNE-io/aigne-framework/commit/f84738acb382d9fb4f47253fcf91c92c02200053))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/platform-helpers bumped to 0.1.1

## [1.18.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.17.0...core-v1.18.0) (2025-05-29)


### Features

* add memory agents support for client agent ([#139](https://github.com/AIGNE-io/aigne-framework/issues/139)) ([57044fa](https://github.com/AIGNE-io/aigne-framework/commit/57044fa87b8abcba395cd05f941d6d312ab65764))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/platform-helpers bumped to 0.1.0


## [1.17.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.16.0...core-v1.17.0) (2025-05-25)


### Features

* add user context support ([#131](https://github.com/AIGNE-io/aigne-framework/issues/131)) ([4dd9d20](https://github.com/AIGNE-io/aigne-framework/commit/4dd9d20953f6ac33933723db56efd9b44bafeb02))


## [1.16.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.15.0...core-v1.16.0) (2025-05-23)


### Features

* add `--chat` option for `run` command ([#120](https://github.com/AIGNE-io/aigne-framework/issues/120)) ([7699550](https://github.com/AIGNE-io/aigne-framework/commit/76995507001ca33b09b29f72ff588dae513cb340))
* **core:** support check output with guide rail agents ([#117](https://github.com/AIGNE-io/aigne-framework/issues/117)) ([bdf7ab3](https://github.com/AIGNE-io/aigne-framework/commit/bdf7ab31789379ba5b0fd920541a469cb86150ff))
* **core:** support lifecycle hooks for agent ([#124](https://github.com/AIGNE-io/aigne-framework/issues/124)) ([0af6afa](https://github.com/AIGNE-io/aigne-framework/commit/0af6afa923dcb917d545fd4535cabe7804fa84c9))
* **models:** publish model adapters as standalone packages ([#126](https://github.com/AIGNE-io/aigne-framework/issues/126)) ([588b8ae](https://github.com/AIGNE-io/aigne-framework/commit/588b8aea6abcee5fa87def1358bf51f84021c6ef))


### Bug Fixes

* automatically convert tool names to a valid format ([#128](https://github.com/AIGNE-io/aigne-framework/issues/128)) ([e9ee91d](https://github.com/AIGNE-io/aigne-framework/commit/e9ee91d9d782fa19000adb4cf95b9d65196ab651))

## [1.15.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.14.0...core-v1.15.0) (2025-05-15)


### Features

* optimize the stability of the model and ci ([#119](https://github.com/AIGNE-io/aigne-framework/issues/119)) ([de93887](https://github.com/AIGNE-io/aigne-framework/commit/de938879452a8be82a198dda0eda1eb9fcbb0474))


### Bug Fixes

* **core:** response.headers.toJSON is not a function ([#121](https://github.com/AIGNE-io/aigne-framework/issues/121)) ([4609ba6](https://github.com/AIGNE-io/aigne-framework/commit/4609ba645e6b8fe8d76ecd475cd2d7817483a4bd))

## [1.14.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.13.0...core-v1.14.0) (2025-05-12)


### Features

* **docs:** use typedoc build and publish docs to gh-pages ([#100](https://github.com/AIGNE-io/aigne-framework/issues/100)) ([b9074c0](https://github.com/AIGNE-io/aigne-framework/commit/b9074c0148ea343ada92b5919a52b47537a1ad48))
* **memory:** allow agents to act as retrievers and recorders in memory ([#65](https://github.com/AIGNE-io/aigne-framework/issues/65)) ([2bafcbb](https://github.com/AIGNE-io/aigne-framework/commit/2bafcbb66a94fcf55dad8c21ede483eaf075c11d))
* optimize the stability of ci and example ([#113](https://github.com/AIGNE-io/aigne-framework/issues/113)) ([d16ed6c](https://github.com/AIGNE-io/aigne-framework/commit/d16ed6cb60faea19fb4f1c12e1f83d69563b153f))


### Bug Fixes

* **core:** default catch tool's error and continue processing ([#115](https://github.com/AIGNE-io/aigne-framework/issues/115)) ([983b0de](https://github.com/AIGNE-io/aigne-framework/commit/983b0de491afb3f0904e145cb491d432b62f9312))
* **core:** handle response for UserAgent automatically in pub/sub mode ([#116](https://github.com/AIGNE-io/aigne-framework/issues/116)) ([b659714](https://github.com/AIGNE-io/aigne-framework/commit/b659714f2398ea042f21cb22eccc1014f181cd46))

## [1.13.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.12.0...core-v1.13.0) (2025-04-30)


### Features

* **core:** add BedrockChatModel support ([#101](https://github.com/AIGNE-io/aigne-framework/issues/101)) ([a0b98f0](https://github.com/AIGNE-io/aigne-framework/commit/a0b98f01bd78a135232226548848fa35a64982d1))


### Bug Fixes

* **core:** deduplicate tools for chat model ([#103](https://github.com/AIGNE-io/aigne-framework/issues/103)) ([570be6d](https://github.com/AIGNE-io/aigne-framework/commit/570be6d8620ab5b9a0149f835ecd4641009a8654))
* export server/client api types ([93e5341](https://github.com/AIGNE-io/aigne-framework/commit/93e5341dde7a6851f08a3d4e2f6c1a1db91765e9))

## [1.12.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.11.0...core-v1.12.0) (2025-04-27)


### Features

* add AIGNEServer/AIGNEClient api to serve agents via network ([#96](https://github.com/AIGNE-io/aigne-framework/issues/96)) ([1f2dfa3](https://github.com/AIGNE-io/aigne-framework/commit/1f2dfa3a6a2568373063cea3c874b573d0a248d3))
* **core:** support streamable http transport for mcp agents ([#92](https://github.com/AIGNE-io/aigne-framework/issues/92)) ([37da490](https://github.com/AIGNE-io/aigne-framework/commit/37da490538298d882ec328e4b3304395a6cd8cf7))
* support TeamAgent and finalize API naming ([#91](https://github.com/AIGNE-io/aigne-framework/issues/91)) ([033d1b6](https://github.com/AIGNE-io/aigne-framework/commit/033d1b6a7dc5460807476abb35a413ba89a2a664))


### Bug Fixes

* **core:** prioritize self model before falling back to context ([#97](https://github.com/AIGNE-io/aigne-framework/issues/97)) ([2a3d067](https://github.com/AIGNE-io/aigne-framework/commit/2a3d067442200657d8ef3b5314930cc14302f6bf))
* upgrade to streamable api for serve mcp command ([#98](https://github.com/AIGNE-io/aigne-framework/issues/98)) ([ae32bda](https://github.com/AIGNE-io/aigne-framework/commit/ae32bda20e57c2a2eb8b49fad034b0b2a5ebb15e))

## [1.11.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.10.0...core-v1.11.0) (2025-04-23)


### Features

* **core:** enhance ClaudeChatModel to support streaming responses ([#85](https://github.com/AIGNE-io/aigne-framework/issues/85)) ([5433240](https://github.com/AIGNE-io/aigne-framework/commit/5433240e7b663ec9e9f4a79dffa05038088d54fc))
* support set memory in agent yaml ([#90](https://github.com/AIGNE-io/aigne-framework/issues/90)) ([215118f](https://github.com/AIGNE-io/aigne-framework/commit/215118f1dc55f02322d59a3f18395a459198e031))


### Bug Fixes

* **core:** router model should support streaming response ([#88](https://github.com/AIGNE-io/aigne-framework/issues/88)) ([4fb4d92](https://github.com/AIGNE-io/aigne-framework/commit/4fb4d92f8b36011437efba3265591b2477f2d680))

## [1.10.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.9.0...core-v1.10.0) (2025-04-22)


### Features

* **stream:** add streaming output support for agent ([#73](https://github.com/AIGNE-io/aigne-framework/issues/73)) ([5f3ea4b](https://github.com/AIGNE-io/aigne-framework/commit/5f3ea4bccda7c8c457d6e9518b3d6a8b254ec041))


### Bug Fixes

* **core:** support dynamic model capability detection ([#72](https://github.com/AIGNE-io/aigne-framework/issues/72)) ([9d56d98](https://github.com/AIGNE-io/aigne-framework/commit/9d56d9885778962e5bef806445ad8c4d199f2c65))

## [1.9.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.8.0...core-v1.9.0) (2025-04-20)


### Features

* **core:** add model adapters for DeepSeek, Gemini, OpenRouter, and Ollama ([#53](https://github.com/AIGNE-io/aigne-framework/issues/53)) ([5d40546](https://github.com/AIGNE-io/aigne-framework/commit/5d40546bd5ddb70233d27ea3b20e5711b2af320a))


### Bug Fixes

* **dx:** custom error message for agent input/output validation ([#71](https://github.com/AIGNE-io/aigne-framework/issues/71)) ([5145673](https://github.com/AIGNE-io/aigne-framework/commit/5145673aaae2cd6665912e80b1c644e974c42b2f))

## [1.8.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.7.0...core-v1.8.0) (2025-04-17)


### Features

* **ci:** support coverage examples with model matrix ([#59](https://github.com/AIGNE-io/aigne-framework/issues/59)) ([1edd704](https://github.com/AIGNE-io/aigne-framework/commit/1edd70426b80a69e3751b2d5fe818297711d0777))
* **cli:** support model and download customization for aigne run ([#61](https://github.com/AIGNE-io/aigne-framework/issues/61)) ([51f6619](https://github.com/AIGNE-io/aigne-framework/commit/51f6619e6c591a84f1f2339b26ef66d89fa9486e))


### Bug Fixes

* **mcp:** set default timeout to 60s ([#67](https://github.com/AIGNE-io/aigne-framework/issues/67)) ([40dc029](https://github.com/AIGNE-io/aigne-framework/commit/40dc029b7795650283a505fd71b9566e5f0a4471))

## [1.7.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.6.0...core-v1.7.0) (2025-04-15)


### Features

* add TerminalTracer for better UX in terminal ([#56](https://github.com/AIGNE-io/aigne-framework/issues/56)) ([9875a5d](https://github.com/AIGNE-io/aigne-framework/commit/9875a5d46abb55073340ffae841fed6bd6b83ff4))
* **cli:** support run agents from remote URL ([#60](https://github.com/AIGNE-io/aigne-framework/issues/60)) ([5f49920](https://github.com/AIGNE-io/aigne-framework/commit/5f4992089d36f9e780ba55a912a1d35508cad28e))
* **core:** support oauth for McpAgent with example ([#55](https://github.com/AIGNE-io/aigne-framework/issues/55)) ([9420f3a](https://github.com/AIGNE-io/aigne-framework/commit/9420f3a56cf18986cd45f173044e660be76daab4))


### Bug Fixes

* remove usage of new Node.js exists API for compatibility ([#57](https://github.com/AIGNE-io/aigne-framework/issues/57)) ([c10cc08](https://github.com/AIGNE-io/aigne-framework/commit/c10cc086d8ecd0744f38cdb1367d4c8816b723b3))

## [1.6.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.5.0...core-v1.6.0) (2025-04-08)


### Features

* add `serve` command for @aigne/cli ([#54](https://github.com/AIGNE-io/aigne-framework/issues/54)) ([1cca843](https://github.com/AIGNE-io/aigne-framework/commit/1cca843f1760abe832b6651108fa858130f47355))
* add agent library support ([#51](https://github.com/AIGNE-io/aigne-framework/issues/51)) ([1f0d34d](https://github.com/AIGNE-io/aigne-framework/commit/1f0d34ddda3154283a4bc958ddb9b68b4ac106b0))
* support token/call/time limits for ExecutionEngine ([#44](https://github.com/AIGNE-io/aigne-framework/issues/44)) ([5a2ca0a](https://github.com/AIGNE-io/aigne-framework/commit/5a2ca0a033267dd4765f574b53dca71e932e53d4))


### Bug Fixes

* support reconnect to the MCP server automatically ([#50](https://github.com/AIGNE-io/aigne-framework/issues/50)) ([898d83f](https://github.com/AIGNE-io/aigne-framework/commit/898d83f75fc655142b93c70a1afeda376a2e92b4))

## [1.5.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.4.0...core-v1.5.0) (2025-03-27)


### Features

* **dx:** show mcp server url on connecting ([#39](https://github.com/AIGNE-io/aigne-framework/issues/39)) ([5819a76](https://github.com/AIGNE-io/aigne-framework/commit/5819a76435fae7333720f9e0c58a25aebc1089e3))


### Bug Fixes

* **dx:** export models/utils in submodules ([#43](https://github.com/AIGNE-io/aigne-framework/issues/43)) ([bd561b3](https://github.com/AIGNE-io/aigne-framework/commit/bd561b397de816f04c2d63d58538e81fba82fc7f))

## [1.4.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.3.1...core-v1.4.0) (2025-03-26)


### Features

* **core:** add xAI chat model adapter ([#34](https://github.com/AIGNE-io/aigne-framework/issues/34)) ([b228d22](https://github.com/AIGNE-io/aigne-framework/commit/b228d22b550535ab8e511f13de9e4a65dd73e3c0))


### Bug Fixes

* **orchestrator:** refactor and enhance orchestrator with step synthesis ([#31](https://github.com/AIGNE-io/aigne-framework/issues/31)) ([ba9fca0](https://github.com/AIGNE-io/aigne-framework/commit/ba9fca04fad71d49c8f4f52172b56668a94ea714))

## [1.3.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.3.0...core-v1.3.1) (2025-03-25)


### Bug Fixes

* **core:** use system message as user message for claude model if needed ([#32](https://github.com/AIGNE-io/aigne-framework/issues/32)) ([316a6d5](https://github.com/AIGNE-io/aigne-framework/commit/316a6d51f885cceee4020c24695f6588f6b7425f))

## [1.3.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.2.0...core-v1.3.0) (2025-03-24)


### Features

* add Agent FunctionAgent AIAgent MCPAgent and ExecutionEngine ([4d2a5a1](https://github.com/AIGNE-io/aigne-framework/commit/4d2a5a1b3366b8f935f50a0937c2da6e49073348))
* add OrchestratorAgent in agent library ([25a5e9e](https://github.com/AIGNE-io/aigne-framework/commit/25a5e9e6c60d747c8bf484ac884b31dc02c14757))
* add sequential and parallel helper function ([a295697](https://github.com/AIGNE-io/aigne-framework/commit/a295697b5694754e02954fc5c7f382a3b219a3ab))
* add support for MCP resources ([1ded2fb](https://github.com/AIGNE-io/aigne-framework/commit/1ded2fbf222fa8984e75df0852ff384524f73b04))
* **core:** add ChatModelClaude to use models of anthropic ([#30](https://github.com/AIGNE-io/aigne-framework/issues/30)) ([0a62a64](https://github.com/AIGNE-io/aigne-framework/commit/0a62a6499e3da723a4646e67952051708ce7de6a))
* **core:** add support for subscribing topics for agent memory ([#28](https://github.com/AIGNE-io/aigne-framework/issues/28)) ([eeecc67](https://github.com/AIGNE-io/aigne-framework/commit/eeecc67049a60ebcc4cdba0fbcd987b3d81f4af6))
* **prompt-builder:** support chat history in PromptBuilder ([6ca05f2](https://github.com/AIGNE-io/aigne-framework/commit/6ca05f28eddb683a4f1e228865f8bbf8a8e190f1))
* support run puppeteer example chat loop in terminal ([85ce7f8](https://github.com/AIGNE-io/aigne-framework/commit/85ce7f8de8b443c86e50815dd7bcab99f869c4ce))
* use PromptBuilder instead of string instructions ([e4cb2cb](https://github.com/AIGNE-io/aigne-framework/commit/e4cb2cb6baf4f9bcef390567a4a174e9246c29a3))


### Bug Fixes

* **AIAgent:** should pass both arguments (model generated) and input (user input) to tool ([c49d64e](https://github.com/AIGNE-io/aigne-framework/commit/c49d64ee35f7efd83b0f82f43205bb1c40f999e8))
* **core:** enforce stricter input/output type checks ([#26](https://github.com/AIGNE-io/aigne-framework/issues/26)) ([ef8cf53](https://github.com/AIGNE-io/aigne-framework/commit/ef8cf53586aff08a809909c56ab2a20f215fa129))
* **MCP:** catch list resource error treat as empty list ([1885fab](https://github.com/AIGNE-io/aigne-framework/commit/1885fab3585e0dd1467b127e5b47cd0b98282bab))
* rename @aigne/core-next to @aigne/core ([3a81009](https://github.com/AIGNE-io/aigne-framework/commit/3a8100962c81813217b687ae28e8de604419c622))
* use text resource from MCP correctly ([8b9eba8](https://github.com/AIGNE-io/aigne-framework/commit/8b9eba83352ec096a2a5d4f410d4c4bde7420bce))
