## [1.22.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.21.0...core-v1.22.0) (2025-06-24)


### Features

* support observability for cli and blocklet ([#155](https://github.com/AIGNE-io/aigne-framework/issues/155)) ([5baa705](https://github.com/AIGNE-io/aigne-framework/commit/5baa705a33cfdba1efc5ccbe18674c27513ca97d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/observability bumped to 0.1.0

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
