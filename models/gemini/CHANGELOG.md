# Changelog

## [0.14.11](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.11-beta.1...gemini-v0.14.11) (2025-11-28)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.69.1
  * devDependencies
    * @aigne/test-utils bumped to 0.5.64

## [0.14.11-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.11-beta...gemini-v0.14.11-beta.1) (2025-11-26)


### Bug Fixes

* **model:** handle large video files by uploading to Files API ([#769](https://github.com/AIGNE-io/aigne-framework/issues/769)) ([5fd7661](https://github.com/AIGNE-io/aigne-framework/commit/5fd76613bd7301cc76bde933de2095a6d86f8c7e))

## [0.14.11-beta](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.10...gemini-v0.14.11-beta) (2025-11-24)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.69.1-beta
  * devDependencies
    * @aigne/test-utils bumped to 0.5.64-beta

## [0.14.10](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.10-beta.4...gemini-v0.14.10) (2025-11-21)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.69.0
  * devDependencies
    * @aigne/test-utils bumped to 0.5.63

## [0.14.10-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.10-beta.3...gemini-v0.14.10-beta.4) (2025-11-21)


### Bug Fixes

* **gemini:** properly handle thinking level for gemini 3.x models ([#763](https://github.com/AIGNE-io/aigne-framework/issues/763)) ([a5dc892](https://github.com/AIGNE-io/aigne-framework/commit/a5dc8921635811ed9ca2ff9e3e0699006f79cf22))
* **gemini:** return reasoningEffort in model options for gemini-3 ([#765](https://github.com/AIGNE-io/aigne-framework/issues/765)) ([682bfda](https://github.com/AIGNE-io/aigne-framework/commit/682bfda353b31fd432232baa57f8e0b0838eb76d))

## [0.14.10-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.10-beta.2...gemini-v0.14.10-beta.3) (2025-11-19)


### Features

* **models:** support gemini 3.x thinking level and thoughtSignature ([#760](https://github.com/AIGNE-io/aigne-framework/issues/760)) ([243f2d4](https://github.com/AIGNE-io/aigne-framework/commit/243f2d457792a20ba2b87378576092e6f88e319c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.69.0-beta.2
  * devDependencies
    * @aigne/test-utils bumped to 0.5.63-beta.3

## [0.14.10-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.10-beta.1...gemini-v0.14.10-beta.2) (2025-11-18)


### Features

* add dynamic model options resolution with getter pattern ([#708](https://github.com/AIGNE-io/aigne-framework/issues/708)) ([5ed5085](https://github.com/AIGNE-io/aigne-framework/commit/5ed5085203763c70194853c56edc13acf56d81c6))
* add modalities support for chat model ([#454](https://github.com/AIGNE-io/aigne-framework/issues/454)) ([70d1bf6](https://github.com/AIGNE-io/aigne-framework/commit/70d1bf631f4e711235d89c6df8ee210a19179b30))
* add reasoningEffort option for chat model ([#680](https://github.com/AIGNE-io/aigne-framework/issues/680)) ([f69d232](https://github.com/AIGNE-io/aigne-framework/commit/f69d232d714d4a3e4946bdc8c6598747c9bcbd57))
* add thinking support to Gemini chat models ([#650](https://github.com/AIGNE-io/aigne-framework/issues/650)) ([09b828b](https://github.com/AIGNE-io/aigne-framework/commit/09b828ba668d90cc6aac68a5e8190adb146b5e45))
* **cli:** add retry functionality and improve error handling for AIGNE Hub ([#348](https://github.com/AIGNE-io/aigne-framework/issues/348)) ([672c93a](https://github.com/AIGNE-io/aigne-framework/commit/672c93abbba8b4b234f6d810536ff4b603a97e1e))
* improve image model architecture and file handling ([#527](https://github.com/AIGNE-io/aigne-framework/issues/527)) ([4db50aa](https://github.com/AIGNE-io/aigne-framework/commit/4db50aa0387a1a0f045ca11aaa61613e36ca7597))
* **memory:** support did space memory adapter ([#229](https://github.com/AIGNE-io/aigne-framework/issues/229)) ([6f69b64](https://github.com/AIGNE-io/aigne-framework/commit/6f69b64e98b963db9d6ab5357306b445385eaa68))
* **models:** support aigne hub models ([#416](https://github.com/AIGNE-io/aigne-framework/issues/416)) ([b4f014c](https://github.com/AIGNE-io/aigne-framework/commit/b4f014cf5ed08ef930d3ddfc278d3610e64c6af3))
* **models:** support gemini and ideogram images models ([#412](https://github.com/AIGNE-io/aigne-framework/issues/412)) ([6534fec](https://github.com/AIGNE-io/aigne-framework/commit/6534fecb0bdfb4b0a4440d44c0e563b9a029a68f))
* **models:** support gemini and ideogram images models ([#412](https://github.com/AIGNE-io/aigne-framework/issues/412)) ([6534fec](https://github.com/AIGNE-io/aigne-framework/commit/6534fecb0bdfb4b0a4440d44c0e563b9a029a68f))
* **model:** support video model ([#647](https://github.com/AIGNE-io/aigne-framework/issues/647)) ([de81742](https://github.com/AIGNE-io/aigne-framework/commit/de817421ef1dd3246d0d8c51ff12f0a855658f9f))
* support custom prefer input file type ([#469](https://github.com/AIGNE-io/aigne-framework/issues/469)) ([db0161b](https://github.com/AIGNE-io/aigne-framework/commit/db0161bbac52542c771ee2f40f361636b0668075))


### Bug Fixes

* add prefer input file type option for image model ([#536](https://github.com/AIGNE-io/aigne-framework/issues/536)) ([3cba8a5](https://github.com/AIGNE-io/aigne-framework/commit/3cba8a5562233a1567b49b6dd5c446c0760f5c4c))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* **core:** make getCredential async for aigne-hub mount point retrieval ([#372](https://github.com/AIGNE-io/aigne-framework/issues/372)) ([34ce7a6](https://github.com/AIGNE-io/aigne-framework/commit/34ce7a645fa83994d3dfe0f29ca70098cfecac9c))
* correct calculate token usage for gemini model ([7fd1328](https://github.com/AIGNE-io/aigne-framework/commit/7fd13289d3d0f8e062211f7c6dd5cb56e5318c1b))
* **docs:** update video mode docs ([#695](https://github.com/AIGNE-io/aigne-framework/issues/695)) ([d691001](https://github.com/AIGNE-io/aigne-framework/commit/d69100169457c16c14f2f3e2f7fcd6b2a99330f3))
* **gemini:** handle empty responses when files are present ([#648](https://github.com/AIGNE-io/aigne-framework/issues/648)) ([f4e259c](https://github.com/AIGNE-io/aigne-framework/commit/f4e259c5e5c687c347bb5cf29cbb0b5bf4d0d4a1))
* **gemini:** implement retry mechanism for empty responses with structured output fallback ([#638](https://github.com/AIGNE-io/aigne-framework/issues/638)) ([d33c8bb](https://github.com/AIGNE-io/aigne-framework/commit/d33c8bb9711aadddef9687d6cf472a179cd8ed9c))
* **gemini:** include thoughts token count in output token usage ([#669](https://github.com/AIGNE-io/aigne-framework/issues/669)) ([f6ff10c](https://github.com/AIGNE-io/aigne-framework/commit/f6ff10c33b0612a0bc416842c5a5bec3850a3fe6))
* **gemini:** should include at least one user message ([#521](https://github.com/AIGNE-io/aigne-framework/issues/521)) ([eb2752e](https://github.com/AIGNE-io/aigne-framework/commit/eb2752ed7d78f59c435ecc3ccb7227e804e3781e))
* **gemini:** use StructuredOutputError to trigger retry for missing JSON response ([#660](https://github.com/AIGNE-io/aigne-framework/issues/660)) ([e8826ed](https://github.com/AIGNE-io/aigne-framework/commit/e8826ed96db57bfcce0b577881bf0d2fd828c269))
* improve image model parameters ([#530](https://github.com/AIGNE-io/aigne-framework/issues/530)) ([d66b5ca](https://github.com/AIGNE-io/aigne-framework/commit/d66b5ca01e14baad2712cc1a84930cdb63703232))
* **models:** add image parameters support for video generation ([#684](https://github.com/AIGNE-io/aigne-framework/issues/684)) ([b048b7f](https://github.com/AIGNE-io/aigne-framework/commit/b048b7f92bd7a532dbdbeb6fb5fa5499bae6b953))
* **models:** add imageConfig to gemini image model ([#621](https://github.com/AIGNE-io/aigne-framework/issues/621)) ([252de7a](https://github.com/AIGNE-io/aigne-framework/commit/252de7a10701c4f5302c2fff977c88e5e833b7b1))
* **models:** add mineType for transform file ([#667](https://github.com/AIGNE-io/aigne-framework/issues/667)) ([155a173](https://github.com/AIGNE-io/aigne-framework/commit/155a173e75aff1dbe870a1305455a4300942e07a))
* **models:** aigne hub video params ([#665](https://github.com/AIGNE-io/aigne-framework/issues/665)) ([d00f836](https://github.com/AIGNE-io/aigne-framework/commit/d00f8368422d8e3707b974e1aff06714731ebb28))
* **models:** auto retry when got emtpy response from gemini ([#636](https://github.com/AIGNE-io/aigne-framework/issues/636)) ([9367cef](https://github.com/AIGNE-io/aigne-framework/commit/9367cef49ea4c0c87b8a36b454deb2efaee6886f))
* **models:** enhance gemini model tool use with status fields ([#634](https://github.com/AIGNE-io/aigne-framework/issues/634)) ([067b175](https://github.com/AIGNE-io/aigne-framework/commit/067b175c8e31bb5b1a6d0fc5a5cfb2d070d8d709))
* **models:** improve message structure handling and enable auto-message options ([#657](https://github.com/AIGNE-io/aigne-framework/issues/657)) ([233d70c](https://github.com/AIGNE-io/aigne-framework/commit/233d70cb292b937200fada8434f33d957d766ad6))
* **model:** transform local file to base64 before request llm ([#462](https://github.com/AIGNE-io/aigne-framework/issues/462)) ([58ef5d7](https://github.com/AIGNE-io/aigne-framework/commit/58ef5d77046c49f3c4eed15b7f0cc283cbbcd74a))
* **model:** updated default video duration settings for AI video models ([#663](https://github.com/AIGNE-io/aigne-framework/issues/663)) ([1203941](https://github.com/AIGNE-io/aigne-framework/commit/12039411aaef77ba665e8edfb0fe6f8097c43e39))
* should not return local path from aigne hub service ([#460](https://github.com/AIGNE-io/aigne-framework/issues/460)) ([c959717](https://github.com/AIGNE-io/aigne-framework/commit/c95971774f7e84dbeb3313f60b3e6464e2bb22e4))
* standardize file parameter naming across models ([#534](https://github.com/AIGNE-io/aigne-framework/issues/534)) ([f159a9d](https://github.com/AIGNE-io/aigne-framework/commit/f159a9d6af21ec0e99641996b150560929845845))
* support gemini-2.0-flash model for image model ([#429](https://github.com/AIGNE-io/aigne-framework/issues/429)) ([5a0bba1](https://github.com/AIGNE-io/aigne-framework/commit/5a0bba197cf8785384b70302f86cf702d04b7fc4))
* support optional field sturectured output for gemini ([#468](https://github.com/AIGNE-io/aigne-framework/issues/468)) ([70c6279](https://github.com/AIGNE-io/aigne-framework/commit/70c62795039a2862e3333f26707329489bf938de))
* **transport:** improve HTTP client option handling and error serialization ([#445](https://github.com/AIGNE-io/aigne-framework/issues/445)) ([d3bcdd2](https://github.com/AIGNE-io/aigne-framework/commit/d3bcdd23ab8011a7d40fc157fd61eb240494c7a5))
* update deps compatibility in CommonJS environment ([#580](https://github.com/AIGNE-io/aigne-framework/issues/580)) ([a1e35d0](https://github.com/AIGNE-io/aigne-framework/commit/a1e35d016405accb51c1aeb6a544503a1c78e912))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.69.0-beta.1
  * devDependencies
    * @aigne/test-utils bumped to 0.5.63-beta.2

## [0.14.10-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.10-beta...gemini-v0.14.10-beta.1) (2025-11-18)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.68.3-beta.1
  * devDependencies
    * @aigne/test-utils bumped to 0.5.63-beta.1

## [0.14.10-beta](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.9...gemini-v0.14.10-beta) (2025-11-17)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.68.3-beta
  * devDependencies
    * @aigne/test-utils bumped to 0.5.63-beta

## [0.14.9](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.9-beta...gemini-v0.14.9) (2025-11-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.68.2
  * devDependencies
    * @aigne/test-utils bumped to 0.5.62

## [0.14.9-beta](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.8...gemini-v0.14.9-beta) (2025-11-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.68.2-beta
  * devDependencies
    * @aigne/test-utils bumped to 0.5.62-beta

## [0.14.8](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.8-beta...gemini-v0.14.8) (2025-11-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.68.1
    * @aigne/platform-helpers bumped to 0.6.4
  * devDependencies
    * @aigne/test-utils bumped to 0.5.61

## [0.14.8-beta](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.7...gemini-v0.14.8-beta) (2025-11-15)


### Bug Fixes

* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.68.1-beta
    * @aigne/platform-helpers bumped to 0.6.4-beta
  * devDependencies
    * @aigne/test-utils bumped to 0.5.61-beta

## [0.14.7](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.7-beta...gemini-v0.14.7) (2025-11-14)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.68.0
  * devDependencies
    * @aigne/test-utils bumped to 0.5.60

## [0.14.7-beta](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.6...gemini-v0.14.7-beta) (2025-11-14)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.68.0-beta
  * devDependencies
    * @aigne/test-utils bumped to 0.5.60-beta

## [0.14.6](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.6-beta.4...gemini-v0.14.6) (2025-11-12)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.67.0
  * devDependencies
    * @aigne/test-utils bumped to 0.5.59

## [0.14.6-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.6-beta.3...gemini-v0.14.6-beta.4) (2025-11-12)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.67.0-beta.4
  * devDependencies
    * @aigne/test-utils bumped to 0.5.59-beta.4

## [0.14.6-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.6-beta.2...gemini-v0.14.6-beta.3) (2025-11-12)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.67.0-beta.3
  * devDependencies
    * @aigne/test-utils bumped to 0.5.59-beta.3

## [0.14.6-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.6-beta.1...gemini-v0.14.6-beta.2) (2025-11-12)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.67.0-beta.2
  * devDependencies
    * @aigne/test-utils bumped to 0.5.59-beta.2

## [0.14.6-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.6-beta...gemini-v0.14.6-beta.1) (2025-11-12)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.67.0-beta.1
  * devDependencies
    * @aigne/test-utils bumped to 0.5.59-beta.1

## [0.14.6-beta](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.5...gemini-v0.14.6-beta) (2025-11-11)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.67.0-beta
  * devDependencies
    * @aigne/test-utils bumped to 0.5.59-beta

## [0.14.5](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.5-beta.6...gemini-v0.14.5) (2025-11-07)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.66.0
  * devDependencies
    * @aigne/test-utils bumped to 0.5.58

## [0.14.5-beta.6](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.5-beta.5...gemini-v0.14.5-beta.6) (2025-11-07)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.66.0-beta.5
  * devDependencies
    * @aigne/test-utils bumped to 0.5.58-beta.6

## [0.14.5-beta.5](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.5-beta.4...gemini-v0.14.5-beta.5) (2025-11-06)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.66.0-beta.4
  * devDependencies
    * @aigne/test-utils bumped to 0.5.58-beta.5

## [0.14.5-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.5-beta.3...gemini-v0.14.5-beta.4) (2025-11-06)


### Features

* add dynamic model options resolution with getter pattern ([#708](https://github.com/AIGNE-io/aigne-framework/issues/708)) ([5ed5085](https://github.com/AIGNE-io/aigne-framework/commit/5ed5085203763c70194853c56edc13acf56d81c6))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.66.0-beta.3
  * devDependencies
    * @aigne/test-utils bumped to 0.5.58-beta.4

## [0.14.5-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.5-beta.2...gemini-v0.14.5-beta.3) (2025-11-05)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.65.1-beta.3
  * devDependencies
    * @aigne/test-utils bumped to 0.5.58-beta.3

## [0.14.5-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.5-beta.1...gemini-v0.14.5-beta.2) (2025-11-04)


### Bug Fixes

* **docs:** update video mode docs ([#695](https://github.com/AIGNE-io/aigne-framework/issues/695)) ([d691001](https://github.com/AIGNE-io/aigne-framework/commit/d69100169457c16c14f2f3e2f7fcd6b2a99330f3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.65.1-beta.2
  * devDependencies
    * @aigne/test-utils bumped to 0.5.58-beta.2

## [0.14.5-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.5-beta...gemini-v0.14.5-beta.1) (2025-11-04)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.65.1-beta.1
  * devDependencies
    * @aigne/test-utils bumped to 0.5.58-beta.1

## [0.14.5-beta](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.4...gemini-v0.14.5-beta) (2025-11-03)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.65.1-beta
  * devDependencies
    * @aigne/test-utils bumped to 0.5.58-beta

## [0.14.4](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.4-beta.8...gemini-v0.14.4) (2025-10-31)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.65.0
  * devDependencies
    * @aigne/test-utils bumped to 0.5.57

## [0.14.4-beta.8](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.4-beta.7...gemini-v0.14.4-beta.8) (2025-10-31)


### Bug Fixes

* **models:** add image parameters support for video generation ([#684](https://github.com/AIGNE-io/aigne-framework/issues/684)) ([b048b7f](https://github.com/AIGNE-io/aigne-framework/commit/b048b7f92bd7a532dbdbeb6fb5fa5499bae6b953))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.65.0-beta.5
  * devDependencies
    * @aigne/test-utils bumped to 0.5.57-beta.6

## [0.14.4-beta.7](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.4-beta.6...gemini-v0.14.4-beta.7) (2025-10-29)


### Features

* add reasoningEffort option for chat model ([#680](https://github.com/AIGNE-io/aigne-framework/issues/680)) ([f69d232](https://github.com/AIGNE-io/aigne-framework/commit/f69d232d714d4a3e4946bdc8c6598747c9bcbd57))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.65.0-beta.4
  * devDependencies
    * @aigne/test-utils bumped to 0.5.57-beta.5

## [0.14.4-beta.6](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.4-beta.5...gemini-v0.14.4-beta.6) (2025-10-28)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.65.0-beta.3
  * devDependencies
    * @aigne/test-utils bumped to 0.5.57-beta.4

## [0.14.4-beta.5](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.4-beta.4...gemini-v0.14.4-beta.5) (2025-10-28)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.65.0-beta.2
  * devDependencies
    * @aigne/test-utils bumped to 0.5.57-beta.3

## [0.14.4-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.4-beta.3...gemini-v0.14.4-beta.4) (2025-10-27)


### Bug Fixes

* **gemini:** include thoughts token count in output token usage ([#669](https://github.com/AIGNE-io/aigne-framework/issues/669)) ([f6ff10c](https://github.com/AIGNE-io/aigne-framework/commit/f6ff10c33b0612a0bc416842c5a5bec3850a3fe6))

## [0.14.4-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.4-beta.2...gemini-v0.14.4-beta.3) (2025-10-26)


### Bug Fixes

* **models:** add mineType for transform file ([#667](https://github.com/AIGNE-io/aigne-framework/issues/667)) ([155a173](https://github.com/AIGNE-io/aigne-framework/commit/155a173e75aff1dbe870a1305455a4300942e07a))
* **models:** aigne hub video params ([#665](https://github.com/AIGNE-io/aigne-framework/issues/665)) ([d00f836](https://github.com/AIGNE-io/aigne-framework/commit/d00f8368422d8e3707b974e1aff06714731ebb28))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.65.0-beta.1
  * devDependencies
    * @aigne/test-utils bumped to 0.5.57-beta.2

## [0.14.4-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.4-beta.1...gemini-v0.14.4-beta.2) (2025-10-24)


### Features

* **model:** support video model ([#647](https://github.com/AIGNE-io/aigne-framework/issues/647)) ([de81742](https://github.com/AIGNE-io/aigne-framework/commit/de817421ef1dd3246d0d8c51ff12f0a855658f9f))


### Bug Fixes

* **model:** updated default video duration settings for AI video models ([#663](https://github.com/AIGNE-io/aigne-framework/issues/663)) ([1203941](https://github.com/AIGNE-io/aigne-framework/commit/12039411aaef77ba665e8edfb0fe6f8097c43e39))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.65.0-beta
  * devDependencies
    * @aigne/test-utils bumped to 0.5.57-beta.1

## [0.14.4-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.4-beta...gemini-v0.14.4-beta.1) (2025-10-24)


### Bug Fixes

* **gemini:** use StructuredOutputError to trigger retry for missing JSON response ([#660](https://github.com/AIGNE-io/aigne-framework/issues/660)) ([e8826ed](https://github.com/AIGNE-io/aigne-framework/commit/e8826ed96db57bfcce0b577881bf0d2fd828c269))

## [0.14.4-beta](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.3...gemini-v0.14.4-beta) (2025-10-23)


### Bug Fixes

* **models:** improve message structure handling and enable auto-message options ([#657](https://github.com/AIGNE-io/aigne-framework/issues/657)) ([233d70c](https://github.com/AIGNE-io/aigne-framework/commit/233d70cb292b937200fada8434f33d957d766ad6))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.64.1-beta
  * devDependencies
    * @aigne/test-utils bumped to 0.5.57-beta

## [0.14.3](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.3-beta.1...gemini-v0.14.3) (2025-10-22)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.64.0
  * devDependencies
    * @aigne/test-utils bumped to 0.5.56

## [0.14.3-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.3-beta...gemini-v0.14.3-beta.1) (2025-10-22)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.64.0-beta.1
  * devDependencies
    * @aigne/test-utils bumped to 0.5.56-beta.1

## [0.14.3-beta](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.2...gemini-v0.14.3-beta) (2025-10-21)


### Features

* add thinking support to Gemini chat models ([#650](https://github.com/AIGNE-io/aigne-framework/issues/650)) ([09b828b](https://github.com/AIGNE-io/aigne-framework/commit/09b828ba668d90cc6aac68a5e8190adb146b5e45))


### Bug Fixes

* **gemini:** handle empty responses when files are present ([#648](https://github.com/AIGNE-io/aigne-framework/issues/648)) ([f4e259c](https://github.com/AIGNE-io/aigne-framework/commit/f4e259c5e5c687c347bb5cf29cbb0b5bf4d0d4a1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.64.0-beta
  * devDependencies
    * @aigne/test-utils bumped to 0.5.56-beta

## [0.14.2](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.2-beta.12...gemini-v0.14.2) (2025-10-19)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.63.0
  * devDependencies
    * @aigne/test-utils bumped to 0.5.55

## [0.14.2-beta.12](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.2-beta.11...gemini-v0.14.2-beta.12) (2025-10-17)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.63.0-beta.12
  * devDependencies
    * @aigne/test-utils bumped to 0.5.55-beta.12

## [0.14.2-beta.11](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.2-beta.10...gemini-v0.14.2-beta.11) (2025-10-17)


### Bug Fixes

* **gemini:** implement retry mechanism for empty responses with structured output fallback ([#638](https://github.com/AIGNE-io/aigne-framework/issues/638)) ([d33c8bb](https://github.com/AIGNE-io/aigne-framework/commit/d33c8bb9711aadddef9687d6cf472a179cd8ed9c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.63.0-beta.11
  * devDependencies
    * @aigne/test-utils bumped to 0.5.55-beta.11

## [0.14.2-beta.10](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.2-beta.9...gemini-v0.14.2-beta.10) (2025-10-16)


### Bug Fixes

* correct calculate token usage for gemini model ([7fd1328](https://github.com/AIGNE-io/aigne-framework/commit/7fd13289d3d0f8e062211f7c6dd5cb56e5318c1b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.63.0-beta.10
  * devDependencies
    * @aigne/test-utils bumped to 0.5.55-beta.10

## [0.14.2-beta.9](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.2-beta.8...gemini-v0.14.2-beta.9) (2025-10-16)


### Bug Fixes

* **models:** auto retry when got emtpy response from gemini ([#636](https://github.com/AIGNE-io/aigne-framework/issues/636)) ([9367cef](https://github.com/AIGNE-io/aigne-framework/commit/9367cef49ea4c0c87b8a36b454deb2efaee6886f))
* **models:** enhance gemini model tool use with status fields ([#634](https://github.com/AIGNE-io/aigne-framework/issues/634)) ([067b175](https://github.com/AIGNE-io/aigne-framework/commit/067b175c8e31bb5b1a6d0fc5a5cfb2d070d8d709))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.63.0-beta.9
  * devDependencies
    * @aigne/test-utils bumped to 0.5.55-beta.9

## [0.14.2-beta.8](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.2-beta.7...gemini-v0.14.2-beta.8) (2025-10-16)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.2-beta.8
  * devDependencies
    * @aigne/core bumped to 1.63.0-beta.8
    * @aigne/test-utils bumped to 0.5.55-beta.8

## [0.14.2-beta.7](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.2-beta.6...gemini-v0.14.2-beta.7) (2025-10-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.2-beta.7
  * devDependencies
    * @aigne/core bumped to 1.63.0-beta.7
    * @aigne/test-utils bumped to 0.5.55-beta.7

## [0.14.2-beta.6](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.2-beta.5...gemini-v0.14.2-beta.6) (2025-10-15)


### Bug Fixes

* **models:** add imageConfig to gemini image model ([#621](https://github.com/AIGNE-io/aigne-framework/issues/621)) ([252de7a](https://github.com/AIGNE-io/aigne-framework/commit/252de7a10701c4f5302c2fff977c88e5e833b7b1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.2-beta.6
  * devDependencies
    * @aigne/core bumped to 1.63.0-beta.6
    * @aigne/test-utils bumped to 0.5.55-beta.6

## [0.14.2-beta.5](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.2-beta.4...gemini-v0.14.2-beta.5) (2025-10-13)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.2-beta.5
  * devDependencies
    * @aigne/core bumped to 1.63.0-beta.5
    * @aigne/test-utils bumped to 0.5.55-beta.5

## [0.14.2-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.2-beta.3...gemini-v0.14.2-beta.4) (2025-10-12)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.2-beta.4
  * devDependencies
    * @aigne/core bumped to 1.63.0-beta.4
    * @aigne/test-utils bumped to 0.5.55-beta.4

## [0.14.2-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.2-beta.2...gemini-v0.14.2-beta.3) (2025-10-11)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.2-beta.3
  * devDependencies
    * @aigne/core bumped to 1.63.0-beta.3
    * @aigne/test-utils bumped to 0.5.55-beta.3

## [0.14.2-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.2-beta.1...gemini-v0.14.2-beta.2) (2025-10-09)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.2-beta.2
  * devDependencies
    * @aigne/core bumped to 1.63.0-beta.2
    * @aigne/test-utils bumped to 0.5.55-beta.2

## [0.14.2-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.2-beta...gemini-v0.14.2-beta.1) (2025-10-09)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.2-beta.1
  * devDependencies
    * @aigne/core bumped to 1.63.0-beta.1
    * @aigne/test-utils bumped to 0.5.55-beta.1

## [0.14.2-beta](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.1...gemini-v0.14.2-beta) (2025-10-07)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.2-beta
  * devDependencies
    * @aigne/core bumped to 1.63.0-beta
    * @aigne/test-utils bumped to 0.5.55-beta

## [0.14.1](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.1-beta.7...gemini-v0.14.1) (2025-10-04)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.1
  * devDependencies
    * @aigne/core bumped to 1.62.0
    * @aigne/test-utils bumped to 0.5.54

## [0.14.1-beta.7](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.1-beta.6...gemini-v0.14.1-beta.7) (2025-10-03)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.1-beta.7
  * devDependencies
    * @aigne/core bumped to 1.62.0-beta.6
    * @aigne/test-utils bumped to 0.5.54-beta.7

## [0.14.1-beta.6](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.1-beta.5...gemini-v0.14.1-beta.6) (2025-10-02)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.1-beta.6
  * devDependencies
    * @aigne/core bumped to 1.62.0-beta.5
    * @aigne/test-utils bumped to 0.5.54-beta.6

## [0.14.1-beta.5](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.1-beta.4...gemini-v0.14.1-beta.5) (2025-10-01)


### Bug Fixes

* update deps compatibility in CommonJS environment ([#580](https://github.com/AIGNE-io/aigne-framework/issues/580)) ([a1e35d0](https://github.com/AIGNE-io/aigne-framework/commit/a1e35d016405accb51c1aeb6a544503a1c78e912))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.1-beta.5
  * devDependencies
    * @aigne/core bumped to 1.62.0-beta.4
    * @aigne/test-utils bumped to 0.5.54-beta.5

## [0.14.1-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.1-beta.3...gemini-v0.14.1-beta.4) (2025-10-01)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.1-beta.4
  * devDependencies
    * @aigne/core bumped to 1.62.0-beta.3
    * @aigne/test-utils bumped to 0.5.54-beta.4

## [0.14.1-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.1-beta.2...gemini-v0.14.1-beta.3) (2025-10-01)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.1-beta.3
  * devDependencies
    * @aigne/core bumped to 1.62.0-beta.2
    * @aigne/test-utils bumped to 0.5.54-beta.3

## [0.14.1-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.1-beta.1...gemini-v0.14.1-beta.2) (2025-10-01)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.1-beta.2
  * devDependencies
    * @aigne/core bumped to 1.62.0-beta.1
    * @aigne/test-utils bumped to 0.5.54-beta.2

## [0.14.1-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.1-beta...gemini-v0.14.1-beta.1) (2025-09-30)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.1-beta.1
  * devDependencies
    * @aigne/core bumped to 1.62.0-beta
    * @aigne/test-utils bumped to 0.5.54-beta.1

## [0.14.1-beta](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.0...gemini-v0.14.1-beta) (2025-09-29)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.1-beta
  * devDependencies
    * @aigne/core bumped to 1.61.1-beta
    * @aigne/test-utils bumped to 0.5.54-beta

## [0.14.0](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.0-beta.9...gemini-v0.14.0) (2025-09-27)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.0
    * @aigne/platform-helpers bumped to 0.6.3
  * devDependencies
    * @aigne/core bumped to 1.61.0
    * @aigne/test-utils bumped to 0.5.53

## [0.14.0-beta.9](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.0-beta.8...gemini-v0.14.0-beta.9) (2025-09-26)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.0-beta.9
  * devDependencies
    * @aigne/core bumped to 1.61.0-beta.8
    * @aigne/test-utils bumped to 0.5.53-beta.8

## [0.14.0-beta.8](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.0-beta.7...gemini-v0.14.0-beta.8) (2025-09-26)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.0-beta.8
  * devDependencies
    * @aigne/core bumped to 1.61.0-beta.7
    * @aigne/test-utils bumped to 0.5.53-beta.7

## [0.14.0-beta.7](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.0-beta.6...gemini-v0.14.0-beta.7) (2025-09-26)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.0-beta.7
  * devDependencies
    * @aigne/core bumped to 1.61.0-beta.6
    * @aigne/test-utils bumped to 0.5.53-beta.6

## [0.14.0-beta.6](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.0-beta.5...gemini-v0.14.0-beta.6) (2025-09-25)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.0-beta.6
  * devDependencies
    * @aigne/core bumped to 1.61.0-beta.5
    * @aigne/test-utils bumped to 0.5.53-beta.5

## [0.14.0-beta.5](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.0-beta.4...gemini-v0.14.0-beta.5) (2025-09-25)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.0-beta.5
  * devDependencies
    * @aigne/core bumped to 1.61.0-beta.4
    * @aigne/test-utils bumped to 0.5.53-beta.4

## [0.14.0-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.0-beta.3...gemini-v0.14.0-beta.4) (2025-09-24)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.0-beta.4
  * devDependencies
    * @aigne/core bumped to 1.61.0-beta.3
    * @aigne/test-utils bumped to 0.5.53-beta.3

## [0.14.0-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.0-beta.2...gemini-v0.14.0-beta.3) (2025-09-23)


### Bug Fixes

* add prefer input file type option for image model ([#536](https://github.com/AIGNE-io/aigne-framework/issues/536)) ([3cba8a5](https://github.com/AIGNE-io/aigne-framework/commit/3cba8a5562233a1567b49b6dd5c446c0760f5c4c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.0-beta.3
  * devDependencies
    * @aigne/core bumped to 1.61.0-beta.2
    * @aigne/test-utils bumped to 0.5.53-beta.2

## [0.14.0-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.0-beta.1...gemini-v0.14.0-beta.2) (2025-09-23)


### Bug Fixes

* standardize file parameter naming across models ([#534](https://github.com/AIGNE-io/aigne-framework/issues/534)) ([f159a9d](https://github.com/AIGNE-io/aigne-framework/commit/f159a9d6af21ec0e99641996b150560929845845))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.0-beta.2
  * devDependencies
    * @aigne/core bumped to 1.61.0-beta.1
    * @aigne/test-utils bumped to 0.5.53-beta.1

## [0.14.0-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.0-beta...gemini-v0.14.0-beta.1) (2025-09-23)


### Bug Fixes

* improve image model parameters ([#530](https://github.com/AIGNE-io/aigne-framework/issues/530)) ([d66b5ca](https://github.com/AIGNE-io/aigne-framework/commit/d66b5ca01e14baad2712cc1a84930cdb63703232))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.0-beta.1

## [0.14.0-beta](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.13.5...gemini-v0.14.0-beta) (2025-09-22)


### Features

* improve image model architecture and file handling ([#527](https://github.com/AIGNE-io/aigne-framework/issues/527)) ([4db50aa](https://github.com/AIGNE-io/aigne-framework/commit/4db50aa0387a1a0f045ca11aaa61613e36ca7597))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.0-beta
    * @aigne/platform-helpers bumped to 0.6.3-beta
  * devDependencies
    * @aigne/core bumped to 1.61.0-beta
    * @aigne/test-utils bumped to 0.5.53-beta

## [0.13.5](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.13.4...gemini-v0.13.5) (2025-09-18)


### Bug Fixes

* **gemini:** should include at least one user message ([#521](https://github.com/AIGNE-io/aigne-framework/issues/521)) ([eb2752e](https://github.com/AIGNE-io/aigne-framework/commit/eb2752ed7d78f59c435ecc3ccb7227e804e3781e))

## [0.13.4](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.13.3...gemini-v0.13.4) (2025-09-18)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.15.4
  * devDependencies
    * @aigne/core bumped to 1.60.3
    * @aigne/test-utils bumped to 0.5.52

## [0.13.3](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.13.2...gemini-v0.13.3) (2025-09-11)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.15.3
  * devDependencies
    * @aigne/core bumped to 1.60.2
    * @aigne/test-utils bumped to 0.5.51

## [0.13.2](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.13.1...gemini-v0.13.2) (2025-09-11)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.15.2
  * devDependencies
    * @aigne/core bumped to 1.60.1
    * @aigne/test-utils bumped to 0.5.50

## [0.13.1](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.13.0...gemini-v0.13.1) (2025-09-10)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.15.1
  * devDependencies
    * @aigne/core bumped to 1.60.0
    * @aigne/test-utils bumped to 0.5.49

## [0.13.0](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.12.3...gemini-v0.13.0) (2025-09-09)


### Features

* support custom prefer input file type ([#469](https://github.com/AIGNE-io/aigne-framework/issues/469)) ([db0161b](https://github.com/AIGNE-io/aigne-framework/commit/db0161bbac52542c771ee2f40f361636b0668075))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.15.0
  * devDependencies
    * @aigne/core bumped to 1.59.0
    * @aigne/test-utils bumped to 0.5.48

## [0.12.3](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.12.2...gemini-v0.12.3) (2025-09-08)


### Bug Fixes

* support optional field sturectured output for gemini ([#468](https://github.com/AIGNE-io/aigne-framework/issues/468)) ([70c6279](https://github.com/AIGNE-io/aigne-framework/commit/70c62795039a2862e3333f26707329489bf938de))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.14.3
  * devDependencies
    * @aigne/core bumped to 1.58.3
    * @aigne/test-utils bumped to 0.5.47

## [0.12.2](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.12.1...gemini-v0.12.2) (2025-09-05)


### Bug Fixes

* **model:** transform local file to base64 before request llm ([#462](https://github.com/AIGNE-io/aigne-framework/issues/462)) ([58ef5d7](https://github.com/AIGNE-io/aigne-framework/commit/58ef5d77046c49f3c4eed15b7f0cc283cbbcd74a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.14.2
  * devDependencies
    * @aigne/core bumped to 1.58.2
    * @aigne/test-utils bumped to 0.5.46

## [0.12.1](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.12.0...gemini-v0.12.1) (2025-09-05)


### Bug Fixes

* should not return local path from aigne hub service ([#460](https://github.com/AIGNE-io/aigne-framework/issues/460)) ([c959717](https://github.com/AIGNE-io/aigne-framework/commit/c95971774f7e84dbeb3313f60b3e6464e2bb22e4))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.14.1
  * devDependencies
    * @aigne/core bumped to 1.58.1
    * @aigne/test-utils bumped to 0.5.45

## [0.12.0](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.11.6...gemini-v0.12.0) (2025-09-05)


### Features

* add modalities support for chat model ([#454](https://github.com/AIGNE-io/aigne-framework/issues/454)) ([70d1bf6](https://github.com/AIGNE-io/aigne-framework/commit/70d1bf631f4e711235d89c6df8ee210a19179b30))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.14.0
  * devDependencies
    * @aigne/core bumped to 1.58.0
    * @aigne/test-utils bumped to 0.5.44

## [0.11.6](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.11.5...gemini-v0.11.6) (2025-09-01)


### Bug Fixes

* **transport:** improve HTTP client option handling and error serialization ([#445](https://github.com/AIGNE-io/aigne-framework/issues/445)) ([d3bcdd2](https://github.com/AIGNE-io/aigne-framework/commit/d3bcdd23ab8011a7d40fc157fd61eb240494c7a5))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.13.7
  * devDependencies
    * @aigne/core bumped to 1.57.5
    * @aigne/test-utils bumped to 0.5.43

## [0.11.5](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.11.4...gemini-v0.11.5) (2025-08-30)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.13.6
  * devDependencies
    * @aigne/core bumped to 1.57.4
    * @aigne/test-utils bumped to 0.5.42

## [0.11.4](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.11.3...gemini-v0.11.4) (2025-08-30)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.13.5
  * devDependencies
    * @aigne/core bumped to 1.57.3
    * @aigne/test-utils bumped to 0.5.41

## [0.11.3](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.11.2...gemini-v0.11.3) (2025-08-29)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.13.4
  * devDependencies
    * @aigne/core bumped to 1.57.2
    * @aigne/test-utils bumped to 0.5.40

## [0.11.2](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.11.1...gemini-v0.11.2) (2025-08-29)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.13.3
  * devDependencies
    * @aigne/core bumped to 1.57.1
    * @aigne/test-utils bumped to 0.5.39

## [0.11.1](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.11.0...gemini-v0.11.1) (2025-08-28)


### Bug Fixes

* support gemini-2.0-flash model for image model ([#429](https://github.com/AIGNE-io/aigne-framework/issues/429)) ([5a0bba1](https://github.com/AIGNE-io/aigne-framework/commit/5a0bba197cf8785384b70302f86cf702d04b7fc4))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.13.2
  * devDependencies
    * @aigne/core bumped to 1.57.0
    * @aigne/test-utils bumped to 0.5.38

## [0.11.0](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.10.0...gemini-v0.11.0) (2025-08-27)


### Features

* **models:** support aigne hub models ([#416](https://github.com/AIGNE-io/aigne-framework/issues/416)) ([b4f014c](https://github.com/AIGNE-io/aigne-framework/commit/b4f014cf5ed08ef930d3ddfc278d3610e64c6af3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.13.1
  * devDependencies
    * @aigne/core bumped to 1.56.0
    * @aigne/test-utils bumped to 0.5.37

## [0.10.0](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.9.10...gemini-v0.10.0) (2025-08-27)


### Features

* **models:** support gemini and ideogram images models ([#412](https://github.com/AIGNE-io/aigne-framework/issues/412)) ([6534fec](https://github.com/AIGNE-io/aigne-framework/commit/6534fecb0bdfb4b0a4440d44c0e563b9a029a68f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.13.0

## [0.9.10](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.9.9...gemini-v0.9.10) (2025-08-26)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.12.4
  * devDependencies
    * @aigne/core bumped to 1.55.1
    * @aigne/test-utils bumped to 0.5.36

## [0.9.9](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.9.8...gemini-v0.9.9) (2025-08-25)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.12.3
  * devDependencies
    * @aigne/test-utils bumped to 0.5.35

## [0.9.8](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.9.7...gemini-v0.9.8) (2025-08-21)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.12.2
  * devDependencies
    * @aigne/core bumped to 1.55.0
    * @aigne/test-utils bumped to 0.5.34

## [0.9.7](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.9.6...gemini-v0.9.7) (2025-08-21)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.12.1
  * devDependencies
    * @aigne/core bumped to 1.54.0
    * @aigne/test-utils bumped to 0.5.33

## [0.9.6](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.9.5...gemini-v0.9.6) (2025-08-20)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.12.0
  * devDependencies
    * @aigne/core bumped to 1.53.0
    * @aigne/test-utils bumped to 0.5.32

## [0.9.5](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.9.4...gemini-v0.9.5) (2025-08-20)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.11.5
  * devDependencies
    * @aigne/core bumped to 1.52.0
    * @aigne/test-utils bumped to 0.5.31

## [0.9.4](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.9.3...gemini-v0.9.4) (2025-08-18)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.11.4
  * devDependencies
    * @aigne/core bumped to 1.51.0
    * @aigne/test-utils bumped to 0.5.30

## [0.9.3](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.9.2...gemini-v0.9.3) (2025-08-16)


### Bug Fixes

* **core:** make getCredential async for aigne-hub mount point retrieval ([#372](https://github.com/AIGNE-io/aigne-framework/issues/372)) ([34ce7a6](https://github.com/AIGNE-io/aigne-framework/commit/34ce7a645fa83994d3dfe0f29ca70098cfecac9c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.11.3
  * devDependencies
    * @aigne/core bumped to 1.50.1
    * @aigne/test-utils bumped to 0.5.29

## [0.9.2](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.9.1...gemini-v0.9.2) (2025-08-14)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.11.2
  * devDependencies
    * @aigne/core bumped to 1.50.0
    * @aigne/test-utils bumped to 0.5.28

## [0.9.1](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.9.0...gemini-v0.9.1) (2025-08-12)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.11.1
  * devDependencies
    * @aigne/core bumped to 1.49.1
    * @aigne/test-utils bumped to 0.5.27

## [0.9.0](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.8.17...gemini-v0.9.0) (2025-08-12)


### Features

* **cli:** add retry functionality and improve error handling for AIGNE Hub ([#348](https://github.com/AIGNE-io/aigne-framework/issues/348)) ([672c93a](https://github.com/AIGNE-io/aigne-framework/commit/672c93abbba8b4b234f6d810536ff4b603a97e1e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.11.0
  * devDependencies
    * @aigne/core bumped to 1.49.0
    * @aigne/test-utils bumped to 0.5.26

## [0.8.17](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.8.16...gemini-v0.8.17) (2025-08-12)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.17
  * devDependencies
    * @aigne/core bumped to 1.48.0
    * @aigne/test-utils bumped to 0.5.25

## [0.8.16](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.8.15...gemini-v0.8.16) (2025-08-11)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.16
  * devDependencies
    * @aigne/core bumped to 1.47.0
    * @aigne/test-utils bumped to 0.5.24

## [0.8.15](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.8.14...gemini-v0.8.15) (2025-08-08)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.15
  * devDependencies
    * @aigne/core bumped to 1.46.1
    * @aigne/test-utils bumped to 0.5.23

## [0.8.14](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.8.13...gemini-v0.8.14) (2025-08-06)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.14
  * devDependencies
    * @aigne/core bumped to 1.46.0
    * @aigne/test-utils bumped to 0.5.22

## [0.8.13](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.8.12...gemini-v0.8.13) (2025-08-06)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.13
  * devDependencies
    * @aigne/core bumped to 1.45.0
    * @aigne/test-utils bumped to 0.5.21

## [0.8.12](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.8.11...gemini-v0.8.12) (2025-08-05)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.12
  * devDependencies
    * @aigne/core bumped to 1.44.0
    * @aigne/test-utils bumped to 0.5.20

## [0.8.11](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.8.10...gemini-v0.8.11) (2025-08-05)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.11
  * devDependencies
    * @aigne/core bumped to 1.43.1
    * @aigne/test-utils bumped to 0.5.19

## [0.8.10](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.8.9...gemini-v0.8.10) (2025-08-04)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.10
  * devDependencies
    * @aigne/core bumped to 1.43.0
    * @aigne/test-utils bumped to 0.5.18

## [0.8.9](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.8.8...gemini-v0.8.9) (2025-08-01)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.9
  * devDependencies
    * @aigne/core bumped to 1.42.0
    * @aigne/test-utils bumped to 0.5.17

## [0.8.8](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.8.7...gemini-v0.8.8) (2025-07-31)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.8
  * devDependencies
    * @aigne/core bumped to 1.41.0
    * @aigne/test-utils bumped to 0.5.16

## [0.8.7](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.8.6...gemini-v0.8.7) (2025-07-31)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.7
  * devDependencies
    * @aigne/core bumped to 1.40.0
    * @aigne/test-utils bumped to 0.5.15

## [0.8.6](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.8.5...gemini-v0.8.6) (2025-07-28)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.6
  * devDependencies
    * @aigne/core bumped to 1.39.0
    * @aigne/test-utils bumped to 0.5.14

## [0.8.5](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.8.4...gemini-v0.8.5) (2025-07-24)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.5
  * devDependencies
    * @aigne/core bumped to 1.38.1
    * @aigne/test-utils bumped to 0.5.13

## [0.8.4](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.8.3...gemini-v0.8.4) (2025-07-24)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.4
  * devDependencies
    * @aigne/core bumped to 1.38.0
    * @aigne/test-utils bumped to 0.5.12

## [0.8.3](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.8.2...gemini-v0.8.3) (2025-07-22)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.3
  * devDependencies
    * @aigne/core bumped to 1.37.0
    * @aigne/test-utils bumped to 0.5.11

## [0.8.2](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.8.1...gemini-v0.8.2) (2025-07-17)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.2
  * devDependencies
    * @aigne/core bumped to 1.36.0
    * @aigne/test-utils bumped to 0.5.10

## [0.8.1](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.8.0...gemini-v0.8.1) (2025-07-17)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.1
  * devDependencies
    * @aigne/core bumped to 1.35.0
    * @aigne/test-utils bumped to 0.5.9

## [0.8.0](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.7.2...gemini-v0.8.0) (2025-07-15)


### Features

* **memory:** support did space memory adapter ([#229](https://github.com/AIGNE-io/aigne-framework/issues/229)) ([6f69b64](https://github.com/AIGNE-io/aigne-framework/commit/6f69b64e98b963db9d6ab5357306b445385eaa68))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.0
  * devDependencies
    * @aigne/core bumped to 1.34.0
    * @aigne/test-utils bumped to 0.5.8

## [0.7.2](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.7.1...gemini-v0.7.2) (2025-07-14)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.9.2
  * devDependencies
    * @aigne/core bumped to 1.33.2
    * @aigne/test-utils bumped to 0.5.7

## [0.7.1](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.7.0...gemini-v0.7.1) (2025-07-14)


### Bug Fixes

* **deps:** update deps to latest version ([#247](https://github.com/AIGNE-io/aigne-framework/issues/247)) ([3972f88](https://github.com/AIGNE-io/aigne-framework/commit/3972f887a9abff20c26da6b51c1071cbd54c0bf1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.9.1
  * devDependencies
    * @aigne/core bumped to 1.33.1
    * @aigne/test-utils bumped to 0.5.6

## [0.7.0](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.6.2...gemini-v0.7.0) (2025-07-10)


### Features

* **model:** reduce unnecessary LLM requests for structured output ([#241](https://github.com/AIGNE-io/aigne-framework/issues/241)) ([e28813c](https://github.com/AIGNE-io/aigne-framework/commit/e28813c021ed35c0251e198e2e007e2d746ab3d8))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.9.0
  * devDependencies
    * @aigne/core bumped to 1.33.0
    * @aigne/test-utils bumped to 0.5.5

## [0.6.2](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.6.1...gemini-v0.6.2) (2025-07-09)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.8.2
  * devDependencies
    * @aigne/core bumped to 1.32.2
    * @aigne/test-utils bumped to 0.5.4

## [0.6.1](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.6.0...gemini-v0.6.1) (2025-07-09)


### Bug Fixes

* **model:** ensure last message is not system role for gemini ([#231](https://github.com/AIGNE-io/aigne-framework/issues/231)) ([1b72e1e](https://github.com/AIGNE-io/aigne-framework/commit/1b72e1e6be98060aa32e68585142b2eea401d109))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.8.1
  * devDependencies
    * @aigne/core bumped to 1.32.1
    * @aigne/test-utils bumped to 0.5.3

## [0.6.0](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.5.1...gemini-v0.6.0) (2025-07-08)


### Features

* **core:** add jinja syntax support for prompt builder ([#230](https://github.com/AIGNE-io/aigne-framework/issues/230)) ([74436a7](https://github.com/AIGNE-io/aigne-framework/commit/74436a7faac0c59a32b0153481386162649f4357))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.8.0
  * devDependencies
    * @aigne/core bumped to 1.32.0
    * @aigne/test-utils bumped to 0.5.2

## [0.5.1](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.5.0...gemini-v0.5.1) (2025-07-04)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.7.1
  * devDependencies
    * @aigne/core bumped to 1.31.0
    * @aigne/test-utils bumped to 0.5.1

## [0.5.0](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.4.4...gemini-v0.5.0) (2025-07-03)


### Features

* upgrade dependencies and adapt code to breaking changes ([#216](https://github.com/AIGNE-io/aigne-framework/issues/216)) ([f215ced](https://github.com/AIGNE-io/aigne-framework/commit/f215cedc1a57e321164064c33316e496eae8d25f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.7.0
  * devDependencies
    * @aigne/core bumped to 1.30.0
    * @aigne/test-utils bumped to 0.5.0

## [0.4.4](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.4.3...gemini-v0.4.4) (2025-07-02)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.6.4
  * devDependencies
    * @aigne/core bumped to 1.29.1
    * @aigne/test-utils bumped to 0.4.16

## [0.4.3](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.4.2...gemini-v0.4.3) (2025-07-02)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.6.3
  * devDependencies
    * @aigne/core bumped to 1.29.0
    * @aigne/test-utils bumped to 0.4.15

## [0.4.2](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.4.1...gemini-v0.4.2) (2025-07-01)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.6.2
  * devDependencies
    * @aigne/core bumped to 1.28.2
    * @aigne/test-utils bumped to 0.4.14

## [0.4.1](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.4.0...gemini-v0.4.1) (2025-07-01)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.6.1
  * devDependencies
    * @aigne/core bumped to 1.28.1
    * @aigne/test-utils bumped to 0.4.13

## [0.4.0](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.3.11...gemini-v0.4.0) (2025-07-01)


### Features

* **example:** use AIGNE cli to run chat-bot example ([#198](https://github.com/AIGNE-io/aigne-framework/issues/198)) ([7085541](https://github.com/AIGNE-io/aigne-framework/commit/708554100692f2a557f7329ea78e46c3c870ce10))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.6.0
  * devDependencies
    * @aigne/core bumped to 1.28.0
    * @aigne/test-utils bumped to 0.4.12

## [0.3.11](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.3.10...gemini-v0.3.11) (2025-07-01)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.5.0
  * devDependencies
    * @aigne/core bumped to 1.27.0
    * @aigne/test-utils bumped to 0.4.11

## [0.3.10](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.3.9...gemini-v0.3.10) (2025-06-30)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.4.3
  * devDependencies
    * @aigne/core bumped to 1.26.0
    * @aigne/test-utils bumped to 0.4.10

## [0.3.9](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.3.8...gemini-v0.3.9) (2025-06-29)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.4.2
  * devDependencies
    * @aigne/core bumped to 1.25.0
    * @aigne/test-utils bumped to 0.4.9

## [0.3.8](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.3.7...gemini-v0.3.8) (2025-06-26)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.4.1
  * devDependencies
    * @aigne/core bumped to 1.24.1
    * @aigne/test-utils bumped to 0.4.8

## [0.3.7](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.3.6...gemini-v0.3.7) (2025-06-26)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.4.0
  * devDependencies
    * @aigne/core bumped to 1.24.0
    * @aigne/test-utils bumped to 0.4.7

## [0.3.6](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.3.5...gemini-v0.3.6) (2025-06-25)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.3.6
  * devDependencies
    * @aigne/core bumped to 1.23.1
    * @aigne/test-utils bumped to 0.4.6

## [0.3.5](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.3.4...gemini-v0.3.5) (2025-06-25)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.3.5
  * devDependencies
    * @aigne/core bumped to 1.23.0
    * @aigne/test-utils bumped to 0.4.5

## [0.3.4](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.3.3...gemini-v0.3.4) (2025-06-24)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.3.4
  * devDependencies
    * @aigne/core bumped to 1.22.0
    * @aigne/test-utils bumped to 0.4.4

## [0.3.3](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.3.2...gemini-v0.3.3) (2025-06-20)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.3.3
  * devDependencies
    * @aigne/core bumped to 1.21.0
    * @aigne/test-utils bumped to 0.4.3

## [0.3.2](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.3.1...gemini-v0.3.2) (2025-06-19)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.3.2
  * devDependencies
    * @aigne/core bumped to 1.20.1
    * @aigne/test-utils bumped to 0.4.2

## [0.3.1](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.3.0...gemini-v0.3.1) (2025-06-17)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.3.1
  * devDependencies
    * @aigne/core bumped to 1.20.0
    * @aigne/test-utils bumped to 0.4.1

## [0.3.0](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.2.7...gemini-v0.3.0) (2025-06-16)


### Features

* support respond progressing chunks by enable `returnProgressChunks` option for aigne.invoke ([cf4c313](https://github.com/AIGNE-io/aigne-framework/commit/cf4c313ee69f255be799ac196da675b79f69bf76))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.3.0
  * devDependencies
    * @aigne/core bumped to 1.19.0
    * @aigne/test-utils bumped to 0.4.0

## [0.2.7](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.2.6...gemini-v0.2.7) (2025-06-11)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.2.7
  * devDependencies
    * @aigne/core bumped to 1.18.6
    * @aigne/test-utils bumped to 0.3.8

## [0.2.6](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.2.5...gemini-v0.2.6) (2025-06-06)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.2.6
  * devDependencies
    * @aigne/core bumped to 1.18.5
    * @aigne/test-utils bumped to 0.3.7

## [0.2.5](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.2.4...gemini-v0.2.5) (2025-06-05)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.2.5
  * devDependencies
    * @aigne/core bumped to 1.18.4
    * @aigne/test-utils bumped to 0.3.6

## [0.2.4](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.2.3...gemini-v0.2.4) (2025-06-05)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.2.4
  * devDependencies
    * @aigne/core bumped to 1.18.3
    * @aigne/test-utils bumped to 0.3.5

## [0.2.3](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.2.2...gemini-v0.2.3) (2025-05-30)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.2.3
  * devDependencies
    * @aigne/core bumped to 1.18.2
    * @aigne/test-utils bumped to 0.3.4

## [0.2.2](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.2.1...gemini-v0.2.2) (2025-05-30)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.2.2
  * devDependencies
    * @aigne/core bumped to 1.18.1
    * @aigne/test-utils bumped to 0.3.3

## [0.2.1](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.2.0...gemini-v0.2.1) (2025-05-29)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.2.1
  * devDependencies
    * @aigne/core bumped to 1.18.0
    * @aigne/test-utils bumped to 0.3.2

## [0.2.0](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.1.0...gemini-v0.2.0) (2025-05-25)


### Features

* add user context support ([#131](https://github.com/AIGNE-io/aigne-framework/issues/131)) ([4dd9d20](https://github.com/AIGNE-io/aigne-framework/commit/4dd9d20953f6ac33933723db56efd9b44bafeb02))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.2.0
  * devDependencies
    * @aigne/core bumped to 1.17.0
    * @aigne/test-utils bumped to 0.3.1

## [0.1.0](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.0.1...gemini-v0.1.0) (2025-05-23)


### Features

* **models:** publish model adapters as standalone packages ([#126](https://github.com/AIGNE-io/aigne-framework/issues/126)) ([588b8ae](https://github.com/AIGNE-io/aigne-framework/commit/588b8aea6abcee5fa87def1358bf51f84021c6ef))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.1.0
  * devDependencies
    * @aigne/core bumped to 1.16.0
    * @aigne/test-utils bumped to 0.3.0
