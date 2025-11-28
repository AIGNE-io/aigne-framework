# Changelog

## [0.15.20](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.20-beta...transport-v0.15.20) (2025-11-28)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.11
  * devDependencies
    * @aigne/agent-library bumped to 1.22.1
    * @aigne/core bumped to 1.69.1
    * @aigne/default-memory bumped to 1.3.1
    * @aigne/test-utils bumped to 0.5.64

## [0.15.20-beta](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.19...transport-v0.15.20-beta) (2025-11-24)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.11-beta
  * devDependencies
    * @aigne/agent-library bumped to 1.22.1-beta
    * @aigne/core bumped to 1.69.1-beta
    * @aigne/default-memory bumped to 1.3.1-beta
    * @aigne/test-utils bumped to 0.5.64-beta

## [0.15.19](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.19-beta.3...transport-v0.15.19) (2025-11-21)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.10
  * devDependencies
    * @aigne/agent-library bumped to 1.22.0
    * @aigne/core bumped to 1.69.0
    * @aigne/default-memory bumped to 1.3.0
    * @aigne/test-utils bumped to 0.5.63

## [0.15.19-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.19-beta.2...transport-v0.15.19-beta.3) (2025-11-19)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.10-beta.3
  * devDependencies
    * @aigne/agent-library bumped to 1.22.0-beta.2
    * @aigne/core bumped to 1.69.0-beta.2
    * @aigne/default-memory bumped to 1.3.0-beta.2
    * @aigne/test-utils bumped to 0.5.63-beta.3

## [0.15.19-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.19-beta.1...transport-v0.15.19-beta.2) (2025-11-18)


### Features

