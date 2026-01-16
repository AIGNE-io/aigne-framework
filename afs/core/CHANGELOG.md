# Changelog

## [1.4.0-beta.11](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.4.0-beta.10...afs-v1.4.0-beta.11) (2026-01-16)


### Features

* add Agent Skill support ([#787](https://github.com/AIGNE-io/aigne-framework/issues/787)) ([f04fbe7](https://github.com/AIGNE-io/aigne-framework/commit/f04fbe76ec24cf3c59c74adf92d87b0c3784a8f7))
* add session compact support for AIAgent ([#863](https://github.com/AIGNE-io/aigne-framework/issues/863)) ([9010918](https://github.com/AIGNE-io/aigne-framework/commit/9010918cd3f18b02b5c60ddc9ed5c34b568d0b28))
* **afs,bash:** add physical path mapping for AFS modules in bash execution ([#881](https://github.com/AIGNE-io/aigne-framework/issues/881)) ([50dbda2](https://github.com/AIGNE-io/aigne-framework/commit/50dbda224bd666d951494d2449779830d8db57fc))
* **afs:** add basic AFS(AIGNE File System) support ([#505](https://github.com/AIGNE-io/aigne-framework/issues/505)) ([ac2a18a](https://github.com/AIGNE-io/aigne-framework/commit/ac2a18a82470a2f31c466f329386525eb1cdab6d))
* **afs:** add edit/delete/rename methods for AFS ([#820](https://github.com/AIGNE-io/aigne-framework/issues/820)) ([68cb508](https://github.com/AIGNE-io/aigne-framework/commit/68cb508d1cfc9c516d56303018139f1e567f897e))
* **afs:** add module access control and schema validation support ([#904](https://github.com/AIGNE-io/aigne-framework/issues/904)) ([d0b279a](https://github.com/AIGNE-io/aigne-framework/commit/d0b279aac07ebe2bcc1fd4148498fc3f6bbcd561))
* **afs:** add module system fs for afs ([#594](https://github.com/AIGNE-io/aigne-framework/issues/594)) ([83c7b65](https://github.com/AIGNE-io/aigne-framework/commit/83c7b6555d21c606a5005eb05f6686882fb8ffa3))
* **afs:** improve list behavior to always include current path ([cb91f80](https://github.com/AIGNE-io/aigne-framework/commit/cb91f80c6ea3aa6e93dde26b6feeea8689fceb48))
* **afs:** support expand context into prompt template by call `$afs.xxx` ([#830](https://github.com/AIGNE-io/aigne-framework/issues/830)) ([5616acd](https://github.com/AIGNE-io/aigne-framework/commit/5616acd6ea257c91aa0b766608f45c5ce17f0345))
* **core:** add session history support ([#858](https://github.com/AIGNE-io/aigne-framework/issues/858)) ([28a070e](https://github.com/AIGNE-io/aigne-framework/commit/28a070ed33b821d1fd344b899706d817ca992b9f))
* support define agent by third library & orchestrator agent refactor ([#799](https://github.com/AIGNE-io/aigne-framework/issues/799)) ([7264b11](https://github.com/AIGNE-io/aigne-framework/commit/7264b11ab6eed787e928367f09aa08d254968d40))
* support mount mcp agent into AFS ([#740](https://github.com/AIGNE-io/aigne-framework/issues/740)) ([6d474fc](https://github.com/AIGNE-io/aigne-framework/commit/6d474fc05845a15e2c3e8fa97727b409bdd70945))


### Bug Fixes

* **afs:** add case-sensitive option for search with case-insensitive default ([#814](https://github.com/AIGNE-io/aigne-framework/issues/814)) ([9dc9446](https://github.com/AIGNE-io/aigne-framework/commit/9dc944635104fc311e7756b4bde0a20275cfe8ec))
* **afs:** check module existence on normalized path ([#793](https://github.com/AIGNE-io/aigne-framework/issues/793)) ([0c991bf](https://github.com/AIGNE-io/aigne-framework/commit/0c991bf0caa948ce62948986ce885b5a98437689))
* **afs:** improve module path resolution and depth handling ([#659](https://github.com/AIGNE-io/aigne-framework/issues/659)) ([c609d4f](https://github.com/AIGNE-io/aigne-framework/commit/c609d4fc9614123afcf4b8f86b3382a613ace417))
* **afs:** read method should not throw not found error ([#835](https://github.com/AIGNE-io/aigne-framework/issues/835)) ([ebfdfc1](https://github.com/AIGNE-io/aigne-framework/commit/ebfdfc1cdba23efd23ac2ad4621e3f046990fd8b))
* **afs:** show gitignored files with marker instead of filtering ([c2bdea1](https://github.com/AIGNE-io/aigne-framework/commit/c2bdea155f47c9420f2fe810cdfed79ef70ef899))
* **afs:** throw errors instead of logging in AFS module operations ([#874](https://github.com/AIGNE-io/aigne-framework/issues/874)) ([f0cc1c4](https://github.com/AIGNE-io/aigne-framework/commit/f0cc1c4056f8b95b631d595892bb12eb75da4b9f))
* **afs:** use simple-list instead of tree as default type ([#839](https://github.com/AIGNE-io/aigne-framework/issues/839)) ([65a9a40](https://github.com/AIGNE-io/aigne-framework/commit/65a9a4054b3bdad6f7e40357299ef3dc48f7c3e4))
* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* improve test coverage tracking and reporting ([#903](https://github.com/AIGNE-io/aigne-framework/issues/903)) ([031144e](https://github.com/AIGNE-io/aigne-framework/commit/031144e74f29e882cffe52ffda8f7a18c76ace7f))

## [1.4.0-beta.10](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.4.0-beta.9...afs-v1.4.0-beta.10) (2026-01-16)


### Features

* **afs:** improve list behavior to always include current path ([cb91f80](https://github.com/AIGNE-io/aigne-framework/commit/cb91f80c6ea3aa6e93dde26b6feeea8689fceb48))

## [1.4.0-beta.9](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.4.0-beta.8...afs-v1.4.0-beta.9) (2026-01-14)


### Features

* **afs:** add module access control and schema validation support ([#904](https://github.com/AIGNE-io/aigne-framework/issues/904)) ([d0b279a](https://github.com/AIGNE-io/aigne-framework/commit/d0b279aac07ebe2bcc1fd4148498fc3f6bbcd561))


### Bug Fixes

* improve test coverage tracking and reporting ([#903](https://github.com/AIGNE-io/aigne-framework/issues/903)) ([031144e](https://github.com/AIGNE-io/aigne-framework/commit/031144e74f29e882cffe52ffda8f7a18c76ace7f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/platform-helpers bumped to 0.6.7-beta.2

## [1.4.0-beta.8](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.4.0-beta.7...afs-v1.4.0-beta.8) (2026-01-12)


### Bug Fixes

* **afs:** show gitignored files with marker instead of filtering ([c2bdea1](https://github.com/AIGNE-io/aigne-framework/commit/c2bdea155f47c9420f2fe810cdfed79ef70ef899))

## [1.4.0-beta.7](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.4.0-beta.6...afs-v1.4.0-beta.7) (2026-01-08)


### Features

* **afs,bash:** add physical path mapping for AFS modules in bash execution ([#881](https://github.com/AIGNE-io/aigne-framework/issues/881)) ([50dbda2](https://github.com/AIGNE-io/aigne-framework/commit/50dbda224bd666d951494d2449779830d8db57fc))


### Bug Fixes

* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/platform-helpers bumped to 0.6.7-beta.1

## [1.4.0-beta.6](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.4.0-beta.5...afs-v1.4.0-beta.6) (2026-01-06)


### Bug Fixes

* **afs:** throw errors instead of logging in AFS module operations ([#874](https://github.com/AIGNE-io/aigne-framework/issues/874)) ([f0cc1c4](https://github.com/AIGNE-io/aigne-framework/commit/f0cc1c4056f8b95b631d595892bb12eb75da4b9f))

## [1.4.0-beta.5](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.4.0-beta.4...afs-v1.4.0-beta.5) (2025-12-31)


### Features

* add session compact support for AIAgent ([#863](https://github.com/AIGNE-io/aigne-framework/issues/863)) ([9010918](https://github.com/AIGNE-io/aigne-framework/commit/9010918cd3f18b02b5c60ddc9ed5c34b568d0b28))

## [1.4.0-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.4.0-beta.3...afs-v1.4.0-beta.4) (2025-12-26)


### Features

* **core:** add session history support ([#858](https://github.com/AIGNE-io/aigne-framework/issues/858)) ([28a070e](https://github.com/AIGNE-io/aigne-framework/commit/28a070ed33b821d1fd344b899706d817ca992b9f))

## [1.4.0-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.4.0-beta.2...afs-v1.4.0-beta.3) (2025-12-24)


### Features

* add Agent Skill support ([#787](https://github.com/AIGNE-io/aigne-framework/issues/787)) ([f04fbe7](https://github.com/AIGNE-io/aigne-framework/commit/f04fbe76ec24cf3c59c74adf92d87b0c3784a8f7))

## [1.4.0-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.4.0-beta.1...afs-v1.4.0-beta.2) (2025-12-19)


### Bug Fixes

* **afs:** use simple-list instead of tree as default type ([#839](https://github.com/AIGNE-io/aigne-framework/issues/839)) ([65a9a40](https://github.com/AIGNE-io/aigne-framework/commit/65a9a4054b3bdad6f7e40357299ef3dc48f7c3e4))

## [1.4.0-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.4.0-beta...afs-v1.4.0-beta.1) (2025-12-17)


### Bug Fixes

* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))

## [1.4.0-beta](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.3.0...afs-v1.4.0-beta) (2025-12-17)


### Features

* **afs:** support expand context into prompt template by call `$afs.xxx` ([#830](https://github.com/AIGNE-io/aigne-framework/issues/830)) ([5616acd](https://github.com/AIGNE-io/aigne-framework/commit/5616acd6ea257c91aa0b766608f45c5ce17f0345))


### Bug Fixes

* **afs:** read method should not throw not found error ([#835](https://github.com/AIGNE-io/aigne-framework/issues/835)) ([ebfdfc1](https://github.com/AIGNE-io/aigne-framework/commit/ebfdfc1cdba23efd23ac2ad4621e3f046990fd8b))

## [1.3.0](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.3.0-beta.3...afs-v1.3.0) (2025-12-12)

## [1.3.0-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.3.0-beta.2...afs-v1.3.0-beta.3) (2025-12-11)


### Features

* **afs:** add edit/delete/rename methods for AFS ([#820](https://github.com/AIGNE-io/aigne-framework/issues/820)) ([68cb508](https://github.com/AIGNE-io/aigne-framework/commit/68cb508d1cfc9c516d56303018139f1e567f897e))

## [1.3.0-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.3.0-beta.1...afs-v1.3.0-beta.2) (2025-12-10)


### Bug Fixes

* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))

## [1.3.0-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.3.0-beta...afs-v1.3.0-beta.1) (2025-12-10)


### Bug Fixes

* **afs:** add case-sensitive option for search with case-insensitive default ([#814](https://github.com/AIGNE-io/aigne-framework/issues/814)) ([9dc9446](https://github.com/AIGNE-io/aigne-framework/commit/9dc944635104fc311e7756b4bde0a20275cfe8ec))

## [1.3.0-beta](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.2.3...afs-v1.3.0-beta) (2025-12-07)


### Features

* support define agent by third library & orchestrator agent refactor ([#799](https://github.com/AIGNE-io/aigne-framework/issues/799)) ([7264b11](https://github.com/AIGNE-io/aigne-framework/commit/7264b11ab6eed787e928367f09aa08d254968d40))

## [1.2.3](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.2.3-beta...afs-v1.2.3) (2025-12-05)

## [1.2.3-beta](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.2.2...afs-v1.2.3-beta) (2025-12-02)


### Bug Fixes

* **afs:** check module existence on normalized path ([#793](https://github.com/AIGNE-io/aigne-framework/issues/793)) ([0c991bf](https://github.com/AIGNE-io/aigne-framework/commit/0c991bf0caa948ce62948986ce885b5a98437689))

## [1.2.2](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.2.2-beta...afs-v1.2.2) (2025-11-28)

## [1.2.2-beta](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.2.1...afs-v1.2.2-beta) (2025-11-28)


### Bug Fixes

* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))

## [1.2.1](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.2.1-beta...afs-v1.2.1) (2025-11-15)

## [1.2.1-beta](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.2.0...afs-v1.2.1-beta) (2025-11-15)


### Bug Fixes

* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))

## [1.2.0](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.2.0-beta...afs-v1.2.0) (2025-11-14)

## [1.2.0-beta](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.1.2...afs-v1.2.0-beta) (2025-11-14)


### Features

* support mount mcp agent into AFS ([#740](https://github.com/AIGNE-io/aigne-framework/issues/740)) ([6d474fc](https://github.com/AIGNE-io/aigne-framework/commit/6d474fc05845a15e2c3e8fa97727b409bdd70945))

## [1.1.2](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.1.2-beta...afs-v1.1.2) (2025-11-12)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/sqlite bumped to 0.4.4

## [1.1.2-beta](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.1.1...afs-v1.1.2-beta) (2025-11-12)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/sqlite bumped to 0.4.4-beta

## [1.1.1](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.1.1-beta...afs-v1.1.1) (2025-10-31)

## [1.1.1-beta](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.1.0...afs-v1.1.1-beta) (2025-10-23)


### Bug Fixes

* **afs:** improve module path resolution and depth handling ([#659](https://github.com/AIGNE-io/aigne-framework/issues/659)) ([c609d4f](https://github.com/AIGNE-io/aigne-framework/commit/c609d4fc9614123afcf4b8f86b3382a613ace417))

## [1.1.0](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.1.0-beta...afs-v1.1.0) (2025-10-19)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/sqlite bumped to 0.4.3

## [1.1.0-beta](https://github.com/AIGNE-io/aigne-framework/compare/afs-v1.0.0...afs-v1.1.0-beta) (2025-10-11)


### Features

* **afs:** add module system fs for afs ([#594](https://github.com/AIGNE-io/aigne-framework/issues/594)) ([83c7b65](https://github.com/AIGNE-io/aigne-framework/commit/83c7b6555d21c606a5005eb05f6686882fb8ffa3))

## 1.0.0 (2025-10-07)


### Features

* **afs:** add basic AFS(AIGNE File System) support ([#505](https://github.com/AIGNE-io/aigne-framework/issues/505)) ([ac2a18a](https://github.com/AIGNE-io/aigne-framework/commit/ac2a18a82470a2f31c466f329386525eb1cdab6d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/sqlite bumped to 0.4.3-beta
