:robot: I have created a release *beep* *boop*
---


<details><summary>afs: 1.4.0-beta.11</summary>

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
</details>

<details><summary>afs-explorer: 1.1.0-beta</summary>

## [1.1.0-beta](https://github.com/AIGNE-io/aigne-framework/compare/afs-explorer-v1.0.0...afs-explorer-v1.1.0-beta) (2026-01-16)


### Features

* **afs:** add explorer for AFS ([97ebe2d](https://github.com/AIGNE-io/aigne-framework/commit/97ebe2de59fb4ac4a5e5dea51b027a02ee69638d))


### Bug Fixes

* **afs:** improve explorer server with SPA routing and global error handler ([865c160](https://github.com/AIGNE-io/aigne-framework/commit/865c1601e2a0d9e481f260d150cb3210aef622fb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/afs bumped to 1.4.0-beta.11
    * @aigne/core bumped to 1.72.0-beta.25
  * devDependencies
    * @aigne/afs-git bumped to 1.1.0-beta
    * @aigne/afs-history bumped to 1.2.0-beta.12
    * @aigne/afs-json bumped to 1.1.0-beta
    * @aigne/afs-local-fs bumped to 1.4.0-beta.26
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>afs-git: 1.1.0-beta</summary>

## [1.1.0-beta](https://github.com/AIGNE-io/aigne-framework/compare/afs-git-v1.0.0...afs-git-v1.1.0-beta) (2026-01-16)


### Features

* **afs:** add AFSGit module support mount a git repo to AFS ([e1e030c](https://github.com/AIGNE-io/aigne-framework/commit/e1e030c181860d06c1c945b4acdcf67d9d708662))


### Bug Fixes

* **afs:** support read binary file as base64 string ([3480f9f](https://github.com/AIGNE-io/aigne-framework/commit/3480f9fe90647eba3bf2ff37e22c334599b72e35))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/afs bumped to 1.4.0-beta.11
    * @aigne/core bumped to 1.72.0-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>afs-history: 1.2.0-beta.12</summary>

## [1.2.0-beta.12](https://github.com/AIGNE-io/aigne-framework/compare/afs-history-v1.2.0-beta.11...afs-history-v1.2.0-beta.12) (2026-01-16)


### Features

* add session compact support for AIAgent ([#863](https://github.com/AIGNE-io/aigne-framework/issues/863)) ([9010918](https://github.com/AIGNE-io/aigne-framework/commit/9010918cd3f18b02b5c60ddc9ed5c34b568d0b28))
* **afs:** add module access control and schema validation support ([#904](https://github.com/AIGNE-io/aigne-framework/issues/904)) ([d0b279a](https://github.com/AIGNE-io/aigne-framework/commit/d0b279aac07ebe2bcc1fd4148498fc3f6bbcd561))
* **afs:** support expand context into prompt template by call `$afs.xxx` ([#830](https://github.com/AIGNE-io/aigne-framework/issues/830)) ([5616acd](https://github.com/AIGNE-io/aigne-framework/commit/5616acd6ea257c91aa0b766608f45c5ce17f0345))
* **core:** add cross session user memory support ([#873](https://github.com/AIGNE-io/aigne-framework/issues/873)) ([f377aa1](https://github.com/AIGNE-io/aigne-framework/commit/f377aa17f2cf8004fd3225ade4a37fd90af1292f))
* **core:** add session history support ([#858](https://github.com/AIGNE-io/aigne-framework/issues/858)) ([28a070e](https://github.com/AIGNE-io/aigne-framework/commit/28a070ed33b821d1fd344b899706d817ca992b9f))
* support mount mcp agent into AFS ([#740](https://github.com/AIGNE-io/aigne-framework/issues/740)) ([6d474fc](https://github.com/AIGNE-io/aigne-framework/commit/6d474fc05845a15e2c3e8fa97727b409bdd70945))


### Bug Fixes

* **afs:** support read binary file as base64 string ([3480f9f](https://github.com/AIGNE-io/aigne-framework/commit/3480f9fe90647eba3bf2ff37e22c334599b72e35))
* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* improve test coverage tracking and reporting ([#903](https://github.com/AIGNE-io/aigne-framework/issues/903)) ([031144e](https://github.com/AIGNE-io/aigne-framework/commit/031144e74f29e882cffe52ffda8f7a18c76ace7f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/afs bumped to 1.4.0-beta.11
</details>

<details><summary>afs-json: 1.1.0-beta</summary>

## [1.1.0-beta](https://github.com/AIGNE-io/aigne-framework/compare/afs-json-v1.0.0...afs-json-v1.1.0-beta) (2026-01-16)


### Features

* **afs:** add AFSJSON module support mount a JSON/yaml file to AFS ([6adedc6](https://github.com/AIGNE-io/aigne-framework/commit/6adedc624bedb1bc741da8534f2fbb41e1bc6623))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/afs bumped to 1.4.0-beta.11
    * @aigne/core bumped to 1.72.0-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>afs-local-fs: 1.4.0-beta.26</summary>

## [1.4.0-beta.26](https://github.com/AIGNE-io/aigne-framework/compare/afs-local-fs-v1.4.0-beta.25...afs-local-fs-v1.4.0-beta.26) (2026-01-16)


### Features

* add Agent Skill support ([#787](https://github.com/AIGNE-io/aigne-framework/issues/787)) ([f04fbe7](https://github.com/AIGNE-io/aigne-framework/commit/f04fbe76ec24cf3c59c74adf92d87b0c3784a8f7))
* **afs,bash:** add physical path mapping for AFS modules in bash execution ([#881](https://github.com/AIGNE-io/aigne-framework/issues/881)) ([50dbda2](https://github.com/AIGNE-io/aigne-framework/commit/50dbda224bd666d951494d2449779830d8db57fc))
* **afs:** add edit/delete/rename methods for AFS ([#820](https://github.com/AIGNE-io/aigne-framework/issues/820)) ([68cb508](https://github.com/AIGNE-io/aigne-framework/commit/68cb508d1cfc9c516d56303018139f1e567f897e))
* **afs:** add module access control and schema validation support ([#904](https://github.com/AIGNE-io/aigne-framework/issues/904)) ([d0b279a](https://github.com/AIGNE-io/aigne-framework/commit/d0b279aac07ebe2bcc1fd4148498fc3f6bbcd561))
* **afs:** support expand context into prompt template by call `$afs.xxx` ([#830](https://github.com/AIGNE-io/aigne-framework/issues/830)) ([5616acd](https://github.com/AIGNE-io/aigne-framework/commit/5616acd6ea257c91aa0b766608f45c5ce17f0345))
* **cli:** add run-skill command ([#868](https://github.com/AIGNE-io/aigne-framework/issues/868)) ([f62ffe2](https://github.com/AIGNE-io/aigne-framework/commit/f62ffe21acc49ec1a68349fbb35a13d0fadd239a))
* support define agent by third library & orchestrator agent refactor ([#799](https://github.com/AIGNE-io/aigne-framework/issues/799)) ([7264b11](https://github.com/AIGNE-io/aigne-framework/commit/7264b11ab6eed787e928367f09aa08d254968d40))
* support mount mcp agent into AFS ([#740](https://github.com/AIGNE-io/aigne-framework/issues/740)) ([6d474fc](https://github.com/AIGNE-io/aigne-framework/commit/6d474fc05845a15e2c3e8fa97727b409bdd70945))


### Bug Fixes

* **afs:** add case-sensitive option for search with case-insensitive default ([#814](https://github.com/AIGNE-io/aigne-framework/issues/814)) ([9dc9446](https://github.com/AIGNE-io/aigne-framework/commit/9dc944635104fc311e7756b4bde0a20275cfe8ec))
* **afs:** always respect ignore option for local-fs ([#843](https://github.com/AIGNE-io/aigne-framework/issues/843)) ([b19a731](https://github.com/AIGNE-io/aigne-framework/commit/b19a7316f03070878c481221550a5cd1ac7ce46f))
* **afs:** read method should not throw not found error ([#835](https://github.com/AIGNE-io/aigne-framework/issues/835)) ([ebfdfc1](https://github.com/AIGNE-io/aigne-framework/commit/ebfdfc1cdba23efd23ac2ad4621e3f046990fd8b))
* **afs:** show gitignored files with marker instead of filtering ([c2bdea1](https://github.com/AIGNE-io/aigne-framework/commit/c2bdea155f47c9420f2fe810cdfed79ef70ef899))
* **afs:** support `~` in the local path for local-fs & add agent-skill example ([#877](https://github.com/AIGNE-io/aigne-framework/issues/877)) ([c86293f](https://github.com/AIGNE-io/aigne-framework/commit/c86293f3d70447974395d02e238305a42b256b66))
* **afs:** support gitignore inheritance and submodule isolation in local-fs ([#879](https://github.com/AIGNE-io/aigne-framework/issues/879)) ([46b794d](https://github.com/AIGNE-io/aigne-framework/commit/46b794d79892017538b300f17d9cc9165e1e6499))
* **afs:** support read binary file as base64 string ([3480f9f](https://github.com/AIGNE-io/aigne-framework/commit/3480f9fe90647eba3bf2ff37e22c334599b72e35))
* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* improve test coverage tracking and reporting ([#903](https://github.com/AIGNE-io/aigne-framework/issues/903)) ([031144e](https://github.com/AIGNE-io/aigne-framework/commit/031144e74f29e882cffe52ffda8f7a18c76ace7f))
* return tree view instead of list for afs_list ([#774](https://github.com/AIGNE-io/aigne-framework/issues/774)) ([8ec2f93](https://github.com/AIGNE-io/aigne-framework/commit/8ec2f93fb5870f6404d886ad0197cc21c61dfd74))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/afs bumped to 1.4.0-beta.11
    * @aigne/core bumped to 1.72.0-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>afs-sqlite: 1.1.0-beta.1</summary>

## [1.1.0-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/afs-sqlite-v1.0.1-beta.1...afs-sqlite-v1.1.0-beta.1) (2026-01-16)


### Features

* **afs:** add generic AFS adapter for sqlite databases ([#908](https://github.com/AIGNE-io/aigne-framework/issues/908)) ([b9b5a8f](https://github.com/AIGNE-io/aigne-framework/commit/b9b5a8fc2680e8e3ae7f28dd720b0089520981b9))


### Bug Fixes

* update @aigne/afs-sqlite release config ([ef0f254](https://github.com/AIGNE-io/aigne-framework/commit/ef0f2547920e0e95545c57c7dd55ff059b5a2e7a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/afs bumped to 1.4.0-beta.11
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>afs-user-profile-memory: 1.3.0-beta.25</summary>

## [1.3.0-beta.25](https://github.com/AIGNE-io/aigne-framework/compare/afs-user-profile-memory-v1.3.0-beta.24...afs-user-profile-memory-v1.3.0-beta.25) (2026-01-16)


### Features

* add session compact support for AIAgent ([#863](https://github.com/AIGNE-io/aigne-framework/issues/863)) ([9010918](https://github.com/AIGNE-io/aigne-framework/commit/9010918cd3f18b02b5c60ddc9ed5c34b568d0b28))
* **afs:** add basic AFS(AIGNE File System) support ([#505](https://github.com/AIGNE-io/aigne-framework/issues/505)) ([ac2a18a](https://github.com/AIGNE-io/aigne-framework/commit/ac2a18a82470a2f31c466f329386525eb1cdab6d))
* **afs:** add module access control and schema validation support ([#904](https://github.com/AIGNE-io/aigne-framework/issues/904)) ([d0b279a](https://github.com/AIGNE-io/aigne-framework/commit/d0b279aac07ebe2bcc1fd4148498fc3f6bbcd561))
* **afs:** support expand context into prompt template by call `$afs.xxx` ([#830](https://github.com/AIGNE-io/aigne-framework/issues/830)) ([5616acd](https://github.com/AIGNE-io/aigne-framework/commit/5616acd6ea257c91aa0b766608f45c5ce17f0345))
* **core:** add cross session user memory support ([#873](https://github.com/AIGNE-io/aigne-framework/issues/873)) ([f377aa1](https://github.com/AIGNE-io/aigne-framework/commit/f377aa17f2cf8004fd3225ade4a37fd90af1292f))
* support mount mcp agent into AFS ([#740](https://github.com/AIGNE-io/aigne-framework/issues/740)) ([6d474fc](https://github.com/AIGNE-io/aigne-framework/commit/6d474fc05845a15e2c3e8fa97727b409bdd70945))


### Bug Fixes

* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* improve test coverage tracking and reporting ([#903](https://github.com/AIGNE-io/aigne-framework/issues/903)) ([031144e](https://github.com/AIGNE-io/aigne-framework/commit/031144e74f29e882cffe52ffda8f7a18c76ace7f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/afs bumped to 1.4.0-beta.11
    * @aigne/afs-history bumped to 1.2.0-beta.12
    * @aigne/core bumped to 1.72.0-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>agent-library: 1.24.0-beta.27</summary>

## [1.24.0-beta.27](https://github.com/AIGNE-io/aigne-framework/compare/agent-library-v1.24.0-beta.26...agent-library-v1.24.0-beta.27) (2026-01-16)


### Features

* add Agent Skill support ([#787](https://github.com/AIGNE-io/aigne-framework/issues/787)) ([f04fbe7](https://github.com/AIGNE-io/aigne-framework/commit/f04fbe76ec24cf3c59c74adf92d87b0c3784a8f7))
* add prompt caching for OpenAI/Gemini/Anthropic and cache token display ([#838](https://github.com/AIGNE-io/aigne-framework/issues/838)) ([46c628f](https://github.com/AIGNE-io/aigne-framework/commit/46c628f180572ea1b955d1a9888aad6145204842))
* add session compact support for AIAgent ([#863](https://github.com/AIGNE-io/aigne-framework/issues/863)) ([9010918](https://github.com/AIGNE-io/aigne-framework/commit/9010918cd3f18b02b5c60ddc9ed5c34b568d0b28))
* **afs,bash:** add physical path mapping for AFS modules in bash execution ([#881](https://github.com/AIGNE-io/aigne-framework/issues/881)) ([50dbda2](https://github.com/AIGNE-io/aigne-framework/commit/50dbda224bd666d951494d2449779830d8db57fc))
* **agent-library:** add agent skill manager agent ([#859](https://github.com/AIGNE-io/aigne-framework/issues/859)) ([d409bf5](https://github.com/AIGNE-io/aigne-framework/commit/d409bf5f44146c96c0d68cd93bc30b01ec5ae329))
* **agent-library:** add askUserQuestion agent ([#848](https://github.com/AIGNE-io/aigne-framework/issues/848)) ([60fa69b](https://github.com/AIGNE-io/aigne-framework/commit/60fa69b40ec122295e57ad175075875ed4840345))
* **agent-library:** add BashAgent with sandbox support ([#816](https://github.com/AIGNE-io/aigne-framework/issues/816)) ([0d4feee](https://github.com/AIGNE-io/aigne-framework/commit/0d4feeeac2b71df1c4d725adeee76c9318ce8e02))
* **agent-library:** add parallel tasks support for orchestrator agent ([#834](https://github.com/AIGNE-io/aigne-framework/issues/834)) ([7314eb1](https://github.com/AIGNE-io/aigne-framework/commit/7314eb1ef5f1eb4bf6f2b8160c61ef627a6aa3cc))
* **cli:** add run-skill command ([#868](https://github.com/AIGNE-io/aigne-framework/issues/868)) ([f62ffe2](https://github.com/AIGNE-io/aigne-framework/commit/f62ffe21acc49ec1a68349fbb35a13d0fadd239a))
* **core:** add session history support ([#858](https://github.com/AIGNE-io/aigne-framework/issues/858)) ([28a070e](https://github.com/AIGNE-io/aigne-framework/commit/28a070ed33b821d1fd344b899706d817ca992b9f))
* support define agent by third library & orchestrator agent refactor ([#799](https://github.com/AIGNE-io/aigne-framework/issues/799)) ([7264b11](https://github.com/AIGNE-io/aigne-framework/commit/7264b11ab6eed787e928367f09aa08d254968d40))


### Bug Fixes

* **agent-library:** add cwd option for bash agent ([#901](https://github.com/AIGNE-io/aigne-framework/issues/901)) ([d8a036b](https://github.com/AIGNE-io/aigne-framework/commit/d8a036b84ee97f80de747c141dae15a0d96bf4f5))
* **agent-library:** add header field and use object-based answers in AskUserQuestion ([#851](https://github.com/AIGNE-io/aigne-framework/issues/851)) ([095db95](https://github.com/AIGNE-io/aigne-framework/commit/095db95e43b5d39b35c638d90d6f0b99565e0dc4))
* **agent-library:** include stdout in the error message ([#872](https://github.com/AIGNE-io/aigne-framework/issues/872)) ([4627428](https://github.com/AIGNE-io/aigne-framework/commit/4627428ade3de38a94491670216372ab2e2f2396))
* **agent-library:** set default instructions for agent skill manager ([#861](https://github.com/AIGNE-io/aigne-framework/issues/861)) ([ca01a05](https://github.com/AIGNE-io/aigne-framework/commit/ca01a056ff73ebed7094e1e07964bc06cd3d26d0))
* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* **core:** preserve Agent Skill in session compact and support complex tool result content ([#876](https://github.com/AIGNE-io/aigne-framework/issues/876)) ([edb86ae](https://github.com/AIGNE-io/aigne-framework/commit/edb86ae2b9cfe56a8f08b276f843606e310566cf))
* **core:** support load third agent in skills ([#819](https://github.com/AIGNE-io/aigne-framework/issues/819)) ([bcbb140](https://github.com/AIGNE-io/aigne-framework/commit/bcbb1404d2fe9c709d99a8c28883b21dd107a844))
* improve test coverage tracking and reporting ([#903](https://github.com/AIGNE-io/aigne-framework/issues/903)) ([031144e](https://github.com/AIGNE-io/aigne-framework/commit/031144e74f29e882cffe52ffda8f7a18c76ace7f))
* **orchestrator:** add default task title for worker agent ([#809](https://github.com/AIGNE-io/aigne-framework/issues/809)) ([3524c3c](https://github.com/AIGNE-io/aigne-framework/commit/3524c3c03c6a6822656c8b1684660677af49d508))
* **orchestrator:** enhance prompts with detailed guidance ([#811](https://github.com/AIGNE-io/aigne-framework/issues/811)) ([5656f38](https://github.com/AIGNE-io/aigne-framework/commit/5656f38c09e458e18b90e962a5e85c96755be2e4))
* **orchestrator:** support custom input schema for planner/worker/completer ([#823](https://github.com/AIGNE-io/aigne-framework/issues/823)) ([3d26f8b](https://github.com/AIGNE-io/aigne-framework/commit/3d26f8bac8b679010f25d9e4eb59fc6e80afda4c))
* update deps compatibility in CommonJS environment ([#580](https://github.com/AIGNE-io/aigne-framework/issues/580)) ([a1e35d0](https://github.com/AIGNE-io/aigne-framework/commit/a1e35d016405accb51c1aeb6a544503a1c78e912))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.72.0-beta.25
    * @aigne/openai bumped to 0.16.16-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>agentic-memory: 1.1.6-beta.25</summary>

## [1.1.6-beta.25](https://github.com/AIGNE-io/aigne-framework/compare/agentic-memory-v1.1.6-beta.24...agentic-memory-v1.1.6-beta.25) (2026-01-16)


### Bug Fixes

* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* improve test coverage tracking and reporting ([#903](https://github.com/AIGNE-io/aigne-framework/issues/903)) ([031144e](https://github.com/AIGNE-io/aigne-framework/commit/031144e74f29e882cffe52ffda8f7a18c76ace7f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.72.0-beta.25
    * @aigne/default-memory bumped to 1.4.0-beta.24
    * @aigne/openai bumped to 0.16.16-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>aigne-hub: 0.10.16-beta.31</summary>

## [0.10.16-beta.31](https://github.com/AIGNE-io/aigne-framework/compare/aigne-hub-v0.10.16-beta.30...aigne-hub-v0.10.16-beta.31) (2026-01-16)


### Features

* add dynamic model options resolution with getter pattern ([#708](https://github.com/AIGNE-io/aigne-framework/issues/708)) ([5ed5085](https://github.com/AIGNE-io/aigne-framework/commit/5ed5085203763c70194853c56edc13acf56d81c6))
* add models method to get available models for aigne hub model ([#532](https://github.com/AIGNE-io/aigne-framework/issues/532)) ([3248646](https://github.com/AIGNE-io/aigne-framework/commit/3248646d248aef5419273adc556bb1f13a7b2a02))
* add reasoningEffort option for chat model ([#680](https://github.com/AIGNE-io/aigne-framework/issues/680)) ([f69d232](https://github.com/AIGNE-io/aigne-framework/commit/f69d232d714d4a3e4946bdc8c6598747c9bcbd57))
* **core:** add nested getter pattern support for model options ([#796](https://github.com/AIGNE-io/aigne-framework/issues/796)) ([824b2fe](https://github.com/AIGNE-io/aigne-framework/commit/824b2fe55cb2a24620e2bb73b470532918fa2996))
* improve image model architecture and file handling ([#527](https://github.com/AIGNE-io/aigne-framework/issues/527)) ([4db50aa](https://github.com/AIGNE-io/aigne-framework/commit/4db50aa0387a1a0f045ca11aaa61613e36ca7597))
* **model:** support video model ([#647](https://github.com/AIGNE-io/aigne-framework/issues/647)) ([de81742](https://github.com/AIGNE-io/aigne-framework/commit/de817421ef1dd3246d0d8c51ff12f0a855658f9f))
* support custom prefer input file type ([#469](https://github.com/AIGNE-io/aigne-framework/issues/469)) ([db0161b](https://github.com/AIGNE-io/aigne-framework/commit/db0161bbac52542c771ee2f40f361636b0668075))
* support define agent by third library & orchestrator agent refactor ([#799](https://github.com/AIGNE-io/aigne-framework/issues/799)) ([7264b11](https://github.com/AIGNE-io/aigne-framework/commit/7264b11ab6eed787e928367f09aa08d254968d40))


### Bug Fixes

* add configurable timeout for fetch requests and set 3min timeout for hub video model ([4eb7f3d](https://github.com/AIGNE-io/aigne-framework/commit/4eb7f3df590992742706197bcb48b4db35ccc948))
* add fetch utility with timeout and enhanced error handling ([#694](https://github.com/AIGNE-io/aigne-framework/issues/694)) ([c2d4076](https://github.com/AIGNE-io/aigne-framework/commit/c2d4076ec590150d2751591a4f723721f78381e9))
* add model for image mode input params ([#450](https://github.com/AIGNE-io/aigne-framework/issues/450)) ([3500a5a](https://github.com/AIGNE-io/aigne-framework/commit/3500a5ae5d420c7e735f2fa57729a9fe524320e8))
* add prefer input file type option for image model ([#536](https://github.com/AIGNE-io/aigne-framework/issues/536)) ([3cba8a5](https://github.com/AIGNE-io/aigne-framework/commit/3cba8a5562233a1567b49b6dd5c446c0760f5c4c))
* **blocklet:** tune observability detail list ux ([#618](https://github.com/AIGNE-io/aigne-framework/issues/618)) ([3ad83b6](https://github.com/AIGNE-io/aigne-framework/commit/3ad83b6be347831125806be7bee19294aa85ed58))
* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* **cli:** optimize app startup by restructuring CLI application loading ([#698](https://github.com/AIGNE-io/aigne-framework/issues/698)) ([20c5059](https://github.com/AIGNE-io/aigne-framework/commit/20c50591bbd9a958b29409eca3ede5e341db2b7d))
* **core:** add creditPrefix field to usage tracking ([#837](https://github.com/AIGNE-io/aigne-framework/issues/837)) ([9ef25e0](https://github.com/AIGNE-io/aigne-framework/commit/9ef25e0687b4e7b4ba39a27a35805f377f0979eb))
* **core:** added support for URL file type handling, expanding the range of supported file formats ([#671](https://github.com/AIGNE-io/aigne-framework/issues/671)) ([fea4519](https://github.com/AIGNE-io/aigne-framework/commit/fea45197e87cf7b19499c48b41626062824d1355))
* **core:** default enable auto breakpoints for chat model ([d4a6b83](https://github.com/AIGNE-io/aigne-framework/commit/d4a6b8323d6c83be45669885b32febb545bdf797))
* **docs:** update video mode docs ([#695](https://github.com/AIGNE-io/aigne-framework/issues/695)) ([d691001](https://github.com/AIGNE-io/aigne-framework/commit/d69100169457c16c14f2f3e2f7fcd6b2a99330f3))
* improve model name parsing to handle complex model identifiers ([#654](https://github.com/AIGNE-io/aigne-framework/issues/654)) ([4b7faea](https://github.com/AIGNE-io/aigne-framework/commit/4b7faea97f33db34a51c49dde3d6c1cf2679f0cd))
* improve test coverage tracking and reporting ([#903](https://github.com/AIGNE-io/aigne-framework/issues/903)) ([031144e](https://github.com/AIGNE-io/aigne-framework/commit/031144e74f29e882cffe52ffda8f7a18c76ace7f))
* **model:** normalize model names to support flexible provider/model format ([#712](https://github.com/AIGNE-io/aigne-framework/issues/712)) ([9f23755](https://github.com/AIGNE-io/aigne-framework/commit/9f23755406e1890e4523c778e71fd3d04c9f3e57))
* **models:** add image parameters support for video generation ([#684](https://github.com/AIGNE-io/aigne-framework/issues/684)) ([b048b7f](https://github.com/AIGNE-io/aigne-framework/commit/b048b7f92bd7a532dbdbeb6fb5fa5499bae6b953))
* **models:** add mineType for transform file ([#667](https://github.com/AIGNE-io/aigne-framework/issues/667)) ([155a173](https://github.com/AIGNE-io/aigne-framework/commit/155a173e75aff1dbe870a1305455a4300942e07a))
* **models:** add provider inference for model params ([#759](https://github.com/AIGNE-io/aigne-framework/issues/759)) ([0b050ae](https://github.com/AIGNE-io/aigne-framework/commit/0b050ae5132c7fbdd80091a81b7e0d00b21a0da5))
* **models:** aigne hub video params ([#665](https://github.com/AIGNE-io/aigne-framework/issues/665)) ([d00f836](https://github.com/AIGNE-io/aigne-framework/commit/d00f8368422d8e3707b974e1aff06714731ebb28))
* **models:** apply dynamic model options resolution and use url output type ([#710](https://github.com/AIGNE-io/aigne-framework/issues/710)) ([1026034](https://github.com/AIGNE-io/aigne-framework/commit/102603402d8fa3ccd52e06f378a73f66ab7464ed))
* **models:** convert local image to base64 for image model ([#517](https://github.com/AIGNE-io/aigne-framework/issues/517)) ([c0bc971](https://github.com/AIGNE-io/aigne-framework/commit/c0bc971087ef6e1caa641a699aed391a24feb40d))
* **models:** convert local image to base64 for image model ([#517](https://github.com/AIGNE-io/aigne-framework/issues/517)) ([c0bc971](https://github.com/AIGNE-io/aigne-framework/commit/c0bc971087ef6e1caa641a699aed391a24feb40d))
* **models:** correct aigne-hub model list schema ([#886](https://github.com/AIGNE-io/aigne-framework/issues/886)) ([b626c7a](https://github.com/AIGNE-io/aigne-framework/commit/b626c7ae99aa948dd310df93dd55139b06157d77))
* **models:** enhance gemini model tool use with status fields ([#634](https://github.com/AIGNE-io/aigne-framework/issues/634)) ([067b175](https://github.com/AIGNE-io/aigne-framework/commit/067b175c8e31bb5b1a6d0fc5a5cfb2d070d8d709))
* **observability:** add image/video model cost calculation and improve trace detail UX ([#683](https://github.com/AIGNE-io/aigne-framework/issues/683)) ([07964e4](https://github.com/AIGNE-io/aigne-framework/commit/07964e47d84636b49a291bfe5c1cc1c4dd31f722))
* should not return local path from aigne hub service ([#460](https://github.com/AIGNE-io/aigne-framework/issues/460)) ([c959717](https://github.com/AIGNE-io/aigne-framework/commit/c95971774f7e84dbeb3313f60b3e6464e2bb22e4))
* standardize file parameter naming across models ([#534](https://github.com/AIGNE-io/aigne-framework/issues/534)) ([f159a9d](https://github.com/AIGNE-io/aigne-framework/commit/f159a9d6af21ec0e99641996b150560929845845))
* standardize URL parameter naming from url to baseURL ([#593](https://github.com/AIGNE-io/aigne-framework/issues/593)) ([47efd4a](https://github.com/AIGNE-io/aigne-framework/commit/47efd4aad7130356a0c0bdf905acd8bc50453d26))
* **transport:** improve HTTP client option handling and error serialization ([#445](https://github.com/AIGNE-io/aigne-framework/issues/445)) ([d3bcdd2](https://github.com/AIGNE-io/aigne-framework/commit/d3bcdd23ab8011a7d40fc157fd61eb240494c7a5))
* update aigne hub params ([#607](https://github.com/AIGNE-io/aigne-framework/issues/607)) ([9ea9e0b](https://github.com/AIGNE-io/aigne-framework/commit/9ea9e0bce7119abe496a463ecb779b120d48f4bc))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/anthropic bumped to 0.14.16-beta.27
    * @aigne/bedrock bumped to 0.10.21-beta.25
    * @aigne/core bumped to 1.72.0-beta.25
    * @aigne/deepseek bumped to 0.7.62-beta.25
    * @aigne/doubao bumped to 1.3.0-beta.24
    * @aigne/gemini bumped to 0.14.16-beta.26
    * @aigne/ideogram bumped to 0.4.16-beta.25
    * @aigne/ollama bumped to 0.7.62-beta.25
    * @aigne/open-router bumped to 0.7.62-beta.25
    * @aigne/openai bumped to 0.16.16-beta.25
    * @aigne/poe bumped to 1.1.6-beta.25
    * @aigne/transport bumped to 0.15.25-beta.27
    * @aigne/xai bumped to 0.7.62-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>anthropic: 0.14.16-beta.27</summary>

## [0.14.16-beta.27](https://github.com/AIGNE-io/aigne-framework/compare/anthropic-v0.14.16-beta.26...anthropic-v0.14.16-beta.27) (2026-01-16)


### Features

* add dynamic model options resolution with getter pattern ([#708](https://github.com/AIGNE-io/aigne-framework/issues/708)) ([5ed5085](https://github.com/AIGNE-io/aigne-framework/commit/5ed5085203763c70194853c56edc13acf56d81c6))
* add modalities support for chat model ([#454](https://github.com/AIGNE-io/aigne-framework/issues/454)) ([70d1bf6](https://github.com/AIGNE-io/aigne-framework/commit/70d1bf631f4e711235d89c6df8ee210a19179b30))
* add prompt caching for OpenAI/Gemini/Anthropic and cache token display ([#838](https://github.com/AIGNE-io/aigne-framework/issues/838)) ([46c628f](https://github.com/AIGNE-io/aigne-framework/commit/46c628f180572ea1b955d1a9888aad6145204842))
* add session compact support for AIAgent ([#863](https://github.com/AIGNE-io/aigne-framework/issues/863)) ([9010918](https://github.com/AIGNE-io/aigne-framework/commit/9010918cd3f18b02b5c60ddc9ed5c34b568d0b28))
* **core:** add automatic JSON parsing and validation for structured outputs ([#548](https://github.com/AIGNE-io/aigne-framework/issues/548)) ([9077f93](https://github.com/AIGNE-io/aigne-framework/commit/9077f93856865915aaf5e8caa5638ef0b7f05b1e))
* **core:** add nested getter pattern support for model options ([#796](https://github.com/AIGNE-io/aigne-framework/issues/796)) ([824b2fe](https://github.com/AIGNE-io/aigne-framework/commit/824b2fe55cb2a24620e2bb73b470532918fa2996))
* support custom prefer input file type ([#469](https://github.com/AIGNE-io/aigne-framework/issues/469)) ([db0161b](https://github.com/AIGNE-io/aigne-framework/commit/db0161bbac52542c771ee2f40f361636b0668075))


### Bug Fixes

* **anthropic:** handle null content blocks in streaming responses ([9fefd6f](https://github.com/AIGNE-io/aigne-framework/commit/9fefd6fcca58bb8a59616560f86a04a0015f6aca))
* **anthropic:** simplify structured output with output tool pattern ([#899](https://github.com/AIGNE-io/aigne-framework/issues/899)) ([a6033c8](https://github.com/AIGNE-io/aigne-framework/commit/a6033c8a9ccf5e8ff6bcb14bc68c43a990ce2fa2))
* **anthropic:** update structured output tool name to generate_json ([897e94d](https://github.com/AIGNE-io/aigne-framework/commit/897e94d82a1bbfa46ae13038a58a65cba6a3b259))
* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* **core:** default enable auto breakpoints for chat model ([d4a6b83](https://github.com/AIGNE-io/aigne-framework/commit/d4a6b8323d6c83be45669885b32febb545bdf797))
* **core:** preserve Agent Skill in session compact and support complex tool result content ([#876](https://github.com/AIGNE-io/aigne-framework/issues/876)) ([edb86ae](https://github.com/AIGNE-io/aigne-framework/commit/edb86ae2b9cfe56a8f08b276f843606e310566cf))
* **core:** simplify token-estimator logic for remaining characters ([45d43cc](https://github.com/AIGNE-io/aigne-framework/commit/45d43ccd3afd636cfb459eea2e6551e8f9c53765))
* improve test coverage tracking and reporting ([#903](https://github.com/AIGNE-io/aigne-framework/issues/903)) ([031144e](https://github.com/AIGNE-io/aigne-framework/commit/031144e74f29e882cffe52ffda8f7a18c76ace7f))
* **models:** support cache the last message for anthropic chat model ([#853](https://github.com/AIGNE-io/aigne-framework/issues/853)) ([bd08e44](https://github.com/AIGNE-io/aigne-framework/commit/bd08e44b28c46ac9a85234f0100d6dd144703c9d))
* **model:** transform local file to base64 before request llm ([#462](https://github.com/AIGNE-io/aigne-framework/issues/462)) ([58ef5d7](https://github.com/AIGNE-io/aigne-framework/commit/58ef5d77046c49f3c4eed15b7f0cc283cbbcd74a))
* update deps compatibility in CommonJS environment ([#580](https://github.com/AIGNE-io/aigne-framework/issues/580)) ([a1e35d0](https://github.com/AIGNE-io/aigne-framework/commit/a1e35d016405accb51c1aeb6a544503a1c78e912))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.72.0-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>bedrock: 0.10.21-beta.25</summary>

## [0.10.21-beta.25](https://github.com/AIGNE-io/aigne-framework/compare/bedrock-v0.10.21-beta.24...bedrock-v0.10.21-beta.25) (2026-01-16)


### Features

* add dynamic model options resolution with getter pattern ([#708](https://github.com/AIGNE-io/aigne-framework/issues/708)) ([5ed5085](https://github.com/AIGNE-io/aigne-framework/commit/5ed5085203763c70194853c56edc13acf56d81c6))
* **core:** add nested getter pattern support for model options ([#796](https://github.com/AIGNE-io/aigne-framework/issues/796)) ([824b2fe](https://github.com/AIGNE-io/aigne-framework/commit/824b2fe55cb2a24620e2bb73b470532918fa2996))
* support custom prefer input file type ([#469](https://github.com/AIGNE-io/aigne-framework/issues/469)) ([db0161b](https://github.com/AIGNE-io/aigne-framework/commit/db0161bbac52542c771ee2f40f361636b0668075))
* support define agent by third library & orchestrator agent refactor ([#799](https://github.com/AIGNE-io/aigne-framework/issues/799)) ([7264b11](https://github.com/AIGNE-io/aigne-framework/commit/7264b11ab6eed787e928367f09aa08d254968d40))


### Bug Fixes

* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* **core:** preserve Agent Skill in session compact and support complex tool result content ([#876](https://github.com/AIGNE-io/aigne-framework/issues/876)) ([edb86ae](https://github.com/AIGNE-io/aigne-framework/commit/edb86ae2b9cfe56a8f08b276f843606e310566cf))
* **gemini:** implement retry mechanism for empty responses with structured output fallback ([#638](https://github.com/AIGNE-io/aigne-framework/issues/638)) ([d33c8bb](https://github.com/AIGNE-io/aigne-framework/commit/d33c8bb9711aadddef9687d6cf472a179cd8ed9c))
* improve test coverage tracking and reporting ([#903](https://github.com/AIGNE-io/aigne-framework/issues/903)) ([031144e](https://github.com/AIGNE-io/aigne-framework/commit/031144e74f29e882cffe52ffda8f7a18c76ace7f))
* update deps compatibility in CommonJS environment ([#580](https://github.com/AIGNE-io/aigne-framework/issues/580)) ([a1e35d0](https://github.com/AIGNE-io/aigne-framework/commit/a1e35d016405accb51c1aeb6a544503a1c78e912))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.72.0-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>cli: 1.59.0-beta.31</summary>

## [1.59.0-beta.31](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.59.0-beta.30...cli-v1.59.0-beta.31) (2026-01-16)


### Features

* add Agent Skill support ([#787](https://github.com/AIGNE-io/aigne-framework/issues/787)) ([f04fbe7](https://github.com/AIGNE-io/aigne-framework/commit/f04fbe76ec24cf3c59c74adf92d87b0c3784a8f7))
* add dynamic model options resolution with getter pattern ([#708](https://github.com/AIGNE-io/aigne-framework/issues/708)) ([5ed5085](https://github.com/AIGNE-io/aigne-framework/commit/5ed5085203763c70194853c56edc13acf56d81c6))
* add modalities support for chat model ([#454](https://github.com/AIGNE-io/aigne-framework/issues/454)) ([70d1bf6](https://github.com/AIGNE-io/aigne-framework/commit/70d1bf631f4e711235d89c6df8ee210a19179b30))
* add multiline support for prompts.input ([#570](https://github.com/AIGNE-io/aigne-framework/issues/570)) ([520d985](https://github.com/AIGNE-io/aigne-framework/commit/520d9859770cc553b551a4a58c7e392b39f53b37))
* add prompt caching for OpenAI/Gemini/Anthropic and cache token display ([#838](https://github.com/AIGNE-io/aigne-framework/issues/838)) ([46c628f](https://github.com/AIGNE-io/aigne-framework/commit/46c628f180572ea1b955d1a9888aad6145204842))
* add session compact support for AIAgent ([#863](https://github.com/AIGNE-io/aigne-framework/issues/863)) ([9010918](https://github.com/AIGNE-io/aigne-framework/commit/9010918cd3f18b02b5c60ddc9ed5c34b568d0b28))
* **afs,bash:** add physical path mapping for AFS modules in bash execution ([#881](https://github.com/AIGNE-io/aigne-framework/issues/881)) ([50dbda2](https://github.com/AIGNE-io/aigne-framework/commit/50dbda224bd666d951494d2449779830d8db57fc))
* **afs:** add AFSJSON module support mount a JSON/yaml file to AFS ([6adedc6](https://github.com/AIGNE-io/aigne-framework/commit/6adedc624bedb1bc741da8534f2fbb41e1bc6623))
* **afs:** add module access control and schema validation support ([#904](https://github.com/AIGNE-io/aigne-framework/issues/904)) ([d0b279a](https://github.com/AIGNE-io/aigne-framework/commit/d0b279aac07ebe2bcc1fd4148498fc3f6bbcd561))
* **afs:** add module system fs for afs ([#594](https://github.com/AIGNE-io/aigne-framework/issues/594)) ([83c7b65](https://github.com/AIGNE-io/aigne-framework/commit/83c7b6555d21c606a5005eb05f6686882fb8ffa3))
* **agent-library:** add BashAgent with sandbox support ([#816](https://github.com/AIGNE-io/aigne-framework/issues/816)) ([0d4feee](https://github.com/AIGNE-io/aigne-framework/commit/0d4feeeac2b71df1c4d725adeee76c9318ce8e02))
* **blocklet:** add token and cost summary for tracing list ([#543](https://github.com/AIGNE-io/aigne-framework/issues/543)) ([5e78919](https://github.com/AIGNE-io/aigne-framework/commit/5e789199b8183cf9c48339ec8163faec001ca64c))
* **cli:** add `--beta` `--target-version` `--force` options for `upgrade` command ([#555](https://github.com/AIGNE-io/aigne-framework/issues/555)) ([f9f0471](https://github.com/AIGNE-io/aigne-framework/commit/f9f04719020cca00bc3adbe8169c42422201df49))
* **cli:** add metadata traces including CLI version, app name, and version ([#646](https://github.com/AIGNE-io/aigne-framework/issues/646)) ([c64bd76](https://github.com/AIGNE-io/aigne-framework/commit/c64bd761ba4c9f3854be5feee208c711bff7a170))
* **cli:** add new eval command for assessing AI agent performance using custom datasets ([#535](https://github.com/AIGNE-io/aigne-framework/issues/535)) ([9da967b](https://github.com/AIGNE-io/aigne-framework/commit/9da967b01ef9eeee4c5e1242934cf08e14815753))
* **cli:** add new eval command for assessing AI agent performance using custom datasets ([#535](https://github.com/AIGNE-io/aigne-framework/issues/535)) ([9da967b](https://github.com/AIGNE-io/aigne-framework/commit/9da967b01ef9eeee4c5e1242934cf08e14815753))
* **cli:** add run-skill command ([#868](https://github.com/AIGNE-io/aigne-framework/issues/868)) ([f62ffe2](https://github.com/AIGNE-io/aigne-framework/commit/f62ffe21acc49ec1a68349fbb35a13d0fadd239a))
* **cli:** add searchable checkbox component with dynamic filtering ([#426](https://github.com/AIGNE-io/aigne-framework/issues/426)) ([1a76fe7](https://github.com/AIGNE-io/aigne-framework/commit/1a76fe7c2f7d91bc4041dfcd73850b39a18a036b))
* **cli:** add web-smith command to @aigne/cli ([#486](https://github.com/AIGNE-io/aigne-framework/issues/486)) ([3f6d51a](https://github.com/AIGNE-io/aigne-framework/commit/3f6d51a24a505c6b0a520b1775164a3456fd9fd5))
* **cli:** start AFS explorer when agent running ([d532ff6](https://github.com/AIGNE-io/aigne-framework/commit/d532ff65d08fb295b3b68390f303f23cd9c266db))
* **cli:** support ctrl+a select all items for prompts.checkbox ([#439](https://github.com/AIGNE-io/aigne-framework/issues/439)) ([af1c6c0](https://github.com/AIGNE-io/aigne-framework/commit/af1c6c03a1ebb2a168d6750a121aacd142ab26ea))
* **cli:** support define nested commands for sub apps ([#568](https://github.com/AIGNE-io/aigne-framework/issues/568)) ([0693b80](https://github.com/AIGNE-io/aigne-framework/commit/0693b807e0f8d335010e6ad00763b07cf095e65b))
* **cli:** support using beta apps with environments ([#511](https://github.com/AIGNE-io/aigne-framework/issues/511)) ([141b11a](https://github.com/AIGNE-io/aigne-framework/commit/141b11a7757f8a441489c9e7ab5e10df1fafe26f))
* **cli:** unify `run` and apps command arguments ([#436](https://github.com/AIGNE-io/aigne-framework/issues/436)) ([9c6b632](https://github.com/AIGNE-io/aigne-framework/commit/9c6b6323f8cfc2afe632d8ae392eab446981fc64))
* **core:** add cross session user memory support ([#873](https://github.com/AIGNE-io/aigne-framework/issues/873)) ([f377aa1](https://github.com/AIGNE-io/aigne-framework/commit/f377aa17f2cf8004fd3225ade4a37fd90af1292f))
* **core:** add session history support ([#858](https://github.com/AIGNE-io/aigne-framework/issues/858)) ([28a070e](https://github.com/AIGNE-io/aigne-framework/commit/28a070ed33b821d1fd344b899706d817ca992b9f))
* **model:** support video model ([#647](https://github.com/AIGNE-io/aigne-framework/issues/647)) ([de81742](https://github.com/AIGNE-io/aigne-framework/commit/de817421ef1dd3246d0d8c51ff12f0a855658f9f))
* **secure:** secure credential storage with keyring support ([#771](https://github.com/AIGNE-io/aigne-framework/issues/771)) ([023c202](https://github.com/AIGNE-io/aigne-framework/commit/023c202f75eddb37d003b1fad447b491e8e1a8c2))
* support custom extra model options in agent yaml file ([#586](https://github.com/AIGNE-io/aigne-framework/issues/586)) ([6d82115](https://github.com/AIGNE-io/aigne-framework/commit/6d82115e0763385c7e44ea152867c0d4a9e0a301))
* support custom model for every agents ([#472](https://github.com/AIGNE-io/aigne-framework/issues/472)) ([0bda78a](https://github.com/AIGNE-io/aigne-framework/commit/0bda78a2ebf537e953d855882d68cb37d94d1d10))
* support custom prefer input file type ([#469](https://github.com/AIGNE-io/aigne-framework/issues/469)) ([db0161b](https://github.com/AIGNE-io/aigne-framework/commit/db0161bbac52542c771ee2f40f361636b0668075))
* support define agent by third library & orchestrator agent refactor ([#799](https://github.com/AIGNE-io/aigne-framework/issues/799)) ([7264b11](https://github.com/AIGNE-io/aigne-framework/commit/7264b11ab6eed787e928367f09aa08d254968d40))
* support mount mcp agent into AFS ([#740](https://github.com/AIGNE-io/aigne-framework/issues/740)) ([6d474fc](https://github.com/AIGNE-io/aigne-framework/commit/6d474fc05845a15e2c3e8fa97727b409bdd70945))
* use a more secure signature mechanism ([#655](https://github.com/AIGNE-io/aigne-framework/issues/655)) ([aa5dc0c](https://github.com/AIGNE-io/aigne-framework/commit/aa5dc0ccdff8245a629cb30e731081528a555134))


### Bug Fixes

* add copy and download  in observability detail and optimize the detail rendering ([#610](https://github.com/AIGNE-io/aigne-framework/issues/610)) ([b1885f2](https://github.com/AIGNE-io/aigne-framework/commit/b1885f2b969d7ca28a0cb1ac2b4707e7c785308b))
* add fetch utility with timeout and enhanced error handling ([#694](https://github.com/AIGNE-io/aigne-framework/issues/694)) ([c2d4076](https://github.com/AIGNE-io/aigne-framework/commit/c2d4076ec590150d2751591a4f723721f78381e9))
* add file protocol to local file links in terminal tracer ([#455](https://github.com/AIGNE-io/aigne-framework/issues/455)) ([14890f9](https://github.com/AIGNE-io/aigne-framework/commit/14890f9ead679f38a7cc0b1ff31a97d2fe9056cb))
* add validate/required support for terminal input ([#651](https://github.com/AIGNE-io/aigne-framework/issues/651)) ([3d7f94c](https://github.com/AIGNE-io/aigne-framework/commit/3d7f94c32c8ec7bebb8f71fb16ddd3dd74a2d255))
* **blocklet:** observability blocklet start failure ([#554](https://github.com/AIGNE-io/aigne-framework/issues/554)) ([8431d4d](https://github.com/AIGNE-io/aigne-framework/commit/8431d4d89a4b96f735f23e774e9545bbe1fd811c))
* **blocklet:** observability blocklet start failure ([#554](https://github.com/AIGNE-io/aigne-framework/issues/554)) ([8431d4d](https://github.com/AIGNE-io/aigne-framework/commit/8431d4d89a4b96f735f23e774e9545bbe1fd811c))
* bump deps to latest and fix build error ([#897](https://github.com/AIGNE-io/aigne-framework/issues/897)) ([4059e79](https://github.com/AIGNE-io/aigne-framework/commit/4059e790ae63b9e4ebd66487665014b0cd7ce6ec))
* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* **checkbox:** display options list alongside error messages in search mode ([#563](https://github.com/AIGNE-io/aigne-framework/issues/563)) ([b0ebbed](https://github.com/AIGNE-io/aigne-framework/commit/b0ebbed933362fe462a6af2c812886f8e80d5194))
* **ci:** replace crypto library and simplify credential handling ([#912](https://github.com/AIGNE-io/aigne-framework/issues/912)) ([f3c3e65](https://github.com/AIGNE-io/aigne-framework/commit/f3c3e651c4776a02675e601ffa56c01c144b892d))
* **cli:** add askUserQuestion for run-skill command ([9c621e7](https://github.com/AIGNE-io/aigne-framework/commit/9c621e7c55501d129e71966da79514717a4579ab))
* **cli:** add chat aliases for interactive option ([#867](https://github.com/AIGNE-io/aigne-framework/issues/867)) ([91f27fd](https://github.com/AIGNE-io/aigne-framework/commit/91f27fd874b8c4b2ded2d7cd46e2821f70943c69))
* **cli:** add environment variable support for AIGNE Hub credentials ([#595](https://github.com/AIGNE-io/aigne-framework/issues/595)) ([00651e4](https://github.com/AIGNE-io/aigne-framework/commit/00651e4f1047c24be297b4f73e06e144592d934d))
* **cli:** ask user retry when model request respond error ([#884](https://github.com/AIGNE-io/aigne-framework/issues/884)) ([60aabbb](https://github.com/AIGNE-io/aigne-framework/commit/60aabbb34be6104f25f0383c2279f7f089268631))
* **cli:** cache approved commands in run-skill to avoid redundant prompts ([d07fe6d](https://github.com/AIGNE-io/aigne-framework/commit/d07fe6d049cd063e750e5b3fe231c74dae26bc9d))
* **cli:** default enter interactive mode ([#906](https://github.com/AIGNE-io/aigne-framework/issues/906)) ([0791040](https://github.com/AIGNE-io/aigne-framework/commit/0791040557dd135c8feb4ceb8eab66d0578382b2))
* **cli:** ensure console is restored after loadAIGNE call ([#447](https://github.com/AIGNE-io/aigne-framework/issues/447)) ([68fae38](https://github.com/AIGNE-io/aigne-framework/commit/68fae38c10346cd202266decf0ab0869bb618a07))
* **cli:** improve app loading reliability with force upgrade on error ([#566](https://github.com/AIGNE-io/aigne-framework/issues/566)) ([d7c49cf](https://github.com/AIGNE-io/aigne-framework/commit/d7c49cfdfdc72c0d1a98c3033babe1392cb707c1))
* **cli:** improve hub deletion with auto default switching ([#782](https://github.com/AIGNE-io/aigne-framework/issues/782)) ([f30b8c2](https://github.com/AIGNE-io/aigne-framework/commit/f30b8c2d0a8167c3678d500944c77ed257427564))
* **cli:** improve hub status display for non-default hubs ([#784](https://github.com/AIGNE-io/aigne-framework/issues/784)) ([9e83e01](https://github.com/AIGNE-io/aigne-framework/commit/9e83e01385bdf8fe6d6801c3b49007cac31a6eb5))
* **cli:** improve terminal outputs ([#847](https://github.com/AIGNE-io/aigne-framework/issues/847)) ([329e91b](https://github.com/AIGNE-io/aigne-framework/commit/329e91bc3323f72fc8a2d278ff5e6bba9adbd6e0))
* **cli:** install deps with `--force` option when installing application ([#560](https://github.com/AIGNE-io/aigne-framework/issues/560)) ([adc49b1](https://github.com/AIGNE-io/aigne-framework/commit/adc49b18907a0c94a1404fa17717aea1f1fc84d3))
* **cli:** load AIGNE in a child process to ensure app is available ([#475](https://github.com/AIGNE-io/aigne-framework/issues/475)) ([c8201b5](https://github.com/AIGNE-io/aigne-framework/commit/c8201b51accc4a9d047394f235df53725733f726))
* **cli:** load image model base on agent definition ([#577](https://github.com/AIGNE-io/aigne-framework/issues/577)) ([f1b7205](https://github.com/AIGNE-io/aigne-framework/commit/f1b7205904ed47b0c00199964eda74581473d805))
* **cli:** only auto-reinstall on agent loading errors ([#702](https://github.com/AIGNE-io/aigne-framework/issues/702)) ([52f61a4](https://github.com/AIGNE-io/aigne-framework/commit/52f61a47537f2be8763f7bd45b8baea94cf43e60))
* **cli:** only show ascii logo on help and errors ([#425](https://github.com/AIGNE-io/aigne-framework/issues/425)) ([1279376](https://github.com/AIGNE-io/aigne-framework/commit/1279376b7ca9c1c38148dcde581ee4730771a4ad))
* **cli:** optimize app startup by restructuring CLI application loading ([#698](https://github.com/AIGNE-io/aigne-framework/issues/698)) ([20c5059](https://github.com/AIGNE-io/aigne-framework/commit/20c50591bbd9a958b29409eca3ede5e341db2b7d))
* **cli:** options.prompts should always available ([44ca0a6](https://github.com/AIGNE-io/aigne-framework/commit/44ca0a65d910fbd327b89d2f3dfe38ab7d1be7df))
* **cli:** prevent potential crashes when environment configurations are incomplete ([#645](https://github.com/AIGNE-io/aigne-framework/issues/645)) ([8ab3a1e](https://github.com/AIGNE-io/aigne-framework/commit/8ab3a1e208a2774987d5d23c7239971c41edfd25))
* **cli:** prevent terminal input text overflow and corruption ([#588](https://github.com/AIGNE-io/aigne-framework/issues/588)) ([990c952](https://github.com/AIGNE-io/aigne-framework/commit/990c9526f0d2d6eec4d9fcd5ae61612a6ce23b9e))
* **cli:** rename cmd option --chat to --interactive ([#865](https://github.com/AIGNE-io/aigne-framework/issues/865)) ([480eca4](https://github.com/AIGNE-io/aigne-framework/commit/480eca49a7381a330024f1f0026bbc5f89b57bbb))
* **cli:** resolve input schema not working for run command ([#557](https://github.com/AIGNE-io/aigne-framework/issues/557)) ([6fa12b3](https://github.com/AIGNE-io/aigne-framework/commit/6fa12b3e068aaec28cf204c3a3f7c471bd2827ae))
* **cli:** run default agent if `entry-agent` argument not present ([#473](https://github.com/AIGNE-io/aigne-framework/issues/473)) ([8c46672](https://github.com/AIGNE-io/aigne-framework/commit/8c4667206a2336e74db07442dc296ef9f9265a0b))
* **cli:** suppress error message for CTRL+C ([#617](https://github.com/AIGNE-io/aigne-framework/issues/617)) ([01f0ea7](https://github.com/AIGNE-io/aigne-framework/commit/01f0ea74affa5653dd94048e68b62b7d7e649d4a))
* **cli:** tune aigne hub status and deprecate aigne hub info ([#513](https://github.com/AIGNE-io/aigne-framework/issues/513)) ([25ca2a9](https://github.com/AIGNE-io/aigne-framework/commit/25ca2a9c402e9cb2d895737c32e25e957fdefd91))
* **cli:** use sequential migration to handle keyring and callback file save ([#776](https://github.com/AIGNE-io/aigne-framework/issues/776)) ([da0db46](https://github.com/AIGNE-io/aigne-framework/commit/da0db46597b76cc0f41d604fd51bcd64931f0315))
* **cli:** wrap onSubmit call in setTimeout to fix cursor visibility issue ([#686](https://github.com/AIGNE-io/aigne-framework/issues/686)) ([7c69f1d](https://github.com/AIGNE-io/aigne-framework/commit/7c69f1ddf134ad297dc51f0ed944234a287415d7))
* **core:** add creditPrefix field to usage tracking ([#837](https://github.com/AIGNE-io/aigne-framework/issues/837)) ([9ef25e0](https://github.com/AIGNE-io/aigne-framework/commit/9ef25e0687b4e7b4ba39a27a35805f377f0979eb))
* **core:** make async memory updates non-blocking ([#900](https://github.com/AIGNE-io/aigne-framework/issues/900)) ([314f2c3](https://github.com/AIGNE-io/aigne-framework/commit/314f2c35d8baa88b600cc4de3f5983fef03a804c))
* **core:** memory leak in AIGNEContext by preventing duplicate signal handler ([#748](https://github.com/AIGNE-io/aigne-framework/issues/748)) ([7f17592](https://github.com/AIGNE-io/aigne-framework/commit/7f175929d78e4289e2d551746b12a73bb5c0eb22))
* **core:** preserve Agent Skill in session compact and support complex tool result content ([#876](https://github.com/AIGNE-io/aigne-framework/issues/876)) ([edb86ae](https://github.com/AIGNE-io/aigne-framework/commit/edb86ae2b9cfe56a8f08b276f843606e310566cf))
* correct loading aigne with AFS config for `upgrade` command ([#613](https://github.com/AIGNE-io/aigne-framework/issues/613)) ([db1db97](https://github.com/AIGNE-io/aigne-framework/commit/db1db97b6305009d302a782dbc7fa3147900af47))
* correct run example & doc improvements ([#707](https://github.com/AIGNE-io/aigne-framework/issues/707)) ([f98fc5d](https://github.com/AIGNE-io/aigne-framework/commit/f98fc5df28fd6ce6134128c2f0e5395c1554b740))
* ensure tips are only printed once during AIGNE loading ([#628](https://github.com/AIGNE-io/aigne-framework/issues/628)) ([7d49508](https://github.com/AIGNE-io/aigne-framework/commit/7d4950882436169986eedab75c232db2c0a30732))
* fix data corruption when using AIGNE multiple ([#914](https://github.com/AIGNE-io/aigne-framework/issues/914)) ([c713736](https://github.com/AIGNE-io/aigne-framework/commit/c713736b17502ffac6b1fdf67e453aba2f37aab3))
* improve exit event handling for cli ([#609](https://github.com/AIGNE-io/aigne-framework/issues/609)) ([00211f8](https://github.com/AIGNE-io/aigne-framework/commit/00211f8ad4686ea673ea8e2eac5b850bcbd8c1f6))
* improve model name parsing to handle complex model identifiers ([#654](https://github.com/AIGNE-io/aigne-framework/issues/654)) ([4b7faea](https://github.com/AIGNE-io/aigne-framework/commit/4b7faea97f33db34a51c49dde3d6c1cf2679f0cd))
* improve test coverage tracking and reporting ([#903](https://github.com/AIGNE-io/aigne-framework/issues/903)) ([031144e](https://github.com/AIGNE-io/aigne-framework/commit/031144e74f29e882cffe52ffda8f7a18c76ace7f))
* improved number formatting for credit balance display in hub commands ([c5ec419](https://github.com/AIGNE-io/aigne-framework/commit/c5ec41910435b58957611fe48105ed3c69c56e17))
* input schema of AI agent should includes input key and input file key ([#600](https://github.com/AIGNE-io/aigne-framework/issues/600)) ([b4ca076](https://github.com/AIGNE-io/aigne-framework/commit/b4ca076d6b4a1a1ecb8d4ebb008abd0d7561aadd))
* load aigne hub api url for image model correctly ([#664](https://github.com/AIGNE-io/aigne-framework/issues/664)) ([c226b6a](https://github.com/AIGNE-io/aigne-framework/commit/c226b6adfa7acc162fdb2de385f2af57368e21ad))
* **models:** add provider inference for model params ([#759](https://github.com/AIGNE-io/aigne-framework/issues/759)) ([0b050ae](https://github.com/AIGNE-io/aigne-framework/commit/0b050ae5132c7fbdd80091a81b7e0d00b21a0da5))
* **observability:** introduce TraceContext and improve delete UX ([#755](https://github.com/AIGNE-io/aigne-framework/issues/755)) ([dee54f1](https://github.com/AIGNE-io/aigne-framework/commit/dee54f1c548ed1046781e919f8c51a642b6b0dac))
* **observability:** support time line as background ([#642](https://github.com/AIGNE-io/aigne-framework/issues/642)) ([6f47870](https://github.com/AIGNE-io/aigne-framework/commit/6f478702090e8106ddcfe318a4766e1246257503))
* properly handle SIGINT to flush observability data before exit ([#739](https://github.com/AIGNE-io/aigne-framework/issues/739)) ([99b4503](https://github.com/AIGNE-io/aigne-framework/commit/99b45033d5f3bcc1f830b583f9cca7258b00606f))
* replace import.meta.dirname with Node 20 compatible dirname approach ([#541](https://github.com/AIGNE-io/aigne-framework/issues/541)) ([8a4fb26](https://github.com/AIGNE-io/aigne-framework/commit/8a4fb2649e88791444a7d4b3ddf9addcec2b666a))
* resolve checkbox multi-select issues and add comprehensive test ([#430](https://github.com/AIGNE-io/aigne-framework/issues/430)) ([a81be74](https://github.com/AIGNE-io/aigne-framework/commit/a81be74253923a1a2981f0780a15f175fd439210))
* resolve Windows file import URI issues ([#528](https://github.com/AIGNE-io/aigne-framework/issues/528)) ([bf807c5](https://github.com/AIGNE-io/aigne-framework/commit/bf807c5a3563c4423dc82fddff7fba280ef57957))
* **secrets:** improve keyring availability detection with environment checks ([#778](https://github.com/AIGNE-io/aigne-framework/issues/778)) ([75dceab](https://github.com/AIGNE-io/aigne-framework/commit/75dceabeb7d6fd8c057759f003e703a2ebb41afd))
* **secrets:** support system keyring for secure credential storage ([#773](https://github.com/AIGNE-io/aigne-framework/issues/773)) ([859ac2d](https://github.com/AIGNE-io/aigne-framework/commit/859ac2d9eb6019d7a68726076d65841cd96bc9a4))
* should not return local path from aigne hub service ([#460](https://github.com/AIGNE-io/aigne-framework/issues/460)) ([c959717](https://github.com/AIGNE-io/aigne-framework/commit/c95971774f7e84dbeb3313f60b3e6464e2bb22e4))
* standardize file parameter naming across models ([#534](https://github.com/AIGNE-io/aigne-framework/issues/534)) ([f159a9d](https://github.com/AIGNE-io/aigne-framework/commit/f159a9d6af21ec0e99641996b150560929845845))
* standardize URL parameter naming from url to baseURL ([#593](https://github.com/AIGNE-io/aigne-framework/issues/593)) ([47efd4a](https://github.com/AIGNE-io/aigne-framework/commit/47efd4aad7130356a0c0bdf905acd8bc50453d26))
* **ui:** enhance terminal input with status indicators and layout options ([#573](https://github.com/AIGNE-io/aigne-framework/issues/573)) ([31b83df](https://github.com/AIGNE-io/aigne-framework/commit/31b83df86fa959a37e6df2df516d7fc3015dc63b))
* update deps ([#802](https://github.com/AIGNE-io/aigne-framework/issues/802)) ([2bedc5c](https://github.com/AIGNE-io/aigne-framework/commit/2bedc5c01ac3b17ba00552ed8878e220fecbc0f0))
* update deps compatibility in CommonJS environment ([#580](https://github.com/AIGNE-io/aigne-framework/issues/580)) ([a1e35d0](https://github.com/AIGNE-io/aigne-framework/commit/a1e35d016405accb51c1aeb6a544503a1c78e912))
* update package to latest ([#699](https://github.com/AIGNE-io/aigne-framework/issues/699)) ([9877f6d](https://github.com/AIGNE-io/aigne-framework/commit/9877f6d1975362338db4eb47a2bf3564114c3cf8))
* update package to latest ([#720](https://github.com/AIGNE-io/aigne-framework/issues/720)) ([4386549](https://github.com/AIGNE-io/aigne-framework/commit/43865497e71f86478bc75d7d6e181c4fac80eae5))
* update package to latest ([#790](https://github.com/AIGNE-io/aigne-framework/issues/790)) ([69c77b3](https://github.com/AIGNE-io/aigne-framework/commit/69c77b353667acc72a2f35eadca7892fb99838b6))
* upgrade dependencies and fix timestamp type ([#757](https://github.com/AIGNE-io/aigne-framework/issues/757)) ([652e8f4](https://github.com/AIGNE-io/aigne-framework/commit/652e8f4b6e9af1461b25336888d76fe1d731b9b5))
* use aigne hub model when aigne hub connected ([#516](https://github.com/AIGNE-io/aigne-framework/issues/516)) ([a0493d0](https://github.com/AIGNE-io/aigne-framework/commit/a0493d0ad453afd3c3734ee2730636c6bd1e08ce))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/afs bumped to 1.4.0-beta.11
    * @aigne/afs-explorer bumped to 1.1.0-beta
    * @aigne/afs-history bumped to 1.2.0-beta.12
    * @aigne/afs-local-fs bumped to 1.4.0-beta.26
    * @aigne/agent-library bumped to 1.24.0-beta.27
    * @aigne/agentic-memory bumped to 1.1.6-beta.25
    * @aigne/aigne-hub bumped to 0.10.16-beta.31
    * @aigne/core bumped to 1.72.0-beta.25
    * @aigne/default-memory bumped to 1.4.0-beta.24
    * @aigne/openai bumped to 0.16.16-beta.25
    * @aigne/secrets bumped to 0.1.6-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>core: 1.72.0-beta.25</summary>

## [1.72.0-beta.25](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.72.0-beta.24...core-v1.72.0-beta.25) (2026-01-16)


### Features

* add Agent Skill support ([#787](https://github.com/AIGNE-io/aigne-framework/issues/787)) ([f04fbe7](https://github.com/AIGNE-io/aigne-framework/commit/f04fbe76ec24cf3c59c74adf92d87b0c3784a8f7))
* add dynamic model options resolution with getter pattern ([#708](https://github.com/AIGNE-io/aigne-framework/issues/708)) ([5ed5085](https://github.com/AIGNE-io/aigne-framework/commit/5ed5085203763c70194853c56edc13acf56d81c6))
* add modalities support for chat model ([#454](https://github.com/AIGNE-io/aigne-framework/issues/454)) ([70d1bf6](https://github.com/AIGNE-io/aigne-framework/commit/70d1bf631f4e711235d89c6df8ee210a19179b30))
* add prompt caching for OpenAI/Gemini/Anthropic and cache token display ([#838](https://github.com/AIGNE-io/aigne-framework/issues/838)) ([46c628f](https://github.com/AIGNE-io/aigne-framework/commit/46c628f180572ea1b955d1a9888aad6145204842))
* add reasoningEffort option for chat model ([#680](https://github.com/AIGNE-io/aigne-framework/issues/680)) ([f69d232](https://github.com/AIGNE-io/aigne-framework/commit/f69d232d714d4a3e4946bdc8c6598747c9bcbd57))
* add session compact support for AIAgent ([#863](https://github.com/AIGNE-io/aigne-framework/issues/863)) ([9010918](https://github.com/AIGNE-io/aigne-framework/commit/9010918cd3f18b02b5c60ddc9ed5c34b568d0b28))
* add thinking support to Gemini chat models ([#650](https://github.com/AIGNE-io/aigne-framework/issues/650)) ([09b828b](https://github.com/AIGNE-io/aigne-framework/commit/09b828ba668d90cc6aac68a5e8190adb146b5e45))
* add user context support to prompt template variables ([#649](https://github.com/AIGNE-io/aigne-framework/issues/649)) ([a02d9b4](https://github.com/AIGNE-io/aigne-framework/commit/a02d9b412878050b8c1e32127b505c0346f19bba))
* **afs,bash:** add physical path mapping for AFS modules in bash execution ([#881](https://github.com/AIGNE-io/aigne-framework/issues/881)) ([50dbda2](https://github.com/AIGNE-io/aigne-framework/commit/50dbda224bd666d951494d2449779830d8db57fc))
* **afs:** add AFSJSON module support mount a JSON/yaml file to AFS ([6adedc6](https://github.com/AIGNE-io/aigne-framework/commit/6adedc624bedb1bc741da8534f2fbb41e1bc6623))
* **afs:** add basic AFS(AIGNE File System) support ([#505](https://github.com/AIGNE-io/aigne-framework/issues/505)) ([ac2a18a](https://github.com/AIGNE-io/aigne-framework/commit/ac2a18a82470a2f31c466f329386525eb1cdab6d))
* **afs:** add configurable history injection to AFS system ([#611](https://github.com/AIGNE-io/aigne-framework/issues/611)) ([689b5d7](https://github.com/AIGNE-io/aigne-framework/commit/689b5d76d8cc82f548e8be74e63f18e7a6216c31))
* **afs:** add edit/delete/rename methods for AFS ([#820](https://github.com/AIGNE-io/aigne-framework/issues/820)) ([68cb508](https://github.com/AIGNE-io/aigne-framework/commit/68cb508d1cfc9c516d56303018139f1e567f897e))
* **afs:** add module access control and schema validation support ([#904](https://github.com/AIGNE-io/aigne-framework/issues/904)) ([d0b279a](https://github.com/AIGNE-io/aigne-framework/commit/d0b279aac07ebe2bcc1fd4148498fc3f6bbcd561))
* **afs:** add module system fs for afs ([#594](https://github.com/AIGNE-io/aigne-framework/issues/594)) ([83c7b65](https://github.com/AIGNE-io/aigne-framework/commit/83c7b6555d21c606a5005eb05f6686882fb8ffa3))
* **afs:** support expand context into prompt template by call `$afs.xxx` ([#830](https://github.com/AIGNE-io/aigne-framework/issues/830)) ([5616acd](https://github.com/AIGNE-io/aigne-framework/commit/5616acd6ea257c91aa0b766608f45c5ce17f0345))
* **cli:** add metadata traces including CLI version, app name, and version ([#646](https://github.com/AIGNE-io/aigne-framework/issues/646)) ([c64bd76](https://github.com/AIGNE-io/aigne-framework/commit/c64bd761ba4c9f3854be5feee208c711bff7a170))
* **cli:** add run-skill command ([#868](https://github.com/AIGNE-io/aigne-framework/issues/868)) ([f62ffe2](https://github.com/AIGNE-io/aigne-framework/commit/f62ffe21acc49ec1a68349fbb35a13d0fadd239a))
* **cli:** add searchable checkbox component with dynamic filtering ([#426](https://github.com/AIGNE-io/aigne-framework/issues/426)) ([1a76fe7](https://github.com/AIGNE-io/aigne-framework/commit/1a76fe7c2f7d91bc4041dfcd73850b39a18a036b))
* **cli:** support define nested commands for sub apps ([#568](https://github.com/AIGNE-io/aigne-framework/issues/568)) ([0693b80](https://github.com/AIGNE-io/aigne-framework/commit/0693b807e0f8d335010e6ad00763b07cf095e65b))
* **core:** add `keepTextInToolUses` option for AI Agent ([#585](https://github.com/AIGNE-io/aigne-framework/issues/585)) ([6c6be9e](https://github.com/AIGNE-io/aigne-framework/commit/6c6be9eee8e96294921b676a1982a18c93b2f66d))
* **core:** add `toolCallsConcurrency` support for AI agent ([#598](https://github.com/AIGNE-io/aigne-framework/issues/598)) ([84df406](https://github.com/AIGNE-io/aigne-framework/commit/84df406bfa9e3bdf159509f4b9cf2301ec80b155))
* **core:** add automatic JSON parsing and validation for structured outputs ([#548](https://github.com/AIGNE-io/aigne-framework/issues/548)) ([9077f93](https://github.com/AIGNE-io/aigne-framework/commit/9077f93856865915aaf5e8caa5638ef0b7f05b1e))
* **core:** add cross session user memory support ([#873](https://github.com/AIGNE-io/aigne-framework/issues/873)) ([f377aa1](https://github.com/AIGNE-io/aigne-framework/commit/f377aa17f2cf8004fd3225ade4a37fd90af1292f))
* **core:** add json/yaml stringify filters for prompt template ([#685](https://github.com/AIGNE-io/aigne-framework/issues/685)) ([4e414bf](https://github.com/AIGNE-io/aigne-framework/commit/4e414bf5a43d0677fb16fcdceacaed501542ee85))
* **core:** add multi-roles instructions support for agent yaml ([#538](https://github.com/AIGNE-io/aigne-framework/issues/538)) ([97bf77f](https://github.com/AIGNE-io/aigne-framework/commit/97bf77f96b5f69321539311159010499eb3b1b25))
* **core:** add nested getter pattern support for model options ([#796](https://github.com/AIGNE-io/aigne-framework/issues/796)) ([824b2fe](https://github.com/AIGNE-io/aigne-framework/commit/824b2fe55cb2a24620e2bb73b470532918fa2996))
* **core:** add session history support ([#858](https://github.com/AIGNE-io/aigne-framework/issues/858)) ([28a070e](https://github.com/AIGNE-io/aigne-framework/commit/28a070ed33b821d1fd344b899706d817ca992b9f))
* **core:** add tson.stringify filter for prompt template ([#725](https://github.com/AIGNE-io/aigne-framework/issues/725)) ([c88e71c](https://github.com/AIGNE-io/aigne-framework/commit/c88e71c245a3eaa8a2d60f25c75368bced35fde2))
* improve image model architecture and file handling ([#527](https://github.com/AIGNE-io/aigne-framework/issues/527)) ([4db50aa](https://github.com/AIGNE-io/aigne-framework/commit/4db50aa0387a1a0f045ca11aaa61613e36ca7597))
* **models:** support gemini 3.x thinking level and thoughtSignature ([#760](https://github.com/AIGNE-io/aigne-framework/issues/760)) ([243f2d4](https://github.com/AIGNE-io/aigne-framework/commit/243f2d457792a20ba2b87378576092e6f88e319c))
* **model:** support video model ([#647](https://github.com/AIGNE-io/aigne-framework/issues/647)) ([de81742](https://github.com/AIGNE-io/aigne-framework/commit/de817421ef1dd3246d0d8c51ff12f0a855658f9f))
* support custom extra model options in agent yaml file ([#586](https://github.com/AIGNE-io/aigne-framework/issues/586)) ([6d82115](https://github.com/AIGNE-io/aigne-framework/commit/6d82115e0763385c7e44ea152867c0d4a9e0a301))
* support custom model for every agents ([#472](https://github.com/AIGNE-io/aigne-framework/issues/472)) ([0bda78a](https://github.com/AIGNE-io/aigne-framework/commit/0bda78a2ebf537e953d855882d68cb37d94d1d10))
* support custom prefer input file type ([#469](https://github.com/AIGNE-io/aigne-framework/issues/469)) ([db0161b](https://github.com/AIGNE-io/aigne-framework/commit/db0161bbac52542c771ee2f40f361636b0668075))
* support custom reflection error message ([#589](https://github.com/AIGNE-io/aigne-framework/issues/589)) ([856348e](https://github.com/AIGNE-io/aigne-framework/commit/856348e889890051d7149b4093161f6ba8636273))
* support define agent by third library & orchestrator agent refactor ([#799](https://github.com/AIGNE-io/aigne-framework/issues/799)) ([7264b11](https://github.com/AIGNE-io/aigne-framework/commit/7264b11ab6eed787e928367f09aa08d254968d40))
* support define function agent by yaml ([#668](https://github.com/AIGNE-io/aigne-framework/issues/668)) ([2fde8cc](https://github.com/AIGNE-io/aigne-framework/commit/2fde8cc44b213fc2d4c20d91c3c8a8b3c2eb140e))
* support mount mcp agent into AFS ([#740](https://github.com/AIGNE-io/aigne-framework/issues/740)) ([6d474fc](https://github.com/AIGNE-io/aigne-framework/commit/6d474fc05845a15e2c3e8fa97727b409bdd70945))


### Bug Fixes

* add disabled observability env ([#453](https://github.com/AIGNE-io/aigne-framework/issues/453)) ([3e01107](https://github.com/AIGNE-io/aigne-framework/commit/3e01107deb07d3e4eb6fbe49a7b39919fa412df1))
* add fetch utility with timeout and enhanced error handling ([#694](https://github.com/AIGNE-io/aigne-framework/issues/694)) ([c2d4076](https://github.com/AIGNE-io/aigne-framework/commit/c2d4076ec590150d2751591a4f723721f78381e9))
* add options for system message reordering and merging ([#624](https://github.com/AIGNE-io/aigne-framework/issues/624)) ([8ca466d](https://github.com/AIGNE-io/aigne-framework/commit/8ca466d49d1e4ed08bc90922f39c0d3ed60c4fd5))
* add prefer input file type option for image model ([#536](https://github.com/AIGNE-io/aigne-framework/issues/536)) ([3cba8a5](https://github.com/AIGNE-io/aigne-framework/commit/3cba8a5562233a1567b49b6dd5c446c0760f5c4c))
* add taskTitle to observability traces and fix GPT-5/o1 model parameters ([#700](https://github.com/AIGNE-io/aigne-framework/issues/700)) ([30b513b](https://github.com/AIGNE-io/aigne-framework/commit/30b513b46ab5edb58a37f29e566e311bbb389f44))
* **afs:** add case-sensitive option for search with case-insensitive default ([#814](https://github.com/AIGNE-io/aigne-framework/issues/814)) ([9dc9446](https://github.com/AIGNE-io/aigne-framework/commit/9dc944635104fc311e7756b4bde0a20275cfe8ec))
* **afs:** set AFS tag for all AFS's skills ([#841](https://github.com/AIGNE-io/aigne-framework/issues/841)) ([0bd995a](https://github.com/AIGNE-io/aigne-framework/commit/0bd995aeb68aa68caac1ce19a200b42a022a9998))
* **afs:** show gitignored files with marker instead of filtering ([c2bdea1](https://github.com/AIGNE-io/aigne-framework/commit/c2bdea155f47c9420f2fe810cdfed79ef70ef899))
* **afs:** support `~` in the local path for local-fs & add agent-skill example ([#877](https://github.com/AIGNE-io/aigne-framework/issues/877)) ([c86293f](https://github.com/AIGNE-io/aigne-framework/commit/c86293f3d70447974395d02e238305a42b256b66))
* **afs:** use simple-list instead of tree as default type ([#839](https://github.com/AIGNE-io/aigne-framework/issues/839)) ([65a9a40](https://github.com/AIGNE-io/aigne-framework/commit/65a9a4054b3bdad6f7e40357299ef3dc48f7c3e4))
* allow custom user messages and prevent duplicate user content ([#632](https://github.com/AIGNE-io/aigne-framework/issues/632)) ([6c883b2](https://github.com/AIGNE-io/aigne-framework/commit/6c883b2d57a65e9b46232cece91fc6aa1de03aba))
* bump deps to latest and fix build error ([#897](https://github.com/AIGNE-io/aigne-framework/issues/897)) ([4059e79](https://github.com/AIGNE-io/aigne-framework/commit/4059e790ae63b9e4ebd66487665014b0cd7ce6ec))
* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* **cli:** improve terminal outputs ([#847](https://github.com/AIGNE-io/aigne-framework/issues/847)) ([329e91b](https://github.com/AIGNE-io/aigne-framework/commit/329e91bc3323f72fc8a2d278ff5e6bba9adbd6e0))
* **cli:** only auto-reinstall on agent loading errors ([#702](https://github.com/AIGNE-io/aigne-framework/issues/702)) ([52f61a4](https://github.com/AIGNE-io/aigne-framework/commit/52f61a47537f2be8763f7bd45b8baea94cf43e60))
* **core:** add `include_input_in_output` option for agent definition ([#575](https://github.com/AIGNE-io/aigne-framework/issues/575)) ([9e28b72](https://github.com/AIGNE-io/aigne-framework/commit/9e28b729963faa8bea90ee42fde855868889396d))
* **core:** add creditPrefix field to usage tracking ([#837](https://github.com/AIGNE-io/aigne-framework/issues/837)) ([9ef25e0](https://github.com/AIGNE-io/aigne-framework/commit/9ef25e0687b4e7b4ba39a27a35805f377f0979eb))
* **core:** add input_file_key support for agent yaml ([#597](https://github.com/AIGNE-io/aigne-framework/issues/597)) ([63414a3](https://github.com/AIGNE-io/aigne-framework/commit/63414a3d46c74c686e7f033c224ca6175bea8c3f))
* **core:** add nullish or nullable support for output schema ([#482](https://github.com/AIGNE-io/aigne-framework/issues/482)) ([bf80c29](https://github.com/AIGNE-io/aigne-framework/commit/bf80c29e10d3fef654c830df8dc7f3b7939fa58d))
* **core:** added support for URL file type handling, expanding the range of supported file formats ([#671](https://github.com/AIGNE-io/aigne-framework/issues/671)) ([fea4519](https://github.com/AIGNE-io/aigne-framework/commit/fea45197e87cf7b19499c48b41626062824d1355))
* **core:** afs skills improvements ([#849](https://github.com/AIGNE-io/aigne-framework/issues/849)) ([557cc8b](https://github.com/AIGNE-io/aigne-framework/commit/557cc8b4b72f0e91ad654556f47bbe0ad0ececdb))
* **core:** afs_read skill return pure text result first ([d42e67c](https://github.com/AIGNE-io/aigne-framework/commit/d42e67c33bb211202e9ba579afec2cf4abacbdb5))
* **core:** agent should not emit error event if retried ([#583](https://github.com/AIGNE-io/aigne-framework/issues/583)) ([04edcbf](https://github.com/AIGNE-io/aigne-framework/commit/04edcbfd71aa2746dad98140e20e0b718701fa0a))
* **core:** auto merge multiple system messages ([#619](https://github.com/AIGNE-io/aigne-framework/issues/619)) ([e9e62c0](https://github.com/AIGNE-io/aigne-framework/commit/e9e62c03c45f5a9b75d44a07588b2b179e262aad))
* **core:** auto retry LLM request for tool not found error ([#590](https://github.com/AIGNE-io/aigne-framework/issues/590)) ([3283daa](https://github.com/AIGNE-io/aigne-framework/commit/3283daa7abb0a44545b27d51645e5868c59a442f))
* **core:** change skills loading from Promise.all to sequential for loop ([#704](https://github.com/AIGNE-io/aigne-framework/issues/704)) ([08ac827](https://github.com/AIGNE-io/aigne-framework/commit/08ac8270285bdbafe171705f43ac32654430b745))
* **core:** check agent by structure instead of instanceOf ([826ef6f](https://github.com/AIGNE-io/aigne-framework/commit/826ef6fd4e9603cf51344e8e5b11af644396220e))
* **core:** compact current turn messages ([#871](https://github.com/AIGNE-io/aigne-framework/issues/871)) ([08c19d7](https://github.com/AIGNE-io/aigne-framework/commit/08c19d7651fb0ff0a0f7faa347746cf62b34f1f5))
* **core:** correct session schema for AIAgent ([30b1deb](https://github.com/AIGNE-io/aigne-framework/commit/30b1deb54ac20287580e0a85ef150b95010f8201))
* **core:** default enable auto breakpoints for chat model ([d4a6b83](https://github.com/AIGNE-io/aigne-framework/commit/d4a6b8323d6c83be45669885b32febb545bdf797))
* **core:** disable Immer autofreeze to return mutable response objects ([#817](https://github.com/AIGNE-io/aigne-framework/issues/817)) ([a3d0651](https://github.com/AIGNE-io/aigne-framework/commit/a3d06512cdadb9d85f92b7e8d2fd85b4f35a804b))
* **core:** disable session manger for compactor and memory extractor ([#882](https://github.com/AIGNE-io/aigne-framework/issues/882)) ([0ef8702](https://github.com/AIGNE-io/aigne-framework/commit/0ef8702b785b78859131ed45b4e71ab4064f3635))
* **core:** ensure data consistency in async compact mode and load all history entries ([25c7840](https://github.com/AIGNE-io/aigne-framework/commit/25c78406b48f8789a19d59b6d2c82ff859f0113b))
* **core:** handle relative path correctly ([#440](https://github.com/AIGNE-io/aigne-framework/issues/440)) ([45a65fe](https://github.com/AIGNE-io/aigne-framework/commit/45a65fea432da44218007e566fe952fa973d8ae2))
* **core:** improve checkArguments error messages and refactor optional schemas ([#726](https://github.com/AIGNE-io/aigne-framework/issues/726)) ([8680f43](https://github.com/AIGNE-io/aigne-framework/commit/8680f43e6ad224eb84948b056c51e80ef8c47e06))
* **core:** improve nested prompt file resolution ([#437](https://github.com/AIGNE-io/aigne-framework/issues/437)) ([38b5b13](https://github.com/AIGNE-io/aigne-framework/commit/38b5b1397b7897cddef39d60c8cae2152e37dc5b))
* **core:** improved ImageAgent parameter filtering to reduce redundant parameter passing ([#734](https://github.com/AIGNE-io/aigne-framework/issues/734)) ([f8f7da2](https://github.com/AIGNE-io/aigne-framework/commit/f8f7da21d6e55062da0d2070b3289388ba5e6702))
* **core:** load nested prompt files with relative paths correctly ([#432](https://github.com/AIGNE-io/aigne-framework/issues/432)) ([036ffa7](https://github.com/AIGNE-io/aigne-framework/commit/036ffa72391d3f27870a5022b7964739805a6161))
* **core:** make async memory updates non-blocking ([#900](https://github.com/AIGNE-io/aigne-framework/issues/900)) ([314f2c3](https://github.com/AIGNE-io/aigne-framework/commit/314f2c35d8baa88b600cc4de3f5983fef03a804c))
* **core:** memory leak in AIGNEContext by preventing duplicate signal handler ([#748](https://github.com/AIGNE-io/aigne-framework/issues/748)) ([7f17592](https://github.com/AIGNE-io/aigne-framework/commit/7f175929d78e4289e2d551746b12a73bb5c0eb22))
* **core:** optimize session compaction to reduce compression frequency ([#894](https://github.com/AIGNE-io/aigne-framework/issues/894)) ([bed53dc](https://github.com/AIGNE-io/aigne-framework/commit/bed53dc0311c69acd2c257fe93416d10ac1120e1))
* **core:** order history entries by time in ascending order ([#736](https://github.com/AIGNE-io/aigne-framework/issues/736)) ([7a3c2c3](https://github.com/AIGNE-io/aigne-framework/commit/7a3c2c32c428026ae7b8025f42ac51c38374915a))
* **core:** passthrough model options in chat model ([#856](https://github.com/AIGNE-io/aigne-framework/issues/856)) ([41387bd](https://github.com/AIGNE-io/aigne-framework/commit/41387bde0a615080ea5d665e998afb0b9c32c5fd))
* **core:** pin jaison dependency to exact version 2.0.2 ([#916](https://github.com/AIGNE-io/aigne-framework/issues/916)) ([e4ad28b](https://github.com/AIGNE-io/aigne-framework/commit/e4ad28b7fcac977d9d2087e0dceacd320818f0f5))
* **core:** preserve Agent Skill in session compact and support complex tool result content ([#876](https://github.com/AIGNE-io/aigne-framework/issues/876)) ([edb86ae](https://github.com/AIGNE-io/aigne-framework/commit/edb86ae2b9cfe56a8f08b276f843606e310566cf))
* **core:** remove Node.js dependencies from skill loader ([#910](https://github.com/AIGNE-io/aigne-framework/issues/910)) ([e12ae89](https://github.com/AIGNE-io/aigne-framework/commit/e12ae89dad8e3118fd5b9432a619846667f34ab7))
* **core:** replace static import with dynamic import for CommonJS compatibility ([#448](https://github.com/AIGNE-io/aigne-framework/issues/448)) ([6db1e57](https://github.com/AIGNE-io/aigne-framework/commit/6db1e570858fff32f7352143585b98e900f1f71d))
* **core:** resolve nested prompt file correctly ([#434](https://github.com/AIGNE-io/aigne-framework/issues/434)) ([b334092](https://github.com/AIGNE-io/aigne-framework/commit/b334092900c003ca3c22d320e12712fd55c2500c))
* **core:** resolve relative paths correctly in JS agent files ([#732](https://github.com/AIGNE-io/aigne-framework/issues/732)) ([0cb5631](https://github.com/AIGNE-io/aigne-framework/commit/0cb5631e1a1516b796f86a8dafc2341fe0e0810c))
* **core:** simplify token-estimator logic for remaining characters ([45d43cc](https://github.com/AIGNE-io/aigne-framework/commit/45d43ccd3afd636cfb459eea2e6551e8f9c53765))
* **core:** support access agent instance by `this` in function agent ([#822](https://github.com/AIGNE-io/aigne-framework/issues/822)) ([68103bc](https://github.com/AIGNE-io/aigne-framework/commit/68103bc8d6d553e1c1374595db98ff61f3046842))
* **core:** support custom `catchToolsError` in yaml agent definition ([#676](https://github.com/AIGNE-io/aigne-framework/issues/676)) ([fe43f5f](https://github.com/AIGNE-io/aigne-framework/commit/fe43f5f32d18d2180abb0717287fc680f1444a0d))
* **core:** support JSON object definitions for agent files ([#730](https://github.com/AIGNE-io/aigne-framework/issues/730)) ([4337def](https://github.com/AIGNE-io/aigne-framework/commit/4337defab694abdbcc118cc7f9151ba4df945478))
* **core:** support load third agent in skills ([#819](https://github.com/AIGNE-io/aigne-framework/issues/819)) ([bcbb140](https://github.com/AIGNE-io/aigne-framework/commit/bcbb1404d2fe9c709d99a8c28883b21dd107a844))
* correct run example & doc improvements ([#707](https://github.com/AIGNE-io/aigne-framework/issues/707)) ([f98fc5d](https://github.com/AIGNE-io/aigne-framework/commit/f98fc5df28fd6ce6134128c2f0e5395c1554b740))
* custom queue instead of fastq to compatible with browser ([#640](https://github.com/AIGNE-io/aigne-framework/issues/640)) ([51e0f8f](https://github.com/AIGNE-io/aigne-framework/commit/51e0f8fdeaf26f2765f392218f04a2af4c0d2e1a))
* **gemini:** handle empty responses when files are present ([#648](https://github.com/AIGNE-io/aigne-framework/issues/648)) ([f4e259c](https://github.com/AIGNE-io/aigne-framework/commit/f4e259c5e5c687c347bb5cf29cbb0b5bf4d0d4a1))
* **gemini:** implement retry mechanism for empty responses with structured output fallback ([#638](https://github.com/AIGNE-io/aigne-framework/issues/638)) ([d33c8bb](https://github.com/AIGNE-io/aigne-framework/commit/d33c8bb9711aadddef9687d6cf472a179cd8ed9c))
* handle absolute paths in agent YAML prompt URLs ([#466](https://github.com/AIGNE-io/aigne-framework/issues/466)) ([a07a088](https://github.com/AIGNE-io/aigne-framework/commit/a07a0880728f65fc831578763b62ce5144d1aed8))
* handle optional imageModel in loader function ([#582](https://github.com/AIGNE-io/aigne-framework/issues/582)) ([7d55084](https://github.com/AIGNE-io/aigne-framework/commit/7d550841b6edfc762ef7c188a585d9fc8ffdf4c7))
* improve test coverage tracking and reporting ([#903](https://github.com/AIGNE-io/aigne-framework/issues/903)) ([031144e](https://github.com/AIGNE-io/aigne-framework/commit/031144e74f29e882cffe52ffda8f7a18c76ace7f))
* input schema of AI agent should includes input key and input file key ([#600](https://github.com/AIGNE-io/aigne-framework/issues/600)) ([b4ca076](https://github.com/AIGNE-io/aigne-framework/commit/b4ca076d6b4a1a1ecb8d4ebb008abd0d7561aadd))
* **models:** add image parameters support for video generation ([#684](https://github.com/AIGNE-io/aigne-framework/issues/684)) ([b048b7f](https://github.com/AIGNE-io/aigne-framework/commit/b048b7f92bd7a532dbdbeb6fb5fa5499bae6b953))
* **models:** aigne hub video params ([#665](https://github.com/AIGNE-io/aigne-framework/issues/665)) ([d00f836](https://github.com/AIGNE-io/aigne-framework/commit/d00f8368422d8e3707b974e1aff06714731ebb28))
* **models:** auto retry when got emtpy response from gemini ([#636](https://github.com/AIGNE-io/aigne-framework/issues/636)) ([9367cef](https://github.com/AIGNE-io/aigne-framework/commit/9367cef49ea4c0c87b8a36b454deb2efaee6886f))
* **models:** convert local image to base64 for image model ([#517](https://github.com/AIGNE-io/aigne-framework/issues/517)) ([c0bc971](https://github.com/AIGNE-io/aigne-framework/commit/c0bc971087ef6e1caa641a699aed391a24feb40d))
* **models:** convert local image to base64 for image model ([#517](https://github.com/AIGNE-io/aigne-framework/issues/517)) ([c0bc971](https://github.com/AIGNE-io/aigne-framework/commit/c0bc971087ef6e1caa641a699aed391a24feb40d))
* **models:** improve message structure handling and enable auto-message options ([#657](https://github.com/AIGNE-io/aigne-framework/issues/657)) ([233d70c](https://github.com/AIGNE-io/aigne-framework/commit/233d70cb292b937200fada8434f33d957d766ad6))
* **model:** transform local file to base64 before request llm ([#462](https://github.com/AIGNE-io/aigne-framework/issues/462)) ([58ef5d7](https://github.com/AIGNE-io/aigne-framework/commit/58ef5d77046c49f3c4eed15b7f0cc283cbbcd74a))
* multiple input reminder ([#550](https://github.com/AIGNE-io/aigne-framework/issues/550)) ([0ab858f](https://github.com/AIGNE-io/aigne-framework/commit/0ab858fbe5177f02c1ca6af239b4171a358545df))
* **observability:** improve trace shutdown handling and exit status  ([#813](https://github.com/AIGNE-io/aigne-framework/issues/813)) ([6215f13](https://github.com/AIGNE-io/aigne-framework/commit/6215f13243b23103c1793a4559798f0e90722384))
* **observability:** prevent OOM by optimizing trace data storage strategy ([#767](https://github.com/AIGNE-io/aigne-framework/issues/767)) ([acd6476](https://github.com/AIGNE-io/aigne-framework/commit/acd6476936423c2186cb633086177541b0c0b558))
* **orchestrator:** enhance prompts with detailed guidance ([#811](https://github.com/AIGNE-io/aigne-framework/issues/811)) ([5656f38](https://github.com/AIGNE-io/aigne-framework/commit/5656f38c09e458e18b90e962a5e85c96755be2e4))
* **orchestrator:** support custom input schema for planner/worker/completer ([#823](https://github.com/AIGNE-io/aigne-framework/issues/823)) ([3d26f8b](https://github.com/AIGNE-io/aigne-framework/commit/3d26f8bac8b679010f25d9e4eb59fc6e80afda4c))
* prevent template rendering for agent and tool messages ([#572](https://github.com/AIGNE-io/aigne-framework/issues/572)) ([859687e](https://github.com/AIGNE-io/aigne-framework/commit/859687e499b07ffebced8b2cd89d4af676f6a462))
* properly handle SIGINT to flush observability data before exit ([#739](https://github.com/AIGNE-io/aigne-framework/issues/739)) ([99b4503](https://github.com/AIGNE-io/aigne-framework/commit/99b45033d5f3bcc1f830b583f9cca7258b00606f))
* resolve Windows file import URI issues ([#528](https://github.com/AIGNE-io/aigne-framework/issues/528)) ([bf807c5](https://github.com/AIGNE-io/aigne-framework/commit/bf807c5a3563c4423dc82fddff7fba280ef57957))
* return tree view instead of list for afs_list ([#774](https://github.com/AIGNE-io/aigne-framework/issues/774)) ([8ec2f93](https://github.com/AIGNE-io/aigne-framework/commit/8ec2f93fb5870f6404d886ad0197cc21c61dfd74))
* should not return local path from aigne hub service ([#460](https://github.com/AIGNE-io/aigne-framework/issues/460)) ([c959717](https://github.com/AIGNE-io/aigne-framework/commit/c95971774f7e84dbeb3313f60b3e6464e2bb22e4))
* standardize AFS skills return format with status and metadata ([#653](https://github.com/AIGNE-io/aigne-framework/issues/653)) ([66b6b00](https://github.com/AIGNE-io/aigne-framework/commit/66b6b005a846ab795e65e9f20b950c854a69ffd2))
* standardize file parameter naming across models ([#534](https://github.com/AIGNE-io/aigne-framework/issues/534)) ([f159a9d](https://github.com/AIGNE-io/aigne-framework/commit/f159a9d6af21ec0e99641996b150560929845845))
* support optional field sturectured output for gemini ([#468](https://github.com/AIGNE-io/aigne-framework/issues/468)) ([70c6279](https://github.com/AIGNE-io/aigne-framework/commit/70c62795039a2862e3333f26707329489bf938de))
* update deps compatibility in CommonJS environment ([#580](https://github.com/AIGNE-io/aigne-framework/issues/580)) ([a1e35d0](https://github.com/AIGNE-io/aigne-framework/commit/a1e35d016405accb51c1aeb6a544503a1c78e912))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/afs bumped to 1.4.0-beta.11
    * @aigne/afs-history bumped to 1.2.0-beta.12
</details>

<details><summary>deepseek: 0.7.62-beta.25</summary>

## [0.7.62-beta.25](https://github.com/AIGNE-io/aigne-framework/compare/deepseek-v0.7.62-beta.24...deepseek-v0.7.62-beta.25) (2026-01-16)


### Features

* add prompt caching for OpenAI/Gemini/Anthropic and cache token display ([#838](https://github.com/AIGNE-io/aigne-framework/issues/838)) ([46c628f](https://github.com/AIGNE-io/aigne-framework/commit/46c628f180572ea1b955d1a9888aad6145204842))


### Bug Fixes

* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* improve test coverage tracking and reporting ([#903](https://github.com/AIGNE-io/aigne-framework/issues/903)) ([031144e](https://github.com/AIGNE-io/aigne-framework/commit/031144e74f29e882cffe52ffda8f7a18c76ace7f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.16-beta.25
  * devDependencies
    * @aigne/core bumped to 1.72.0-beta.25
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>default-memory: 1.4.0-beta.24</summary>

## [1.4.0-beta.24](https://github.com/AIGNE-io/aigne-framework/compare/default-memory-v1.4.0-beta.23...default-memory-v1.4.0-beta.24) (2026-01-16)


### Features

* add modalities support for chat model ([#454](https://github.com/AIGNE-io/aigne-framework/issues/454)) ([70d1bf6](https://github.com/AIGNE-io/aigne-framework/commit/70d1bf631f4e711235d89c6df8ee210a19179b30))
* add session compact support for AIAgent ([#863](https://github.com/AIGNE-io/aigne-framework/issues/863)) ([9010918](https://github.com/AIGNE-io/aigne-framework/commit/9010918cd3f18b02b5c60ddc9ed5c34b568d0b28))
* **core:** add session history support ([#858](https://github.com/AIGNE-io/aigne-framework/issues/858)) ([28a070e](https://github.com/AIGNE-io/aigne-framework/commit/28a070ed33b821d1fd344b899706d817ca992b9f))


### Bug Fixes

* add options for system message reordering and merging ([#624](https://github.com/AIGNE-io/aigne-framework/issues/624)) ([8ca466d](https://github.com/AIGNE-io/aigne-framework/commit/8ca466d49d1e4ed08bc90922f39c0d3ed60c4fd5))
* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* **core:** auto merge multiple system messages ([#619](https://github.com/AIGNE-io/aigne-framework/issues/619)) ([e9e62c0](https://github.com/AIGNE-io/aigne-framework/commit/e9e62c03c45f5a9b75d44a07588b2b179e262aad))
* improve test coverage tracking and reporting ([#903](https://github.com/AIGNE-io/aigne-framework/issues/903)) ([031144e](https://github.com/AIGNE-io/aigne-framework/commit/031144e74f29e882cffe52ffda8f7a18c76ace7f))
* **models:** improve message structure handling and enable auto-message options ([#657](https://github.com/AIGNE-io/aigne-framework/issues/657)) ([233d70c](https://github.com/AIGNE-io/aigne-framework/commit/233d70cb292b937200fada8434f33d957d766ad6))
* update deps compatibility in CommonJS environment ([#580](https://github.com/AIGNE-io/aigne-framework/issues/580)) ([a1e35d0](https://github.com/AIGNE-io/aigne-framework/commit/a1e35d016405accb51c1aeb6a544503a1c78e912))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.72.0-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
    * @aigne/openai bumped to 0.16.16-beta.25
</details>

<details><summary>did-space-memory: 1.4.0-beta.24</summary>

## [1.4.0-beta.24](https://github.com/AIGNE-io/aigne-framework/compare/did-space-memory-v1.4.0-beta.23...did-space-memory-v1.4.0-beta.24) (2026-01-16)


### Features

* add session compact support for AIAgent ([#863](https://github.com/AIGNE-io/aigne-framework/issues/863)) ([9010918](https://github.com/AIGNE-io/aigne-framework/commit/9010918cd3f18b02b5c60ddc9ed5c34b568d0b28))
* support mount mcp agent into AFS ([#740](https://github.com/AIGNE-io/aigne-framework/issues/740)) ([6d474fc](https://github.com/AIGNE-io/aigne-framework/commit/6d474fc05845a15e2c3e8fa97727b409bdd70945))
* use a more secure signature mechanism ([#655](https://github.com/AIGNE-io/aigne-framework/issues/655)) ([aa5dc0c](https://github.com/AIGNE-io/aigne-framework/commit/aa5dc0ccdff8245a629cb30e731081528a555134))


### Bug Fixes

* bump deps to latest and fix build error ([#897](https://github.com/AIGNE-io/aigne-framework/issues/897)) ([4059e79](https://github.com/AIGNE-io/aigne-framework/commit/4059e790ae63b9e4ebd66487665014b0cd7ce6ec))
* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* improve test coverage tracking and reporting ([#903](https://github.com/AIGNE-io/aigne-framework/issues/903)) ([031144e](https://github.com/AIGNE-io/aigne-framework/commit/031144e74f29e882cffe52ffda8f7a18c76ace7f))
* update deps ([#802](https://github.com/AIGNE-io/aigne-framework/issues/802)) ([2bedc5c](https://github.com/AIGNE-io/aigne-framework/commit/2bedc5c01ac3b17ba00552ed8878e220fecbc0f0))
* update package ([#677](https://github.com/AIGNE-io/aigne-framework/issues/677)) ([a4ad78a](https://github.com/AIGNE-io/aigne-framework/commit/a4ad78a79e4f34eb6c0b00909e7707cd5dd9dd97))
* update package to latest ([#699](https://github.com/AIGNE-io/aigne-framework/issues/699)) ([9877f6d](https://github.com/AIGNE-io/aigne-framework/commit/9877f6d1975362338db4eb47a2bf3564114c3cf8))
* update package to latest ([#709](https://github.com/AIGNE-io/aigne-framework/issues/709)) ([47661ab](https://github.com/AIGNE-io/aigne-framework/commit/47661ab78cd13ce039d6ebf596e4e603c0220139))
* update package to latest ([#720](https://github.com/AIGNE-io/aigne-framework/issues/720)) ([4386549](https://github.com/AIGNE-io/aigne-framework/commit/43865497e71f86478bc75d7d6e181c4fac80eae5))
* update package to latest ([#790](https://github.com/AIGNE-io/aigne-framework/issues/790)) ([69c77b3](https://github.com/AIGNE-io/aigne-framework/commit/69c77b353667acc72a2f35eadca7892fb99838b6))
* upgrade dependencies and fix timestamp type ([#757](https://github.com/AIGNE-io/aigne-framework/issues/757)) ([652e8f4](https://github.com/AIGNE-io/aigne-framework/commit/652e8f4b6e9af1461b25336888d76fe1d731b9b5))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.72.0-beta.25
    * @aigne/openai bumped to 0.16.16-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>doubao: 1.3.0-beta.24</summary>

## [1.3.0-beta.24](https://github.com/AIGNE-io/aigne-framework/compare/doubao-v1.3.0-beta.23...doubao-v1.3.0-beta.24) (2026-01-16)


### Features

* add prompt caching for OpenAI/Gemini/Anthropic and cache token display ([#838](https://github.com/AIGNE-io/aigne-framework/issues/838)) ([46c628f](https://github.com/AIGNE-io/aigne-framework/commit/46c628f180572ea1b955d1a9888aad6145204842))
* improve image model architecture and file handling ([#527](https://github.com/AIGNE-io/aigne-framework/issues/527)) ([4db50aa](https://github.com/AIGNE-io/aigne-framework/commit/4db50aa0387a1a0f045ca11aaa61613e36ca7597))


### Bug Fixes

* add fetch utility with timeout and enhanced error handling ([#694](https://github.com/AIGNE-io/aigne-framework/issues/694)) ([c2d4076](https://github.com/AIGNE-io/aigne-framework/commit/c2d4076ec590150d2751591a4f723721f78381e9))
* add prefer input file type option for image model ([#536](https://github.com/AIGNE-io/aigne-framework/issues/536)) ([3cba8a5](https://github.com/AIGNE-io/aigne-framework/commit/3cba8a5562233a1567b49b6dd5c446c0760f5c4c))
* add timeout to doubao and ideogram image models ([#761](https://github.com/AIGNE-io/aigne-framework/issues/761)) ([c232483](https://github.com/AIGNE-io/aigne-framework/commit/c232483c6024426524c3310e64b22d9f63206227))
* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* improve test coverage tracking and reporting ([#903](https://github.com/AIGNE-io/aigne-framework/issues/903)) ([031144e](https://github.com/AIGNE-io/aigne-framework/commit/031144e74f29e882cffe52ffda8f7a18c76ace7f))
* release new version ([#509](https://github.com/AIGNE-io/aigne-framework/issues/509)) ([822ccd2](https://github.com/AIGNE-io/aigne-framework/commit/822ccd2c374cdcef187066e102dc79230e2eebff))
* standardize file parameter naming across models ([#534](https://github.com/AIGNE-io/aigne-framework/issues/534)) ([f159a9d](https://github.com/AIGNE-io/aigne-framework/commit/f159a9d6af21ec0e99641996b150560929845845))
* support the correct 3.0 model ([#514](https://github.com/AIGNE-io/aigne-framework/issues/514)) ([98e0d44](https://github.com/AIGNE-io/aigne-framework/commit/98e0d44ce2c4c7b043d5fc934c6e312ffa821521))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.16-beta.25
  * devDependencies
    * @aigne/core bumped to 1.72.0-beta.25
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>example-afs-git: 1.1.0-beta</summary>

## [1.1.0-beta](https://github.com/AIGNE-io/aigne-framework/compare/example-afs-git-v1.0.0...example-afs-git-v1.1.0-beta) (2026-01-16)


### Features

* **afs:** add AFSGit module support mount a git repo to AFS ([e1e030c](https://github.com/AIGNE-io/aigne-framework/commit/e1e030c181860d06c1c945b4acdcf67d9d708662))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/afs bumped to 1.4.0-beta.11
    * @aigne/afs-history bumped to 1.2.0-beta.12
    * @aigne/afs-git bumped to 1.1.0-beta
    * @aigne/cli bumped to 1.59.0-beta.31
    * @aigne/core bumped to 1.72.0-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>example-afs-local-fs: 1.3.0-beta.31</summary>

## [1.3.0-beta.31](https://github.com/AIGNE-io/aigne-framework/compare/example-afs-local-fs-v1.2.6-beta.31...example-afs-local-fs-v1.3.0-beta.31) (2026-01-16)


### Features

* support mount mcp agent into AFS ([#740](https://github.com/AIGNE-io/aigne-framework/issues/740)) ([6d474fc](https://github.com/AIGNE-io/aigne-framework/commit/6d474fc05845a15e2c3e8fa97727b409bdd70945))


### Bug Fixes

* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* **cli:** rename cmd option --chat to --interactive ([#865](https://github.com/AIGNE-io/aigne-framework/issues/865)) ([480eca4](https://github.com/AIGNE-io/aigne-framework/commit/480eca49a7381a330024f1f0026bbc5f89b57bbb))
* correct run example & doc improvements ([#707](https://github.com/AIGNE-io/aigne-framework/issues/707)) ([f98fc5d](https://github.com/AIGNE-io/aigne-framework/commit/f98fc5df28fd6ce6134128c2f0e5395c1554b740))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/afs bumped to 1.4.0-beta.11
    * @aigne/afs-history bumped to 1.2.0-beta.12
    * @aigne/afs-local-fs bumped to 1.4.0-beta.26
    * @aigne/cli bumped to 1.59.0-beta.31
    * @aigne/core bumped to 1.72.0-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>example-afs-mcp-server: 1.2.0-beta.31</summary>

## [1.2.0-beta.31](https://github.com/AIGNE-io/aigne-framework/compare/example-afs-mcp-server-v1.1.6-beta.31...example-afs-mcp-server-v1.2.0-beta.31) (2026-01-16)


### Features

* support mount mcp agent into AFS ([#740](https://github.com/AIGNE-io/aigne-framework/issues/740)) ([6d474fc](https://github.com/AIGNE-io/aigne-framework/commit/6d474fc05845a15e2c3e8fa97727b409bdd70945))


### Bug Fixes

* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* **cli:** rename cmd option --chat to --interactive ([#865](https://github.com/AIGNE-io/aigne-framework/issues/865)) ([480eca4](https://github.com/AIGNE-io/aigne-framework/commit/480eca49a7381a330024f1f0026bbc5f89b57bbb))
* correct run example & doc improvements ([#707](https://github.com/AIGNE-io/aigne-framework/issues/707)) ([f98fc5d](https://github.com/AIGNE-io/aigne-framework/commit/f98fc5df28fd6ce6134128c2f0e5395c1554b740))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/afs bumped to 1.4.0-beta.11
    * @aigne/afs-history bumped to 1.2.0-beta.12
    * @aigne/afs-local-fs bumped to 1.4.0-beta.26
    * @aigne/cli bumped to 1.59.0-beta.31
    * @aigne/core bumped to 1.72.0-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>example-afs-memory: 0.10.79-beta.32</summary>

## [0.10.79-beta.32](https://github.com/AIGNE-io/aigne-framework/compare/example-afs-memory-v0.10.79-beta.31...example-afs-memory-v0.10.79-beta.32) (2026-01-16)


### Features

* **afs:** add module access control and schema validation support ([#904](https://github.com/AIGNE-io/aigne-framework/issues/904)) ([d0b279a](https://github.com/AIGNE-io/aigne-framework/commit/d0b279aac07ebe2bcc1fd4148498fc3f6bbcd561))
* support mount mcp agent into AFS ([#740](https://github.com/AIGNE-io/aigne-framework/issues/740)) ([6d474fc](https://github.com/AIGNE-io/aigne-framework/commit/6d474fc05845a15e2c3e8fa97727b409bdd70945))


### Bug Fixes

* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* **cli:** rename cmd option --chat to --interactive ([#865](https://github.com/AIGNE-io/aigne-framework/issues/865)) ([480eca4](https://github.com/AIGNE-io/aigne-framework/commit/480eca49a7381a330024f1f0026bbc5f89b57bbb))
* correct run example & doc improvements ([#707](https://github.com/AIGNE-io/aigne-framework/issues/707)) ([f98fc5d](https://github.com/AIGNE-io/aigne-framework/commit/f98fc5df28fd6ce6134128c2f0e5395c1554b740))
* **examples:** use separate SQLite databases for each AFS memory module ([#753](https://github.com/AIGNE-io/aigne-framework/issues/753)) ([4454666](https://github.com/AIGNE-io/aigne-framework/commit/44546666c954041dab08adb5f3f8c9742b71f070))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/afs bumped to 1.4.0-beta.11
    * @aigne/afs-history bumped to 1.2.0-beta.12
    * @aigne/afs-user-profile-memory bumped to 1.3.0-beta.25
    * @aigne/cli bumped to 1.59.0-beta.31
    * @aigne/core bumped to 1.72.0-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>example-agent-skill: 1.0.1-beta.15</summary>

## [1.0.1-beta.15](https://github.com/AIGNE-io/aigne-framework/compare/example-agent-skill-v1.0.1-beta.14...example-agent-skill-v1.0.1-beta.15) (2026-01-16)


### Bug Fixes

* **afs:** support `~` in the local path for local-fs & add agent-skill example ([#877](https://github.com/AIGNE-io/aigne-framework/issues/877)) ([c86293f](https://github.com/AIGNE-io/aigne-framework/commit/c86293f3d70447974395d02e238305a42b256b66))
* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/cli bumped to 1.59.0-beta.31
</details>

<details><summary>example-chat-bot: 1.15.91-beta.32</summary>

## [1.15.91-beta.32](https://github.com/AIGNE-io/aigne-framework/compare/example-chat-bot-v1.15.91-beta.31...example-chat-bot-v1.15.91-beta.32) (2026-01-16)


### Bug Fixes

* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* **cli:** rename cmd option --chat to --interactive ([#865](https://github.com/AIGNE-io/aigne-framework/issues/865)) ([480eca4](https://github.com/AIGNE-io/aigne-framework/commit/480eca49a7381a330024f1f0026bbc5f89b57bbb))
* **cli:** run default agent if `entry-agent` argument not present ([#473](https://github.com/AIGNE-io/aigne-framework/issues/473)) ([8c46672](https://github.com/AIGNE-io/aigne-framework/commit/8c4667206a2336e74db07442dc296ef9f9265a0b))
* correct run example & doc improvements ([#707](https://github.com/AIGNE-io/aigne-framework/issues/707)) ([f98fc5d](https://github.com/AIGNE-io/aigne-framework/commit/f98fc5df28fd6ce6134128c2f0e5395c1554b740))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/cli bumped to 1.59.0-beta.31
</details>

<details><summary>example-mcp-blocklet: 1.18.0-beta.31</summary>

## [1.18.0-beta.31](https://github.com/AIGNE-io/aigne-framework/compare/example-mcp-blocklet-v1.18.0-beta.30...example-mcp-blocklet-v1.18.0-beta.31) (2026-01-16)


### Features

* **afs:** add AFSJSON module support mount a JSON/yaml file to AFS ([6adedc6](https://github.com/AIGNE-io/aigne-framework/commit/6adedc624bedb1bc741da8534f2fbb41e1bc6623))


### Bug Fixes

* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* **cli:** rename cmd option --chat to --interactive ([#865](https://github.com/AIGNE-io/aigne-framework/issues/865)) ([480eca4](https://github.com/AIGNE-io/aigne-framework/commit/480eca49a7381a330024f1f0026bbc5f89b57bbb))
* correct run example & doc improvements ([#707](https://github.com/AIGNE-io/aigne-framework/issues/707)) ([f98fc5d](https://github.com/AIGNE-io/aigne-framework/commit/f98fc5df28fd6ce6134128c2f0e5395c1554b740))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.24.0-beta.27
    * @aigne/cli bumped to 1.59.0-beta.31
    * @aigne/core bumped to 1.72.0-beta.25
    * @aigne/default-memory bumped to 1.4.0-beta.24
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>example-mcp-github: 1.17.6-beta.32</summary>

## [1.17.6-beta.32](https://github.com/AIGNE-io/aigne-framework/compare/example-mcp-github-v1.17.6-beta.31...example-mcp-github-v1.17.6-beta.32) (2026-01-16)


### Bug Fixes

* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* **cli:** rename cmd option --chat to --interactive ([#865](https://github.com/AIGNE-io/aigne-framework/issues/865)) ([480eca4](https://github.com/AIGNE-io/aigne-framework/commit/480eca49a7381a330024f1f0026bbc5f89b57bbb))
* correct run example & doc improvements ([#707](https://github.com/AIGNE-io/aigne-framework/issues/707)) ([f98fc5d](https://github.com/AIGNE-io/aigne-framework/commit/f98fc5df28fd6ce6134128c2f0e5395c1554b740))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.24.0-beta.27
    * @aigne/cli bumped to 1.59.0-beta.31
    * @aigne/core bumped to 1.72.0-beta.25
    * @aigne/default-memory bumped to 1.4.0-beta.24
    * @aigne/openai bumped to 0.16.16-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>example-mcp-puppeteer: 1.19.6-beta.32</summary>

## [1.19.6-beta.32](https://github.com/AIGNE-io/aigne-framework/compare/example-mcp-puppeteer-v1.19.6-beta.31...example-mcp-puppeteer-v1.19.6-beta.32) (2026-01-16)


### Bug Fixes

* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* **cli:** rename cmd option --chat to --interactive ([#865](https://github.com/AIGNE-io/aigne-framework/issues/865)) ([480eca4](https://github.com/AIGNE-io/aigne-framework/commit/480eca49a7381a330024f1f0026bbc5f89b57bbb))
* correct run example & doc improvements ([#707](https://github.com/AIGNE-io/aigne-framework/issues/707)) ([f98fc5d](https://github.com/AIGNE-io/aigne-framework/commit/f98fc5df28fd6ce6134128c2f0e5395c1554b740))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.24.0-beta.27
    * @aigne/cli bumped to 1.59.0-beta.31
    * @aigne/core bumped to 1.72.0-beta.25
    * @aigne/default-memory bumped to 1.4.0-beta.24
    * @aigne/openai bumped to 0.16.16-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>example-mcp-server: 0.3.91-beta.32</summary>

## [0.3.91-beta.32](https://github.com/AIGNE-io/aigne-framework/compare/example-mcp-server-v0.3.91-beta.31...example-mcp-server-v0.3.91-beta.32) (2026-01-16)


### Bug Fixes

* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* correct run example & doc improvements ([#707](https://github.com/AIGNE-io/aigne-framework/issues/707)) ([f98fc5d](https://github.com/AIGNE-io/aigne-framework/commit/f98fc5df28fd6ce6134128c2f0e5395c1554b740))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/cli bumped to 1.59.0-beta.31
</details>

<details><summary>example-mcp-sqlite: 1.19.6-beta.32</summary>

## [1.19.6-beta.32](https://github.com/AIGNE-io/aigne-framework/compare/example-mcp-sqlite-v1.19.6-beta.31...example-mcp-sqlite-v1.19.6-beta.32) (2026-01-16)


### Bug Fixes

* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* **cli:** rename cmd option --chat to --interactive ([#865](https://github.com/AIGNE-io/aigne-framework/issues/865)) ([480eca4](https://github.com/AIGNE-io/aigne-framework/commit/480eca49a7381a330024f1f0026bbc5f89b57bbb))
* correct run example & doc improvements ([#707](https://github.com/AIGNE-io/aigne-framework/issues/707)) ([f98fc5d](https://github.com/AIGNE-io/aigne-framework/commit/f98fc5df28fd6ce6134128c2f0e5395c1554b740))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.24.0-beta.27
    * @aigne/cli bumped to 1.59.0-beta.31
    * @aigne/core bumped to 1.72.0-beta.25
    * @aigne/default-memory bumped to 1.4.0-beta.24
    * @aigne/openai bumped to 0.16.16-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>example-nano-banana: 1.3.0-beta.31</summary>

## [1.3.0-beta.31](https://github.com/AIGNE-io/aigne-framework/compare/example-nano-banana-v1.2.6-beta.31...example-nano-banana-v1.3.0-beta.31) (2026-01-16)


### Features

* add modalities support for chat model ([#454](https://github.com/AIGNE-io/aigne-framework/issues/454)) ([70d1bf6](https://github.com/AIGNE-io/aigne-framework/commit/70d1bf631f4e711235d89c6df8ee210a19179b30))
* improve image model architecture and file handling ([#527](https://github.com/AIGNE-io/aigne-framework/issues/527)) ([4db50aa](https://github.com/AIGNE-io/aigne-framework/commit/4db50aa0387a1a0f045ca11aaa61613e36ca7597))


### Bug Fixes

* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* **cli:** rename cmd option --chat to --interactive ([#865](https://github.com/AIGNE-io/aigne-framework/issues/865)) ([480eca4](https://github.com/AIGNE-io/aigne-framework/commit/480eca49a7381a330024f1f0026bbc5f89b57bbb))
* correct run example & doc improvements ([#707](https://github.com/AIGNE-io/aigne-framework/issues/707)) ([f98fc5d](https://github.com/AIGNE-io/aigne-framework/commit/f98fc5df28fd6ce6134128c2f0e5395c1554b740))
* should not return local path from aigne hub service ([#460](https://github.com/AIGNE-io/aigne-framework/issues/460)) ([c959717](https://github.com/AIGNE-io/aigne-framework/commit/c95971774f7e84dbeb3313f60b3e6464e2bb22e4))
* standardize file parameter naming across models ([#534](https://github.com/AIGNE-io/aigne-framework/issues/534)) ([f159a9d](https://github.com/AIGNE-io/aigne-framework/commit/f159a9d6af21ec0e99641996b150560929845845))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.24.0-beta.27
    * @aigne/aigne-hub bumped to 0.10.16-beta.31
    * @aigne/cli bumped to 1.59.0-beta.31
    * @aigne/core bumped to 1.72.0-beta.25
    * @aigne/default-memory bumped to 1.4.0-beta.24
    * @aigne/fs-memory bumped to 1.2.0-beta.24
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>example-workflow-code-execution: 1.18.6-beta.32</summary>

## [1.18.6-beta.32](https://github.com/AIGNE-io/aigne-framework/compare/example-workflow-code-execution-v1.18.6-beta.31...example-workflow-code-execution-v1.18.6-beta.32) (2026-01-16)


### Bug Fixes

* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* **cli:** rename cmd option --chat to --interactive ([#865](https://github.com/AIGNE-io/aigne-framework/issues/865)) ([480eca4](https://github.com/AIGNE-io/aigne-framework/commit/480eca49a7381a330024f1f0026bbc5f89b57bbb))
* correct run example & doc improvements ([#707](https://github.com/AIGNE-io/aigne-framework/issues/707)) ([f98fc5d](https://github.com/AIGNE-io/aigne-framework/commit/f98fc5df28fd6ce6134128c2f0e5395c1554b740))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.24.0-beta.27
    * @aigne/cli bumped to 1.59.0-beta.31
    * @aigne/core bumped to 1.72.0-beta.25
    * @aigne/default-memory bumped to 1.4.0-beta.24
    * @aigne/openai bumped to 0.16.16-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>example-workflow-concurrency: 1.16.88-beta.32</summary>

## [1.16.88-beta.32](https://github.com/AIGNE-io/aigne-framework/compare/example-workflow-concurrency-v1.16.88-beta.31...example-workflow-concurrency-v1.16.88-beta.32) (2026-01-16)


### Bug Fixes

* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* **cli:** rename cmd option --chat to --interactive ([#865](https://github.com/AIGNE-io/aigne-framework/issues/865)) ([480eca4](https://github.com/AIGNE-io/aigne-framework/commit/480eca49a7381a330024f1f0026bbc5f89b57bbb))
* correct run example & doc improvements ([#707](https://github.com/AIGNE-io/aigne-framework/issues/707)) ([f98fc5d](https://github.com/AIGNE-io/aigne-framework/commit/f98fc5df28fd6ce6134128c2f0e5395c1554b740))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.24.0-beta.27
    * @aigne/cli bumped to 1.59.0-beta.31
    * @aigne/core bumped to 1.72.0-beta.25
    * @aigne/openai bumped to 0.16.16-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>example-workflow-group-chat: 1.19.0-beta.31</summary>

## [1.19.0-beta.31](https://github.com/AIGNE-io/aigne-framework/compare/example-workflow-group-chat-v1.18.6-beta.31...example-workflow-group-chat-v1.19.0-beta.31) (2026-01-16)


### Features

* **cli:** add searchable checkbox component with dynamic filtering ([#426](https://github.com/AIGNE-io/aigne-framework/issues/426)) ([1a76fe7](https://github.com/AIGNE-io/aigne-framework/commit/1a76fe7c2f7d91bc4041dfcd73850b39a18a036b))


### Bug Fixes

* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* **cli:** rename cmd option --chat to --interactive ([#865](https://github.com/AIGNE-io/aigne-framework/issues/865)) ([480eca4](https://github.com/AIGNE-io/aigne-framework/commit/480eca49a7381a330024f1f0026bbc5f89b57bbb))
* correct run example & doc improvements ([#707](https://github.com/AIGNE-io/aigne-framework/issues/707)) ([f98fc5d](https://github.com/AIGNE-io/aigne-framework/commit/f98fc5df28fd6ce6134128c2f0e5395c1554b740))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.24.0-beta.27
    * @aigne/cli bumped to 1.59.0-beta.31
    * @aigne/core bumped to 1.72.0-beta.25
    * @aigne/default-memory bumped to 1.4.0-beta.24
    * @aigne/openai bumped to 0.16.16-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>example-workflow-handoff: 1.17.6-beta.32</summary>

## [1.17.6-beta.32](https://github.com/AIGNE-io/aigne-framework/compare/example-workflow-handoff-v1.17.6-beta.31...example-workflow-handoff-v1.17.6-beta.32) (2026-01-16)


### Bug Fixes

* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* **cli:** rename cmd option --chat to --interactive ([#865](https://github.com/AIGNE-io/aigne-framework/issues/865)) ([480eca4](https://github.com/AIGNE-io/aigne-framework/commit/480eca49a7381a330024f1f0026bbc5f89b57bbb))
* correct run example & doc improvements ([#707](https://github.com/AIGNE-io/aigne-framework/issues/707)) ([f98fc5d](https://github.com/AIGNE-io/aigne-framework/commit/f98fc5df28fd6ce6134128c2f0e5395c1554b740))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.24.0-beta.27
    * @aigne/cli bumped to 1.59.0-beta.31
    * @aigne/core bumped to 1.72.0-beta.25
    * @aigne/default-memory bumped to 1.4.0-beta.24
    * @aigne/openai bumped to 0.16.16-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>example-workflow-orchestrator: 1.15.0-beta.31</summary>

## [1.15.0-beta.31](https://github.com/AIGNE-io/aigne-framework/compare/example-workflow-orchestrator-v1.15.0-beta.30...example-workflow-orchestrator-v1.15.0-beta.31) (2026-01-16)


### Features

* **core:** add session history support ([#858](https://github.com/AIGNE-io/aigne-framework/issues/858)) ([28a070e](https://github.com/AIGNE-io/aigne-framework/commit/28a070ed33b821d1fd344b899706d817ca992b9f))
* support define agent by third library & orchestrator agent refactor ([#799](https://github.com/AIGNE-io/aigne-framework/issues/799)) ([7264b11](https://github.com/AIGNE-io/aigne-framework/commit/7264b11ab6eed787e928367f09aa08d254968d40))


### Bug Fixes

* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* **cli:** rename cmd option --chat to --interactive ([#865](https://github.com/AIGNE-io/aigne-framework/issues/865)) ([480eca4](https://github.com/AIGNE-io/aigne-framework/commit/480eca49a7381a330024f1f0026bbc5f89b57bbb))
* correct run example & doc improvements ([#707](https://github.com/AIGNE-io/aigne-framework/issues/707)) ([f98fc5d](https://github.com/AIGNE-io/aigne-framework/commit/f98fc5df28fd6ce6134128c2f0e5395c1554b740))
* **orchestrator:** add default task title for worker agent ([#809](https://github.com/AIGNE-io/aigne-framework/issues/809)) ([3524c3c](https://github.com/AIGNE-io/aigne-framework/commit/3524c3c03c6a6822656c8b1684660677af49d508))
* **orchestrator:** enhance prompts with detailed guidance ([#811](https://github.com/AIGNE-io/aigne-framework/issues/811)) ([5656f38](https://github.com/AIGNE-io/aigne-framework/commit/5656f38c09e458e18b90e962a5e85c96755be2e4))
* remove files entry from package.json include all files ([02a0a1b](https://github.com/AIGNE-io/aigne-framework/commit/02a0a1bebb249a525bcda4d443b4d080b1d3db2d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.24.0-beta.27
    * @aigne/cli bumped to 1.59.0-beta.31
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>example-workflow-reflection: 1.15.89-beta.32</summary>

## [1.15.89-beta.32](https://github.com/AIGNE-io/aigne-framework/compare/example-workflow-reflection-v1.15.89-beta.31...example-workflow-reflection-v1.15.89-beta.32) (2026-01-16)


### Bug Fixes

* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* **cli:** rename cmd option --chat to --interactive ([#865](https://github.com/AIGNE-io/aigne-framework/issues/865)) ([480eca4](https://github.com/AIGNE-io/aigne-framework/commit/480eca49a7381a330024f1f0026bbc5f89b57bbb))
* correct run example & doc improvements ([#707](https://github.com/AIGNE-io/aigne-framework/issues/707)) ([f98fc5d](https://github.com/AIGNE-io/aigne-framework/commit/f98fc5df28fd6ce6134128c2f0e5395c1554b740))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.24.0-beta.27
    * @aigne/cli bumped to 1.59.0-beta.31
    * @aigne/core bumped to 1.72.0-beta.25
    * @aigne/openai bumped to 0.16.16-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>example-workflow-router: 1.19.6-beta.32</summary>

## [1.19.6-beta.32](https://github.com/AIGNE-io/aigne-framework/compare/example-workflow-router-v1.19.6-beta.31...example-workflow-router-v1.19.6-beta.32) (2026-01-16)


### Bug Fixes

* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* **cli:** rename cmd option --chat to --interactive ([#865](https://github.com/AIGNE-io/aigne-framework/issues/865)) ([480eca4](https://github.com/AIGNE-io/aigne-framework/commit/480eca49a7381a330024f1f0026bbc5f89b57bbb))
* correct run example & doc improvements ([#707](https://github.com/AIGNE-io/aigne-framework/issues/707)) ([f98fc5d](https://github.com/AIGNE-io/aigne-framework/commit/f98fc5df28fd6ce6134128c2f0e5395c1554b740))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.24.0-beta.27
    * @aigne/cli bumped to 1.59.0-beta.31
    * @aigne/core bumped to 1.72.0-beta.25
    * @aigne/default-memory bumped to 1.4.0-beta.24
    * @aigne/openai bumped to 0.16.16-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>example-workflow-sequential: 1.17.88-beta.32</summary>

## [1.17.88-beta.32](https://github.com/AIGNE-io/aigne-framework/compare/example-workflow-sequential-v1.17.88-beta.31...example-workflow-sequential-v1.17.88-beta.32) (2026-01-16)


### Bug Fixes

* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* **cli:** rename cmd option --chat to --interactive ([#865](https://github.com/AIGNE-io/aigne-framework/issues/865)) ([480eca4](https://github.com/AIGNE-io/aigne-framework/commit/480eca49a7381a330024f1f0026bbc5f89b57bbb))
* correct run example & doc improvements ([#707](https://github.com/AIGNE-io/aigne-framework/issues/707)) ([f98fc5d](https://github.com/AIGNE-io/aigne-framework/commit/f98fc5df28fd6ce6134128c2f0e5395c1554b740))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.24.0-beta.27
    * @aigne/cli bumped to 1.59.0-beta.31
    * @aigne/core bumped to 1.72.0-beta.25
    * @aigne/openai bumped to 0.16.16-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>fs-memory: 1.2.0-beta.24</summary>

## [1.2.0-beta.24](https://github.com/AIGNE-io/aigne-framework/compare/fs-memory-v1.2.0-beta.23...fs-memory-v1.2.0-beta.24) (2026-01-16)


### Features

* add session compact support for AIAgent ([#863](https://github.com/AIGNE-io/aigne-framework/issues/863)) ([9010918](https://github.com/AIGNE-io/aigne-framework/commit/9010918cd3f18b02b5c60ddc9ed5c34b568d0b28))


### Bug Fixes

* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* improve test coverage tracking and reporting ([#903](https://github.com/AIGNE-io/aigne-framework/issues/903)) ([031144e](https://github.com/AIGNE-io/aigne-framework/commit/031144e74f29e882cffe52ffda8f7a18c76ace7f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.72.0-beta.25
    * @aigne/openai bumped to 0.16.16-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>gemini: 0.14.16-beta.26</summary>

## [0.14.16-beta.26](https://github.com/AIGNE-io/aigne-framework/compare/gemini-v0.14.16-beta.25...gemini-v0.14.16-beta.26) (2026-01-16)


### Features

* add dynamic model options resolution with getter pattern ([#708](https://github.com/AIGNE-io/aigne-framework/issues/708)) ([5ed5085](https://github.com/AIGNE-io/aigne-framework/commit/5ed5085203763c70194853c56edc13acf56d81c6))
* add modalities support for chat model ([#454](https://github.com/AIGNE-io/aigne-framework/issues/454)) ([70d1bf6](https://github.com/AIGNE-io/aigne-framework/commit/70d1bf631f4e711235d89c6df8ee210a19179b30))
* add prompt caching for OpenAI/Gemini/Anthropic and cache token display ([#838](https://github.com/AIGNE-io/aigne-framework/issues/838)) ([46c628f](https://github.com/AIGNE-io/aigne-framework/commit/46c628f180572ea1b955d1a9888aad6145204842))
* add reasoningEffort option for chat model ([#680](https://github.com/AIGNE-io/aigne-framework/issues/680)) ([f69d232](https://github.com/AIGNE-io/aigne-framework/commit/f69d232d714d4a3e4946bdc8c6598747c9bcbd57))
* add thinking support to Gemini chat models ([#650](https://github.com/AIGNE-io/aigne-framework/issues/650)) ([09b828b](https://github.com/AIGNE-io/aigne-framework/commit/09b828ba668d90cc6aac68a5e8190adb146b5e45))
* **core:** add nested getter pattern support for model options ([#796](https://github.com/AIGNE-io/aigne-framework/issues/796)) ([824b2fe](https://github.com/AIGNE-io/aigne-framework/commit/824b2fe55cb2a24620e2bb73b470532918fa2996))
* improve image model architecture and file handling ([#527](https://github.com/AIGNE-io/aigne-framework/issues/527)) ([4db50aa](https://github.com/AIGNE-io/aigne-framework/commit/4db50aa0387a1a0f045ca11aaa61613e36ca7597))
* **models:** support gemini 3.x thinking level and thoughtSignature ([#760](https://github.com/AIGNE-io/aigne-framework/issues/760)) ([243f2d4](https://github.com/AIGNE-io/aigne-framework/commit/243f2d457792a20ba2b87378576092e6f88e319c))
* **model:** support video model ([#647](https://github.com/AIGNE-io/aigne-framework/issues/647)) ([de81742](https://github.com/AIGNE-io/aigne-framework/commit/de817421ef1dd3246d0d8c51ff12f0a855658f9f))
* support custom prefer input file type ([#469](https://github.com/AIGNE-io/aigne-framework/issues/469)) ([db0161b](https://github.com/AIGNE-io/aigne-framework/commit/db0161bbac52542c771ee2f40f361636b0668075))
* support define agent by third library & orchestrator agent refactor ([#799](https://github.com/AIGNE-io/aigne-framework/issues/799)) ([7264b11](https://github.com/AIGNE-io/aigne-framework/commit/7264b11ab6eed787e928367f09aa08d254968d40))


### Bug Fixes

* add prefer input file type option for image model ([#536](https://github.com/AIGNE-io/aigne-framework/issues/536)) ([3cba8a5](https://github.com/AIGNE-io/aigne-framework/commit/3cba8a5562233a1567b49b6dd5c446c0760f5c4c))
* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* **core:** preserve Agent Skill in session compact and support complex tool result content ([#876](https://github.com/AIGNE-io/aigne-framework/issues/876)) ([edb86ae](https://github.com/AIGNE-io/aigne-framework/commit/edb86ae2b9cfe56a8f08b276f843606e310566cf))
* **core:** simplify token-estimator logic for remaining characters ([45d43cc](https://github.com/AIGNE-io/aigne-framework/commit/45d43ccd3afd636cfb459eea2e6551e8f9c53765))
* correct calculate token usage for gemini model ([7fd1328](https://github.com/AIGNE-io/aigne-framework/commit/7fd13289d3d0f8e062211f7c6dd5cb56e5318c1b))
* correct run example & doc improvements ([#707](https://github.com/AIGNE-io/aigne-framework/issues/707)) ([f98fc5d](https://github.com/AIGNE-io/aigne-framework/commit/f98fc5df28fd6ce6134128c2f0e5395c1554b740))
* **docs:** update video mode docs ([#695](https://github.com/AIGNE-io/aigne-framework/issues/695)) ([d691001](https://github.com/AIGNE-io/aigne-framework/commit/d69100169457c16c14f2f3e2f7fcd6b2a99330f3))
* **gemini:** handle empty responses when files are present ([#648](https://github.com/AIGNE-io/aigne-framework/issues/648)) ([f4e259c](https://github.com/AIGNE-io/aigne-framework/commit/f4e259c5e5c687c347bb5cf29cbb0b5bf4d0d4a1))
* **gemini:** implement retry mechanism for empty responses with structured output fallback ([#638](https://github.com/AIGNE-io/aigne-framework/issues/638)) ([d33c8bb](https://github.com/AIGNE-io/aigne-framework/commit/d33c8bb9711aadddef9687d6cf472a179cd8ed9c))
* **gemini:** include thoughts token count in output token usage ([#669](https://github.com/AIGNE-io/aigne-framework/issues/669)) ([f6ff10c](https://github.com/AIGNE-io/aigne-framework/commit/f6ff10c33b0612a0bc416842c5a5bec3850a3fe6))
* **gemini:** properly handle thinking level for gemini 3.x models ([#763](https://github.com/AIGNE-io/aigne-framework/issues/763)) ([a5dc892](https://github.com/AIGNE-io/aigne-framework/commit/a5dc8921635811ed9ca2ff9e3e0699006f79cf22))
* **gemini:** return reasoningEffort in model options for gemini-3 ([#765](https://github.com/AIGNE-io/aigne-framework/issues/765)) ([682bfda](https://github.com/AIGNE-io/aigne-framework/commit/682bfda353b31fd432232baa57f8e0b0838eb76d))
* **gemini:** should include at least one user message ([#521](https://github.com/AIGNE-io/aigne-framework/issues/521)) ([eb2752e](https://github.com/AIGNE-io/aigne-framework/commit/eb2752ed7d78f59c435ecc3ccb7227e804e3781e))
* **gemini:** use StructuredOutputError to trigger retry for missing JSON response ([#660](https://github.com/AIGNE-io/aigne-framework/issues/660)) ([e8826ed](https://github.com/AIGNE-io/aigne-framework/commit/e8826ed96db57bfcce0b577881bf0d2fd828c269))
* improve image model parameters ([#530](https://github.com/AIGNE-io/aigne-framework/issues/530)) ([d66b5ca](https://github.com/AIGNE-io/aigne-framework/commit/d66b5ca01e14baad2712cc1a84930cdb63703232))
* improve test coverage tracking and reporting ([#903](https://github.com/AIGNE-io/aigne-framework/issues/903)) ([031144e](https://github.com/AIGNE-io/aigne-framework/commit/031144e74f29e882cffe52ffda8f7a18c76ace7f))
* **model:** handle large video files by uploading to Files API ([#769](https://github.com/AIGNE-io/aigne-framework/issues/769)) ([5fd7661](https://github.com/AIGNE-io/aigne-framework/commit/5fd76613bd7301cc76bde933de2095a6d86f8c7e))
* **models:** add image parameters support for video generation ([#684](https://github.com/AIGNE-io/aigne-framework/issues/684)) ([b048b7f](https://github.com/AIGNE-io/aigne-framework/commit/b048b7f92bd7a532dbdbeb6fb5fa5499bae6b953))
* **models:** add imageConfig to gemini image model ([#621](https://github.com/AIGNE-io/aigne-framework/issues/621)) ([252de7a](https://github.com/AIGNE-io/aigne-framework/commit/252de7a10701c4f5302c2fff977c88e5e833b7b1))
* **models:** add mineType for transform file ([#667](https://github.com/AIGNE-io/aigne-framework/issues/667)) ([155a173](https://github.com/AIGNE-io/aigne-framework/commit/155a173e75aff1dbe870a1305455a4300942e07a))
* **models:** aigne hub video params ([#665](https://github.com/AIGNE-io/aigne-framework/issues/665)) ([d00f836](https://github.com/AIGNE-io/aigne-framework/commit/d00f8368422d8e3707b974e1aff06714731ebb28))
* **models:** auto retry when got emtpy response from gemini ([#636](https://github.com/AIGNE-io/aigne-framework/issues/636)) ([9367cef](https://github.com/AIGNE-io/aigne-framework/commit/9367cef49ea4c0c87b8a36b454deb2efaee6886f))
* **models:** enhance gemini model tool use with status fields ([#634](https://github.com/AIGNE-io/aigne-framework/issues/634)) ([067b175](https://github.com/AIGNE-io/aigne-framework/commit/067b175c8e31bb5b1a6d0fc5a5cfb2d070d8d709))
* **models:** improve message structure handling and enable auto-message options ([#657](https://github.com/AIGNE-io/aigne-framework/issues/657)) ([233d70c](https://github.com/AIGNE-io/aigne-framework/commit/233d70cb292b937200fada8434f33d957d766ad6))
* **models:** parallel tool calls for gemini model ([#844](https://github.com/AIGNE-io/aigne-framework/issues/844)) ([adfae33](https://github.com/AIGNE-io/aigne-framework/commit/adfae337709295b594a8f5da61213535d2ef61aa))
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
    * @aigne/core bumped to 1.72.0-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>ideogram: 0.4.16-beta.25</summary>

## [0.4.16-beta.25](https://github.com/AIGNE-io/aigne-framework/compare/ideogram-v0.4.16-beta.24...ideogram-v0.4.16-beta.25) (2026-01-16)


### Features

* improve image model architecture and file handling ([#527](https://github.com/AIGNE-io/aigne-framework/issues/527)) ([4db50aa](https://github.com/AIGNE-io/aigne-framework/commit/4db50aa0387a1a0f045ca11aaa61613e36ca7597))


### Bug Fixes

* add fetch utility with timeout and enhanced error handling ([#694](https://github.com/AIGNE-io/aigne-framework/issues/694)) ([c2d4076](https://github.com/AIGNE-io/aigne-framework/commit/c2d4076ec590150d2751591a4f723721f78381e9))
* add prefer input file type option for image model ([#536](https://github.com/AIGNE-io/aigne-framework/issues/536)) ([3cba8a5](https://github.com/AIGNE-io/aigne-framework/commit/3cba8a5562233a1567b49b6dd5c446c0760f5c4c))
* add timeout to doubao and ideogram image models ([#761](https://github.com/AIGNE-io/aigne-framework/issues/761)) ([c232483](https://github.com/AIGNE-io/aigne-framework/commit/c232483c6024426524c3310e64b22d9f63206227))
* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* improve test coverage tracking and reporting ([#903](https://github.com/AIGNE-io/aigne-framework/issues/903)) ([031144e](https://github.com/AIGNE-io/aigne-framework/commit/031144e74f29e882cffe52ffda8f7a18c76ace7f))
* move zod from devDependencies to dependencies in ideogram model ([#539](https://github.com/AIGNE-io/aigne-framework/issues/539)) ([9a08529](https://github.com/AIGNE-io/aigne-framework/commit/9a08529c53a40817acc831fb9b1925e200671f40))
* standardize file parameter naming across models ([#534](https://github.com/AIGNE-io/aigne-framework/issues/534)) ([f159a9d](https://github.com/AIGNE-io/aigne-framework/commit/f159a9d6af21ec0e99641996b150560929845845))
* support gemini-2.0-flash model for image model ([#429](https://github.com/AIGNE-io/aigne-framework/issues/429)) ([5a0bba1](https://github.com/AIGNE-io/aigne-framework/commit/5a0bba197cf8785384b70302f86cf702d04b7fc4))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.72.0-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>lmstudio: 1.2.0-beta.24</summary>

## [1.2.0-beta.24](https://github.com/AIGNE-io/aigne-framework/compare/lmstudio-v1.1.6-beta.24...lmstudio-v1.2.0-beta.24) (2026-01-16)


### Features

* add lmstudio model adapter ([#406](https://github.com/AIGNE-io/aigne-framework/issues/406)) ([6610993](https://github.com/AIGNE-io/aigne-framework/commit/6610993cb500b1fac2bf5d17f40f351d4c897bd7))


### Bug Fixes

* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* improve test coverage tracking and reporting ([#903](https://github.com/AIGNE-io/aigne-framework/issues/903)) ([031144e](https://github.com/AIGNE-io/aigne-framework/commit/031144e74f29e882cffe52ffda8f7a18c76ace7f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.16-beta.25
  * devDependencies
    * @aigne/core bumped to 1.72.0-beta.25
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>ollama: 0.7.62-beta.25</summary>

## [0.7.62-beta.25](https://github.com/AIGNE-io/aigne-framework/compare/ollama-v0.7.62-beta.24...ollama-v0.7.62-beta.25) (2026-01-16)


### Bug Fixes

* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* improve test coverage tracking and reporting ([#903](https://github.com/AIGNE-io/aigne-framework/issues/903)) ([031144e](https://github.com/AIGNE-io/aigne-framework/commit/031144e74f29e882cffe52ffda8f7a18c76ace7f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.16-beta.25
  * devDependencies
    * @aigne/core bumped to 1.72.0-beta.25
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>open-router: 0.7.62-beta.25</summary>

## [0.7.62-beta.25](https://github.com/AIGNE-io/aigne-framework/compare/open-router-v0.7.62-beta.24...open-router-v0.7.62-beta.25) (2026-01-16)


### Bug Fixes

* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* improve test coverage tracking and reporting ([#903](https://github.com/AIGNE-io/aigne-framework/issues/903)) ([031144e](https://github.com/AIGNE-io/aigne-framework/commit/031144e74f29e882cffe52ffda8f7a18c76ace7f))
* **models:** enable parallel tool calls for open router model ([0aa7d1b](https://github.com/AIGNE-io/aigne-framework/commit/0aa7d1ba30907ee820b793e20e42c4201ca763cc))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.16-beta.25
  * devDependencies
    * @aigne/core bumped to 1.72.0-beta.25
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>openai: 0.16.16-beta.25</summary>

## [0.16.16-beta.25](https://github.com/AIGNE-io/aigne-framework/compare/openai-v0.16.16-beta.24...openai-v0.16.16-beta.25) (2026-01-16)


### Features

* add dynamic model options resolution with getter pattern ([#708](https://github.com/AIGNE-io/aigne-framework/issues/708)) ([5ed5085](https://github.com/AIGNE-io/aigne-framework/commit/5ed5085203763c70194853c56edc13acf56d81c6))
* add modalities support for chat model ([#454](https://github.com/AIGNE-io/aigne-framework/issues/454)) ([70d1bf6](https://github.com/AIGNE-io/aigne-framework/commit/70d1bf631f4e711235d89c6df8ee210a19179b30))
* add prompt caching for OpenAI/Gemini/Anthropic and cache token display ([#838](https://github.com/AIGNE-io/aigne-framework/issues/838)) ([46c628f](https://github.com/AIGNE-io/aigne-framework/commit/46c628f180572ea1b955d1a9888aad6145204842))
* add reasoningEffort option for chat model ([#680](https://github.com/AIGNE-io/aigne-framework/issues/680)) ([f69d232](https://github.com/AIGNE-io/aigne-framework/commit/f69d232d714d4a3e4946bdc8c6598747c9bcbd57))
* **core:** add automatic JSON parsing and validation for structured outputs ([#548](https://github.com/AIGNE-io/aigne-framework/issues/548)) ([9077f93](https://github.com/AIGNE-io/aigne-framework/commit/9077f93856865915aaf5e8caa5638ef0b7f05b1e))
* **core:** add nested getter pattern support for model options ([#796](https://github.com/AIGNE-io/aigne-framework/issues/796)) ([824b2fe](https://github.com/AIGNE-io/aigne-framework/commit/824b2fe55cb2a24620e2bb73b470532918fa2996))
* improve image model architecture and file handling ([#527](https://github.com/AIGNE-io/aigne-framework/issues/527)) ([4db50aa](https://github.com/AIGNE-io/aigne-framework/commit/4db50aa0387a1a0f045ca11aaa61613e36ca7597))
* **model:** support video model ([#647](https://github.com/AIGNE-io/aigne-framework/issues/647)) ([de81742](https://github.com/AIGNE-io/aigne-framework/commit/de817421ef1dd3246d0d8c51ff12f0a855658f9f))
* support custom prefer input file type ([#469](https://github.com/AIGNE-io/aigne-framework/issues/469)) ([db0161b](https://github.com/AIGNE-io/aigne-framework/commit/db0161bbac52542c771ee2f40f361636b0668075))


### Bug Fixes

* add prefer input file type option for image model ([#536](https://github.com/AIGNE-io/aigne-framework/issues/536)) ([3cba8a5](https://github.com/AIGNE-io/aigne-framework/commit/3cba8a5562233a1567b49b6dd5c446c0760f5c4c))
* add taskTitle to observability traces and fix GPT-5/o1 model parameters ([#700](https://github.com/AIGNE-io/aigne-framework/issues/700)) ([30b513b](https://github.com/AIGNE-io/aigne-framework/commit/30b513b46ab5edb58a37f29e566e311bbb389f44))
* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* **docs:** update video mode docs ([#695](https://github.com/AIGNE-io/aigne-framework/issues/695)) ([d691001](https://github.com/AIGNE-io/aigne-framework/commit/d69100169457c16c14f2f3e2f7fcd6b2a99330f3))
* improve image model parameters ([#530](https://github.com/AIGNE-io/aigne-framework/issues/530)) ([d66b5ca](https://github.com/AIGNE-io/aigne-framework/commit/d66b5ca01e14baad2712cc1a84930cdb63703232))
* improve test coverage tracking and reporting ([#903](https://github.com/AIGNE-io/aigne-framework/issues/903)) ([031144e](https://github.com/AIGNE-io/aigne-framework/commit/031144e74f29e882cffe52ffda8f7a18c76ace7f))
* input schema of AI agent should includes input key and input file key ([#600](https://github.com/AIGNE-io/aigne-framework/issues/600)) ([b4ca076](https://github.com/AIGNE-io/aigne-framework/commit/b4ca076d6b4a1a1ecb8d4ebb008abd0d7561aadd))
* **models:** add image parameters support for video generation ([#684](https://github.com/AIGNE-io/aigne-framework/issues/684)) ([b048b7f](https://github.com/AIGNE-io/aigne-framework/commit/b048b7f92bd7a532dbdbeb6fb5fa5499bae6b953))
* **models:** add mineType for transform file ([#667](https://github.com/AIGNE-io/aigne-framework/issues/667)) ([155a173](https://github.com/AIGNE-io/aigne-framework/commit/155a173e75aff1dbe870a1305455a4300942e07a))
* **models:** aigne hub video params ([#665](https://github.com/AIGNE-io/aigne-framework/issues/665)) ([d00f836](https://github.com/AIGNE-io/aigne-framework/commit/d00f8368422d8e3707b974e1aff06714731ebb28))
* **model:** transform local file to base64 before request llm ([#462](https://github.com/AIGNE-io/aigne-framework/issues/462)) ([58ef5d7](https://github.com/AIGNE-io/aigne-framework/commit/58ef5d77046c49f3c4eed15b7f0cc283cbbcd74a))
* **model:** updated default video duration settings for AI video models ([#663](https://github.com/AIGNE-io/aigne-framework/issues/663)) ([1203941](https://github.com/AIGNE-io/aigne-framework/commit/12039411aaef77ba665e8edfb0fe6f8097c43e39))
* remove useless parameter ([efb0690](https://github.com/AIGNE-io/aigne-framework/commit/efb0690cf1ada6de95896e160c7cc5ffc7524ab2))
* standardize file parameter naming across models ([#534](https://github.com/AIGNE-io/aigne-framework/issues/534)) ([f159a9d](https://github.com/AIGNE-io/aigne-framework/commit/f159a9d6af21ec0e99641996b150560929845845))
* support optional field sturectured output for gemini ([#468](https://github.com/AIGNE-io/aigne-framework/issues/468)) ([70c6279](https://github.com/AIGNE-io/aigne-framework/commit/70c62795039a2862e3333f26707329489bf938de))
* update deps compatibility in CommonJS environment ([#580](https://github.com/AIGNE-io/aigne-framework/issues/580)) ([a1e35d0](https://github.com/AIGNE-io/aigne-framework/commit/a1e35d016405accb51c1aeb6a544503a1c78e912))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.72.0-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>poe: 1.1.6-beta.25</summary>

## [1.1.6-beta.25](https://github.com/AIGNE-io/aigne-framework/compare/poe-v1.1.6-beta.24...poe-v1.1.6-beta.25) (2026-01-16)


### Bug Fixes

* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* improve test coverage tracking and reporting ([#903](https://github.com/AIGNE-io/aigne-framework/issues/903)) ([031144e](https://github.com/AIGNE-io/aigne-framework/commit/031144e74f29e882cffe52ffda8f7a18c76ace7f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.16-beta.25
  * devDependencies
    * @aigne/core bumped to 1.72.0-beta.25
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>secrets: 0.1.6-beta.25</summary>

## [0.1.6-beta.25](https://github.com/AIGNE-io/aigne-framework/compare/secrets-v0.1.6-beta.24...secrets-v0.1.6-beta.25) (2026-01-16)


### Features

* **secure:** secure credential storage with keyring support ([#771](https://github.com/AIGNE-io/aigne-framework/issues/771)) ([023c202](https://github.com/AIGNE-io/aigne-framework/commit/023c202f75eddb37d003b1fad447b491e8e1a8c2))


### Bug Fixes

* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* **cli:** use sequential migration to handle keyring and callback file save ([#776](https://github.com/AIGNE-io/aigne-framework/issues/776)) ([da0db46](https://github.com/AIGNE-io/aigne-framework/commit/da0db46597b76cc0f41d604fd51bcd64931f0315))
* improve test coverage tracking and reporting ([#903](https://github.com/AIGNE-io/aigne-framework/issues/903)) ([031144e](https://github.com/AIGNE-io/aigne-framework/commit/031144e74f29e882cffe52ffda8f7a18c76ace7f))
* **secrets:** implement lazy loading for keyring to prevent crashes in unsupported environments ([#775](https://github.com/AIGNE-io/aigne-framework/issues/775)) ([78b8c87](https://github.com/AIGNE-io/aigne-framework/commit/78b8c873b067e1dea1c05e8bc9dc3ec0a4c86a47))
* **secrets:** improve keyring availability detection with environment checks ([#778](https://github.com/AIGNE-io/aigne-framework/issues/778)) ([75dceab](https://github.com/AIGNE-io/aigne-framework/commit/75dceabeb7d6fd8c057759f003e703a2ebb41afd))
* **secrets:** simplify default item handling in KeyringStore ([#780](https://github.com/AIGNE-io/aigne-framework/issues/780)) ([4c1ff51](https://github.com/AIGNE-io/aigne-framework/commit/4c1ff51e982ed5787df37b127a381276537ec92f))
* **secrets:** support system keyring for secure credential storage ([#773](https://github.com/AIGNE-io/aigne-framework/issues/773)) ([859ac2d](https://github.com/AIGNE-io/aigne-framework/commit/859ac2d9eb6019d7a68726076d65841cd96bc9a4))
* **secrets:** use workspace protocol for @aigne/core dependency ([895f127](https://github.com/AIGNE-io/aigne-framework/commit/895f12791d788f9d7298504ab3de5425710b3292))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.72.0-beta.25
  * devDependencies
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>test-utils: 0.5.69-beta.25</summary>

## [0.5.69-beta.25](https://github.com/AIGNE-io/aigne-framework/compare/test-utils-v0.5.69-beta.24...test-utils-v0.5.69-beta.25) (2026-01-16)


### Bug Fixes

* bump version ([696560f](https://github.com/AIGNE-io/aigne-framework/commit/696560fa2673eddcb4d00ac0523fbbbde7273cb3))
* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))
* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))
* improve test coverage tracking and reporting ([#903](https://github.com/AIGNE-io/aigne-framework/issues/903)) ([031144e](https://github.com/AIGNE-io/aigne-framework/commit/031144e74f29e882cffe52ffda8f7a18c76ace7f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.72.0-beta.25
</details>

<details><summary>transport: 0.15.25-beta.27</summary>

## [0.15.25-beta.27](https://github.com/AIGNE-io/aigne-framework/compare/transport-v0.15.25-beta.26...transport-v0.15.25-beta.27) (2026-01-16)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.16-beta.25
  * devDependencies
    * @aigne/agent-library bumped to 1.24.0-beta.27
    * @aigne/core bumped to 1.72.0-beta.25
    * @aigne/default-memory bumped to 1.4.0-beta.24
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>xai: 0.7.62-beta.25</summary>

## [0.7.62-beta.25](https://github.com/AIGNE-io/aigne-framework/compare/xai-v0.7.62-beta.24...xai-v0.7.62-beta.25) (2026-01-16)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/openai bumped to 0.16.16-beta.25
  * devDependencies
    * @aigne/core bumped to 1.72.0-beta.25
    * @aigne/test-utils bumped to 0.5.69-beta.25
</details>

<details><summary>agent-runtime: 1.6.11-beta.31</summary>

## [1.6.11-beta.31](https://github.com/AIGNE-io/aigne-framework/compare/agent-runtime-v1.6.11-beta.30...agent-runtime-v1.6.11-beta.31) (2026-01-16)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/aigne-hub bumped to 0.10.16-beta.31
    * @aigne/core bumped to 1.72.0-beta.25
    * @aigne/transport bumped to 0.15.25-beta.27
</details>

<details><summary>aigne-framework: 1.91.0-beta.32</summary>

## [1.91.0-beta.32](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.91.0-beta.31...aigne-framework-v1.91.0-beta.32) (2026-01-16)


### Bug Fixes

* **afs:** improve explorer server with SPA routing and global error handler ([865c160](https://github.com/AIGNE-io/aigne-framework/commit/865c1601e2a0d9e481f260d150cb3210aef622fb))
</details>

---
This PR was generated with [Release Please](https://github.com/googleapis/release-please). See [documentation](https://github.com/googleapis/release-please#release-please).