* add dynamic model options resolution with getter pattern ([#708](https://github.com/AIGNE-io/aigne-framework/issues/708)) ([5ed5085](https://github.com/AIGNE-io/aigne-framework/commit/5ed5085203763c70194853c56edc13acf56d81c6))
* add modalities support for chat model ([#454](https://github.com/AIGNE-io/aigne-framework/issues/454)) ([70d1bf6](https://github.com/AIGNE-io/aigne-framework/commit/70d1bf631f4e711235d89c6df8ee210a19179b30))
* allow inserting agent-hub credits manually ([#315](https://github.com/AIGNE-io/aigne-framework/issues/315)) ([e3e4d1f](https://github.com/AIGNE-io/aigne-framework/commit/e3e4d1ff0d9d3fef33bb41d85e99735d4dd76cb7))
* **cli:** add retry functionality and improve error handling for AIGNE Hub ([#348](https://github.com/AIGNE-io/aigne-framework/issues/348)) ([672c93a](https://github.com/AIGNE-io/aigne-framework/commit/672c93abbba8b4b234f6d810536ff4b603a97e1e))
* **memory:** support did space memory adapter ([#229](https://github.com/AIGNE-io/aigne-framework/issues/229)) ([6f69b64](https://github.com/AIGNE-io/aigne-framework/commit/6f69b64e98b963db9d6ab5357306b445385eaa68))
* **model:** support aigne-hub model adapter ([#253](https://github.com/AIGNE-io/aigne-framework/issues/253)) ([4b33f8d](https://github.com/AIGNE-io/aigne-framework/commit/4b33f8d1a819f52357db81d502c56b55eaa0669f))
* support google model and skip check mode when connected to Hub ([#300](https://github.com/AIGNE-io/aigne-framework/issues/300)) ([e992c0f](https://github.com/AIGNE-io/aigne-framework/commit/e992c0f3335a7c512fa807d5b8ad10c9c3bf2351))
* **transport:** add retry mechanism to HTTP client ([#364](https://github.com/AIGNE-io/aigne-framework/issues/364)) ([85dfab0](https://github.com/AIGNE-io/aigne-framework/commit/85dfab0d285199137edea47199c448247823258c))


### Bug Fixes

* add configurable timeout for fetch requests and set 3min timeout for hub video model ([4eb7f3d](https://github.com/AIGNE-io/aigne-framework/commit/4eb7f3df590992742706197bcb48b4db35ccc948))
* add fetch utility with timeout and enhanced error handling ([#694](https://github.com/AIGNE-io/aigne-framework/issues/694)) ([c2d4076](https://github.com/AIGNE-io/aigne-framework/commit/c2d4076ec590150d2751591a4f723721f78381e9))
* add missing dependencies ([#280](https://github.com/AIGNE-io/aigne-framework/issues/280)) ([5da315e](https://github.com/AIGNE-io/aigne-framework/commit/5da315e29dc02818293e74ad159294f137e2c7f7))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* **cli:** log only once in loadAIGNE ([#357](https://github.com/AIGNE-io/aigne-framework/issues/357)) ([6e6d968](https://github.com/AIGNE-io/aigne-framework/commit/6e6d96814fbc87f210522ae16daf94c1f84f311a))
* **cli:** reduce memory usage of AIGNE CLI ([#411](https://github.com/AIGNE-io/aigne-framework/issues/411)) ([9c36969](https://github.com/AIGNE-io/aigne-framework/commit/9c369699d966d37abf2d6a1624eac3d2fda4123b))
* **core:** add optional memory context toggle for AI agent ([#350](https://github.com/AIGNE-io/aigne-framework/issues/350)) ([92322cc](https://github.com/AIGNE-io/aigne-framework/commit/92322ccaf6f2b6e4440d47a7631589061c351d64))
* **core:** make getCredential async for aigne-hub mount point retrieval ([#372](https://github.com/AIGNE-io/aigne-framework/issues/372)) ([34ce7a6](https://github.com/AIGNE-io/aigne-framework/commit/34ce7a645fa83994d3dfe0f29ca70098cfecac9c))
* **core:** share skills/agents from context ([#309](https://github.com/AIGNE-io/aigne-framework/issues/309)) ([88dd849](https://github.com/AIGNE-io/aigne-framework/commit/88dd849954c6f3fb68df238be22be3371c734e6e))
* support error hooks for AIGNEHTTPServer ([#456](https://github.com/AIGNE-io/aigne-framework/issues/456)) ([37197c8](https://github.com/AIGNE-io/aigne-framework/commit/37197c8f2db757974f35ce836be12f07b568b4c6))
* **transport:** improve HTTP client option handling and error serialization ([#445](https://github.com/AIGNE-io/aigne-framework/issues/445)) ([d3bcdd2](https://github.com/AIGNE-io/aigne-framework/commit/d3bcdd23ab8011a7d40fc157fd61eb240494c7a5))
* **transport:** improve HTTP error status code validation ([#703](https://github.com/AIGNE-io/aigne-framework/issues/703)) ([76791d7](https://github.com/AIGNE-io/aigne-framework/commit/76791d760fc319c0c0edb82d19474d6141240a8e))
* **transport:** simplify ClientAgentOptions interface ([#394](https://github.com/AIGNE-io/aigne-framework/issues/394)) ([001271a](https://github.com/AIGNE-io/aigne-framework/commit/001271a46a7a734cd28f3dae28303c11f01861a7))
* update deps compatibility in CommonJS environment ([#580](https://github.com/AIGNE-io/aigne-framework/issues/580)) ([a1e35d0](https://github.com/AIGNE-io/aigne-framework/commit/a1e35d016405accb51c1aeb6a544503a1c78e912))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.10-beta.2
  * devDependencies
    * @aigne/agent-library bumped to 1.22.0-beta.1
    * @aigne/core bumped to 1.69.0-beta.1
    * @aigne/default-memory bumped to 1.3.0-beta.1
    * @aigne/test-utils bumped to 0.5.63-beta.2

## [0.15.19-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.19-beta...transport-v0.15.19-beta.1) (2025-11-18)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.10-beta.1
  * devDependencies
    * @aigne/agent-library bumped to 1.21.56-beta.1
    * @aigne/core bumped to 1.68.3-beta.1
    * @aigne/default-memory bumped to 1.2.19-beta.1
    * @aigne/test-utils bumped to 0.5.63-beta.1

## [0.15.19-beta](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.18...transport-v0.15.19-beta) (2025-11-17)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.10-beta
  * devDependencies
    * @aigne/agent-library bumped to 1.21.56-beta
    * @aigne/core bumped to 1.68.3-beta
    * @aigne/default-memory bumped to 1.2.19-beta
    * @aigne/test-utils bumped to 0.5.63-beta

## [0.15.18](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.18-beta...transport-v0.15.18) (2025-11-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.9
  * devDependencies
    * @aigne/agent-library bumped to 1.21.55
    * @aigne/core bumped to 1.68.2
    * @aigne/default-memory bumped to 1.2.18
    * @aigne/test-utils bumped to 0.5.62

## [0.15.18-beta](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.17...transport-v0.15.18-beta) (2025-11-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.9-beta
  * devDependencies
    * @aigne/agent-library bumped to 1.21.55-beta
    * @aigne/core bumped to 1.68.2-beta
    * @aigne/default-memory bumped to 1.2.18-beta
    * @aigne/test-utils bumped to 0.5.62-beta

## [0.15.17](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.17-beta...transport-v0.15.17) (2025-11-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.8
  * devDependencies
    * @aigne/agent-library bumped to 1.21.54
    * @aigne/core bumped to 1.68.1
    * @aigne/default-memory bumped to 1.2.17
    * @aigne/test-utils bumped to 0.5.61

## [0.15.17-beta](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.16...transport-v0.15.17-beta) (2025-11-15)


### Bug Fixes

* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.8-beta
  * devDependencies
    * @aigne/agent-library bumped to 1.21.54-beta
    * @aigne/core bumped to 1.68.1-beta
    * @aigne/default-memory bumped to 1.2.17-beta
    * @aigne/test-utils bumped to 0.5.61-beta

## [0.15.16](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.16-beta...transport-v0.15.16) (2025-11-14)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.7
  * devDependencies
    * @aigne/agent-library bumped to 1.21.53
    * @aigne/core bumped to 1.68.0
    * @aigne/default-memory bumped to 1.2.16
    * @aigne/test-utils bumped to 0.5.60

## [0.15.16-beta](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.15...transport-v0.15.16-beta) (2025-11-14)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.7-beta
  * devDependencies
    * @aigne/agent-library bumped to 1.21.53-beta
    * @aigne/core bumped to 1.68.0-beta
    * @aigne/default-memory bumped to 1.2.16-beta
    * @aigne/test-utils bumped to 0.5.60-beta

## [0.15.15](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.15-beta.4...transport-v0.15.15) (2025-11-12)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.6
  * devDependencies
    * @aigne/agent-library bumped to 1.21.52
    * @aigne/core bumped to 1.67.0
    * @aigne/default-memory bumped to 1.2.15
    * @aigne/test-utils bumped to 0.5.59

## [0.15.15-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.15-beta.3...transport-v0.15.15-beta.4) (2025-11-12)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.6-beta.4
  * devDependencies
    * @aigne/agent-library bumped to 1.21.52-beta.4
    * @aigne/core bumped to 1.67.0-beta.4
    * @aigne/default-memory bumped to 1.2.15-beta.4
    * @aigne/test-utils bumped to 0.5.59-beta.4

## [0.15.15-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.15-beta.2...transport-v0.15.15-beta.3) (2025-11-12)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.6-beta.3
  * devDependencies
    * @aigne/agent-library bumped to 1.21.52-beta.3
    * @aigne/core bumped to 1.67.0-beta.3
    * @aigne/default-memory bumped to 1.2.15-beta.3
    * @aigne/test-utils bumped to 0.5.59-beta.3

## [0.15.15-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.15-beta.1...transport-v0.15.15-beta.2) (2025-11-12)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.6-beta.2
  * devDependencies
    * @aigne/agent-library bumped to 1.21.52-beta.2
    * @aigne/core bumped to 1.67.0-beta.2
    * @aigne/default-memory bumped to 1.2.15-beta.2
    * @aigne/test-utils bumped to 0.5.59-beta.2

## [0.15.15-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.15-beta...transport-v0.15.15-beta.1) (2025-11-12)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.6-beta.1
  * devDependencies
    * @aigne/agent-library bumped to 1.21.52-beta.1
    * @aigne/core bumped to 1.67.0-beta.1
    * @aigne/default-memory bumped to 1.2.15-beta.1
    * @aigne/test-utils bumped to 0.5.59-beta.1

## [0.15.15-beta](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.14...transport-v0.15.15-beta) (2025-11-11)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.6-beta
  * devDependencies
    * @aigne/agent-library bumped to 1.21.52-beta
    * @aigne/core bumped to 1.67.0-beta
    * @aigne/default-memory bumped to 1.2.15-beta
    * @aigne/test-utils bumped to 0.5.59-beta

## [0.15.14](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.14-beta.6...transport-v0.15.14) (2025-11-07)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.5
  * devDependencies
    * @aigne/agent-library bumped to 1.21.51
    * @aigne/core bumped to 1.66.0
    * @aigne/default-memory bumped to 1.2.14
    * @aigne/test-utils bumped to 0.5.58

## [0.15.14-beta.6](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.14-beta.5...transport-v0.15.14-beta.6) (2025-11-07)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.5-beta.6
  * devDependencies
    * @aigne/agent-library bumped to 1.21.51-beta.6
    * @aigne/core bumped to 1.66.0-beta.5
    * @aigne/default-memory bumped to 1.2.14-beta.6
    * @aigne/test-utils bumped to 0.5.58-beta.6

## [0.15.14-beta.5](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.14-beta.4...transport-v0.15.14-beta.5) (2025-11-06)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.5-beta.5
  * devDependencies
    * @aigne/agent-library bumped to 1.21.51-beta.5
    * @aigne/core bumped to 1.66.0-beta.4
    * @aigne/default-memory bumped to 1.2.14-beta.5
    * @aigne/test-utils bumped to 0.5.58-beta.5

## [0.15.14-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.14-beta.3...transport-v0.15.14-beta.4) (2025-11-06)


### Features

* add dynamic model options resolution with getter pattern ([#708](https://github.com/AIGNE-io/aigne-framework/issues/708)) ([5ed5085](https://github.com/AIGNE-io/aigne-framework/commit/5ed5085203763c70194853c56edc13acf56d81c6))


### Bug Fixes

* add configurable timeout for fetch requests and set 3min timeout for hub video model ([4eb7f3d](https://github.com/AIGNE-io/aigne-framework/commit/4eb7f3df590992742706197bcb48b4db35ccc948))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.5-beta.4
  * devDependencies
    * @aigne/agent-library bumped to 1.21.51-beta.4
    * @aigne/core bumped to 1.66.0-beta.3
    * @aigne/default-memory bumped to 1.2.14-beta.4
    * @aigne/test-utils bumped to 0.5.58-beta.4

## [0.15.14-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.14-beta.2...transport-v0.15.14-beta.3) (2025-11-05)


### Bug Fixes

* **transport:** improve HTTP error status code validation ([#703](https://github.com/AIGNE-io/aigne-framework/issues/703)) ([76791d7](https://github.com/AIGNE-io/aigne-framework/commit/76791d760fc319c0c0edb82d19474d6141240a8e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.5-beta.3
  * devDependencies
    * @aigne/agent-library bumped to 1.21.51-beta.3
    * @aigne/core bumped to 1.65.1-beta.3
    * @aigne/default-memory bumped to 1.2.14-beta.3
    * @aigne/test-utils bumped to 0.5.58-beta.3

## [0.15.14-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.14-beta.1...transport-v0.15.14-beta.2) (2025-11-04)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.5-beta.2
  * devDependencies
    * @aigne/agent-library bumped to 1.21.51-beta.2
    * @aigne/core bumped to 1.65.1-beta.2
    * @aigne/default-memory bumped to 1.2.14-beta.2
    * @aigne/test-utils bumped to 0.5.58-beta.2

## [0.15.14-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.14-beta...transport-v0.15.14-beta.1) (2025-11-04)


### Bug Fixes

* add fetch utility with timeout and enhanced error handling ([#694](https://github.com/AIGNE-io/aigne-framework/issues/694)) ([c2d4076](https://github.com/AIGNE-io/aigne-framework/commit/c2d4076ec590150d2751591a4f723721f78381e9))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.5-beta.1
  * devDependencies
    * @aigne/agent-library bumped to 1.21.51-beta.1
    * @aigne/core bumped to 1.65.1-beta.1
    * @aigne/default-memory bumped to 1.2.14-beta.1
    * @aigne/test-utils bumped to 0.5.58-beta.1

## [0.15.14-beta](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.13...transport-v0.15.14-beta) (2025-11-03)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.5-beta
  * devDependencies
    * @aigne/agent-library bumped to 1.21.51-beta
    * @aigne/core bumped to 1.65.1-beta
    * @aigne/default-memory bumped to 1.2.14-beta
    * @aigne/test-utils bumped to 0.5.58-beta

## [0.15.13](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.13-beta.6...transport-v0.15.13) (2025-10-31)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.4
  * devDependencies
    * @aigne/agent-library bumped to 1.21.50
    * @aigne/core bumped to 1.65.0
    * @aigne/default-memory bumped to 1.2.13
    * @aigne/test-utils bumped to 0.5.57

## [0.15.13-beta.6](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.13-beta.5...transport-v0.15.13-beta.6) (2025-10-31)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.4-beta.6
  * devDependencies
    * @aigne/agent-library bumped to 1.21.50-beta.6
    * @aigne/core bumped to 1.65.0-beta.5
    * @aigne/default-memory bumped to 1.2.13-beta.6
    * @aigne/test-utils bumped to 0.5.57-beta.6

## [0.15.13-beta.5](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.13-beta.4...transport-v0.15.13-beta.5) (2025-10-29)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.4-beta.5
  * devDependencies
    * @aigne/agent-library bumped to 1.21.50-beta.5
    * @aigne/core bumped to 1.65.0-beta.4
    * @aigne/default-memory bumped to 1.2.13-beta.5
    * @aigne/test-utils bumped to 0.5.57-beta.5

## [0.15.13-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.13-beta.3...transport-v0.15.13-beta.4) (2025-10-28)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.4-beta.4
  * devDependencies
    * @aigne/agent-library bumped to 1.21.50-beta.4
    * @aigne/core bumped to 1.65.0-beta.3
    * @aigne/default-memory bumped to 1.2.13-beta.4
    * @aigne/test-utils bumped to 0.5.57-beta.4

## [0.15.13-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.13-beta.2...transport-v0.15.13-beta.3) (2025-10-28)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.4-beta.3
  * devDependencies
    * @aigne/agent-library bumped to 1.21.50-beta.3
    * @aigne/core bumped to 1.65.0-beta.2
    * @aigne/default-memory bumped to 1.2.13-beta.3
    * @aigne/test-utils bumped to 0.5.57-beta.3

## [0.15.13-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.13-beta.1...transport-v0.15.13-beta.2) (2025-10-26)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.4-beta.2
  * devDependencies
    * @aigne/agent-library bumped to 1.21.50-beta.2
    * @aigne/core bumped to 1.65.0-beta.1
    * @aigne/default-memory bumped to 1.2.13-beta.2
    * @aigne/test-utils bumped to 0.5.57-beta.2

## [0.15.13-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.13-beta...transport-v0.15.13-beta.1) (2025-10-24)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.4-beta.1
  * devDependencies
    * @aigne/agent-library bumped to 1.21.50-beta.1
    * @aigne/core bumped to 1.65.0-beta
    * @aigne/default-memory bumped to 1.2.13-beta.1
    * @aigne/test-utils bumped to 0.5.57-beta.1

## [0.15.13-beta](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.12...transport-v0.15.13-beta) (2025-10-23)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.4-beta
  * devDependencies
    * @aigne/agent-library bumped to 1.21.50-beta
    * @aigne/core bumped to 1.64.1-beta
    * @aigne/default-memory bumped to 1.2.13-beta
    * @aigne/test-utils bumped to 0.5.57-beta

## [0.15.12](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.12-beta.1...transport-v0.15.12) (2025-10-22)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.3
  * devDependencies
    * @aigne/agent-library bumped to 1.21.49
    * @aigne/core bumped to 1.64.0
    * @aigne/default-memory bumped to 1.2.12
    * @aigne/test-utils bumped to 0.5.56

## [0.15.12-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.12-beta...transport-v0.15.12-beta.1) (2025-10-22)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.3-beta.1
  * devDependencies
    * @aigne/agent-library bumped to 1.21.49-beta.1
    * @aigne/core bumped to 1.64.0-beta.1
    * @aigne/default-memory bumped to 1.2.12-beta.1
    * @aigne/test-utils bumped to 0.5.56-beta.1

## [0.15.12-beta](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.11...transport-v0.15.12-beta) (2025-10-21)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.3-beta
  * devDependencies
    * @aigne/agent-library bumped to 1.21.49-beta
    * @aigne/core bumped to 1.64.0-beta
    * @aigne/default-memory bumped to 1.2.12-beta
    * @aigne/test-utils bumped to 0.5.56-beta

## [0.15.11](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.11-beta.12...transport-v0.15.11) (2025-10-19)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.2
  * devDependencies
    * @aigne/agent-library bumped to 1.21.48
    * @aigne/core bumped to 1.63.0
    * @aigne/default-memory bumped to 1.2.11
    * @aigne/test-utils bumped to 0.5.55

## [0.15.11-beta.12](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.11-beta.11...transport-v0.15.11-beta.12) (2025-10-17)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.2-beta.12
  * devDependencies
    * @aigne/agent-library bumped to 1.21.48-beta.12
    * @aigne/core bumped to 1.63.0-beta.12
    * @aigne/default-memory bumped to 1.2.11-beta.12
    * @aigne/test-utils bumped to 0.5.55-beta.12

## [0.15.11-beta.11](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.11-beta.10...transport-v0.15.11-beta.11) (2025-10-17)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.2-beta.11
  * devDependencies
    * @aigne/agent-library bumped to 1.21.48-beta.11
    * @aigne/core bumped to 1.63.0-beta.11
    * @aigne/default-memory bumped to 1.2.11-beta.11
    * @aigne/test-utils bumped to 0.5.55-beta.11

## [0.15.11-beta.10](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.11-beta.9...transport-v0.15.11-beta.10) (2025-10-16)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.2-beta.10
  * devDependencies
    * @aigne/agent-library bumped to 1.21.48-beta.10
    * @aigne/core bumped to 1.63.0-beta.10
    * @aigne/default-memory bumped to 1.2.11-beta.10
    * @aigne/test-utils bumped to 0.5.55-beta.10

## [0.15.11-beta.9](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.11-beta.8...transport-v0.15.11-beta.9) (2025-10-16)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.2-beta.9
  * devDependencies
    * @aigne/agent-library bumped to 1.21.48-beta.9
    * @aigne/core bumped to 1.63.0-beta.9
    * @aigne/default-memory bumped to 1.2.11-beta.9
    * @aigne/test-utils bumped to 0.5.55-beta.9

## [0.15.11-beta.8](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.11-beta.7...transport-v0.15.11-beta.8) (2025-10-16)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.2-beta.8
  * devDependencies
    * @aigne/agent-library bumped to 1.21.48-beta.8
    * @aigne/core bumped to 1.63.0-beta.8
    * @aigne/default-memory bumped to 1.2.11-beta.8
    * @aigne/test-utils bumped to 0.5.55-beta.8

## [0.15.11-beta.7](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.11-beta.6...transport-v0.15.11-beta.7) (2025-10-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.2-beta.7
  * devDependencies
    * @aigne/agent-library bumped to 1.21.48-beta.7
    * @aigne/core bumped to 1.63.0-beta.7
    * @aigne/default-memory bumped to 1.2.11-beta.7
    * @aigne/test-utils bumped to 0.5.55-beta.7

## [0.15.11-beta.6](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.11-beta.5...transport-v0.15.11-beta.6) (2025-10-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.2-beta.6
  * devDependencies
    * @aigne/agent-library bumped to 1.21.48-beta.6
    * @aigne/core bumped to 1.63.0-beta.6
    * @aigne/default-memory bumped to 1.2.11-beta.6
    * @aigne/test-utils bumped to 0.5.55-beta.6

## [0.15.11-beta.5](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.11-beta.4...transport-v0.15.11-beta.5) (2025-10-13)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.2-beta.5
  * devDependencies
    * @aigne/agent-library bumped to 1.21.48-beta.5
    * @aigne/core bumped to 1.63.0-beta.5
    * @aigne/default-memory bumped to 1.2.11-beta.5
    * @aigne/test-utils bumped to 0.5.55-beta.5

## [0.15.11-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.11-beta.3...transport-v0.15.11-beta.4) (2025-10-12)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.2-beta.4
  * devDependencies
    * @aigne/agent-library bumped to 1.21.48-beta.4
    * @aigne/core bumped to 1.63.0-beta.4
    * @aigne/default-memory bumped to 1.2.11-beta.4
    * @aigne/test-utils bumped to 0.5.55-beta.4

## [0.15.11-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.11-beta.2...transport-v0.15.11-beta.3) (2025-10-11)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.2-beta.3
  * devDependencies
    * @aigne/agent-library bumped to 1.21.48-beta.3
    * @aigne/core bumped to 1.63.0-beta.3
    * @aigne/default-memory bumped to 1.2.11-beta.3
    * @aigne/test-utils bumped to 0.5.55-beta.3

## [0.15.11-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.11-beta.1...transport-v0.15.11-beta.2) (2025-10-09)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.2-beta.2
  * devDependencies
    * @aigne/agent-library bumped to 1.21.48-beta.2
    * @aigne/core bumped to 1.63.0-beta.2
    * @aigne/default-memory bumped to 1.2.11-beta.2
    * @aigne/test-utils bumped to 0.5.55-beta.2

## [0.15.11-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.11-beta...transport-v0.15.11-beta.1) (2025-10-09)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.2-beta.1
  * devDependencies
    * @aigne/agent-library bumped to 1.21.48-beta.1
    * @aigne/core bumped to 1.63.0-beta.1
    * @aigne/default-memory bumped to 1.2.11-beta.1
    * @aigne/test-utils bumped to 0.5.55-beta.1

## [0.15.11-beta](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.10...transport-v0.15.11-beta) (2025-10-07)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.2-beta
  * devDependencies
    * @aigne/agent-library bumped to 1.21.48-beta
    * @aigne/core bumped to 1.63.0-beta
    * @aigne/default-memory bumped to 1.2.11-beta
    * @aigne/test-utils bumped to 0.5.55-beta

## [0.15.10](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.10-beta.7...transport-v0.15.10) (2025-10-04)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.1
  * devDependencies
    * @aigne/agent-library bumped to 1.21.47
    * @aigne/core bumped to 1.62.0
    * @aigne/default-memory bumped to 1.2.10
    * @aigne/test-utils bumped to 0.5.54

## [0.15.10-beta.7](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.10-beta.6...transport-v0.15.10-beta.7) (2025-10-03)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.1-beta.7
  * devDependencies
    * @aigne/agent-library bumped to 1.21.47-beta.7
    * @aigne/core bumped to 1.62.0-beta.6
    * @aigne/default-memory bumped to 1.2.10-beta.7
    * @aigne/test-utils bumped to 0.5.54-beta.7

## [0.15.10-beta.6](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.10-beta.5...transport-v0.15.10-beta.6) (2025-10-02)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.1-beta.6
  * devDependencies
    * @aigne/agent-library bumped to 1.21.47-beta.6
    * @aigne/core bumped to 1.62.0-beta.5
    * @aigne/default-memory bumped to 1.2.10-beta.6
    * @aigne/test-utils bumped to 0.5.54-beta.6

## [0.15.10-beta.5](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.10-beta.4...transport-v0.15.10-beta.5) (2025-10-01)


### Bug Fixes

* update deps compatibility in CommonJS environment ([#580](https://github.com/AIGNE-io/aigne-framework/issues/580)) ([a1e35d0](https://github.com/AIGNE-io/aigne-framework/commit/a1e35d016405accb51c1aeb6a544503a1c78e912))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.1-beta.5
  * devDependencies
    * @aigne/agent-library bumped to 1.21.47-beta.5
    * @aigne/core bumped to 1.62.0-beta.4
    * @aigne/default-memory bumped to 1.2.10-beta.5
    * @aigne/test-utils bumped to 0.5.54-beta.5

## [0.15.10-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.10-beta.3...transport-v0.15.10-beta.4) (2025-10-01)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.1-beta.4
  * devDependencies
    * @aigne/agent-library bumped to 1.21.47-beta.4
    * @aigne/core bumped to 1.62.0-beta.3
    * @aigne/default-memory bumped to 1.2.10-beta.4
    * @aigne/test-utils bumped to 0.5.54-beta.4

## [0.15.10-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.10-beta.2...transport-v0.15.10-beta.3) (2025-10-01)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.1-beta.3
  * devDependencies
    * @aigne/agent-library bumped to 1.21.47-beta.3
    * @aigne/core bumped to 1.62.0-beta.2
    * @aigne/default-memory bumped to 1.2.10-beta.3
    * @aigne/test-utils bumped to 0.5.54-beta.3

## [0.15.10-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.10-beta.1...transport-v0.15.10-beta.2) (2025-10-01)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.1-beta.2
  * devDependencies
    * @aigne/agent-library bumped to 1.21.47-beta.2
    * @aigne/core bumped to 1.62.0-beta.1
    * @aigne/default-memory bumped to 1.2.10-beta.2
    * @aigne/test-utils bumped to 0.5.54-beta.2

## [0.15.10-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.10-beta...transport-v0.15.10-beta.1) (2025-09-30)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.1-beta.1
  * devDependencies
    * @aigne/agent-library bumped to 1.21.47-beta.1
    * @aigne/core bumped to 1.62.0-beta
    * @aigne/default-memory bumped to 1.2.10-beta.1
    * @aigne/test-utils bumped to 0.5.54-beta.1

## [0.15.10-beta](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.9...transport-v0.15.10-beta) (2025-09-29)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.1-beta
  * devDependencies
    * @aigne/agent-library bumped to 1.21.47-beta
    * @aigne/core bumped to 1.61.1-beta
    * @aigne/default-memory bumped to 1.2.10-beta
    * @aigne/test-utils bumped to 0.5.54-beta

## [0.15.9](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.9-beta.9...transport-v0.15.9) (2025-09-27)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.0
  * devDependencies
    * @aigne/agent-library bumped to 1.21.46
    * @aigne/core bumped to 1.61.0
    * @aigne/default-memory bumped to 1.2.9
    * @aigne/test-utils bumped to 0.5.53

## [0.15.9-beta.9](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.9-beta.8...transport-v0.15.9-beta.9) (2025-09-26)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.0-beta.9
  * devDependencies
    * @aigne/agent-library bumped to 1.21.46-beta.9
    * @aigne/core bumped to 1.61.0-beta.8
    * @aigne/default-memory bumped to 1.2.9-beta.9
    * @aigne/test-utils bumped to 0.5.53-beta.8

## [0.15.9-beta.8](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.9-beta.7...transport-v0.15.9-beta.8) (2025-09-26)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.0-beta.8
  * devDependencies
    * @aigne/agent-library bumped to 1.21.46-beta.8
    * @aigne/core bumped to 1.61.0-beta.7
    * @aigne/default-memory bumped to 1.2.9-beta.8
    * @aigne/test-utils bumped to 0.5.53-beta.7

## [0.15.9-beta.7](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.9-beta.6...transport-v0.15.9-beta.7) (2025-09-26)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.0-beta.7
  * devDependencies
    * @aigne/agent-library bumped to 1.21.46-beta.7
    * @aigne/core bumped to 1.61.0-beta.6
    * @aigne/default-memory bumped to 1.2.9-beta.7
    * @aigne/test-utils bumped to 0.5.53-beta.6

## [0.15.9-beta.6](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.9-beta.5...transport-v0.15.9-beta.6) (2025-09-25)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.0-beta.6
  * devDependencies
    * @aigne/agent-library bumped to 1.21.46-beta.6
    * @aigne/core bumped to 1.61.0-beta.5
    * @aigne/default-memory bumped to 1.2.9-beta.6
    * @aigne/test-utils bumped to 0.5.53-beta.5

## [0.15.9-beta.5](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.9-beta.4...transport-v0.15.9-beta.5) (2025-09-25)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.0-beta.5
  * devDependencies
    * @aigne/agent-library bumped to 1.21.46-beta.5
    * @aigne/core bumped to 1.61.0-beta.4
    * @aigne/default-memory bumped to 1.2.9-beta.5
    * @aigne/test-utils bumped to 0.5.53-beta.4

## [0.15.9-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.9-beta.3...transport-v0.15.9-beta.4) (2025-09-24)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.0-beta.4
  * devDependencies
    * @aigne/agent-library bumped to 1.21.46-beta.4
    * @aigne/core bumped to 1.61.0-beta.3
    * @aigne/default-memory bumped to 1.2.9-beta.4
    * @aigne/test-utils bumped to 0.5.53-beta.3

## [0.15.9-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.9-beta.2...transport-v0.15.9-beta.3) (2025-09-23)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.0-beta.3
  * devDependencies
    * @aigne/agent-library bumped to 1.21.46-beta.3
    * @aigne/core bumped to 1.61.0-beta.2
    * @aigne/default-memory bumped to 1.2.9-beta.3
    * @aigne/test-utils bumped to 0.5.53-beta.2

## [0.15.9-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.9-beta.1...transport-v0.15.9-beta.2) (2025-09-23)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.0-beta.2
  * devDependencies
    * @aigne/agent-library bumped to 1.21.46-beta.2
    * @aigne/core bumped to 1.61.0-beta.1
    * @aigne/default-memory bumped to 1.2.9-beta.2
    * @aigne/test-utils bumped to 0.5.53-beta.1

## [0.15.9-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.9-beta...transport-v0.15.9-beta.1) (2025-09-23)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.0-beta.1
  * devDependencies
    * @aigne/agent-library bumped to 1.21.46-beta.1
    * @aigne/default-memory bumped to 1.2.9-beta.1

## [0.15.9-beta](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.8...transport-v0.15.9-beta) (2025-09-22)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.0-beta
  * devDependencies
    * @aigne/agent-library bumped to 1.21.46-beta
    * @aigne/core bumped to 1.61.0-beta
    * @aigne/default-memory bumped to 1.2.9-beta
    * @aigne/test-utils bumped to 0.5.53-beta

## [0.15.8](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.7...transport-v0.15.8) (2025-09-18)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.15.4
  * devDependencies
    * @aigne/agent-library bumped to 1.21.45
    * @aigne/core bumped to 1.60.3
    * @aigne/default-memory bumped to 1.2.8
    * @aigne/test-utils bumped to 0.5.52

## [0.15.7](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.6...transport-v0.15.7) (2025-09-11)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.15.3
  * devDependencies
    * @aigne/agent-library bumped to 1.21.44
    * @aigne/core bumped to 1.60.2
    * @aigne/default-memory bumped to 1.2.7
    * @aigne/test-utils bumped to 0.5.51

## [0.15.6](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.5...transport-v0.15.6) (2025-09-11)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.15.2
  * devDependencies
    * @aigne/agent-library bumped to 1.21.43
    * @aigne/core bumped to 1.60.1
    * @aigne/default-memory bumped to 1.2.6
    * @aigne/test-utils bumped to 0.5.50

## [0.15.5](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.4...transport-v0.15.5) (2025-09-10)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.15.1
  * devDependencies
    * @aigne/agent-library bumped to 1.21.42
    * @aigne/core bumped to 1.60.0
    * @aigne/default-memory bumped to 1.2.5
    * @aigne/test-utils bumped to 0.5.49

## [0.15.4](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.3...transport-v0.15.4) (2025-09-09)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.15.0
  * devDependencies
    * @aigne/agent-library bumped to 1.21.41
    * @aigne/core bumped to 1.59.0
    * @aigne/default-memory bumped to 1.2.4
    * @aigne/test-utils bumped to 0.5.48

## [0.15.3](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.2...transport-v0.15.3) (2025-09-08)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.14.3
  * devDependencies
    * @aigne/agent-library bumped to 1.21.40
    * @aigne/core bumped to 1.58.3
    * @aigne/default-memory bumped to 1.2.3
    * @aigne/test-utils bumped to 0.5.47

## [0.15.2](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.1...transport-v0.15.2) (2025-09-05)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.14.2
  * devDependencies
    * @aigne/agent-library bumped to 1.21.39
    * @aigne/core bumped to 1.58.2
    * @aigne/default-memory bumped to 1.2.2
    * @aigne/test-utils bumped to 0.5.46

## [0.15.1](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.0...transport-v0.15.1) (2025-09-05)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.14.1
  * devDependencies
    * @aigne/agent-library bumped to 1.21.38
    * @aigne/core bumped to 1.58.1
    * @aigne/default-memory bumped to 1.2.1
    * @aigne/test-utils bumped to 0.5.45

## [0.15.0](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.14.16...transport-v0.15.0) (2025-09-05)


### Features

* add modalities support for chat model ([#454](https://github.com/AIGNE-io/aigne-framework/issues/454)) ([70d1bf6](https://github.com/AIGNE-io/aigne-framework/commit/70d1bf631f4e711235d89c6df8ee210a19179b30))


### Bug Fixes

* support error hooks for AIGNEHTTPServer ([#456](https://github.com/AIGNE-io/aigne-framework/issues/456)) ([37197c8](https://github.com/AIGNE-io/aigne-framework/commit/37197c8f2db757974f35ce836be12f07b568b4c6))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.14.0
  * devDependencies
    * @aigne/agent-library bumped to 1.21.37
    * @aigne/core bumped to 1.58.0
    * @aigne/default-memory bumped to 1.2.0
    * @aigne/test-utils bumped to 0.5.44

## [0.14.16](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.14.15...transport-v0.14.16) (2025-09-01)


### Bug Fixes

* **transport:** improve HTTP client option handling and error serialization ([#445](https://github.com/AIGNE-io/aigne-framework/issues/445)) ([d3bcdd2](https://github.com/AIGNE-io/aigne-framework/commit/d3bcdd23ab8011a7d40fc157fd61eb240494c7a5))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.13.7
  * devDependencies
    * @aigne/agent-library bumped to 1.21.36
    * @aigne/core bumped to 1.57.5
    * @aigne/default-memory bumped to 1.1.18
    * @aigne/test-utils bumped to 0.5.43

## [0.14.15](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.14.14...transport-v0.14.15) (2025-08-30)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.13.6
  * devDependencies
    * @aigne/agent-library bumped to 1.21.35
    * @aigne/core bumped to 1.57.4
    * @aigne/default-memory bumped to 1.1.17
    * @aigne/test-utils bumped to 0.5.42

## [0.14.14](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.14.13...transport-v0.14.14) (2025-08-30)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.13.5
  * devDependencies
    * @aigne/agent-library bumped to 1.21.34
    * @aigne/core bumped to 1.57.3
    * @aigne/default-memory bumped to 1.1.16
    * @aigne/test-utils bumped to 0.5.41

## [0.14.13](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.14.12...transport-v0.14.13) (2025-08-29)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.13.4
  * devDependencies
    * @aigne/agent-library bumped to 1.21.33
    * @aigne/core bumped to 1.57.2
    * @aigne/default-memory bumped to 1.1.15
    * @aigne/test-utils bumped to 0.5.40

## [0.14.12](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.14.11...transport-v0.14.12) (2025-08-29)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.13.3
  * devDependencies
    * @aigne/agent-library bumped to 1.21.32
    * @aigne/core bumped to 1.57.1
    * @aigne/default-memory bumped to 1.1.14
    * @aigne/test-utils bumped to 0.5.39

## [0.14.11](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.14.10...transport-v0.14.11) (2025-08-28)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.13.2
  * devDependencies
    * @aigne/agent-library bumped to 1.21.31
    * @aigne/core bumped to 1.57.0
    * @aigne/default-memory bumped to 1.1.13
    * @aigne/test-utils bumped to 0.5.38

## [0.14.10](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.14.9...transport-v0.14.10) (2025-08-27)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.13.1
  * devDependencies
    * @aigne/agent-library bumped to 1.21.30
    * @aigne/core bumped to 1.56.0
    * @aigne/default-memory bumped to 1.1.12
    * @aigne/test-utils bumped to 0.5.37

## [0.14.9](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.14.8...transport-v0.14.9) (2025-08-27)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.13.0
  * devDependencies
    * @aigne/agent-library bumped to 1.21.29
    * @aigne/default-memory bumped to 1.1.11

## [0.14.8](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.14.7...transport-v0.14.8) (2025-08-26)


### Bug Fixes

* **cli:** reduce memory usage of AIGNE CLI ([#411](https://github.com/AIGNE-io/aigne-framework/issues/411)) ([9c36969](https://github.com/AIGNE-io/aigne-framework/commit/9c369699d966d37abf2d6a1624eac3d2fda4123b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.12.4
  * devDependencies
    * @aigne/agent-library bumped to 1.21.28
    * @aigne/core bumped to 1.55.1
    * @aigne/default-memory bumped to 1.1.10
    * @aigne/test-utils bumped to 0.5.36

## [0.14.7](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.14.6...transport-v0.14.7) (2025-08-25)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.12.3
  * devDependencies
    * @aigne/agent-library bumped to 1.21.27
    * @aigne/default-memory bumped to 1.1.9
    * @aigne/test-utils bumped to 0.5.35

## [0.14.6](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.14.5...transport-v0.14.6) (2025-08-21)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.12.2
  * devDependencies
    * @aigne/agent-library bumped to 1.21.26
    * @aigne/core bumped to 1.55.0
    * @aigne/default-memory bumped to 1.1.8
    * @aigne/test-utils bumped to 0.5.34

## [0.14.5](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.14.4...transport-v0.14.5) (2025-08-21)


### Bug Fixes

* **transport:** simplify ClientAgentOptions interface ([#394](https://github.com/AIGNE-io/aigne-framework/issues/394)) ([001271a](https://github.com/AIGNE-io/aigne-framework/commit/001271a46a7a734cd28f3dae28303c11f01861a7))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.12.1
  * devDependencies
    * @aigne/agent-library bumped to 1.21.25
    * @aigne/core bumped to 1.54.0
    * @aigne/default-memory bumped to 1.1.7
    * @aigne/test-utils bumped to 0.5.33

## [0.14.4](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.14.3...transport-v0.14.4) (2025-08-20)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.12.0
  * devDependencies
    * @aigne/agent-library bumped to 1.21.24
    * @aigne/core bumped to 1.53.0
    * @aigne/default-memory bumped to 1.1.6
    * @aigne/test-utils bumped to 0.5.32

## [0.14.3](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.14.2...transport-v0.14.3) (2025-08-20)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.11.5
  * devDependencies
    * @aigne/agent-library bumped to 1.21.23
    * @aigne/core bumped to 1.52.0
    * @aigne/default-memory bumped to 1.1.5
    * @aigne/test-utils bumped to 0.5.31

## [0.14.2](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.14.1...transport-v0.14.2) (2025-08-18)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.11.4
  * devDependencies
    * @aigne/agent-library bumped to 1.21.22
    * @aigne/core bumped to 1.51.0
    * @aigne/default-memory bumped to 1.1.4
    * @aigne/test-utils bumped to 0.5.30

## [0.14.1](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.14.0...transport-v0.14.1) (2025-08-16)


### Bug Fixes

* **core:** make getCredential async for aigne-hub mount point retrieval ([#372](https://github.com/AIGNE-io/aigne-framework/issues/372)) ([34ce7a6](https://github.com/AIGNE-io/aigne-framework/commit/34ce7a645fa83994d3dfe0f29ca70098cfecac9c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.11.3
  * devDependencies
    * @aigne/agent-library bumped to 1.21.21
    * @aigne/core bumped to 1.50.1
    * @aigne/default-memory bumped to 1.1.3
    * @aigne/test-utils bumped to 0.5.29

## [0.14.0](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.13.1...transport-v0.14.0) (2025-08-14)


### Features

* **transport:** add retry mechanism to HTTP client ([#364](https://github.com/AIGNE-io/aigne-framework/issues/364)) ([85dfab0](https://github.com/AIGNE-io/aigne-framework/commit/85dfab0d285199137edea47199c448247823258c))


### Bug Fixes

* **cli:** log only once in loadAIGNE ([#357](https://github.com/AIGNE-io/aigne-framework/issues/357)) ([6e6d968](https://github.com/AIGNE-io/aigne-framework/commit/6e6d96814fbc87f210522ae16daf94c1f84f311a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.11.2
  * devDependencies
    * @aigne/agent-library bumped to 1.21.20
    * @aigne/core bumped to 1.50.0
    * @aigne/default-memory bumped to 1.1.2
    * @aigne/test-utils bumped to 0.5.28

## [0.13.1](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.13.0...transport-v0.13.1) (2025-08-12)


### Bug Fixes

* **core:** add optional memory context toggle for AI agent ([#350](https://github.com/AIGNE-io/aigne-framework/issues/350)) ([92322cc](https://github.com/AIGNE-io/aigne-framework/commit/92322ccaf6f2b6e4440d47a7631589061c351d64))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.11.1
  * devDependencies
    * @aigne/agent-library bumped to 1.21.19
    * @aigne/core bumped to 1.49.1
    * @aigne/default-memory bumped to 1.1.1
    * @aigne/test-utils bumped to 0.5.27

## [0.13.0](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.12.5...transport-v0.13.0) (2025-08-12)


### Features

* **cli:** add retry functionality and improve error handling for AIGNE Hub ([#348](https://github.com/AIGNE-io/aigne-framework/issues/348)) ([672c93a](https://github.com/AIGNE-io/aigne-framework/commit/672c93abbba8b4b234f6d810536ff4b603a97e1e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.11.0
  * devDependencies
    * @aigne/agent-library bumped to 1.21.18
    * @aigne/core bumped to 1.49.0
    * @aigne/default-memory bumped to 1.1.0
    * @aigne/test-utils bumped to 0.5.26

## [0.12.5](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.12.4...transport-v0.12.5) (2025-08-12)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.17
  * devDependencies
    * @aigne/agent-library bumped to 1.21.17
    * @aigne/core bumped to 1.48.0
    * @aigne/default-memory bumped to 1.0.17
    * @aigne/test-utils bumped to 0.5.25

## [0.12.4](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.12.3...transport-v0.12.4) (2025-08-11)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.16
  * devDependencies
    * @aigne/agent-library bumped to 1.21.16
    * @aigne/core bumped to 1.47.0
    * @aigne/default-memory bumped to 1.0.16
    * @aigne/test-utils bumped to 0.5.24

## [0.12.3](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.12.2...transport-v0.12.3) (2025-08-08)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.15
  * devDependencies
    * @aigne/agent-library bumped to 1.21.15
    * @aigne/core bumped to 1.46.1
    * @aigne/default-memory bumped to 1.0.15
    * @aigne/test-utils bumped to 0.5.23

## [0.12.2](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.12.1...transport-v0.12.2) (2025-08-06)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.14
  * devDependencies
    * @aigne/agent-library bumped to 1.21.14
    * @aigne/core bumped to 1.46.0
    * @aigne/default-memory bumped to 1.0.14
    * @aigne/test-utils bumped to 0.5.22

## [0.12.1](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.12.0...transport-v0.12.1) (2025-08-06)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.13
  * devDependencies
    * @aigne/agent-library bumped to 1.21.13
    * @aigne/core bumped to 1.45.0
    * @aigne/default-memory bumped to 1.0.13
    * @aigne/test-utils bumped to 0.5.21

## [0.12.0](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.11.2...transport-v0.12.0) (2025-08-05)


### Features

* allow inserting agent-hub credits manually ([#315](https://github.com/AIGNE-io/aigne-framework/issues/315)) ([e3e4d1f](https://github.com/AIGNE-io/aigne-framework/commit/e3e4d1ff0d9d3fef33bb41d85e99735d4dd76cb7))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.12
  * devDependencies
    * @aigne/agent-library bumped to 1.21.12
    * @aigne/core bumped to 1.44.0
    * @aigne/default-memory bumped to 1.0.12
    * @aigne/test-utils bumped to 0.5.20

## [0.11.2](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.11.1...transport-v0.11.2) (2025-08-05)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.11
  * devDependencies
    * @aigne/agent-library bumped to 1.21.11
    * @aigne/core bumped to 1.43.1
    * @aigne/default-memory bumped to 1.0.11
    * @aigne/test-utils bumped to 0.5.19

## [0.11.1](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.11.0...transport-v0.11.1) (2025-08-04)


### Bug Fixes

* **core:** share skills/agents from context ([#309](https://github.com/AIGNE-io/aigne-framework/issues/309)) ([88dd849](https://github.com/AIGNE-io/aigne-framework/commit/88dd849954c6f3fb68df238be22be3371c734e6e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.10
  * devDependencies
    * @aigne/agent-library bumped to 1.21.10
    * @aigne/core bumped to 1.43.0
    * @aigne/default-memory bumped to 1.0.10
    * @aigne/test-utils bumped to 0.5.18

## [0.11.0](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.10.8...transport-v0.11.0) (2025-08-01)


### Features

* support google model and skip check mode when connected to Hub ([#300](https://github.com/AIGNE-io/aigne-framework/issues/300)) ([e992c0f](https://github.com/AIGNE-io/aigne-framework/commit/e992c0f3335a7c512fa807d5b8ad10c9c3bf2351))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.9
  * devDependencies
    * @aigne/agent-library bumped to 1.21.9
    * @aigne/core bumped to 1.42.0
    * @aigne/default-memory bumped to 1.0.9
    * @aigne/test-utils bumped to 0.5.17

## [0.10.8](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.10.7...transport-v0.10.8) (2025-07-31)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.8
  * devDependencies
    * @aigne/agent-library bumped to 1.21.8
    * @aigne/core bumped to 1.41.0
    * @aigne/default-memory bumped to 1.0.8
    * @aigne/test-utils bumped to 0.5.16

## [0.10.7](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.10.6...transport-v0.10.7) (2025-07-31)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.7
  * devDependencies
    * @aigne/agent-library bumped to 1.21.7
    * @aigne/core bumped to 1.40.0
    * @aigne/default-memory bumped to 1.0.7
    * @aigne/test-utils bumped to 0.5.15

## [0.10.6](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.10.5...transport-v0.10.6) (2025-07-28)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.6
  * devDependencies
    * @aigne/agent-library bumped to 1.21.6
    * @aigne/core bumped to 1.39.0
    * @aigne/default-memory bumped to 1.0.6
    * @aigne/test-utils bumped to 0.5.14

## [0.10.5](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.10.4...transport-v0.10.5) (2025-07-24)


### Bug Fixes

* add missing dependencies ([#280](https://github.com/AIGNE-io/aigne-framework/issues/280)) ([5da315e](https://github.com/AIGNE-io/aigne-framework/commit/5da315e29dc02818293e74ad159294f137e2c7f7))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.5
  * devDependencies
    * @aigne/agent-library bumped to 1.21.5
    * @aigne/core bumped to 1.38.1
    * @aigne/default-memory bumped to 1.0.5
    * @aigne/test-utils bumped to 0.5.13

## [0.10.4](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.10.3...transport-v0.10.4) (2025-07-24)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.4
  * devDependencies
    * @aigne/agent-library bumped to 1.21.4
    * @aigne/core bumped to 1.38.0
    * @aigne/default-memory bumped to 1.0.4
    * @aigne/test-utils bumped to 0.5.12

## [0.10.3](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.10.2...transport-v0.10.3) (2025-07-22)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.3
  * devDependencies
    * @aigne/agent-library bumped to 1.21.3
    * @aigne/core bumped to 1.37.0
    * @aigne/default-memory bumped to 1.0.3
    * @aigne/test-utils bumped to 0.5.11

## [0.10.2](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.10.1...transport-v0.10.2) (2025-07-17)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.2
  * devDependencies
    * @aigne/agent-library bumped to 1.21.2
    * @aigne/core bumped to 1.36.0
    * @aigne/test-utils bumped to 0.5.10
    * @aigne/default-memory bumped to 1.0.2

## [0.10.1](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.10.0...transport-v0.10.1) (2025-07-17)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.1
  * devDependencies
    * @aigne/agent-library bumped to 1.21.1
    * @aigne/core bumped to 1.35.0
    * @aigne/test-utils bumped to 0.5.9
    * @aigne/default-memory bumped to 1.0.1

## [0.10.0](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.9.6...transport-v0.10.0) (2025-07-15)


### Features

* **memory:** support did space memory adapter ([#229](https://github.com/AIGNE-io/aigne-framework/issues/229)) ([6f69b64](https://github.com/AIGNE-io/aigne-framework/commit/6f69b64e98b963db9d6ab5357306b445385eaa68))
* **model:** support aigne-hub model adapter ([#253](https://github.com/AIGNE-io/aigne-framework/issues/253)) ([4b33f8d](https://github.com/AIGNE-io/aigne-framework/commit/4b33f8d1a819f52357db81d502c56b55eaa0669f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.10.0
  * devDependencies
    * @aigne/agent-library bumped to 1.21.0
    * @aigne/core bumped to 1.34.0
    * @aigne/test-utils bumped to 0.5.8
    * @aigne/default-memory bumped to 1.0.0

## [0.9.6](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.9.5...transport-v0.9.6) (2025-07-14)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.9.2
  * devDependencies
    * @aigne/agent-library bumped to 1.20.5
    * @aigne/core bumped to 1.33.2
    * @aigne/test-utils bumped to 0.5.7

## [0.9.5](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.9.4...transport-v0.9.5) (2025-07-14)


### Bug Fixes

* **deps:** update deps to latest version ([#247](https://github.com/AIGNE-io/aigne-framework/issues/247)) ([3972f88](https://github.com/AIGNE-io/aigne-framework/commit/3972f887a9abff20c26da6b51c1071cbd54c0bf1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.9.1
  * devDependencies
    * @aigne/agent-library bumped to 1.20.4
    * @aigne/core bumped to 1.33.1
    * @aigne/test-utils bumped to 0.5.6

## [0.9.4](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.9.3...transport-v0.9.4) (2025-07-10)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.9.0
  * devDependencies
    * @aigne/agent-library bumped to 1.20.3
    * @aigne/core bumped to 1.33.0
    * @aigne/test-utils bumped to 0.5.5

## [0.9.3](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.9.2...transport-v0.9.3) (2025-07-09)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.8.2
  * devDependencies
    * @aigne/agent-library bumped to 1.20.2
    * @aigne/core bumped to 1.32.2
    * @aigne/test-utils bumped to 0.5.4

## [0.9.2](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.9.1...transport-v0.9.2) (2025-07-09)


### Bug Fixes

* share user context between server and client ([#233](https://github.com/AIGNE-io/aigne-framework/issues/233)) ([d55bfbc](https://github.com/AIGNE-io/aigne-framework/commit/d55bfbcc230e9c876c6d2fc0b74a4d7821f9e6ce))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.8.1
  * devDependencies
    * @aigne/agent-library bumped to 1.20.1
    * @aigne/core bumped to 1.32.1
    * @aigne/test-utils bumped to 0.5.3

## [0.9.1](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.9.0...transport-v0.9.1) (2025-07-08)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.8.0
  * devDependencies
    * @aigne/agent-library bumped to 1.20.0
    * @aigne/core bumped to 1.32.0
    * @aigne/test-utils bumped to 0.5.2

## [0.9.0](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.8.0...transport-v0.9.0) (2025-07-04)


### Features

* **core:** add standard userId/sessionId in userContext ([#219](https://github.com/AIGNE-io/aigne-framework/issues/219)) ([58e5804](https://github.com/AIGNE-io/aigne-framework/commit/58e5804cf08b1d2fa6e232646fadd70b5db2e007))
* **memory:** add support for AgenticMemory & some improvements for DefaultMemory ([#224](https://github.com/AIGNE-io/aigne-framework/issues/224)) ([f4a08af](https://github.com/AIGNE-io/aigne-framework/commit/f4a08aff935205c62615c060763c835a9579607d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.7.1
  * devDependencies
    * @aigne/agent-library bumped to 1.19.0
    * @aigne/core bumped to 1.31.0
    * @aigne/test-utils bumped to 0.5.1

## [0.8.0](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.7.4...transport-v0.8.0) (2025-07-03)


### Features

* upgrade dependencies and adapt code to breaking changes ([#216](https://github.com/AIGNE-io/aigne-framework/issues/216)) ([f215ced](https://github.com/AIGNE-io/aigne-framework/commit/f215cedc1a57e321164064c33316e496eae8d25f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.7.0
  * devDependencies
    * @aigne/agent-library bumped to 1.18.0
    * @aigne/core bumped to 1.30.0
    * @aigne/test-utils bumped to 0.5.0

## [0.7.4](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.7.3...transport-v0.7.4) (2025-07-02)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.6.4
  * devDependencies
    * @aigne/agent-library bumped to 1.17.9
    * @aigne/core bumped to 1.29.1
    * @aigne/test-utils bumped to 0.4.16

## [0.7.3](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.7.2...transport-v0.7.3) (2025-07-02)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.6.3
  * devDependencies
    * @aigne/agent-library bumped to 1.17.8
    * @aigne/core bumped to 1.29.0
    * @aigne/test-utils bumped to 0.4.15

## [0.7.2](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.7.1...transport-v0.7.2) (2025-07-01)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.6.2
  * devDependencies
    * @aigne/agent-library bumped to 1.17.7
    * @aigne/core bumped to 1.28.2
    * @aigne/test-utils bumped to 0.4.14

## [0.7.1](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.7.0...transport-v0.7.1) (2025-07-01)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.6.1
  * devDependencies
    * @aigne/agent-library bumped to 1.17.6
    * @aigne/core bumped to 1.28.1
    * @aigne/test-utils bumped to 0.4.13

## [0.7.0](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.6.4...transport-v0.7.0) (2025-07-01)


### Features

* **example:** use AIGNE cli to run chat-bot example ([#198](https://github.com/AIGNE-io/aigne-framework/issues/198)) ([7085541](https://github.com/AIGNE-io/aigne-framework/commit/708554100692f2a557f7329ea78e46c3c870ce10))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.6.0
  * devDependencies
    * @aigne/agent-library bumped to 1.17.5
    * @aigne/core bumped to 1.28.0
    * @aigne/test-utils bumped to 0.4.12

## [0.6.4](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.6.3...transport-v0.6.4) (2025-07-01)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.5.0
  * devDependencies
    * @aigne/agent-library bumped to 1.17.4
    * @aigne/core bumped to 1.27.0
    * @aigne/test-utils bumped to 0.4.11

## [0.6.3](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.6.2...transport-v0.6.3) (2025-06-30)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.4.3
  * devDependencies
    * @aigne/agent-library bumped to 1.17.3
    * @aigne/core bumped to 1.26.0
    * @aigne/test-utils bumped to 0.4.10

## [0.6.2](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.6.1...transport-v0.6.2) (2025-06-29)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.4.2
  * devDependencies
    * @aigne/agent-library bumped to 1.17.2
    * @aigne/core bumped to 1.25.0
    * @aigne/test-utils bumped to 0.4.9

## [0.6.1](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.6.0...transport-v0.6.1) (2025-06-26)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.4.1
  * devDependencies
    * @aigne/agent-library bumped to 1.17.1
    * @aigne/core bumped to 1.24.1
    * @aigne/test-utils bumped to 0.4.8

## [0.6.0](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.5.2...transport-v0.6.0) (2025-06-26)


### Features

* **transport:** support invoke server side chat model ([#182](https://github.com/AIGNE-io/aigne-framework/issues/182)) ([f81a1bf](https://github.com/AIGNE-io/aigne-framework/commit/f81a1bf883abda1845ccee09b270e5f583e287ab))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.4.0
  * devDependencies
    * @aigne/agent-library bumped to 1.17.0
    * @aigne/core bumped to 1.24.0
    * @aigne/test-utils bumped to 0.4.7

## [0.5.2](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.5.1...transport-v0.5.2) (2025-06-25)


### Bug Fixes

* **core:** pass input/output to MemoryAgent directily ([#178](https://github.com/AIGNE-io/aigne-framework/issues/178)) ([3b20e33](https://github.com/AIGNE-io/aigne-framework/commit/3b20e33f1eefc81ac1e009b1afff14fca46644b1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.3.6
  * devDependencies
    * @aigne/agent-library bumped to 1.16.1
    * @aigne/core bumped to 1.23.1
    * @aigne/test-utils bumped to 0.4.6

## [0.5.1](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.5.0...transport-v0.5.1) (2025-06-25)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.3.5
  * devDependencies
    * @aigne/core bumped to 1.23.0
    * @aigne/test-utils bumped to 0.4.5

## [0.5.0](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.4.3...transport-v0.5.0) (2025-06-24)


### Features

* support observability for cli and blocklet ([#155](https://github.com/AIGNE-io/aigne-framework/issues/155)) ([5baa705](https://github.com/AIGNE-io/aigne-framework/commit/5baa705a33cfdba1efc5ccbe18674c27513ca97d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.3.4
  * devDependencies
    * @aigne/core bumped to 1.22.0
    * @aigne/test-utils bumped to 0.4.4

## [0.4.3](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.4.2...transport-v0.4.3) (2025-06-20)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.3.3
  * devDependencies
    * @aigne/core bumped to 1.21.0
    * @aigne/test-utils bumped to 0.4.3

## [0.4.2](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.4.1...transport-v0.4.2) (2025-06-19)


### Bug Fixes

* use `inputKey` instead of implicit $message for AIAgent ([#165](https://github.com/AIGNE-io/aigne-framework/issues/165)) ([8b6e589](https://github.com/AIGNE-io/aigne-framework/commit/8b6e5896bba8209fd2eecb0f5b9263618bffdaf8))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.3.2
  * devDependencies
    * @aigne/core bumped to 1.20.1
    * @aigne/test-utils bumped to 0.4.2

## [0.4.1](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.4.0...transport-v0.4.1) (2025-06-17)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.3.1
  * devDependencies
    * @aigne/core bumped to 1.20.0
    * @aigne/test-utils bumped to 0.4.1

## [0.4.0](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.3.6...transport-v0.4.0) (2025-06-16)


### Features

* support respond progressing chunks by enable `returnProgressChunks` option for aigne.invoke ([cf4c313](https://github.com/AIGNE-io/aigne-framework/commit/cf4c313ee69f255be799ac196da675b79f69bf76))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.3.0
  * devDependencies
    * @aigne/core bumped to 1.19.0
    * @aigne/test-utils bumped to 0.4.0

## [0.3.6](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.3.5...transport-v0.3.6) (2025-06-11)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.2.7
  * devDependencies
    * @aigne/core bumped to 1.18.6
    * @aigne/test-utils bumped to 0.3.8

## [0.3.5](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.3.4...transport-v0.3.5) (2025-06-06)


### Bug Fixes

* **core:** should pass memories from invocation options to nested agents ([#153](https://github.com/AIGNE-io/aigne-framework/issues/153)) ([57629a5](https://github.com/AIGNE-io/aigne-framework/commit/57629a5da6cf2a295356dfe32ecbb15154e098fe))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.2.6
  * devDependencies
    * @aigne/core bumped to 1.18.5
    * @aigne/test-utils bumped to 0.3.7

## [0.3.4](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.3.3...transport-v0.3.4) (2025-06-05)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.2.5
  * devDependencies
    * @aigne/core bumped to 1.18.4
    * @aigne/test-utils bumped to 0.3.6

## [0.3.3](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.3.2...transport-v0.3.3) (2025-06-05)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.2.4
  * devDependencies
    * @aigne/core bumped to 1.18.3
    * @aigne/test-utils bumped to 0.3.5

## [0.3.2](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.3.1...transport-v0.3.2) (2025-05-30)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.2.3
  * devDependencies
    * @aigne/core bumped to 1.18.2
    * @aigne/test-utils bumped to 0.3.4

## [0.3.1](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.3.0...transport-v0.3.1) (2025-05-30)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.2.2
  * devDependencies
    * @aigne/core bumped to 1.18.1
    * @aigne/test-utils bumped to 0.3.3

## [0.3.0](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.2.0...transport-v0.3.0) (2025-05-29)


### Features

* add memory agents support for client agent ([#139](https://github.com/AIGNE-io/aigne-framework/issues/139)) ([57044fa](https://github.com/AIGNE-io/aigne-framework/commit/57044fa87b8abcba395cd05f941d6d312ab65764))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.2.1
  * devDependencies
    * @aigne/core bumped to 1.18.0
    * @aigne/test-utils bumped to 0.3.2

## [0.2.0](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.1.0...transport-v0.2.0) (2025-05-25)


### Features

* add user context support ([#131](https://github.com/AIGNE-io/aigne-framework/issues/131)) ([4dd9d20](https://github.com/AIGNE-io/aigne-framework/commit/4dd9d20953f6ac33933723db56efd9b44bafeb02))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.2.0
  * devDependencies
    * @aigne/core bumped to 1.17.0
    * @aigne/test-utils bumped to 0.3.1

## [0.1.0](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.0.1...transport-v0.1.0) (2025-05-23)


### Features

* **models:** publish model adapters as standalone packages ([#126](https://github.com/AIGNE-io/aigne-framework/issues/126)) ([588b8ae](https://github.com/AIGNE-io/aigne-framework/commit/588b8aea6abcee5fa87def1358bf51f84021c6ef))


### Bug Fixes

* automatically convert tool names to a valid format ([#128](https://github.com/AIGNE-io/aigne-framework/issues/128)) ([e9ee91d](https://github.com/AIGNE-io/aigne-framework/commit/e9ee91d9d782fa19000adb4cf95b9d65196ab651))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.1.0
  * devDependencies
    * @aigne/core bumped to 1.16.0
    * @aigne/test-utils bumped to 0.3.0
