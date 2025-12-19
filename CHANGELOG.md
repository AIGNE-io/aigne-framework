# Changelog

## [1.91.0-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.91.0-beta.1...aigne-framework-v1.91.0-beta.2) (2025-12-19)


### Bug Fixes

* **afs:** set AFS tag for all AFS's skills ([#841](https://github.com/AIGNE-io/aigne-framework/issues/841)) ([0bd995a](https://github.com/AIGNE-io/aigne-framework/commit/0bd995aeb68aa68caac1ce19a200b42a022a9998))
* **afs:** use simple-list instead of tree as default type ([#839](https://github.com/AIGNE-io/aigne-framework/issues/839)) ([65a9a40](https://github.com/AIGNE-io/aigne-framework/commit/65a9a4054b3bdad6f7e40357299ef3dc48f7c3e4))
* **core:** add creditPrefix field to usage tracking ([#837](https://github.com/AIGNE-io/aigne-framework/issues/837)) ([9ef25e0](https://github.com/AIGNE-io/aigne-framework/commit/9ef25e0687b4e7b4ba39a27a35805f377f0979eb))

## [1.91.0-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.91.0-beta...aigne-framework-v1.91.0-beta.1) (2025-12-17)


### Bug Fixes

* bump version ([70d217c](https://github.com/AIGNE-io/aigne-framework/commit/70d217c8360dd0dda7f5f17011c4e92ec836e801))

## [1.91.0-beta](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.90.0...aigne-framework-v1.91.0-beta) (2025-12-17)


### Features

* **afs:** support expand context into prompt template by call `$afs.xxx` ([#830](https://github.com/AIGNE-io/aigne-framework/issues/830)) ([5616acd](https://github.com/AIGNE-io/aigne-framework/commit/5616acd6ea257c91aa0b766608f45c5ce17f0345))
* **agent-library:** add parallel tasks support for orchestrator agent ([#834](https://github.com/AIGNE-io/aigne-framework/issues/834)) ([7314eb1](https://github.com/AIGNE-io/aigne-framework/commit/7314eb1ef5f1eb4bf6f2b8160c61ef627a6aa3cc))


### Bug Fixes

* **afs:** read method should not throw not found error ([#835](https://github.com/AIGNE-io/aigne-framework/issues/835)) ([ebfdfc1](https://github.com/AIGNE-io/aigne-framework/commit/ebfdfc1cdba23efd23ac2ad4621e3f046990fd8b))
* **docs:** fix docs x-cards use ([#832](https://github.com/AIGNE-io/aigne-framework/issues/832)) ([9c566eb](https://github.com/AIGNE-io/aigne-framework/commit/9c566ebc6be17f7688485b4614ffe9b1b37d6899))

## [1.90.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.90.0-beta.9...aigne-framework-v1.90.0) (2025-12-12)

## [1.90.0-beta.9](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.90.0-beta.8...aigne-framework-v1.90.0-beta.9) (2025-12-12)


### Features

* **agent-library:** add BashAgent with sandbox support ([#816](https://github.com/AIGNE-io/aigne-framework/issues/816)) ([0d4feee](https://github.com/AIGNE-io/aigne-framework/commit/0d4feeeac2b71df1c4d725adeee76c9318ce8e02))

## [1.90.0-beta.8](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.90.0-beta.7...aigne-framework-v1.90.0-beta.8) (2025-12-11)


### Bug Fixes

* **orchestrator:** support custom input schema for planner/worker/completer ([#823](https://github.com/AIGNE-io/aigne-framework/issues/823)) ([3d26f8b](https://github.com/AIGNE-io/aigne-framework/commit/3d26f8bac8b679010f25d9e4eb59fc6e80afda4c))

## [1.90.0-beta.7](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.90.0-beta.6...aigne-framework-v1.90.0-beta.7) (2025-12-11)


### Features

* **afs:** add edit/delete/rename methods for AFS ([#820](https://github.com/AIGNE-io/aigne-framework/issues/820)) ([68cb508](https://github.com/AIGNE-io/aigne-framework/commit/68cb508d1cfc9c516d56303018139f1e567f897e))


### Bug Fixes

* **core:** support access agent instance by `this` in function agent ([#822](https://github.com/AIGNE-io/aigne-framework/issues/822)) ([68103bc](https://github.com/AIGNE-io/aigne-framework/commit/68103bc8d6d553e1c1374595db98ff61f3046842))

## [1.90.0-beta.6](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.90.0-beta.5...aigne-framework-v1.90.0-beta.6) (2025-12-10)


### Bug Fixes

* bump version ([af04b69](https://github.com/AIGNE-io/aigne-framework/commit/af04b6931951afa35d52065430acc7fef4b10087))
* **core:** support load third agent in skills ([#819](https://github.com/AIGNE-io/aigne-framework/issues/819)) ([bcbb140](https://github.com/AIGNE-io/aigne-framework/commit/bcbb1404d2fe9c709d99a8c28883b21dd107a844))

## [1.90.0-beta.5](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.90.0-beta.4...aigne-framework-v1.90.0-beta.5) (2025-12-10)


### Bug Fixes

* **afs:** add case-sensitive option for search with case-insensitive default ([#814](https://github.com/AIGNE-io/aigne-framework/issues/814)) ([9dc9446](https://github.com/AIGNE-io/aigne-framework/commit/9dc944635104fc311e7756b4bde0a20275cfe8ec))
* **core:** disable Immer autofreeze to return mutable response objects ([#817](https://github.com/AIGNE-io/aigne-framework/issues/817)) ([a3d0651](https://github.com/AIGNE-io/aigne-framework/commit/a3d06512cdadb9d85f92b7e8d2fd85b4f35a804b))
* **observability:** improve trace shutdown handling and exit status  ([#813](https://github.com/AIGNE-io/aigne-framework/issues/813)) ([6215f13](https://github.com/AIGNE-io/aigne-framework/commit/6215f13243b23103c1793a4559798f0e90722384))

## [1.90.0-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.90.0-beta.3...aigne-framework-v1.90.0-beta.4) (2025-12-09)


### Bug Fixes

* **orchestrator:** enhance prompts with detailed guidance ([#811](https://github.com/AIGNE-io/aigne-framework/issues/811)) ([5656f38](https://github.com/AIGNE-io/aigne-framework/commit/5656f38c09e458e18b90e962a5e85c96755be2e4))

## [1.90.0-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.90.0-beta.2...aigne-framework-v1.90.0-beta.3) (2025-12-08)


### Bug Fixes

* **orchestrator:** add default task title for worker agent ([#809](https://github.com/AIGNE-io/aigne-framework/issues/809)) ([3524c3c](https://github.com/AIGNE-io/aigne-framework/commit/3524c3c03c6a6822656c8b1684660677af49d508))

## [1.90.0-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.90.0-beta.1...aigne-framework-v1.90.0-beta.2) (2025-12-08)


### Bug Fixes

* remove files entry from package.json include all files ([02a0a1b](https://github.com/AIGNE-io/aigne-framework/commit/02a0a1bebb249a525bcda4d443b4d080b1d3db2d))

## [1.90.0-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.90.0-beta...aigne-framework-v1.90.0-beta.1) (2025-12-08)


### Bug Fixes

* correct run example & doc improvements ([#707](https://github.com/AIGNE-io/aigne-framework/issues/707)) ([f98fc5d](https://github.com/AIGNE-io/aigne-framework/commit/f98fc5df28fd6ce6134128c2f0e5395c1554b740))

## [1.90.0-beta](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.89.1...aigne-framework-v1.90.0-beta) (2025-12-07)


### Features

* support define agent by third library & orchestrator agent refactor ([#799](https://github.com/AIGNE-io/aigne-framework/issues/799)) ([7264b11](https://github.com/AIGNE-io/aigne-framework/commit/7264b11ab6eed787e928367f09aa08d254968d40))

## [1.89.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.89.1-beta...aigne-framework-v1.89.1) (2025-12-06)

## [1.89.1-beta](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.89.0...aigne-framework-v1.89.1-beta) (2025-12-06)


### Bug Fixes

* update deps ([#802](https://github.com/AIGNE-io/aigne-framework/issues/802)) ([2bedc5c](https://github.com/AIGNE-io/aigne-framework/commit/2bedc5c01ac3b17ba00552ed8878e220fecbc0f0))

## [1.89.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.89.0-beta.1...aigne-framework-v1.89.0) (2025-12-05)

## [1.89.0-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.89.0-beta...aigne-framework-v1.89.0-beta.1) (2025-12-05)


### Bug Fixes

* return tree view instead of list for afs_list ([#774](https://github.com/AIGNE-io/aigne-framework/issues/774)) ([8ec2f93](https://github.com/AIGNE-io/aigne-framework/commit/8ec2f93fb5870f6404d886ad0197cc21c61dfd74))

## [1.89.0-beta](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.88.1...aigne-framework-v1.89.0-beta) (2025-12-02)


### Features

* **core:** add nested getter pattern support for model options ([#796](https://github.com/AIGNE-io/aigne-framework/issues/796)) ([824b2fe](https://github.com/AIGNE-io/aigne-framework/commit/824b2fe55cb2a24620e2bb73b470532918fa2996))


### Bug Fixes

* **afs:** check module existence on normalized path ([#793](https://github.com/AIGNE-io/aigne-framework/issues/793)) ([0c991bf](https://github.com/AIGNE-io/aigne-framework/commit/0c991bf0caa948ce62948986ce885b5a98437689))

## [1.88.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.88.1-beta.1...aigne-framework-v1.88.1) (2025-11-28)

## [1.88.1-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.88.1-beta...aigne-framework-v1.88.1-beta.1) (2025-11-28)


### Bug Fixes

* update package to latest ([#790](https://github.com/AIGNE-io/aigne-framework/issues/790)) ([69c77b3](https://github.com/AIGNE-io/aigne-framework/commit/69c77b353667acc72a2f35eadca7892fb99838b6))

## [1.88.1-beta](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.88.0...aigne-framework-v1.88.1-beta) (2025-11-28)


### Bug Fixes

* bump version ([ba7ad18](https://github.com/AIGNE-io/aigne-framework/commit/ba7ad184fcf32b49bf0507a3cb638d20fb00690d))
* **secrets:** use workspace protocol for @aigne/core dependency ([895f127](https://github.com/AIGNE-io/aigne-framework/commit/895f12791d788f9d7298504ab3de5425710b3292))

## [1.88.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.88.0-beta.5...aigne-framework-v1.88.0) (2025-11-28)

## [1.88.0-beta.5](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.88.0-beta.4...aigne-framework-v1.88.0-beta.5) (2025-11-28)


### Bug Fixes

* **cli:** improve hub status display for non-default hubs ([#784](https://github.com/AIGNE-io/aigne-framework/issues/784)) ([9e83e01](https://github.com/AIGNE-io/aigne-framework/commit/9e83e01385bdf8fe6d6801c3b49007cac31a6eb5))

## [1.88.0-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.88.0-beta.3...aigne-framework-v1.88.0-beta.4) (2025-11-28)


### Bug Fixes

* **cli:** improve hub deletion with auto default switching ([#782](https://github.com/AIGNE-io/aigne-framework/issues/782)) ([f30b8c2](https://github.com/AIGNE-io/aigne-framework/commit/f30b8c2d0a8167c3678d500944c77ed257427564))

## [1.88.0-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.88.0-beta.2...aigne-framework-v1.88.0-beta.3) (2025-11-27)


### Bug Fixes

* **secrets:** simplify default item handling in KeyringStore ([#780](https://github.com/AIGNE-io/aigne-framework/issues/780)) ([4c1ff51](https://github.com/AIGNE-io/aigne-framework/commit/4c1ff51e982ed5787df37b127a381276537ec92f))

## [1.88.0-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.88.0-beta.1...aigne-framework-v1.88.0-beta.2) (2025-11-27)


### Bug Fixes

* **secrets:** improve keyring availability detection with environment checks ([#778](https://github.com/AIGNE-io/aigne-framework/issues/778)) ([75dceab](https://github.com/AIGNE-io/aigne-framework/commit/75dceabeb7d6fd8c057759f003e703a2ebb41afd))

## [1.88.0-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.88.0-beta...aigne-framework-v1.88.0-beta.1) (2025-11-26)


### Bug Fixes

* **cli:** use sequential migration to handle keyring and callback file save ([#776](https://github.com/AIGNE-io/aigne-framework/issues/776)) ([da0db46](https://github.com/AIGNE-io/aigne-framework/commit/da0db46597b76cc0f41d604fd51bcd64931f0315))

## [1.88.0-beta](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.87.1-beta...aigne-framework-v1.88.0-beta) (2025-11-26)


### Features

* **secure:** secure credential storage with keyring support ([#771](https://github.com/AIGNE-io/aigne-framework/issues/771)) ([023c202](https://github.com/AIGNE-io/aigne-framework/commit/023c202f75eddb37d003b1fad447b491e8e1a8c2))


### Bug Fixes

* **model:** handle large video files by uploading to Files API ([#769](https://github.com/AIGNE-io/aigne-framework/issues/769)) ([5fd7661](https://github.com/AIGNE-io/aigne-framework/commit/5fd76613bd7301cc76bde933de2095a6d86f8c7e))
* **secrets:** implement lazy loading for keyring to prevent crashes in unsupported environments ([#775](https://github.com/AIGNE-io/aigne-framework/issues/775)) ([78b8c87](https://github.com/AIGNE-io/aigne-framework/commit/78b8c873b067e1dea1c05e8bc9dc3ec0a4c86a47))
* **secrets:** support system keyring for secure credential storage ([#773](https://github.com/AIGNE-io/aigne-framework/issues/773)) ([859ac2d](https://github.com/AIGNE-io/aigne-framework/commit/859ac2d9eb6019d7a68726076d65841cd96bc9a4))

## [1.87.1-beta](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.87.0...aigne-framework-v1.87.1-beta) (2025-11-24)


### Bug Fixes

* **observability:** prevent OOM by optimizing trace data storage strategy ([#767](https://github.com/AIGNE-io/aigne-framework/issues/767)) ([acd6476](https://github.com/AIGNE-io/aigne-framework/commit/acd6476936423c2186cb633086177541b0c0b558))

## [1.87.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.87.0-beta.3...aigne-framework-v1.87.0) (2025-11-21)

## [1.87.0-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.87.0-beta.2...aigne-framework-v1.87.0-beta.3) (2025-11-21)


### Bug Fixes

* **gemini:** properly handle thinking level for gemini 3.x models ([#763](https://github.com/AIGNE-io/aigne-framework/issues/763)) ([a5dc892](https://github.com/AIGNE-io/aigne-framework/commit/a5dc8921635811ed9ca2ff9e3e0699006f79cf22))
* **gemini:** return reasoningEffort in model options for gemini-3 ([#765](https://github.com/AIGNE-io/aigne-framework/issues/765)) ([682bfda](https://github.com/AIGNE-io/aigne-framework/commit/682bfda353b31fd432232baa57f8e0b0838eb76d))

## [1.87.0-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.87.0-beta.1...aigne-framework-v1.87.0-beta.2) (2025-11-20)


### Bug Fixes

* add timeout to doubao and ideogram image models ([#761](https://github.com/AIGNE-io/aigne-framework/issues/761)) ([c232483](https://github.com/AIGNE-io/aigne-framework/commit/c232483c6024426524c3310e64b22d9f63206227))

## [1.87.0-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.86.3-beta.1...aigne-framework-v1.87.0-beta.1) (2025-11-19)


### Features

* **models:** support gemini 3.x thinking level and thoughtSignature ([#760](https://github.com/AIGNE-io/aigne-framework/issues/760)) ([243f2d4](https://github.com/AIGNE-io/aigne-framework/commit/243f2d457792a20ba2b87378576092e6f88e319c))


### Bug Fixes

* **models:** add provider inference for model params ([#759](https://github.com/AIGNE-io/aigne-framework/issues/759)) ([0b050ae](https://github.com/AIGNE-io/aigne-framework/commit/0b050ae5132c7fbdd80091a81b7e0d00b21a0da5))
* upgrade dependencies and fix timestamp type ([#757](https://github.com/AIGNE-io/aigne-framework/issues/757)) ([652e8f4](https://github.com/AIGNE-io/aigne-framework/commit/652e8f4b6e9af1461b25336888d76fe1d731b9b5))

## [1.86.3-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.86.3-beta...aigne-framework-v1.86.3-beta.1) (2025-11-18)


### Bug Fixes

* **examples:** use separate SQLite databases for each AFS memory module ([#753](https://github.com/AIGNE-io/aigne-framework/issues/753)) ([4454666](https://github.com/AIGNE-io/aigne-framework/commit/44546666c954041dab08adb5f3f8c9742b71f070))
* **observability:** introduce TraceContext and improve delete UX ([#755](https://github.com/AIGNE-io/aigne-framework/issues/755)) ([dee54f1](https://github.com/AIGNE-io/aigne-framework/commit/dee54f1c548ed1046781e919f8c51a642b6b0dac))

## [1.86.3-beta](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.86.2...aigne-framework-v1.86.3-beta) (2025-11-17)


### Bug Fixes

* **sqlite:** improve WAL checkpoint and database cleanup ([#751](https://github.com/AIGNE-io/aigne-framework/issues/751)) ([85c7884](https://github.com/AIGNE-io/aigne-framework/commit/85c78849a8d2637349786c696d6eaa01f8c70fcf))

## [1.86.2](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.86.2-beta...aigne-framework-v1.86.2) (2025-11-15)

## [1.86.2-beta](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.86.1...aigne-framework-v1.86.2-beta) (2025-11-15)


### Bug Fixes

* **core:** memory leak in AIGNEContext by preventing duplicate signal handler ([#748](https://github.com/AIGNE-io/aigne-framework/issues/748)) ([7f17592](https://github.com/AIGNE-io/aigne-framework/commit/7f175929d78e4289e2d551746b12a73bb5c0eb22))

## [1.86.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.86.1-beta...aigne-framework-v1.86.1) (2025-11-15)

## [1.86.1-beta](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.86.0...aigne-framework-v1.86.1-beta) (2025-11-15)


### Bug Fixes

* bump version ([93a1c10](https://github.com/AIGNE-io/aigne-framework/commit/93a1c10cf35f88eaafe91092481f5d087bd5b3a9))

## [1.86.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.86.0-beta...aigne-framework-v1.86.0) (2025-11-14)

## [1.86.0-beta](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.85.0...aigne-framework-v1.86.0-beta) (2025-11-14)


### Features

* support mount mcp agent into AFS ([#740](https://github.com/AIGNE-io/aigne-framework/issues/740)) ([6d474fc](https://github.com/AIGNE-io/aigne-framework/commit/6d474fc05845a15e2c3e8fa97727b409bdd70945))


### Bug Fixes

* properly handle SIGINT to flush observability data before exit ([#739](https://github.com/AIGNE-io/aigne-framework/issues/739)) ([99b4503](https://github.com/AIGNE-io/aigne-framework/commit/99b45033d5f3bcc1f830b583f9cca7258b00606f))

## [1.85.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.85.0-beta.4...aigne-framework-v1.85.0) (2025-11-12)

## [1.85.0-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.85.0-beta.3...aigne-framework-v1.85.0-beta.4) (2025-11-12)


### Bug Fixes

* **core:** order history entries by time in ascending order ([#736](https://github.com/AIGNE-io/aigne-framework/issues/736)) ([7a3c2c3](https://github.com/AIGNE-io/aigne-framework/commit/7a3c2c32c428026ae7b8025f42ac51c38374915a))

## [1.85.0-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.85.0-beta.2...aigne-framework-v1.85.0-beta.3) (2025-11-12)


### Bug Fixes

* **core:** improved ImageAgent parameter filtering to reduce redundant parameter passing ([#734](https://github.com/AIGNE-io/aigne-framework/issues/734)) ([f8f7da2](https://github.com/AIGNE-io/aigne-framework/commit/f8f7da21d6e55062da0d2070b3289388ba5e6702))

## [1.85.0-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.85.0-beta.1...aigne-framework-v1.85.0-beta.2) (2025-11-12)


### Bug Fixes

* **core:** resolve relative paths correctly in JS agent files ([#732](https://github.com/AIGNE-io/aigne-framework/issues/732)) ([0cb5631](https://github.com/AIGNE-io/aigne-framework/commit/0cb5631e1a1516b796f86a8dafc2341fe0e0810c))
* **core:** support JSON object definitions for agent files ([#730](https://github.com/AIGNE-io/aigne-framework/issues/730)) ([4337def](https://github.com/AIGNE-io/aigne-framework/commit/4337defab694abdbcc118cc7f9151ba4df945478))
* replace dynamic import with readFileSync for model prices loading ([#733](https://github.com/AIGNE-io/aigne-framework/issues/733)) ([0e5d372](https://github.com/AIGNE-io/aigne-framework/commit/0e5d37248cd55559f1d5cafa74bd6095e69e5345))

## [1.85.0-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.85.0-beta...aigne-framework-v1.85.0-beta.1) (2025-11-12)


### Bug Fixes

* **observability:** optimize database performance with indexes ([#728](https://github.com/AIGNE-io/aigne-framework/issues/728)) ([301aeea](https://github.com/AIGNE-io/aigne-framework/commit/301aeeaa2acd5f529b20582711ae691fa66e181d))
* **sqlite:** auto-create parent directories for file-based databases ([#727](https://github.com/AIGNE-io/aigne-framework/issues/727)) ([581789f](https://github.com/AIGNE-io/aigne-framework/commit/581789f38d838f53396e9e41ce9367a486319c53))

## [1.85.0-beta](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.84.0...aigne-framework-v1.85.0-beta) (2025-11-11)


### Features

* **core:** add tson.stringify filter for prompt template ([#725](https://github.com/AIGNE-io/aigne-framework/issues/725)) ([c88e71c](https://github.com/AIGNE-io/aigne-framework/commit/c88e71c245a3eaa8a2d60f25c75368bced35fde2))


### Bug Fixes

* **core:** improve checkArguments error messages and refactor optional schemas ([#726](https://github.com/AIGNE-io/aigne-framework/issues/726)) ([8680f43](https://github.com/AIGNE-io/aigne-framework/commit/8680f43e6ad224eb84948b056c51e80ef8c47e06))
* **model:** normalize model names to support flexible provider/model format ([#712](https://github.com/AIGNE-io/aigne-framework/issues/712)) ([9f23755](https://github.com/AIGNE-io/aigne-framework/commit/9f23755406e1890e4523c778e71fd3d04c9f3e57))
* update package to latest ([#720](https://github.com/AIGNE-io/aigne-framework/issues/720)) ([4386549](https://github.com/AIGNE-io/aigne-framework/commit/43865497e71f86478bc75d7d6e181c4fac80eae5))

## [1.84.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.84.0-beta.7...aigne-framework-v1.84.0) (2025-11-07)

## [1.84.0-beta.7](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.84.0-beta.6...aigne-framework-v1.84.0-beta.7) (2025-11-07)


### Bug Fixes

* improve trace list layout and string truncation ([#714](https://github.com/AIGNE-io/aigne-framework/issues/714)) ([35716b4](https://github.com/AIGNE-io/aigne-framework/commit/35716b419f691d36bcf5ca810f267c9fdaf4f909))
* use aigne-code-smith latest version ([#713](https://github.com/AIGNE-io/aigne-framework/issues/713)) ([9be1c09](https://github.com/AIGNE-io/aigne-framework/commit/9be1c09a8d466b8bef8819559574daf3228c6328))

## [1.84.0-beta.6](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.84.0-beta.5...aigne-framework-v1.84.0-beta.6) (2025-11-07)


### Bug Fixes

* **system-fs:** auto-install ripgrep when binary is missing ([#715](https://github.com/AIGNE-io/aigne-framework/issues/715)) ([265e45f](https://github.com/AIGNE-io/aigne-framework/commit/265e45f5004093bf130317e70ec0e4bee868ac8c))

## [1.84.0-beta.5](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.84.0-beta.4...aigne-framework-v1.84.0-beta.5) (2025-11-06)


### Bug Fixes

* **models:** apply dynamic model options resolution and use url output type ([#710](https://github.com/AIGNE-io/aigne-framework/issues/710)) ([1026034](https://github.com/AIGNE-io/aigne-framework/commit/102603402d8fa3ccd52e06f378a73f66ab7464ed))
* update package to latest ([#709](https://github.com/AIGNE-io/aigne-framework/issues/709)) ([47661ab](https://github.com/AIGNE-io/aigne-framework/commit/47661ab78cd13ce039d6ebf596e4e603c0220139))

## [1.84.0-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.83.1-beta.4...aigne-framework-v1.84.0-beta.4) (2025-11-06)


### Features

* add dynamic model options resolution with getter pattern ([#708](https://github.com/AIGNE-io/aigne-framework/issues/708)) ([5ed5085](https://github.com/AIGNE-io/aigne-framework/commit/5ed5085203763c70194853c56edc13acf56d81c6))


### Bug Fixes

* add configurable timeout for fetch requests and set 3min timeout for hub video model ([4eb7f3d](https://github.com/AIGNE-io/aigne-framework/commit/4eb7f3df590992742706197bcb48b4db35ccc948))
* **core:** change skills loading from Promise.all to sequential for loop ([#704](https://github.com/AIGNE-io/aigne-framework/issues/704)) ([08ac827](https://github.com/AIGNE-io/aigne-framework/commit/08ac8270285bdbafe171705f43ac32654430b745))

## [1.83.1-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.83.1-beta.3...aigne-framework-v1.83.1-beta.4) (2025-11-05)


### Bug Fixes

* add taskTitle to observability traces and fix GPT-5/o1 model parameters ([#700](https://github.com/AIGNE-io/aigne-framework/issues/700)) ([30b513b](https://github.com/AIGNE-io/aigne-framework/commit/30b513b46ab5edb58a37f29e566e311bbb389f44))
* **cli:** only auto-reinstall on agent loading errors ([#702](https://github.com/AIGNE-io/aigne-framework/issues/702)) ([52f61a4](https://github.com/AIGNE-io/aigne-framework/commit/52f61a47537f2be8763f7bd45b8baea94cf43e60))
* **transport:** improve HTTP error status code validation ([#703](https://github.com/AIGNE-io/aigne-framework/issues/703)) ([76791d7](https://github.com/AIGNE-io/aigne-framework/commit/76791d760fc319c0c0edb82d19474d6141240a8e))

## [1.83.1-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.83.1-beta.2...aigne-framework-v1.83.1-beta.3) (2025-11-04)


### Bug Fixes

* **cli:** optimize app startup by restructuring CLI application loading ([#698](https://github.com/AIGNE-io/aigne-framework/issues/698)) ([20c5059](https://github.com/AIGNE-io/aigne-framework/commit/20c50591bbd9a958b29409eca3ede5e341db2b7d))
* **docs:** update video mode docs ([#695](https://github.com/AIGNE-io/aigne-framework/issues/695)) ([d691001](https://github.com/AIGNE-io/aigne-framework/commit/d69100169457c16c14f2f3e2f7fcd6b2a99330f3))
* update package to latest ([#699](https://github.com/AIGNE-io/aigne-framework/issues/699)) ([9877f6d](https://github.com/AIGNE-io/aigne-framework/commit/9877f6d1975362338db4eb47a2bf3564114c3cf8))

## [1.83.1-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.83.1-beta.1...aigne-framework-v1.83.1-beta.2) (2025-11-04)


### Bug Fixes

* add fetch utility with timeout and enhanced error handling ([#694](https://github.com/AIGNE-io/aigne-framework/issues/694)) ([c2d4076](https://github.com/AIGNE-io/aigne-framework/commit/c2d4076ec590150d2751591a4f723721f78381e9))

## [1.83.1-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.83.1-beta...aigne-framework-v1.83.1-beta.1) (2025-11-03)


### Bug Fixes

* **afs:** return matched lines instead of full content for search method ([#692](https://github.com/AIGNE-io/aigne-framework/issues/692)) ([1130405](https://github.com/AIGNE-io/aigne-framework/commit/1130405bdd7e6244801023acc7a820c08f400412))

## [1.83.1-beta](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.83.0...aigne-framework-v1.83.1-beta) (2025-11-03)


### Bug Fixes

* **examples:** enable history for memory example & update readme ([#690](https://github.com/AIGNE-io/aigne-framework/issues/690)) ([93b4185](https://github.com/AIGNE-io/aigne-framework/commit/93b41850425cc762aae9dec2516e655aa249bfef))
* **observability:** enhance trace detail panel with improved JSON viewer and cost tracking ([#689](https://github.com/AIGNE-io/aigne-framework/issues/689)) ([1cddb6b](https://github.com/AIGNE-io/aigne-framework/commit/1cddb6ba1737c32aba045e34758d77416fb91fa0))

## [1.83.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.83.0-beta.8...aigne-framework-v1.83.0) (2025-10-31)

## [1.83.0-beta.8](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.83.0-beta.7...aigne-framework-v1.83.0-beta.8) (2025-10-31)


### Bug Fixes

* **cli:** wrap onSubmit call in setTimeout to fix cursor visibility issue ([#686](https://github.com/AIGNE-io/aigne-framework/issues/686)) ([7c69f1d](https://github.com/AIGNE-io/aigne-framework/commit/7c69f1ddf134ad297dc51f0ed944234a287415d7))

## [1.83.0-beta.7](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.83.0-beta.6...aigne-framework-v1.83.0-beta.7) (2025-10-31)


### Features

* **core:** add json/yaml stringify filters for prompt template ([#685](https://github.com/AIGNE-io/aigne-framework/issues/685)) ([4e414bf](https://github.com/AIGNE-io/aigne-framework/commit/4e414bf5a43d0677fb16fcdceacaed501542ee85))


### Bug Fixes

* **models:** add image parameters support for video generation ([#684](https://github.com/AIGNE-io/aigne-framework/issues/684)) ([b048b7f](https://github.com/AIGNE-io/aigne-framework/commit/b048b7f92bd7a532dbdbeb6fb5fa5499bae6b953))
* **observability:** add image/video model cost calculation and improve trace detail UX ([#683](https://github.com/AIGNE-io/aigne-framework/issues/683)) ([07964e4](https://github.com/AIGNE-io/aigne-framework/commit/07964e47d84636b49a291bfe5c1cc1c4dd31f722))
* update package to latest ([#681](https://github.com/AIGNE-io/aigne-framework/issues/681)) ([645327f](https://github.com/AIGNE-io/aigne-framework/commit/645327f7562311b42b281c55a2184600d1676059))

## [1.83.0-beta.6](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.83.0-beta.5...aigne-framework-v1.83.0-beta.6) (2025-10-29)


### Features

* add reasoningEffort option for chat model ([#680](https://github.com/AIGNE-io/aigne-framework/issues/680)) ([f69d232](https://github.com/AIGNE-io/aigne-framework/commit/f69d232d714d4a3e4946bdc8c6598747c9bcbd57))


### Bug Fixes

* update package ([#677](https://github.com/AIGNE-io/aigne-framework/issues/677)) ([a4ad78a](https://github.com/AIGNE-io/aigne-framework/commit/a4ad78a79e4f34eb6c0b00909e7707cd5dd9dd97))

## [1.83.0-beta.5](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.83.0-beta.4...aigne-framework-v1.83.0-beta.5) (2025-10-28)


### Features

* use a more secure signature mechanism ([#655](https://github.com/AIGNE-io/aigne-framework/issues/655)) ([aa5dc0c](https://github.com/AIGNE-io/aigne-framework/commit/aa5dc0ccdff8245a629cb30e731081528a555134))


### Bug Fixes

* **core:** support custom `catchToolsError` in yaml agent definition ([#676](https://github.com/AIGNE-io/aigne-framework/issues/676)) ([fe43f5f](https://github.com/AIGNE-io/aigne-framework/commit/fe43f5f32d18d2180abb0717287fc680f1444a0d))
* update package ([#675](https://github.com/AIGNE-io/aigne-framework/issues/675)) ([0b233f3](https://github.com/AIGNE-io/aigne-framework/commit/0b233f38f86c9d5e0ddd469fa2a0406ec0083fa7))

## [1.83.0-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.83.0-beta.3...aigne-framework-v1.83.0-beta.4) (2025-10-28)


### Bug Fixes

* **core:** added support for URL file type handling, expanding the range of supported file formats ([#671](https://github.com/AIGNE-io/aigne-framework/issues/671)) ([fea4519](https://github.com/AIGNE-io/aigne-framework/commit/fea45197e87cf7b19499c48b41626062824d1355))

## [1.83.0-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.83.0-beta.2...aigne-framework-v1.83.0-beta.3) (2025-10-27)


### Bug Fixes

* **gemini:** include thoughts token count in output token usage ([#669](https://github.com/AIGNE-io/aigne-framework/issues/669)) ([f6ff10c](https://github.com/AIGNE-io/aigne-framework/commit/f6ff10c33b0612a0bc416842c5a5bec3850a3fe6))

## [1.83.0-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.83.0-beta.1...aigne-framework-v1.83.0-beta.2) (2025-10-26)


### Features

* support define function agent by yaml ([#668](https://github.com/AIGNE-io/aigne-framework/issues/668)) ([2fde8cc](https://github.com/AIGNE-io/aigne-framework/commit/2fde8cc44b213fc2d4c20d91c3c8a8b3c2eb140e))


### Bug Fixes

* **models:** add mineType for transform file ([#667](https://github.com/AIGNE-io/aigne-framework/issues/667)) ([155a173](https://github.com/AIGNE-io/aigne-framework/commit/155a173e75aff1dbe870a1305455a4300942e07a))
* **models:** aigne hub video params ([#665](https://github.com/AIGNE-io/aigne-framework/issues/665)) ([d00f836](https://github.com/AIGNE-io/aigne-framework/commit/d00f8368422d8e3707b974e1aff06714731ebb28))

## [1.83.0-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.82.1-beta.1...aigne-framework-v1.83.0-beta.1) (2025-10-24)


### Features

* **model:** support video model ([#647](https://github.com/AIGNE-io/aigne-framework/issues/647)) ([de81742](https://github.com/AIGNE-io/aigne-framework/commit/de817421ef1dd3246d0d8c51ff12f0a855658f9f))


### Bug Fixes

* load aigne hub api url for image model correctly ([#664](https://github.com/AIGNE-io/aigne-framework/issues/664)) ([c226b6a](https://github.com/AIGNE-io/aigne-framework/commit/c226b6adfa7acc162fdb2de385f2af57368e21ad))
* **model:** updated default video duration settings for AI video models ([#663](https://github.com/AIGNE-io/aigne-framework/issues/663)) ([1203941](https://github.com/AIGNE-io/aigne-framework/commit/12039411aaef77ba665e8edfb0fe6f8097c43e39))

## [1.82.1-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.82.1-beta...aigne-framework-v1.82.1-beta.1) (2025-10-24)


### Bug Fixes

* **gemini:** use StructuredOutputError to trigger retry for missing JSON response ([#660](https://github.com/AIGNE-io/aigne-framework/issues/660)) ([e8826ed](https://github.com/AIGNE-io/aigne-framework/commit/e8826ed96db57bfcce0b577881bf0d2fd828c269))

## [1.82.1-beta](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.82.0...aigne-framework-v1.82.1-beta) (2025-10-23)


### Bug Fixes

* **afs:** improve module path resolution and depth handling ([#659](https://github.com/AIGNE-io/aigne-framework/issues/659)) ([c609d4f](https://github.com/AIGNE-io/aigne-framework/commit/c609d4fc9614123afcf4b8f86b3382a613ace417))
* **models:** improve message structure handling and enable auto-message options ([#657](https://github.com/AIGNE-io/aigne-framework/issues/657)) ([233d70c](https://github.com/AIGNE-io/aigne-framework/commit/233d70cb292b937200fada8434f33d957d766ad6))

## [1.82.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.82.0-beta.1...aigne-framework-v1.82.0) (2025-10-22)

## [1.82.0-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.82.0-beta...aigne-framework-v1.82.0-beta.1) (2025-10-22)


### Bug Fixes

* add validate/required support for terminal input ([#651](https://github.com/AIGNE-io/aigne-framework/issues/651)) ([3d7f94c](https://github.com/AIGNE-io/aigne-framework/commit/3d7f94c32c8ec7bebb8f71fb16ddd3dd74a2d255))
* improve model name parsing to handle complex model identifiers ([#654](https://github.com/AIGNE-io/aigne-framework/issues/654)) ([4b7faea](https://github.com/AIGNE-io/aigne-framework/commit/4b7faea97f33db34a51c49dde3d6c1cf2679f0cd))
* standardize AFS skills return format with status and metadata ([#653](https://github.com/AIGNE-io/aigne-framework/issues/653)) ([66b6b00](https://github.com/AIGNE-io/aigne-framework/commit/66b6b005a846ab795e65e9f20b950c854a69ffd2))

## [1.82.0-beta](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.81.0...aigne-framework-v1.82.0-beta) (2025-10-21)


### Features

* add thinking support to Gemini chat models ([#650](https://github.com/AIGNE-io/aigne-framework/issues/650)) ([09b828b](https://github.com/AIGNE-io/aigne-framework/commit/09b828ba668d90cc6aac68a5e8190adb146b5e45))
* add user context support to prompt template variables ([#649](https://github.com/AIGNE-io/aigne-framework/issues/649)) ([a02d9b4](https://github.com/AIGNE-io/aigne-framework/commit/a02d9b412878050b8c1e32127b505c0346f19bba))
* **cli:** add metadata traces including CLI version, app name, and version ([#646](https://github.com/AIGNE-io/aigne-framework/issues/646)) ([c64bd76](https://github.com/AIGNE-io/aigne-framework/commit/c64bd761ba4c9f3854be5feee208c711bff7a170))


### Bug Fixes

* **cli:** prevent potential crashes when environment configurations are incomplete ([#645](https://github.com/AIGNE-io/aigne-framework/issues/645)) ([8ab3a1e](https://github.com/AIGNE-io/aigne-framework/commit/8ab3a1e208a2774987d5d23c7239971c41edfd25))
* **gemini:** handle empty responses when files are present ([#648](https://github.com/AIGNE-io/aigne-framework/issues/648)) ([f4e259c](https://github.com/AIGNE-io/aigne-framework/commit/f4e259c5e5c687c347bb5cf29cbb0b5bf4d0d4a1))
* **observability:** support time line as background ([#642](https://github.com/AIGNE-io/aigne-framework/issues/642)) ([6f47870](https://github.com/AIGNE-io/aigne-framework/commit/6f478702090e8106ddcfe318a4766e1246257503))

## [1.81.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.81.0-beta.15...aigne-framework-v1.81.0) (2025-10-19)

## [1.81.0-beta.15](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.81.0-beta.14...aigne-framework-v1.81.0-beta.15) (2025-10-17)


### Bug Fixes

* custom queue instead of fastq to compatible with browser ([#640](https://github.com/AIGNE-io/aigne-framework/issues/640)) ([51e0f8f](https://github.com/AIGNE-io/aigne-framework/commit/51e0f8fdeaf26f2765f392218f04a2af4c0d2e1a))

## [1.81.0-beta.14](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.81.0-beta.13...aigne-framework-v1.81.0-beta.14) (2025-10-17)


### Bug Fixes

* **gemini:** implement retry mechanism for empty responses with structured output fallback ([#638](https://github.com/AIGNE-io/aigne-framework/issues/638)) ([d33c8bb](https://github.com/AIGNE-io/aigne-framework/commit/d33c8bb9711aadddef9687d6cf472a179cd8ed9c))

## [1.81.0-beta.13](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.81.0-beta.12...aigne-framework-v1.81.0-beta.13) (2025-10-16)


### Features

* **observability:** support import and export trace items ([#635](https://github.com/AIGNE-io/aigne-framework/issues/635)) ([27acadf](https://github.com/AIGNE-io/aigne-framework/commit/27acadfca49adb653a78007daa0a41ee90468047))


### Bug Fixes

* correct calculate token usage for gemini model ([7fd1328](https://github.com/AIGNE-io/aigne-framework/commit/7fd13289d3d0f8e062211f7c6dd5cb56e5318c1b))

## [1.81.0-beta.12](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.81.0-beta.11...aigne-framework-v1.81.0-beta.12) (2025-10-16)


### Bug Fixes

* allow custom user messages and prevent duplicate user content ([#632](https://github.com/AIGNE-io/aigne-framework/issues/632)) ([6c883b2](https://github.com/AIGNE-io/aigne-framework/commit/6c883b2d57a65e9b46232cece91fc6aa1de03aba))
* **blocklet:** tune observability ui build script ([#631](https://github.com/AIGNE-io/aigne-framework/issues/631)) ([8d23d39](https://github.com/AIGNE-io/aigne-framework/commit/8d23d39875f6f4e2bf42b52ffb9c806ad8e184de))
* **models:** auto retry when got emtpy response from gemini ([#636](https://github.com/AIGNE-io/aigne-framework/issues/636)) ([9367cef](https://github.com/AIGNE-io/aigne-framework/commit/9367cef49ea4c0c87b8a36b454deb2efaee6886f))
* **models:** enhance gemini model tool use with status fields ([#634](https://github.com/AIGNE-io/aigne-framework/issues/634)) ([067b175](https://github.com/AIGNE-io/aigne-framework/commit/067b175c8e31bb5b1a6d0fc5a5cfb2d070d8d709))

## [1.81.0-beta.11](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.81.0-beta.10...aigne-framework-v1.81.0-beta.11) (2025-10-16)


### Bug Fixes

* update observability api ([#629](https://github.com/AIGNE-io/aigne-framework/issues/629)) ([5024262](https://github.com/AIGNE-io/aigne-framework/commit/50242620e904922b07168751a4477f1e60347fcf))

## [1.81.0-beta.10](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.81.0-beta.9...aigne-framework-v1.81.0-beta.10) (2025-10-16)


### Bug Fixes

* **blocklet:** disabled editor context menu ([#626](https://github.com/AIGNE-io/aigne-framework/issues/626)) ([e6f4a6b](https://github.com/AIGNE-io/aigne-framework/commit/e6f4a6b3ef2581ec6c7f1174d65b15df6ccd31c6))
* ensure tips are only printed once during AIGNE loading ([#628](https://github.com/AIGNE-io/aigne-framework/issues/628)) ([7d49508](https://github.com/AIGNE-io/aigne-framework/commit/7d4950882436169986eedab75c232db2c0a30732))

## [1.81.0-beta.9](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.81.0-beta.8...aigne-framework-v1.81.0-beta.9) (2025-10-15)


### Bug Fixes

* add options for system message reordering and merging ([#624](https://github.com/AIGNE-io/aigne-framework/issues/624)) ([8ca466d](https://github.com/AIGNE-io/aigne-framework/commit/8ca466d49d1e4ed08bc90922f39c0d3ed60c4fd5))
* **blocklet:** add expand/collapse all functionality to trace visualization ([#623](https://github.com/AIGNE-io/aigne-framework/issues/623)) ([b66a2a0](https://github.com/AIGNE-io/aigne-framework/commit/b66a2a050463bb7f69ded7f67c318b10ed9319d9))

## [1.81.0-beta.8](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.81.0-beta.7...aigne-framework-v1.81.0-beta.8) (2025-10-15)


### Features

* **blocklet:** support remark for observability trace item ([#620](https://github.com/AIGNE-io/aigne-framework/issues/620)) ([d91c42c](https://github.com/AIGNE-io/aigne-framework/commit/d91c42c0c9286cd6e39beace740f8ea61dff3f50))


### Bug Fixes

* **blocklet:** tune observability detail list ux ([#618](https://github.com/AIGNE-io/aigne-framework/issues/618)) ([3ad83b6](https://github.com/AIGNE-io/aigne-framework/commit/3ad83b6be347831125806be7bee19294aa85ed58))
* **models:** add imageConfig to gemini image model ([#621](https://github.com/AIGNE-io/aigne-framework/issues/621)) ([252de7a](https://github.com/AIGNE-io/aigne-framework/commit/252de7a10701c4f5302c2fff977c88e5e833b7b1))

## [1.81.0-beta.7](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.81.0-beta.6...aigne-framework-v1.81.0-beta.7) (2025-10-13)


### Bug Fixes

* add copy and download  in observability detail and optimize the detail rendering ([#610](https://github.com/AIGNE-io/aigne-framework/issues/610)) ([b1885f2](https://github.com/AIGNE-io/aigne-framework/commit/b1885f2b969d7ca28a0cb1ac2b4707e7c785308b))
* **cli:** suppress error message for CTRL+C ([#617](https://github.com/AIGNE-io/aigne-framework/issues/617)) ([01f0ea7](https://github.com/AIGNE-io/aigne-framework/commit/01f0ea74affa5653dd94048e68b62b7d7e649d4a))
* **core:** auto merge multiple system messages ([#619](https://github.com/AIGNE-io/aigne-framework/issues/619)) ([e9e62c0](https://github.com/AIGNE-io/aigne-framework/commit/e9e62c03c45f5a9b75d44a07588b2b179e262aad))

## [1.81.0-beta.6](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.81.0-beta.5...aigne-framework-v1.81.0-beta.6) (2025-10-12)


### Bug Fixes

* correct loading aigne with AFS config for `upgrade` command ([#613](https://github.com/AIGNE-io/aigne-framework/issues/613)) ([db1db97](https://github.com/AIGNE-io/aigne-framework/commit/db1db97b6305009d302a782dbc7fa3147900af47))

## [1.81.0-beta.5](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.81.0-beta.4...aigne-framework-v1.81.0-beta.5) (2025-10-12)


### Features

* **afs:** add configurable history injection to AFS system ([#611](https://github.com/AIGNE-io/aigne-framework/issues/611)) ([689b5d7](https://github.com/AIGNE-io/aigne-framework/commit/689b5d76d8cc82f548e8be74e63f18e7a6216c31))

## [1.81.0-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.81.0-beta.3...aigne-framework-v1.81.0-beta.4) (2025-10-11)


### Features

* **afs:** add module system fs for afs ([#594](https://github.com/AIGNE-io/aigne-framework/issues/594)) ([83c7b65](https://github.com/AIGNE-io/aigne-framework/commit/83c7b6555d21c606a5005eb05f6686882fb8ffa3))


### Bug Fixes

* add ability to delete individual trace records ([f853cec](https://github.com/AIGNE-io/aigne-framework/commit/f853cec0557600788f2da1e5be4935360372dc99))
* improve exit event handling for cli ([#609](https://github.com/AIGNE-io/aigne-framework/issues/609)) ([00211f8](https://github.com/AIGNE-io/aigne-framework/commit/00211f8ad4686ea673ea8e2eac5b850bcbd8c1f6))
* observability list query setting ([#605](https://github.com/AIGNE-io/aigne-framework/issues/605)) ([0952d39](https://github.com/AIGNE-io/aigne-framework/commit/0952d398955702276956da963710f8bfd85a86ce))
* update aigne hub params ([#607](https://github.com/AIGNE-io/aigne-framework/issues/607)) ([9ea9e0b](https://github.com/AIGNE-io/aigne-framework/commit/9ea9e0bce7119abe496a463ecb779b120d48f4bc))
* update observability deps ([#602](https://github.com/AIGNE-io/aigne-framework/issues/602)) ([fc70ecd](https://github.com/AIGNE-io/aigne-framework/commit/fc70ecd142825f0bcfc01bfa7df488d8f1d95ec3))
* upload to different Blocklet store based on version ([e4d3a1c](https://github.com/AIGNE-io/aigne-framework/commit/e4d3a1c5485f473d1ba092dd6c91bcc57590e68d))

## [1.81.0-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.81.0-beta.2...aigne-framework-v1.81.0-beta.3) (2025-10-09)


### Bug Fixes

* input schema of AI agent should includes input key and input file key ([#600](https://github.com/AIGNE-io/aigne-framework/issues/600)) ([b4ca076](https://github.com/AIGNE-io/aigne-framework/commit/b4ca076d6b4a1a1ecb8d4ebb008abd0d7561aadd))

## [1.81.0-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.81.0-beta.1...aigne-framework-v1.81.0-beta.2) (2025-10-09)


### Features

* **core:** add `toolCallsConcurrency` support for AI agent ([#598](https://github.com/AIGNE-io/aigne-framework/issues/598)) ([84df406](https://github.com/AIGNE-io/aigne-framework/commit/84df406bfa9e3bdf159509f4b9cf2301ec80b155))


### Bug Fixes

* **core:** add input_file_key support for agent yaml ([#597](https://github.com/AIGNE-io/aigne-framework/issues/597)) ([63414a3](https://github.com/AIGNE-io/aigne-framework/commit/63414a3d46c74c686e7f033c224ca6175bea8c3f))

## [1.81.0-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.81.0-beta...aigne-framework-v1.81.0-beta.1) (2025-10-08)


### Bug Fixes

* **cli:** add environment variable support for AIGNE Hub credentials ([#595](https://github.com/AIGNE-io/aigne-framework/issues/595)) ([00651e4](https://github.com/AIGNE-io/aigne-framework/commit/00651e4f1047c24be297b4f73e06e144592d934d))

## [1.81.0-beta](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.80.0...aigne-framework-v1.81.0-beta) (2025-10-07)


### Features

* **afs:** add basic AFS(AIGNE File System) support ([#505](https://github.com/AIGNE-io/aigne-framework/issues/505)) ([ac2a18a](https://github.com/AIGNE-io/aigne-framework/commit/ac2a18a82470a2f31c466f329386525eb1cdab6d))


### Bug Fixes

* standardize URL parameter naming from url to baseURL ([#593](https://github.com/AIGNE-io/aigne-framework/issues/593)) ([47efd4a](https://github.com/AIGNE-io/aigne-framework/commit/47efd4aad7130356a0c0bdf905acd8bc50453d26))

## [1.80.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.80.0-beta.8...aigne-framework-v1.80.0) (2025-10-04)

## [1.80.0-beta.8](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.80.0-beta.7...aigne-framework-v1.80.0-beta.8) (2025-10-03)


### Features

* support custom extra model options in agent yaml file ([#586](https://github.com/AIGNE-io/aigne-framework/issues/586)) ([6d82115](https://github.com/AIGNE-io/aigne-framework/commit/6d82115e0763385c7e44ea152867c0d4a9e0a301))
* support custom reflection error message ([#589](https://github.com/AIGNE-io/aigne-framework/issues/589)) ([856348e](https://github.com/AIGNE-io/aigne-framework/commit/856348e889890051d7149b4093161f6ba8636273))


### Bug Fixes

* **cli:** prevent terminal input text overflow and corruption ([#588](https://github.com/AIGNE-io/aigne-framework/issues/588)) ([990c952](https://github.com/AIGNE-io/aigne-framework/commit/990c9526f0d2d6eec4d9fcd5ae61612a6ce23b9e))
* **core:** auto retry LLM request for tool not found error ([#590](https://github.com/AIGNE-io/aigne-framework/issues/590)) ([3283daa](https://github.com/AIGNE-io/aigne-framework/commit/3283daa7abb0a44545b27d51645e5868c59a442f))

## [1.80.0-beta.7](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.80.0-beta.6...aigne-framework-v1.80.0-beta.7) (2025-10-02)


### Features

* **core:** add `keepTextInToolUses` option for AI Agent ([#585](https://github.com/AIGNE-io/aigne-framework/issues/585)) ([6c6be9e](https://github.com/AIGNE-io/aigne-framework/commit/6c6be9eee8e96294921b676a1982a18c93b2f66d))


### Bug Fixes

* **core:** agent should not emit error event if retried ([#583](https://github.com/AIGNE-io/aigne-framework/issues/583)) ([04edcbf](https://github.com/AIGNE-io/aigne-framework/commit/04edcbfd71aa2746dad98140e20e0b718701fa0a))

## [1.80.0-beta.6](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.80.0-beta.5...aigne-framework-v1.80.0-beta.6) (2025-10-01)


### Bug Fixes

* handle optional imageModel in loader function ([#582](https://github.com/AIGNE-io/aigne-framework/issues/582)) ([7d55084](https://github.com/AIGNE-io/aigne-framework/commit/7d550841b6edfc762ef7c188a585d9fc8ffdf4c7))
* update deps compatibility in CommonJS environment ([#580](https://github.com/AIGNE-io/aigne-framework/issues/580)) ([a1e35d0](https://github.com/AIGNE-io/aigne-framework/commit/a1e35d016405accb51c1aeb6a544503a1c78e912))

## [1.80.0-beta.5](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.80.0-beta.4...aigne-framework-v1.80.0-beta.5) (2025-10-01)


### Bug Fixes

* resolve import.meta compatibility in CommonJS environment ([#578](https://github.com/AIGNE-io/aigne-framework/issues/578)) ([d3a492a](https://github.com/AIGNE-io/aigne-framework/commit/d3a492a4de1b8f6648866590266aab0fe69f32e0))

## [1.80.0-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.80.0-beta.3...aigne-framework-v1.80.0-beta.4) (2025-10-01)


### Bug Fixes

* **cli:** load image model base on agent definition ([#577](https://github.com/AIGNE-io/aigne-framework/issues/577)) ([f1b7205](https://github.com/AIGNE-io/aigne-framework/commit/f1b7205904ed47b0c00199964eda74581473d805))
* **core:** add `include_input_in_output` option for agent definition ([#575](https://github.com/AIGNE-io/aigne-framework/issues/575)) ([9e28b72](https://github.com/AIGNE-io/aigne-framework/commit/9e28b729963faa8bea90ee42fde855868889396d))

## [1.80.0-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.80.0-beta.2...aigne-framework-v1.80.0-beta.3) (2025-10-01)


### Bug Fixes

* prevent template rendering for agent and tool messages ([#572](https://github.com/AIGNE-io/aigne-framework/issues/572)) ([859687e](https://github.com/AIGNE-io/aigne-framework/commit/859687e499b07ffebced8b2cd89d4af676f6a462))
* **ui:** enhance terminal input with status indicators and layout options ([#573](https://github.com/AIGNE-io/aigne-framework/issues/573)) ([31b83df](https://github.com/AIGNE-io/aigne-framework/commit/31b83df86fa959a37e6df2df516d7fc3015dc63b))

## [1.80.0-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.80.0-beta.1...aigne-framework-v1.80.0-beta.2) (2025-09-30)


### Features

* add multiline support for prompts.input ([#570](https://github.com/AIGNE-io/aigne-framework/issues/570)) ([520d985](https://github.com/AIGNE-io/aigne-framework/commit/520d9859770cc553b551a4a58c7e392b39f53b37))

## [1.80.0-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.79.2-beta.1...aigne-framework-v1.80.0-beta.1) (2025-09-30)


### Features

* **cli:** support define nested commands for sub apps ([#568](https://github.com/AIGNE-io/aigne-framework/issues/568)) ([0693b80](https://github.com/AIGNE-io/aigne-framework/commit/0693b807e0f8d335010e6ad00763b07cf095e65b))

## [1.79.2-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.79.2-beta...aigne-framework-v1.79.2-beta.1) (2025-09-29)


### Bug Fixes

* **cli:** improve app loading reliability with force upgrade on error ([#566](https://github.com/AIGNE-io/aigne-framework/issues/566)) ([d7c49cf](https://github.com/AIGNE-io/aigne-framework/commit/d7c49cfdfdc72c0d1a98c3033babe1392cb707c1))

## [1.79.2-beta](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.79.1...aigne-framework-v1.79.2-beta) (2025-09-29)


### Bug Fixes

* **checkbox:** display options list alongside error messages in search mode ([#563](https://github.com/AIGNE-io/aigne-framework/issues/563)) ([b0ebbed](https://github.com/AIGNE-io/aigne-framework/commit/b0ebbed933362fe462a6af2c812886f8e80d5194))
* improved path resolution for better module compatibility ([#564](https://github.com/AIGNE-io/aigne-framework/issues/564)) ([84e92a1](https://github.com/AIGNE-io/aigne-framework/commit/84e92a13367d801c58dd7740e9762c7b245308c6))

## [1.79.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.79.1-beta...aigne-framework-v1.79.1) (2025-09-27)

## [1.79.1-beta](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.79.0...aigne-framework-v1.79.1-beta) (2025-09-27)


### Bug Fixes

* **cli:** install deps with `--force` option when installing application ([#560](https://github.com/AIGNE-io/aigne-framework/issues/560)) ([adc49b1](https://github.com/AIGNE-io/aigne-framework/commit/adc49b18907a0c94a1404fa17717aea1f1fc84d3))

## [1.79.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.79.0-beta.11...aigne-framework-v1.79.0) (2025-09-27)

## [1.79.0-beta.11](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.79.0-beta.10...aigne-framework-v1.79.0-beta.11) (2025-09-27)


### Bug Fixes

* **cli:** resolve input schema not working for run command ([#557](https://github.com/AIGNE-io/aigne-framework/issues/557)) ([6fa12b3](https://github.com/AIGNE-io/aigne-framework/commit/6fa12b3e068aaec28cf204c3a3f7c471bd2827ae))

## [1.79.0-beta.10](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.79.0-beta.9...aigne-framework-v1.79.0-beta.10) (2025-09-26)


### Features

* **cli:** add `--beta` `--target-version` `--force` options for `upgrade` command ([#555](https://github.com/AIGNE-io/aigne-framework/issues/555)) ([f9f0471](https://github.com/AIGNE-io/aigne-framework/commit/f9f04719020cca00bc3adbe8169c42422201df49))


### Bug Fixes

* **blocklet:** observability blocklet start failure ([#554](https://github.com/AIGNE-io/aigne-framework/issues/554)) ([8431d4d](https://github.com/AIGNE-io/aigne-framework/commit/8431d4d89a4b96f735f23e774e9545bbe1fd811c))

## [1.79.0-beta.9](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.79.0-beta.8...aigne-framework-v1.79.0-beta.9) (2025-09-26)


### Bug Fixes

* **core:** check agent by structure instead of instanceOf ([826ef6f](https://github.com/AIGNE-io/aigne-framework/commit/826ef6fd4e9603cf51344e8e5b11af644396220e))

## [1.79.0-beta.8](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.79.0-beta.7...aigne-framework-v1.79.0-beta.8) (2025-09-26)


### Bug Fixes

* **cli:** options.prompts should always available ([44ca0a6](https://github.com/AIGNE-io/aigne-framework/commit/44ca0a65d910fbd327b89d2f3dfe38ab7d1be7df))
* multiple input reminder ([#550](https://github.com/AIGNE-io/aigne-framework/issues/550)) ([0ab858f](https://github.com/AIGNE-io/aigne-framework/commit/0ab858fbe5177f02c1ca6af239b4171a358545df))

## [1.79.0-beta.7](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.79.0-beta.6...aigne-framework-v1.79.0-beta.7) (2025-09-25)


### Features

* **blocklet:** add token and cost summary for tracing list ([#543](https://github.com/AIGNE-io/aigne-framework/issues/543)) ([5e78919](https://github.com/AIGNE-io/aigne-framework/commit/5e789199b8183cf9c48339ec8163faec001ca64c))
* **core:** add automatic JSON parsing and validation for structured outputs ([#548](https://github.com/AIGNE-io/aigne-framework/issues/548)) ([9077f93](https://github.com/AIGNE-io/aigne-framework/commit/9077f93856865915aaf5e8caa5638ef0b7f05b1e))

## [1.79.0-beta.6](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.79.0-beta.5...aigne-framework-v1.79.0-beta.6) (2025-09-25)


### Features

* **cli:** add new eval command for assessing AI agent performance using custom datasets ([#535](https://github.com/AIGNE-io/aigne-framework/issues/535)) ([9da967b](https://github.com/AIGNE-io/aigne-framework/commit/9da967b01ef9eeee4c5e1242934cf08e14815753))


### Bug Fixes

* improve SQLite busy error handling and observability logging ([#545](https://github.com/AIGNE-io/aigne-framework/issues/545)) ([6dc8e06](https://github.com/AIGNE-io/aigne-framework/commit/6dc8e064231f3d6342036626591e89bff1ae5c08))

## [1.79.0-beta.5](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.79.0-beta.4...aigne-framework-v1.79.0-beta.5) (2025-09-24)


### Bug Fixes

* replace import.meta.dirname with Node 20 compatible dirname approach ([#541](https://github.com/AIGNE-io/aigne-framework/issues/541)) ([8a4fb26](https://github.com/AIGNE-io/aigne-framework/commit/8a4fb2649e88791444a7d4b3ddf9addcec2b666a))

## [1.79.0-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.79.0-beta.3...aigne-framework-v1.79.0-beta.4) (2025-09-24)


### Features

* **core:** add multi-roles instructions support for agent yaml ([#538](https://github.com/AIGNE-io/aigne-framework/issues/538)) ([97bf77f](https://github.com/AIGNE-io/aigne-framework/commit/97bf77f96b5f69321539311159010499eb3b1b25))


### Bug Fixes

* move zod from devDependencies to dependencies in ideogram model ([#539](https://github.com/AIGNE-io/aigne-framework/issues/539)) ([9a08529](https://github.com/AIGNE-io/aigne-framework/commit/9a08529c53a40817acc831fb9b1925e200671f40))

## [1.79.0-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.79.0-beta.2...aigne-framework-v1.79.0-beta.3) (2025-09-23)


### Bug Fixes

* add prefer input file type option for image model ([#536](https://github.com/AIGNE-io/aigne-framework/issues/536)) ([3cba8a5](https://github.com/AIGNE-io/aigne-framework/commit/3cba8a5562233a1567b49b6dd5c446c0760f5c4c))

## [1.79.0-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.79.0-beta.1...aigne-framework-v1.79.0-beta.2) (2025-09-23)


### Bug Fixes

* remove useless parameter ([efb0690](https://github.com/AIGNE-io/aigne-framework/commit/efb0690cf1ada6de95896e160c7cc5ffc7524ab2))
* standardize file parameter naming across models ([#534](https://github.com/AIGNE-io/aigne-framework/issues/534)) ([f159a9d](https://github.com/AIGNE-io/aigne-framework/commit/f159a9d6af21ec0e99641996b150560929845845))

## [1.79.0-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.79.0-beta...aigne-framework-v1.79.0-beta.1) (2025-09-23)


### Features

* add models method to get available models for aigne hub model ([#532](https://github.com/AIGNE-io/aigne-framework/issues/532)) ([3248646](https://github.com/AIGNE-io/aigne-framework/commit/3248646d248aef5419273adc556bb1f13a7b2a02))


### Bug Fixes

* improve image model parameters ([#530](https://github.com/AIGNE-io/aigne-framework/issues/530)) ([d66b5ca](https://github.com/AIGNE-io/aigne-framework/commit/d66b5ca01e14baad2712cc1a84930cdb63703232))

## [1.79.0-beta](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.78.3...aigne-framework-v1.79.0-beta) (2025-09-22)


### Features

* improve image model architecture and file handling ([#527](https://github.com/AIGNE-io/aigne-framework/issues/527)) ([4db50aa](https://github.com/AIGNE-io/aigne-framework/commit/4db50aa0387a1a0f045ca11aaa61613e36ca7597))


### Bug Fixes

* resolve Windows file import URI issues ([#528](https://github.com/AIGNE-io/aigne-framework/issues/528)) ([bf807c5](https://github.com/AIGNE-io/aigne-framework/commit/bf807c5a3563c4423dc82fddff7fba280ef57957))

## [1.78.3](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.78.3-beta...aigne-framework-v1.78.3) (2025-09-22)

## [1.78.3-beta](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.78.2...aigne-framework-v1.78.3-beta) (2025-09-22)


### Bug Fixes

* improved number formatting for credit balance display in hub commands ([c5ec419](https://github.com/AIGNE-io/aigne-framework/commit/c5ec41910435b58957611fe48105ed3c69c56e17))

## [1.78.2](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.78.1...aigne-framework-v1.78.2) (2025-09-18)


### Bug Fixes

* correct flat import, remove default import error ([#519](https://github.com/AIGNE-io/aigne-framework/issues/519)) ([6e8fd30](https://github.com/AIGNE-io/aigne-framework/commit/6e8fd30b89be1300ab6214f13fd273e51e25329b))
* **gemini:** should include at least one user message ([#521](https://github.com/AIGNE-io/aigne-framework/issues/521)) ([eb2752e](https://github.com/AIGNE-io/aigne-framework/commit/eb2752ed7d78f59c435ecc3ccb7227e804e3781e))

## [1.78.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.78.0...aigne-framework-v1.78.1) (2025-09-18)


### Bug Fixes

* **models:** convert local image to base64 for image model ([#517](https://github.com/AIGNE-io/aigne-framework/issues/517)) ([c0bc971](https://github.com/AIGNE-io/aigne-framework/commit/c0bc971087ef6e1caa641a699aed391a24feb40d))
* support the correct 3.0 model ([#514](https://github.com/AIGNE-io/aigne-framework/issues/514)) ([98e0d44](https://github.com/AIGNE-io/aigne-framework/commit/98e0d44ce2c4c7b043d5fc934c6e312ffa821521))
* use aigne hub model when aigne hub connected ([#516](https://github.com/AIGNE-io/aigne-framework/issues/516)) ([a0493d0](https://github.com/AIGNE-io/aigne-framework/commit/a0493d0ad453afd3c3734ee2730636c6bd1e08ce))

## [1.78.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.77.1...aigne-framework-v1.78.0) (2025-09-16)


### Features

* **cli:** support using beta apps with environments ([#511](https://github.com/AIGNE-io/aigne-framework/issues/511)) ([141b11a](https://github.com/AIGNE-io/aigne-framework/commit/141b11a7757f8a441489c9e7ab5e10df1fafe26f))


### Bug Fixes

* **cli:** tune aigne hub status and deprecate aigne hub info ([#513](https://github.com/AIGNE-io/aigne-framework/issues/513)) ([25ca2a9](https://github.com/AIGNE-io/aigne-framework/commit/25ca2a9c402e9cb2d895737c32e25e957fdefd91))

## [1.77.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.77.0...aigne-framework-v1.77.1) (2025-09-16)


### Bug Fixes

* release new version ([#509](https://github.com/AIGNE-io/aigne-framework/issues/509)) ([822ccd2](https://github.com/AIGNE-io/aigne-framework/commit/822ccd2c374cdcef187066e102dc79230e2eebff))

## [1.77.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.76.2...aigne-framework-v1.77.0) (2025-09-14)


### Features

* **cli:** add web-smith command to @aigne/cli ([#486](https://github.com/AIGNE-io/aigne-framework/issues/486)) ([3f6d51a](https://github.com/AIGNE-io/aigne-framework/commit/3f6d51a24a505c6b0a520b1775164a3456fd9fd5))

## [1.76.2](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.76.1...aigne-framework-v1.76.2) (2025-09-11)


### Bug Fixes

* **core:** add nullish or nullable support for output schema ([#482](https://github.com/AIGNE-io/aigne-framework/issues/482)) ([bf80c29](https://github.com/AIGNE-io/aigne-framework/commit/bf80c29e10d3fef654c830df8dc7f3b7939fa58d))

## [1.76.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.76.0...aigne-framework-v1.76.1) (2025-09-11)


### Bug Fixes

* add compatibility for incorrect file object input ([#477](https://github.com/AIGNE-io/aigne-framework/issues/477)) ([b8fa75d](https://github.com/AIGNE-io/aigne-framework/commit/b8fa75d28faeadaea76036838abbc5f2aae42aba))
* rename chatModel to model ([13ad16b](https://github.com/AIGNE-io/aigne-framework/commit/13ad16b2935d706173c7596015dac8eaefd03b43))

## [1.76.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.75.0...aigne-framework-v1.76.0) (2025-09-10)


### Features

* support custom model for every agents ([#472](https://github.com/AIGNE-io/aigne-framework/issues/472)) ([0bda78a](https://github.com/AIGNE-io/aigne-framework/commit/0bda78a2ebf537e953d855882d68cb37d94d1d10))


### Bug Fixes

* **cli:** load AIGNE in a child process to ensure app is available ([#475](https://github.com/AIGNE-io/aigne-framework/issues/475)) ([c8201b5](https://github.com/AIGNE-io/aigne-framework/commit/c8201b51accc4a9d047394f235df53725733f726))
* **cli:** run default agent if `entry-agent` argument not present ([#473](https://github.com/AIGNE-io/aigne-framework/issues/473)) ([8c46672](https://github.com/AIGNE-io/aigne-framework/commit/8c4667206a2336e74db07442dc296ef9f9265a0b))
* **observability:** convert base64 image output into mekia kit image file ([#471](https://github.com/AIGNE-io/aigne-framework/issues/471)) ([ce05713](https://github.com/AIGNE-io/aigne-framework/commit/ce057131a2308eb73bbe49dff534749e68c268d9))

## [1.75.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.74.3...aigne-framework-v1.75.0) (2025-09-09)


### Features

* support custom prefer input file type ([#469](https://github.com/AIGNE-io/aigne-framework/issues/469)) ([db0161b](https://github.com/AIGNE-io/aigne-framework/commit/db0161bbac52542c771ee2f40f361636b0668075))

## [1.74.3](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.74.2...aigne-framework-v1.74.3) (2025-09-08)


### Bug Fixes

* handle absolute paths in agent YAML prompt URLs ([#466](https://github.com/AIGNE-io/aigne-framework/issues/466)) ([a07a088](https://github.com/AIGNE-io/aigne-framework/commit/a07a0880728f65fc831578763b62ce5144d1aed8))
* support optional field sturectured output for gemini ([#468](https://github.com/AIGNE-io/aigne-framework/issues/468)) ([70c6279](https://github.com/AIGNE-io/aigne-framework/commit/70c62795039a2862e3333f26707329489bf938de))

## [1.74.2](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.74.1...aigne-framework-v1.74.2) (2025-09-05)


### Bug Fixes

* **model:** transform local file to base64 before request llm ([#462](https://github.com/AIGNE-io/aigne-framework/issues/462)) ([58ef5d7](https://github.com/AIGNE-io/aigne-framework/commit/58ef5d77046c49f3c4eed15b7f0cc283cbbcd74a))

## [1.74.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.74.0...aigne-framework-v1.74.1) (2025-09-05)


### Bug Fixes

* should not return local path from aigne hub service ([#460](https://github.com/AIGNE-io/aigne-framework/issues/460)) ([c959717](https://github.com/AIGNE-io/aigne-framework/commit/c95971774f7e84dbeb3313f60b3e6464e2bb22e4))

## [1.74.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.73.1...aigne-framework-v1.74.0) (2025-09-05)


### Features

* add modalities support for chat model ([#454](https://github.com/AIGNE-io/aigne-framework/issues/454)) ([70d1bf6](https://github.com/AIGNE-io/aigne-framework/commit/70d1bf631f4e711235d89c6df8ee210a19179b30))
* **cli:** unify `run` and apps command arguments ([#436](https://github.com/AIGNE-io/aigne-framework/issues/436)) ([9c6b632](https://github.com/AIGNE-io/aigne-framework/commit/9c6b6323f8cfc2afe632d8ae392eab446981fc64))


### Bug Fixes

* add disabled observability env ([#453](https://github.com/AIGNE-io/aigne-framework/issues/453)) ([3e01107](https://github.com/AIGNE-io/aigne-framework/commit/3e01107deb07d3e4eb6fbe49a7b39919fa412df1))
* add file protocol to local file links in terminal tracer ([#455](https://github.com/AIGNE-io/aigne-framework/issues/455)) ([14890f9](https://github.com/AIGNE-io/aigne-framework/commit/14890f9ead679f38a7cc0b1ff31a97d2fe9056cb))
* add model for image mode input params ([#450](https://github.com/AIGNE-io/aigne-framework/issues/450)) ([3500a5a](https://github.com/AIGNE-io/aigne-framework/commit/3500a5ae5d420c7e735f2fa57729a9fe524320e8))
* delete all observability data ([#451](https://github.com/AIGNE-io/aigne-framework/issues/451)) ([4176743](https://github.com/AIGNE-io/aigne-framework/commit/4176743afbd2aadf6777e39c29b45d65d21b751a))
* support error hooks for AIGNEHTTPServer ([#456](https://github.com/AIGNE-io/aigne-framework/issues/456)) ([37197c8](https://github.com/AIGNE-io/aigne-framework/commit/37197c8f2db757974f35ce836be12f07b568b4c6))

## [1.73.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.73.0...aigne-framework-v1.73.1) (2025-09-01)


### Bug Fixes

* **cli:** ensure console is restored after loadAIGNE call ([#447](https://github.com/AIGNE-io/aigne-framework/issues/447)) ([68fae38](https://github.com/AIGNE-io/aigne-framework/commit/68fae38c10346cd202266decf0ab0869bb618a07))
* **core:** replace static import with dynamic import for CommonJS compatibility ([#448](https://github.com/AIGNE-io/aigne-framework/issues/448)) ([6db1e57](https://github.com/AIGNE-io/aigne-framework/commit/6db1e570858fff32f7352143585b98e900f1f71d))
* **transport:** improve HTTP client option handling and error serialization ([#445](https://github.com/AIGNE-io/aigne-framework/issues/445)) ([d3bcdd2](https://github.com/AIGNE-io/aigne-framework/commit/d3bcdd23ab8011a7d40fc157fd61eb240494c7a5))

## [1.73.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.72.4...aigne-framework-v1.73.0) (2025-08-30)


### Features

* **cli:** support ctrl+a select all items for prompts.checkbox ([#439](https://github.com/AIGNE-io/aigne-framework/issues/439)) ([af1c6c0](https://github.com/AIGNE-io/aigne-framework/commit/af1c6c03a1ebb2a168d6750a121aacd142ab26ea))


### Bug Fixes

* **core:** handle relative path correctly ([#440](https://github.com/AIGNE-io/aigne-framework/issues/440)) ([45a65fe](https://github.com/AIGNE-io/aigne-framework/commit/45a65fea432da44218007e566fe952fa973d8ae2))

## [1.72.4](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.72.3...aigne-framework-v1.72.4) (2025-08-30)


### Bug Fixes

* **core:** improve nested prompt file resolution ([#437](https://github.com/AIGNE-io/aigne-framework/issues/437)) ([38b5b13](https://github.com/AIGNE-io/aigne-framework/commit/38b5b1397b7897cddef39d60c8cae2152e37dc5b))

## [1.72.3](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.72.2...aigne-framework-v1.72.3) (2025-08-29)


### Bug Fixes

* **core:** resolve nested prompt file correctly ([#434](https://github.com/AIGNE-io/aigne-framework/issues/434)) ([b334092](https://github.com/AIGNE-io/aigne-framework/commit/b334092900c003ca3c22d320e12712fd55c2500c))

## [1.72.2](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.72.1...aigne-framework-v1.72.2) (2025-08-29)


### Bug Fixes

* **core:** load nested prompt files with relative paths correctly ([#432](https://github.com/AIGNE-io/aigne-framework/issues/432)) ([036ffa7](https://github.com/AIGNE-io/aigne-framework/commit/036ffa72391d3f27870a5022b7964739805a6161))

## [1.72.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.72.0...aigne-framework-v1.72.1) (2025-08-29)


### Bug Fixes

* resolve checkbox multi-select issues and add comprehensive test ([#430](https://github.com/AIGNE-io/aigne-framework/issues/430)) ([a81be74](https://github.com/AIGNE-io/aigne-framework/commit/a81be74253923a1a2981f0780a15f175fd439210))

## [1.72.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.71.0...aigne-framework-v1.72.0) (2025-08-28)


### Features

* add lmstudio model adapter ([#406](https://github.com/AIGNE-io/aigne-framework/issues/406)) ([6610993](https://github.com/AIGNE-io/aigne-framework/commit/6610993cb500b1fac2bf5d17f40f351d4c897bd7))
* **cli:** add searchable checkbox component with dynamic filtering ([#426](https://github.com/AIGNE-io/aigne-framework/issues/426)) ([1a76fe7](https://github.com/AIGNE-io/aigne-framework/commit/1a76fe7c2f7d91bc4041dfcd73850b39a18a036b))
* **docs:** add support for custom component ([#422](https://github.com/AIGNE-io/aigne-framework/issues/422)) ([2610e54](https://github.com/AIGNE-io/aigne-framework/commit/2610e54588a44ee4fede7bc9957a7e547c966658))


### Bug Fixes

* **cli:** only show ascii logo on help and errors ([#425](https://github.com/AIGNE-io/aigne-framework/issues/425)) ([1279376](https://github.com/AIGNE-io/aigne-framework/commit/1279376b7ca9c1c38148dcde581ee4730771a4ad))
* **docs:** normalize data-href attribute for custom components ([#427](https://github.com/AIGNE-io/aigne-framework/issues/427)) ([ae8a251](https://github.com/AIGNE-io/aigne-framework/commit/ae8a2514f244148b0962fffdb8f284c27736f368))
* polish custom component link ([#428](https://github.com/AIGNE-io/aigne-framework/issues/428)) ([f2d0e6d](https://github.com/AIGNE-io/aigne-framework/commit/f2d0e6d52f28ee9baa3a82b83f28d693cc4881b8))
* support gemini-2.0-flash model for image model ([#429](https://github.com/AIGNE-io/aigne-framework/issues/429)) ([5a0bba1](https://github.com/AIGNE-io/aigne-framework/commit/5a0bba197cf8785384b70302f86cf702d04b7fc4))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @aigne/publish-docs bumped to 0.8.0

## [1.71.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.70.0...aigne-framework-v1.71.0) (2025-08-27)


### Features

* **models:** add retry mechanism for network errors and structured output validation errors ([#418](https://github.com/AIGNE-io/aigne-framework/issues/418)) ([52bc9ee](https://github.com/AIGNE-io/aigne-framework/commit/52bc9eec5f4f4fa3c3f26881c405f4f89dad01c9))
* **models:** support aigne hub models ([#416](https://github.com/AIGNE-io/aigne-framework/issues/416)) ([b4f014c](https://github.com/AIGNE-io/aigne-framework/commit/b4f014cf5ed08ef930d3ddfc278d3610e64c6af3))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @aigne/publish-docs bumped to 0.7.0

## [1.70.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.69.0...aigne-framework-v1.70.0) (2025-08-27)


### Features

* **models:** support gemini and ideogram images models ([#412](https://github.com/AIGNE-io/aigne-framework/issues/412)) ([6534fec](https://github.com/AIGNE-io/aigne-framework/commit/6534fecb0bdfb4b0a4440d44c0e563b9a029a68f))

## [1.69.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.68.0...aigne-framework-v1.69.0) (2025-08-26)


### Features

* **docs:** support auto asset uploading on publishing ([#410](https://github.com/AIGNE-io/aigne-framework/issues/410)) ([c0f84b3](https://github.com/AIGNE-io/aigne-framework/commit/c0f84b3c89cb17e5719d6707a0bf93dd99129f8b))


### Bug Fixes

* **cli:** reduce memory usage of AIGNE CLI ([#411](https://github.com/AIGNE-io/aigne-framework/issues/411)) ([9c36969](https://github.com/AIGNE-io/aigne-framework/commit/9c369699d966d37abf2d6a1624eac3d2fda4123b))
* **cli:** use corepack instead of npm install deps ([#413](https://github.com/AIGNE-io/aigne-framework/issues/413)) ([1b9150c](https://github.com/AIGNE-io/aigne-framework/commit/1b9150c534bfd0cfbb51f5bed51fff609da93628))
* optimize hub connect copy ([#415](https://github.com/AIGNE-io/aigne-framework/issues/415)) ([8acc4ad](https://github.com/AIGNE-io/aigne-framework/commit/8acc4adf5815afc9564235eeb40b09293c6ab00c))
* update package to latest for observability ([#408](https://github.com/AIGNE-io/aigne-framework/issues/408)) ([997c3f3](https://github.com/AIGNE-io/aigne-framework/commit/997c3f3e8c9a7d6f3b3fedd3e6eea838b8385635))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @aigne/publish-docs bumped to 0.6.0

## [1.68.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.67.0...aigne-framework-v1.68.0) (2025-08-25)


### Features

* **ux:** use standard blocklet layout in aigne runtime ([#403](https://github.com/AIGNE-io/aigne-framework/issues/403)) ([a14274d](https://github.com/AIGNE-io/aigne-framework/commit/a14274dbf970bae7fed0eff150933ecf0f65eb64))


### Bug Fixes

* **cli:** prefer variables from process.env when loadChatModel ([#407](https://github.com/AIGNE-io/aigne-framework/issues/407)) ([d32b2db](https://github.com/AIGNE-io/aigne-framework/commit/d32b2db20435a022d944a674e90333899d881daf))
* save board meta info ([#404](https://github.com/AIGNE-io/aigne-framework/issues/404)) ([433c07c](https://github.com/AIGNE-io/aigne-framework/commit/433c07c52229a73cc8e30b9f88927e0a88b07607))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @aigne/publish-docs bumped to 0.5.7

## [1.67.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.66.0...aigne-framework-v1.67.0) (2025-08-22)


### Features

* **cli:** support aigne deploy command ([#399](https://github.com/AIGNE-io/aigne-framework/issues/399)) ([b69cba9](https://github.com/AIGNE-io/aigne-framework/commit/b69cba901d95882f847032f41d963e2fa6893ab6))

## [1.66.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.65.0...aigne-framework-v1.66.0) (2025-08-21)


### Features

* **blocklet:** support agent runtime blocklet ([#396](https://github.com/AIGNE-io/aigne-framework/issues/396)) ([baaae69](https://github.com/AIGNE-io/aigne-framework/commit/baaae691d552b7c7d313c4964a135a1b245943f9))


### Bug Fixes

* add workflow for aigne runtime ([#400](https://github.com/AIGNE-io/aigne-framework/issues/400)) ([d04d926](https://github.com/AIGNE-io/aigne-framework/commit/d04d92682e7fa4278f02ca58f9911cf9e17abc57))
* can specify an id to create a board ([#397](https://github.com/AIGNE-io/aigne-framework/issues/397)) ([f7e10fe](https://github.com/AIGNE-io/aigne-framework/commit/f7e10fe3fc188a8f38d6bd61ab85be8a9d444a06))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @aigne/publish-docs bumped to 0.5.6

## [1.65.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.64.1...aigne-framework-v1.65.0) (2025-08-21)


### Features

* **cli:** add chat mode support for cli ([#389](https://github.com/AIGNE-io/aigne-framework/issues/389)) ([d7dc138](https://github.com/AIGNE-io/aigne-framework/commit/d7dc138719dd638ddb12c4625abdf42746baf35d))


### Bug Fixes

* **cli:** force reimport of agent modules with cache busting ([#392](https://github.com/AIGNE-io/aigne-framework/issues/392)) ([c372cb9](https://github.com/AIGNE-io/aigne-framework/commit/c372cb9600a9d78ad1808a045bcddfc285e9c6f0))
* **transport:** simplify ClientAgentOptions interface ([#394](https://github.com/AIGNE-io/aigne-framework/issues/394)) ([001271a](https://github.com/AIGNE-io/aigne-framework/commit/001271a46a7a734cd28f3dae28303c11f01861a7))

## [1.64.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.64.0...aigne-framework-v1.64.1) (2025-08-21)


### Bug Fixes

* **cli:** force upgrade app while load app error ([#390](https://github.com/AIGNE-io/aigne-framework/issues/390)) ([fa5e427](https://github.com/AIGNE-io/aigne-framework/commit/fa5e427eb29157c3ebcd9c9bf8c5c6b31efad4ae))

## [1.64.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.63.0...aigne-framework-v1.64.0) (2025-08-20)


### Features

* add ImageModel/ImageAgent support ([#383](https://github.com/AIGNE-io/aigne-framework/issues/383)) ([96a2093](https://github.com/AIGNE-io/aigne-framework/commit/96a209368d91d98f47db6de1e404640368a86fa8))


### Bug Fixes

* detecting changes in board information and updating board information ([#387](https://github.com/AIGNE-io/aigne-framework/issues/387)) ([419da73](https://github.com/AIGNE-io/aigne-framework/commit/419da73690fbdbd63ddd6b6dbc4ac0f5fe7e197b))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @aigne/publish-docs bumped to 0.5.5

## [1.63.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.62.0...aigne-framework-v1.63.0) (2025-08-20)


### Features

* **agents:** add async memory recording option ([#385](https://github.com/AIGNE-io/aigne-framework/issues/385)) ([573acdb](https://github.com/AIGNE-io/aigne-framework/commit/573acdb617434e6699b2e07db942e6336706d27f))


### Bug Fixes

* **observability:** handle pagination and query errors properly ([#380](https://github.com/AIGNE-io/aigne-framework/issues/380)) ([1088b67](https://github.com/AIGNE-io/aigne-framework/commit/1088b677bb553c1c3c2a977dcf1648afef069bb0))

## [1.62.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.61.3...aigne-framework-v1.62.0) (2025-08-18)


### Features

* **cli:** add support for array inputs in CLI arguments ([#378](https://github.com/AIGNE-io/aigne-framework/issues/378)) ([827ae11](https://github.com/AIGNE-io/aigne-framework/commit/827ae112de8d1a2e997b272b759090b6e5b8d395))
* **cli:** support hide or collapse task for agents in CLI ([#381](https://github.com/AIGNE-io/aigne-framework/issues/381)) ([05b372d](https://github.com/AIGNE-io/aigne-framework/commit/05b372d431a862f7cdfa2a90bb4b7b2379bf97ab))


### Bug Fixes

* **cli:** only log API requests at info level and above ([#376](https://github.com/AIGNE-io/aigne-framework/issues/376)) ([03fc4d9](https://github.com/AIGNE-io/aigne-framework/commit/03fc4d9aad6e81aeae3b2eb02a62f7acade3bd77))
* **memory:** memory storage error if search segments is empty ([#379](https://github.com/AIGNE-io/aigne-framework/issues/379)) ([4e36b6b](https://github.com/AIGNE-io/aigne-framework/commit/4e36b6bfe71cd78ee75014ba26a4c121417e5daa))

## [1.61.3](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.61.2...aigne-framework-v1.61.3) (2025-08-16)


### Bug Fixes

* **core:** make getCredential async for aigne-hub mount point retrieval ([#372](https://github.com/AIGNE-io/aigne-framework/issues/372)) ([34ce7a6](https://github.com/AIGNE-io/aigne-framework/commit/34ce7a645fa83994d3dfe0f29ca70098cfecac9c))
* **models:** support custom clientId for aigne-hub adapter ([#373](https://github.com/AIGNE-io/aigne-framework/issues/373)) ([0e46568](https://github.com/AIGNE-io/aigne-framework/commit/0e465683f4b34fb7456e313fa45f0cda50bb08dc))

## [1.61.2](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.61.1...aigne-framework-v1.61.2) (2025-08-15)


### Bug Fixes

* **cli:** display only the origin URL when linking to hub ([#369](https://github.com/AIGNE-io/aigne-framework/issues/369)) ([b3baf3f](https://github.com/AIGNE-io/aigne-framework/commit/b3baf3f2c98f965d5279dd0dfb282be9f5ffb6c2))
* **model:** add x-aigne-hub-client-did header for hub model requests ([#371](https://github.com/AIGNE-io/aigne-framework/issues/371)) ([8c29f37](https://github.com/AIGNE-io/aigne-framework/commit/8c29f377d6ef3833723c8ec721a252171026d84d))

## [1.61.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.61.0...aigne-framework-v1.61.1) (2025-08-15)


### Bug Fixes

* **model:** ensure Chat Model client is initialized before use ([#367](https://github.com/AIGNE-io/aigne-framework/issues/367)) ([7543ccb](https://github.com/AIGNE-io/aigne-framework/commit/7543ccb7e1cf5395c4f4e1f51659982b58f5daa1))

## [1.61.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.60.0...aigne-framework-v1.61.0) (2025-08-14)


### Features

* **model:** add poe chat model support ([#365](https://github.com/AIGNE-io/aigne-framework/issues/365)) ([b2cce67](https://github.com/AIGNE-io/aigne-framework/commit/b2cce67bdab1c6dec273929bcdd79e1d15410119))

## [1.60.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.59.1...aigne-framework-v1.60.0) (2025-08-14)


### Features

* **core:** add priority support for agent hooks ([#358](https://github.com/AIGNE-io/aigne-framework/issues/358)) ([9196141](https://github.com/AIGNE-io/aigne-framework/commit/91961413aea171048a6afae87ffc8dc53e20fca8))
* **transport:** add retry mechanism to HTTP client ([#364](https://github.com/AIGNE-io/aigne-framework/issues/364)) ([85dfab0](https://github.com/AIGNE-io/aigne-framework/commit/85dfab0d285199137edea47199c448247823258c))


### Bug Fixes

* **cli:** alwasy print useage information after agent processed ([58da143](https://github.com/AIGNE-io/aigne-framework/commit/58da143329a6748005c7812723c6b3f986e07e08))
* **cli:** clean app folder before upgrade ([#362](https://github.com/AIGNE-io/aigne-framework/issues/362)) ([0553c50](https://github.com/AIGNE-io/aigne-framework/commit/0553c504f5d0a446397bdccb20c91921cc618167))
* **cli:** improve feedback in AIGNE Hub commands ([#361](https://github.com/AIGNE-io/aigne-framework/issues/361)) ([ff29a4b](https://github.com/AIGNE-io/aigne-framework/commit/ff29a4b3c7bb828ef9894482586c8c4df41a2122))
* **cli:** improve markdown terminal theme styling ([#360](https://github.com/AIGNE-io/aigne-framework/issues/360)) ([dc9efbb](https://github.com/AIGNE-io/aigne-framework/commit/dc9efbb477e6792f51090c4fdd6e129e90821263))
* **cli:** log only once in loadAIGNE ([#357](https://github.com/AIGNE-io/aigne-framework/issues/357)) ([6e6d968](https://github.com/AIGNE-io/aigne-framework/commit/6e6d96814fbc87f210522ae16daf94c1f84f311a))
* **cli:** prevent multiple simultaneous buy credits prompts ([#363](https://github.com/AIGNE-io/aigne-framework/issues/363)) ([b8fb459](https://github.com/AIGNE-io/aigne-framework/commit/b8fb459261fe327bcc9bfb4d163e66863cb797ec))

## [1.59.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.59.0...aigne-framework-v1.59.1) (2025-08-13)


### Bug Fixes

* resolve circular dependency in aigne-hub ([#355](https://github.com/AIGNE-io/aigne-framework/issues/355)) ([202c1f3](https://github.com/AIGNE-io/aigne-framework/commit/202c1f3acc199f4512580b3c1f73c1dee13e40a5))

## [1.59.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.58.1...aigne-framework-v1.59.0) (2025-08-13)


### Features

* **cli:** support aigne hub commond ([#352](https://github.com/AIGNE-io/aigne-framework/issues/352)) ([0341f19](https://github.com/AIGNE-io/aigne-framework/commit/0341f190229b42c5d2ab8a8616597359f35543a7))


### Bug Fixes

* ensure log prints only once ([#354](https://github.com/AIGNE-io/aigne-framework/issues/354)) ([b5a64f7](https://github.com/AIGNE-io/aigne-framework/commit/b5a64f74ac67854fc6d576aacd1aa8b91a256765))

## [1.58.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.58.0...aigne-framework-v1.58.1) (2025-08-12)


### Bug Fixes

* **core:** add optional memory context toggle for AI agent ([#350](https://github.com/AIGNE-io/aigne-framework/issues/350)) ([92322cc](https://github.com/AIGNE-io/aigne-framework/commit/92322ccaf6f2b6e4440d47a7631589061c351d64))

## [1.58.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.57.0...aigne-framework-v1.58.0) (2025-08-12)


### Features

* **cli:** add retry functionality and improve error handling for AIGNE Hub ([#348](https://github.com/AIGNE-io/aigne-framework/issues/348)) ([672c93a](https://github.com/AIGNE-io/aigne-framework/commit/672c93abbba8b4b234f6d810536ff4b603a97e1e))


### Bug Fixes

* **core:** examples cases that failed when using aigne-hub ([#337](https://github.com/AIGNE-io/aigne-framework/issues/337)) ([0d4a31c](https://github.com/AIGNE-io/aigne-framework/commit/0d4a31c24d9e7d26f00d1accb80719d9ad79a4c6))

## [1.57.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.56.0...aigne-framework-v1.57.0) (2025-08-12)


### Features

* enhance task title functionality to support dynamic generation ([#346](https://github.com/AIGNE-io/aigne-framework/issues/346)) ([fff098c](https://github.com/AIGNE-io/aigne-framework/commit/fff098c9828beca9d99e4b2ebaebdf6b92efb84e))

## [1.56.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.55.2...aigne-framework-v1.56.0) (2025-08-11)


### Features

* enhance AI agent streaming with thinking mode support ([#343](https://github.com/AIGNE-io/aigne-framework/issues/343)) ([bea2a39](https://github.com/AIGNE-io/aigne-framework/commit/bea2a39a2610c2fe58e46ad612b5103726159ab9))

## [1.55.2](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.55.1...aigne-framework-v1.55.2) (2025-08-11)


### Bug Fixes

* add multilingual support for document publishing ([#342](https://github.com/AIGNE-io/aigne-framework/issues/342)) ([b1f9134](https://github.com/AIGNE-io/aigne-framework/commit/b1f913465d81ccf3e6b71997f0f92c86ee311cf2))
* **cli:** highlight URLs in error messages ([#340](https://github.com/AIGNE-io/aigne-framework/issues/340)) ([74c233b](https://github.com/AIGNE-io/aigne-framework/commit/74c233b548c8054f1be91955c9f1420a53785739))
* implement board name conflict resolution with ownership validation ([#339](https://github.com/AIGNE-io/aigne-framework/issues/339)) ([a5f91a4](https://github.com/AIGNE-io/aigne-framework/commit/a5f91a4d5b63c6f1cacc107c38c9aad58ae8100b))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @aigne/publish-docs bumped to 0.5.4

## [1.55.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.55.0...aigne-framework-v1.55.1) (2025-08-08)


### Bug Fixes

* **core:** auto trim trailing whitespace for AIAgent with structuredStreamMode enabled ([#334](https://github.com/AIGNE-io/aigne-framework/issues/334)) ([342eb49](https://github.com/AIGNE-io/aigne-framework/commit/342eb493995809f01da02fca6975ea6e52ecbd3a))
* **core:** hide internal prop toolsMap from trace logs ([#335](https://github.com/AIGNE-io/aigne-framework/issues/335)) ([bcec317](https://github.com/AIGNE-io/aigne-framework/commit/bcec317bf436988e5f43af05f649196bdbd6ac55))

## [1.55.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.54.0...aigne-framework-v1.55.0) (2025-08-07)


### Features

* **cli:** support config custom AIGNE Hub service URL ([#330](https://github.com/AIGNE-io/aigne-framework/issues/330)) ([21d30c8](https://github.com/AIGNE-io/aigne-framework/commit/21d30c8c75d9f27cb257d92434ba63e38e06f468))


### Bug Fixes

* **cli:** properly handle boolean and number types in agent options ([#331](https://github.com/AIGNE-io/aigne-framework/issues/331)) ([c9f4209](https://github.com/AIGNE-io/aigne-framework/commit/c9f4209ec1b236bc54e8aaef0b960e10a380e375))

## [1.54.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.53.0...aigne-framework-v1.54.0) (2025-08-06)


### Features

* **cli:** support custom task title of agent in cli ([#328](https://github.com/AIGNE-io/aigne-framework/issues/328)) ([128d75f](https://github.com/AIGNE-io/aigne-framework/commit/128d75fb42ca470b47a2793d79c92d7bb64cfedb))


### Bug Fixes

* **cli:** nunjucks should import as cjs module ([432b9e1](https://github.com/AIGNE-io/aigne-framework/commit/432b9e1e436bd5b02427a5effea907be1f589c31))
* **core:** improve hook handling in agent and context ([#325](https://github.com/AIGNE-io/aigne-framework/issues/325)) ([c858fec](https://github.com/AIGNE-io/aigne-framework/commit/c858fecb08453c2daca9708f4b8a9c135fac40b0))
* **models:** improve aigne-model chat logic and fix incorrect input in blocklet usage ([#329](https://github.com/AIGNE-io/aigne-framework/issues/329)) ([f50a9b8](https://github.com/AIGNE-io/aigne-framework/commit/f50a9b84e12f129396006784e810be25a3fa15fc))
* polish create board ([#326](https://github.com/AIGNE-io/aigne-framework/issues/326)) ([6e5dad4](https://github.com/AIGNE-io/aigne-framework/commit/6e5dad4fdd270bb88a4af1f74fc37acd2bf0f2f3))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @aigne/publish-docs bumped to 0.5.3

## [1.53.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.52.0...aigne-framework-v1.53.0) (2025-08-06)


### Features

* **core:** add concurrency support for team agent ([#323](https://github.com/AIGNE-io/aigne-framework/issues/323)) ([5743260](https://github.com/AIGNE-io/aigne-framework/commit/57432603a45208ad3503b9fc4c64f07c8151f9ee))


### Bug Fixes

* **cli:** improve help display and command handling ([#319](https://github.com/AIGNE-io/aigne-framework/issues/319)) ([306ca5f](https://github.com/AIGNE-io/aigne-framework/commit/306ca5f251d6de356131b11909293be3904d0675))
* **core:** remove lodash dependency ensure core support both esm and cjs ([#324](https://github.com/AIGNE-io/aigne-framework/issues/324)) ([d6c2452](https://github.com/AIGNE-io/aigne-framework/commit/d6c2452b660a163c73f2c628ffdc2a12949360b0))
* create connect add app info ([#321](https://github.com/AIGNE-io/aigne-framework/issues/321)) ([f0094a3](https://github.com/AIGNE-io/aigne-framework/commit/f0094a3f891617a9822df90918445639cd8c1a90))
* **models:** aigne-hub adapter not working in node.js v21 ([#320](https://github.com/AIGNE-io/aigne-framework/issues/320)) ([2884d00](https://github.com/AIGNE-io/aigne-framework/commit/2884d00b83e153ae7465ef1369fcd22d7c6d43e0))

## [1.52.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.51.0...aigne-framework-v1.52.0) (2025-08-05)


### Features

* allow inserting agent-hub credits manually ([#315](https://github.com/AIGNE-io/aigne-framework/issues/315)) ([e3e4d1f](https://github.com/AIGNE-io/aigne-framework/commit/e3e4d1ff0d9d3fef33bb41d85e99735d4dd76cb7))


### Bug Fixes

* **cli:** ensure aigne cli works in node.js v20+ ([#316](https://github.com/AIGNE-io/aigne-framework/issues/316)) ([9c9c3d2](https://github.com/AIGNE-io/aigne-framework/commit/9c9c3d2e57d6a8e1afb33ef903c3703283d73db7))
* **cli:** improve CLI prompts and output handling ([#318](https://github.com/AIGNE-io/aigne-framework/issues/318)) ([681ee79](https://github.com/AIGNE-io/aigne-framework/commit/681ee79e9b18aed5a977a0a418c2d9df20a7297c))

## [1.51.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.50.0...aigne-framework-v1.51.0) (2025-08-05)


### Features

* **ci:** using aigne codesmith as reviewer ([7aaca1c](https://github.com/AIGNE-io/aigne-framework/commit/7aaca1cf6505acf715ce927af283415a5c69266e))


### Bug Fixes

* call tools args is null ([#313](https://github.com/AIGNE-io/aigne-framework/issues/313)) ([2cf9487](https://github.com/AIGNE-io/aigne-framework/commit/2cf9487b606cb7884086938def834f89a3c3a775))
* **core:** filter empty memory content ([#312](https://github.com/AIGNE-io/aigne-framework/issues/312)) ([39dd77a](https://github.com/AIGNE-io/aigne-framework/commit/39dd77a68154d51c7a132adccd9f21b8bc461be0))

## [1.50.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.49.0...aigne-framework-v1.50.0) (2025-08-04)


### Features

* add includeAllStepsOutput option to control TeamAgent sequential streaming behavior ([#305](https://github.com/AIGNE-io/aigne-framework/issues/305)) ([0817475](https://github.com/AIGNE-io/aigne-framework/commit/08174751316b940a70463e71971a19a18b92667b))
* update observability blocklet logo and readme ([#308](https://github.com/AIGNE-io/aigne-framework/issues/308)) ([79bb897](https://github.com/AIGNE-io/aigne-framework/commit/79bb897ed7a6d8fa51af617c3aaf9ded95d5ff4b))


### Bug Fixes

* **cli:** persist prompts log and improve terminal output ([#307](https://github.com/AIGNE-io/aigne-framework/issues/307)) ([ac8116f](https://github.com/AIGNE-io/aigne-framework/commit/ac8116fc46f26169e7619860c392fb9f66bc3fee))
* **core:** share skills/agents from context ([#309](https://github.com/AIGNE-io/aigne-framework/issues/309)) ([88dd849](https://github.com/AIGNE-io/aigne-framework/commit/88dd849954c6f3fb68df238be22be3371c734e6e))

## [1.49.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.48.0...aigne-framework-v1.49.0) (2025-08-01)


### Features

* **cli:** add `--model` option for aigne applications ([#302](https://github.com/AIGNE-io/aigne-framework/issues/302)) ([5d63743](https://github.com/AIGNE-io/aigne-framework/commit/5d63743b8a47be64fd49245983f4f2f9da3197a0))
* **cli:** add `upgrade` command for aigne app ([#299](https://github.com/AIGNE-io/aigne-framework/issues/299)) ([1bf461a](https://github.com/AIGNE-io/aigne-framework/commit/1bf461ab644b2d810ef81cd3092475496dfc7ddc))
* support google model and skip check mode when connected to Hub ([#300](https://github.com/AIGNE-io/aigne-framework/issues/300)) ([e992c0f](https://github.com/AIGNE-io/aigne-framework/commit/e992c0f3335a7c512fa807d5b8ad10c9c3bf2351))


### Bug Fixes

* **cli:** indicator not responsive in macos terminal ([#304](https://github.com/AIGNE-io/aigne-framework/issues/304)) ([336f75b](https://github.com/AIGNE-io/aigne-framework/commit/336f75b8a7dfaf28d78e9a4cfcb4ac8c6a29c469))
* polish publish docs log ([#303](https://github.com/AIGNE-io/aigne-framework/issues/303)) ([1a9f934](https://github.com/AIGNE-io/aigne-framework/commit/1a9f934b7ab01f38fdf945b52b0b3ba6fe508843))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @aigne/publish-docs bumped to 0.5.2

## [1.48.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.47.0...aigne-framework-v1.48.0) (2025-07-31)


### Features

* **cli:** add alias support for agent ([#297](https://github.com/AIGNE-io/aigne-framework/issues/297)) ([fa166ab](https://github.com/AIGNE-io/aigne-framework/commit/fa166ab66d19e89ddd32c34e1470450eb4fbdbbd))

## [1.47.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.46.0...aigne-framework-v1.47.0) (2025-07-31)


### Features

* **cli:** support dynamic download and execution of doc-smith app ([#293](https://github.com/AIGNE-io/aigne-framework/issues/293)) ([4c40077](https://github.com/AIGNE-io/aigne-framework/commit/4c40077bacef076bc4b098879e948ef866218e39))


### Bug Fixes

* add auto open document url feature ([#296](https://github.com/AIGNE-io/aigne-framework/issues/296)) ([b6d2b56](https://github.com/AIGNE-io/aigne-framework/commit/b6d2b566cc7d209eefc2a7042453832c0f064e36))
* blocklet observability request without prefix ([#294](https://github.com/AIGNE-io/aigne-framework/issues/294)) ([c9c0b96](https://github.com/AIGNE-io/aigne-framework/commit/c9c0b966fef3ab5a54cd33a6f346b8f87cfc559b))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @aigne/publish-docs bumped to 0.5.1

## [1.46.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.45.0...aigne-framework-v1.46.0) (2025-07-30)


### Features

* add auto create docs board ([#287](https://github.com/AIGNE-io/aigne-framework/issues/287)) ([11013cb](https://github.com/AIGNE-io/aigne-framework/commit/11013cb857b54b89077afbcd76339eb15fdcc666))
* **models:** support doubao llm adapter ([#289](https://github.com/AIGNE-io/aigne-framework/issues/289)) ([0f68887](https://github.com/AIGNE-io/aigne-framework/commit/0f688871d232e7a42613f4921491de8974b31b81))
* support aigne connect command and add test ([#283](https://github.com/AIGNE-io/aigne-framework/issues/283)) ([387d22d](https://github.com/AIGNE-io/aigne-framework/commit/387d22d5cacf20abe02a13deaca1f36987d48ba5))


### Bug Fixes

* **cli:** replace external dependency with built-in user subscription API ([#292](https://github.com/AIGNE-io/aigne-framework/issues/292)) ([67de7fa](https://github.com/AIGNE-io/aigne-framework/commit/67de7fa521626ee7266c6c527e4eafc227bafa48))
* support aigne connect status more info ([#290](https://github.com/AIGNE-io/aigne-framework/issues/290)) ([04c5a06](https://github.com/AIGNE-io/aigne-framework/commit/04c5a0625938a7c1ca1d6fd997f6e9047d425ea0))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @aigne/publish-docs bumped to 0.5.0

## [1.45.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.44.1...aigne-framework-v1.45.0) (2025-07-28)


### Features

* **cli:** add inquirer/prompts integrations for cli ([#286](https://github.com/AIGNE-io/aigne-framework/issues/286)) ([33af756](https://github.com/AIGNE-io/aigne-framework/commit/33af7567fe2e7f9fb4b1633127e1d54fd65cb2a8))


### Bug Fixes

* **observability:** uniq index on insert and perf on trace query ([#268](https://github.com/AIGNE-io/aigne-framework/issues/268)) ([bd02d2e](https://github.com/AIGNE-io/aigne-framework/commit/bd02d2ef4dadc3df7e4806746fede2faa5cc50bb))

## [1.44.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.44.0...aigne-framework-v1.44.1) (2025-07-24)


### Bug Fixes

* add missing dependencies ([#280](https://github.com/AIGNE-io/aigne-framework/issues/280)) ([5da315e](https://github.com/AIGNE-io/aigne-framework/commit/5da315e29dc02818293e74ad159294f137e2c7f7))

## [1.44.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.43.0...aigne-framework-v1.44.0) (2025-07-24)


### Features

* **cli:** support aigne hub connect and model use ([#267](https://github.com/AIGNE-io/aigne-framework/issues/267)) ([8e5a32a](https://github.com/AIGNE-io/aigne-framework/commit/8e5a32afc64593137153d7407bde13837312ac70))
* **core:** support config reflection for TeamAgent in yaml file ([#276](https://github.com/AIGNE-io/aigne-framework/issues/276)) ([e6296a8](https://github.com/AIGNE-io/aigne-framework/commit/e6296a8aff313e8209c4fbb2878e7869cc672576))


### Bug Fixes

* ci lint ([#278](https://github.com/AIGNE-io/aigne-framework/issues/278)) ([b23dea9](https://github.com/AIGNE-io/aigne-framework/commit/b23dea98bf91082ce7429b766dff28cfa5163cd9))
* update blocklet key name ([#279](https://github.com/AIGNE-io/aigne-framework/issues/279)) ([210ef61](https://github.com/AIGNE-io/aigne-framework/commit/210ef612f9d1dcbbb9cbe10635b056114bfd10b7))

## [1.43.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.42.0...aigne-framework-v1.43.0) (2025-07-22)


### Features

* **core:** add reflection mode support to TeamAgent ([#273](https://github.com/AIGNE-io/aigne-framework/issues/273)) ([4e2dad6](https://github.com/AIGNE-io/aigne-framework/commit/4e2dad687c1caefa231c7a7620651d060f8c8b9d))


### Bug Fixes

* **core:** function agent should use common schema from yaml definition ([#270](https://github.com/AIGNE-io/aigne-framework/issues/270)) ([076a489](https://github.com/AIGNE-io/aigne-framework/commit/076a4896948c397518e99df46c1a443ea43daa64))

## [1.42.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.41.0...aigne-framework-v1.42.0) (2025-07-18)


### Features

* publish docs option add slug without ext parameter ([#266](https://github.com/AIGNE-io/aigne-framework/issues/266)) ([f815750](https://github.com/AIGNE-io/aigne-framework/commit/f815750e0359e18ad9686713be9279e8a5819960))


### Bug Fixes

* **docs:** remove trailing line breaks from code blocks ([#265](https://github.com/AIGNE-io/aigne-framework/issues/265)) ([ca56c9d](https://github.com/AIGNE-io/aigne-framework/commit/ca56c9d3061fb8b3a655dd5e89e4b06d9a90c53e))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @aigne/publish-docs bumped to 0.4.0

## [1.41.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.40.0...aigne-framework-v1.41.0) (2025-07-17)


### Features

* **core:** support define hooks for agent in yaml ([#260](https://github.com/AIGNE-io/aigne-framework/issues/260)) ([c388e82](https://github.com/AIGNE-io/aigne-framework/commit/c388e8216134271af4d9c7def70862ea3c354c7f))

## [1.40.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.39.0...aigne-framework-v1.40.0) (2025-07-17)


### Features

* **core:** support custom default input value for agent ([#258](https://github.com/AIGNE-io/aigne-framework/issues/258)) ([352ac70](https://github.com/AIGNE-io/aigne-framework/commit/352ac70400fb7e28cc36c4f6dc9c591b0d64e546))


### Bug Fixes

* **docs:** should parse inline code inside markdown links ([#257](https://github.com/AIGNE-io/aigne-framework/issues/257)) ([b91f34e](https://github.com/AIGNE-io/aigne-framework/commit/b91f34e09378d3b506fa03ae61e2cede4e08943f))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @aigne/publish-docs bumped to 0.3.1

## [1.39.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.38.3...aigne-framework-v1.39.0) (2025-07-15)


### Features

* **memory:** support did space memory adapter ([#229](https://github.com/AIGNE-io/aigne-framework/issues/229)) ([6f69b64](https://github.com/AIGNE-io/aigne-framework/commit/6f69b64e98b963db9d6ab5357306b445385eaa68))
* **model:** support aigne-hub model adapter ([#253](https://github.com/AIGNE-io/aigne-framework/issues/253)) ([4b33f8d](https://github.com/AIGNE-io/aigne-framework/commit/4b33f8d1a819f52357db81d502c56b55eaa0669f))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @aigne/publish-docs bumped to 0.3.0

## [1.38.3](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.38.2...aigne-framework-v1.38.3) (2025-07-14)


### Bug Fixes

* **core:** fix error of external schema with array type ([#251](https://github.com/AIGNE-io/aigne-framework/issues/251)) ([bd80921](https://github.com/AIGNE-io/aigne-framework/commit/bd80921bbbe8385645eb7c52fd719ce48d672da9))

## [1.38.2](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.38.1...aigne-framework-v1.38.2) (2025-07-14)


### Bug Fixes

* **cli:** print pretty error message for cli ([#249](https://github.com/AIGNE-io/aigne-framework/issues/249)) ([d68e0f7](https://github.com/AIGNE-io/aigne-framework/commit/d68e0f7151259a05696de77d9f00793b6f5b36b2))
* **core:** check if skills is empty before TeamAgent processes ([#250](https://github.com/AIGNE-io/aigne-framework/issues/250)) ([f0fff7e](https://github.com/AIGNE-io/aigne-framework/commit/f0fff7e41512cf06f106a0d7fe03a7d98206f136))
* **deps:** update deps to latest version ([#247](https://github.com/AIGNE-io/aigne-framework/issues/247)) ([3972f88](https://github.com/AIGNE-io/aigne-framework/commit/3972f887a9abff20c26da6b51c1071cbd54c0bf1))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @aigne/publish-docs bumped to 0.2.1

## [1.38.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.38.0...aigne-framework-v1.38.1) (2025-07-10)


### Bug Fixes

* **cli:** reduce excessive console output to improve cli performance ([#246](https://github.com/AIGNE-io/aigne-framework/issues/246)) ([4430504](https://github.com/AIGNE-io/aigne-framework/commit/4430504b643bba92775e5a908ca1c1153d90a402))
* **example:** add command `/exit` to quit example ([#244](https://github.com/AIGNE-io/aigne-framework/issues/244)) ([6f479ce](https://github.com/AIGNE-io/aigne-framework/commit/6f479ce58fa716bc8e4b0e9d8b100bc022509de5))

## [1.38.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.37.2...aigne-framework-v1.38.0) (2025-07-10)


### Features

* **core:** support external files as agent input/output schema ([#242](https://github.com/AIGNE-io/aigne-framework/issues/242)) ([58f8de6](https://github.com/AIGNE-io/aigne-framework/commit/58f8de63008b78ea1b404ba7721c3a242c330113))
* **model:** reduce unnecessary LLM requests for structured output ([#241](https://github.com/AIGNE-io/aigne-framework/issues/241)) ([e28813c](https://github.com/AIGNE-io/aigne-framework/commit/e28813c021ed35c0251e198e2e007e2d746ab3d8))

## [1.37.2](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.37.1...aigne-framework-v1.37.2) (2025-07-09)


### Bug Fixes

* **xai:** handle multiple tool calls correctly ([#238](https://github.com/AIGNE-io/aigne-framework/issues/238)) ([d087d53](https://github.com/AIGNE-io/aigne-framework/commit/d087d533f83867451b3352937998eae36f85a0be))

## [1.37.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.37.0...aigne-framework-v1.37.1) (2025-07-09)


### Bug Fixes

* **observability:** reduce the size of the requested data ([#235](https://github.com/AIGNE-io/aigne-framework/issues/235)) ([760b5d4](https://github.com/AIGNE-io/aigne-framework/commit/760b5d4aaec0c60ef0908e3376ba7d7ad9dd630b))
* resolve warning caused by dependencies. ([#237](https://github.com/AIGNE-io/aigne-framework/issues/237)) ([3ad7cc6](https://github.com/AIGNE-io/aigne-framework/commit/3ad7cc66b0c1ab425879176849af97c88c01b5a2))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @aigne/publish-docs bumped to 0.2.0

## [1.37.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.36.0...aigne-framework-v1.37.0) (2025-07-09)


### Features

* **observability:** show chat model name in trace waterfall ([#232](https://github.com/AIGNE-io/aigne-framework/issues/232)) ([a7131ed](https://github.com/AIGNE-io/aigne-framework/commit/a7131edacbda9f69f619c18cc58a6d708223b4e2))


### Bug Fixes

* **model:** ensure last message is not system role for gemini ([#231](https://github.com/AIGNE-io/aigne-framework/issues/231)) ([1b72e1e](https://github.com/AIGNE-io/aigne-framework/commit/1b72e1e6be98060aa32e68585142b2eea401d109))
* share user context between server and client ([#233](https://github.com/AIGNE-io/aigne-framework/issues/233)) ([d55bfbc](https://github.com/AIGNE-io/aigne-framework/commit/d55bfbcc230e9c876c6d2fc0b74a4d7821f9e6ce))

## [1.36.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.35.0...aigne-framework-v1.36.0) (2025-07-08)


### Features

* **core:** add jinja syntax support for prompt builder ([#230](https://github.com/AIGNE-io/aigne-framework/issues/230)) ([74436a7](https://github.com/AIGNE-io/aigne-framework/commit/74436a7faac0c59a32b0153481386162649f4357))
* support setting component id to different component data ([#226](https://github.com/AIGNE-io/aigne-framework/issues/226)) ([c7b3224](https://github.com/AIGNE-io/aigne-framework/commit/c7b32240e6660f34974615bcb9b91978a1191e3e))


### Bug Fixes

* **core:** ensure output is a record type ([#228](https://github.com/AIGNE-io/aigne-framework/issues/228)) ([dfd9104](https://github.com/AIGNE-io/aigne-framework/commit/dfd910451e5f1f9edd94a719857e36d34fadbe45))
* wrong type AgenticMemoryRetrieverOptions ([0893e02](https://github.com/AIGNE-io/aigne-framework/commit/0893e0271ea6870a420f8c6fd59022ab6566b9c2))

## [1.35.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.34.0...aigne-framework-v1.35.0) (2025-07-04)


### Features

* **core:** add standard userId/sessionId in userContext ([#219](https://github.com/AIGNE-io/aigne-framework/issues/219)) ([58e5804](https://github.com/AIGNE-io/aigne-framework/commit/58e5804cf08b1d2fa6e232646fadd70b5db2e007))
* **core:** add strucutredStreamMode option for AIAgent to support text and json output in one-shot ([#222](https://github.com/AIGNE-io/aigne-framework/issues/222)) ([c0af92b](https://github.com/AIGNE-io/aigne-framework/commit/c0af92b6a020453b047e5bb3782239795839baa8))
* **memory:** add support for AgenticMemory & some improvements for DefaultMemory ([#224](https://github.com/AIGNE-io/aigne-framework/issues/224)) ([f4a08af](https://github.com/AIGNE-io/aigne-framework/commit/f4a08aff935205c62615c060763c835a9579607d))


### Bug Fixes

* **cli:** set run as the default command ([#221](https://github.com/AIGNE-io/aigne-framework/issues/221)) ([7f3346c](https://github.com/AIGNE-io/aigne-framework/commit/7f3346c461a13de9df24ca00b7a7c1102ece2d06))

## [1.34.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.33.1...aigne-framework-v1.34.0) (2025-07-03)


### Features

* upgrade dependencies and adapt code to breaking changes ([#216](https://github.com/AIGNE-io/aigne-framework/issues/216)) ([f215ced](https://github.com/AIGNE-io/aigne-framework/commit/f215cedc1a57e321164064c33316e496eae8d25f))


### Bug Fixes

* **observability:** load model metadata from api instead of js bundles ([#217](https://github.com/AIGNE-io/aigne-framework/issues/217)) ([4418126](https://github.com/AIGNE-io/aigne-framework/commit/44181263d3a8d8eca794d7e485679fcf80f0abad))

## [1.33.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.33.0...aigne-framework-v1.33.1) (2025-07-02)


### Bug Fixes

* remove useless code ([#214](https://github.com/AIGNE-io/aigne-framework/issues/214)) ([59f4965](https://github.com/AIGNE-io/aigne-framework/commit/59f49657233772b5243a8b5b9059970cbc0f0bb1))

## [1.33.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.32.0...aigne-framework-v1.33.0) (2025-07-02)


### Features

* **cli:** support executing aigne.yaml via shebang (#!/usr/bin/env aigne) ([#211](https://github.com/AIGNE-io/aigne-framework/issues/211)) ([2a82c27](https://github.com/AIGNE-io/aigne-framework/commit/2a82c2754b5eab5c3d6e45a5cbe7f0c76d927967))
* support iterate special input call skills for TeamAgent ([#188](https://github.com/AIGNE-io/aigne-framework/issues/188)) ([8cf06d3](https://github.com/AIGNE-io/aigne-framework/commit/8cf06d39172ed59ca93f34d893486f2bb7bd2e5a))

## [1.32.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.31.0...aigne-framework-v1.32.0) (2025-07-01)


### Features

* rename command serve to serve-mcp ([#206](https://github.com/AIGNE-io/aigne-framework/issues/206)) ([f3dfc93](https://github.com/AIGNE-io/aigne-framework/commit/f3dfc932b4eeb8ff956bf2d4b1b71b36bd05056e))


### Bug Fixes

* fix: compatible with node 20.0 & polish example defintions ([#209](https://github.com/AIGNE-io/aigne-framework/issues/209)) ([9752b96](https://github.com/AIGNE-io/aigne-framework/commit/9752b96dc54a44c6f710f056fe9205c0f2b0a73e))

## [1.31.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.30.1...aigne-framework-v1.31.0) (2025-07-01)


### Features

* **example:** add serve agent as mcp-server example ([#204](https://github.com/AIGNE-io/aigne-framework/issues/204)) ([d51793b](https://github.com/AIGNE-io/aigne-framework/commit/d51793b919c7c3316e4bcf73ab9af3dc38900e94))

## [1.30.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.30.0...aigne-framework-v1.30.1) (2025-07-01)


### Bug Fixes

* remove useless package ([#202](https://github.com/AIGNE-io/aigne-framework/issues/202)) ([6189433](https://github.com/AIGNE-io/aigne-framework/commit/6189433aa439813304b6b5ff36b3cbd6d552c53d))

## [1.30.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.29.0...aigne-framework-v1.30.0) (2025-07-01)


### Features

* **example:** use AIGNE cli to run chat-bot example ([#198](https://github.com/AIGNE-io/aigne-framework/issues/198)) ([7085541](https://github.com/AIGNE-io/aigne-framework/commit/708554100692f2a557f7329ea78e46c3c870ce10))

## [1.29.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.28.0...aigne-framework-v1.29.0) (2025-07-01)


### Features

* **cli:** support HTTPS_PROXY and named path param ([#196](https://github.com/AIGNE-io/aigne-framework/issues/196)) ([04e684e](https://github.com/AIGNE-io/aigne-framework/commit/04e684ee26bc2d79924b0e3cb541cd07a7191804))

## [1.28.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.27.0...aigne-framework-v1.28.0) (2025-06-30)


### Features

* **cli:** auto-load dotenv files for AIGNE CLI ([#192](https://github.com/AIGNE-io/aigne-framework/issues/192)) ([56d5632](https://github.com/AIGNE-io/aigne-framework/commit/56d5632ba427a1cf39235bcd1c30df3bc60643f6))
* **ux:** polish tracing ux and update docs ([#193](https://github.com/AIGNE-io/aigne-framework/issues/193)) ([f80b63e](https://github.com/AIGNE-io/aigne-framework/commit/f80b63ecb1cfb00daa9b68330026da839d33f8a2))

## [1.27.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.26.1...aigne-framework-v1.27.0) (2025-06-29)


### Features

* **observability:** tune trace ux and supoort incremental exporting ([#184](https://github.com/AIGNE-io/aigne-framework/issues/184)) ([d174188](https://github.com/AIGNE-io/aigne-framework/commit/d174188459c77acb09b5ca040972f83abb067587))


### Bug Fixes

* **core:** enable proper tracing for agent calls via message queue ([#191](https://github.com/AIGNE-io/aigne-framework/issues/191)) ([f8a4ce5](https://github.com/AIGNE-io/aigne-framework/commit/f8a4ce5fa54e0e01113b31fefcbd248b163980b2))

## [1.26.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.26.0...aigne-framework-v1.26.1) (2025-06-26)


### Bug Fixes

* aigne cli not found package ([#185](https://github.com/AIGNE-io/aigne-framework/issues/185)) ([5d98b61](https://github.com/AIGNE-io/aigne-framework/commit/5d98b6158f1e43e049a3a51a69bab88092bf1c92))

## [1.26.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.25.2...aigne-framework-v1.26.0) (2025-06-26)


### Features

* **transport:** support invoke server side chat model ([#182](https://github.com/AIGNE-io/aigne-framework/issues/182)) ([f81a1bf](https://github.com/AIGNE-io/aigne-framework/commit/f81a1bf883abda1845ccee09b270e5f583e287ab))


### Bug Fixes

* blocklet start failed ([#180](https://github.com/AIGNE-io/aigne-framework/issues/180)) ([296a481](https://github.com/AIGNE-io/aigne-framework/commit/296a481be69d9b9b279dc4e50b0d21c993d1d841))

## [1.25.2](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.25.1...aigne-framework-v1.25.2) (2025-06-25)


### Bug Fixes

* **core:** pass input/output to MemoryAgent directily ([#178](https://github.com/AIGNE-io/aigne-framework/issues/178)) ([3b20e33](https://github.com/AIGNE-io/aigne-framework/commit/3b20e33f1eefc81ac1e009b1afff14fca46644b1))


## [1.25.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.25.0...aigne-framework-v1.25.1) (2025-06-25)


### Bug Fixes

* **blocklet:** remove h3 from changelog for blocklet bundle ([3d31114](https://github.com/AIGNE-io/aigne-framework/commit/3d31114109abc6780ffc7aaf54f00f37f2644e16))


## [1.25.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.24.0...aigne-framework-v1.25.0) (2025-06-25)


### Features

* support remember custom fields from message ([#174](https://github.com/AIGNE-io/aigne-framework/issues/174)) ([664069d](https://github.com/AIGNE-io/aigne-framework/commit/664069d343137f69d0c103b2b5eff545ab0051fb))


### Bug Fixes

* **blocklet:** ensure only admins can access traces ([#173](https://github.com/AIGNE-io/aigne-framework/issues/173)) ([9c5cc06](https://github.com/AIGNE-io/aigne-framework/commit/9c5cc06c5841b9684d16c5c60af764d8c98c9c3e))
* **ci:** blocklet release workflow config and naming ([c92146e](https://github.com/AIGNE-io/aigne-framework/commit/c92146ee51fdd11a02b6b88d82b8281c26d2c4c9))
* **ci:** tune observability blocklet title ([261a80e](https://github.com/AIGNE-io/aigne-framework/commit/261a80e6a69750625e7c70bd2b96b2e02f98ee06))
* publish blocklet ci ([#171](https://github.com/AIGNE-io/aigne-framework/issues/171)) ([65f1701](https://github.com/AIGNE-io/aigne-framework/commit/65f1701b1e94fb6fe79f6723919ffba4c652673a))


## [1.24.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.23.0...aigne-framework-v1.24.0) (2025-06-24)


### Features

* support observability for cli and blocklet ([#155](https://github.com/AIGNE-io/aigne-framework/issues/155)) ([5baa705](https://github.com/AIGNE-io/aigne-framework/commit/5baa705a33cfdba1efc5ccbe18674c27513ca97d))

## [1.23.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.22.1...aigne-framework-v1.23.0) (2025-06-20)


### Features

* **cli:** support pass named input to agent by --input-xxx ([#167](https://github.com/AIGNE-io/aigne-framework/issues/167)) ([cda5bb6](https://github.com/AIGNE-io/aigne-framework/commit/cda5bb6baab680787de1a042664fe34c17a84bb1))

## [1.22.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.22.0...aigne-framework-v1.22.1) (2025-06-19)


### Bug Fixes

* use `inputKey` instead of implicit $message for AIAgent ([#165](https://github.com/AIGNE-io/aigne-framework/issues/165)) ([8b6e589](https://github.com/AIGNE-io/aigne-framework/commit/8b6e5896bba8209fd2eecb0f5b9263618bffdaf8))

## [1.22.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.21.0...aigne-framework-v1.22.0) (2025-06-17)


### Features

* support return $meta output by enable returnMetadata option ([#163](https://github.com/AIGNE-io/aigne-framework/issues/163)) ([ac73759](https://github.com/AIGNE-io/aigne-framework/commit/ac73759615d44a09fa71b3bfbd3e9356ffe1d2ed))

## [1.21.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.20.6...aigne-framework-v1.21.0) (2025-06-16)


### Features

* support respond progressing chunks by enable `returnProgressChunks` option for aigne.invoke ([cf4c313](https://github.com/AIGNE-io/aigne-framework/commit/cf4c313ee69f255be799ac196da675b79f69bf76))

## [1.20.6](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.20.5...aigne-framework-v1.20.6) (2025-06-11)


### Bug Fixes

* **core:** add async generator polyfill for ReadableStream on safari ([#158](https://github.com/AIGNE-io/aigne-framework/issues/158)) ([70ef026](https://github.com/AIGNE-io/aigne-framework/commit/70ef026f413726c369f6a0781efc7f0333735406))
* **core:** exclude nested skills from final tool list in invokable skill ([#156](https://github.com/AIGNE-io/aigne-framework/issues/156)) ([91645f1](https://github.com/AIGNE-io/aigne-framework/commit/91645f12e79110a00f8f2db8ebc19401ddbd5a80))

## [1.20.5](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.20.4...aigne-framework-v1.20.5) (2025-06-06)


### Bug Fixes

* **core:** should pass memories from invocation options to nested agents ([#153](https://github.com/AIGNE-io/aigne-framework/issues/153)) ([57629a5](https://github.com/AIGNE-io/aigne-framework/commit/57629a5da6cf2a295356dfe32ecbb15154e098fe))

## [1.20.4](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.20.3...aigne-framework-v1.20.4) (2025-06-05)


### Bug Fixes

* **core:** prioritize returning json chunks ([#151](https://github.com/AIGNE-io/aigne-framework/issues/151)) ([8bf49a1](https://github.com/AIGNE-io/aigne-framework/commit/8bf49a18c083b33d2e0b35e8d0f22f68d9d6effa))

## [1.20.3](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.20.2...aigne-framework-v1.20.3) (2025-06-05)


### Bug Fixes

* compatible nodejs version &gt;=20 ([#149](https://github.com/AIGNE-io/aigne-framework/issues/149)) ([d5ae9f2](https://github.com/AIGNE-io/aigne-framework/commit/d5ae9f245972e87e70fd87cdd960ade9940f288c))

## [1.20.2](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.20.1...aigne-framework-v1.20.2) (2025-05-30)


### Bug Fixes

* blank file handling in converter ([#146](https://github.com/AIGNE-io/aigne-framework/issues/146)) ([4323522](https://github.com/AIGNE-io/aigne-framework/commit/432352202ab958ed4788cd2eeb81a918831e07e7))
* provide available memories for AIGNE ([#145](https://github.com/AIGNE-io/aigne-framework/issues/145)) ([c5dc960](https://github.com/AIGNE-io/aigne-framework/commit/c5dc9605e0fb7ca60e1f5fa2f0da67ffec00c601))

## [1.20.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.20.0...aigne-framework-v1.20.1) (2025-05-30)


### Bug Fixes

* respect DEBUG env for logger ([#142](https://github.com/AIGNE-io/aigne-framework/issues/142)) ([f84738a](https://github.com/AIGNE-io/aigne-framework/commit/f84738acb382d9fb4f47253fcf91c92c02200053))

## [1.20.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.19.0...aigne-framework-v1.20.0) (2025-05-29)


### Features

* add memory agents support for client agent ([#139](https://github.com/AIGNE-io/aigne-framework/issues/139)) ([57044fa](https://github.com/AIGNE-io/aigne-framework/commit/57044fa87b8abcba395cd05f941d6d312ab65764))

## [1.19.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.18.0...aigne-framework-v1.19.0) (2025-05-27)


### Features

* add schema transform ([#35](https://github.com/AIGNE-io/aigne-framework/issues/35)) ([c7d9a2c](https://github.com/AIGNE-io/aigne-framework/commit/c7d9a2c9fcab8d384d4198db5ff6ba4603846cdf))
* support automatic document publishing ([#134](https://github.com/AIGNE-io/aigne-framework/issues/134)) ([5c14d7b](https://github.com/AIGNE-io/aigne-framework/commit/5c14d7bd0ed2fb054cbf1bd1b9e6b075570ad6ab))


### Bug Fixes

* add ufo library to improve robustness ([#136](https://github.com/AIGNE-io/aigne-framework/issues/136)) ([cfead29](https://github.com/AIGNE-io/aigne-framework/commit/cfead294c9783ab8af18a236c71b56758ffad4b8))


## [1.18.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.17.0...aigne-framework-v1.18.0) (2025-05-25)

### Features

* add user context support ([#131](https://github.com/AIGNE-io/aigne-framework/issues/131)) ([4dd9d20](https://github.com/AIGNE-io/aigne-framework/commit/4dd9d20953f6ac33933723db56efd9b44bafeb02))


## [1.17.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.16.0...aigne-framework-v1.17.0) (2025-05-23)

### Features

* add `--chat` option for `run` command ([#120](https://github.com/AIGNE-io/aigne-framework/issues/120)) ([7699550](https://github.com/AIGNE-io/aigne-framework/commit/76995507001ca33b09b29f72ff588dae513cb340))
* **core:** support check output with guide rail agents ([#117](https://github.com/AIGNE-io/aigne-framework/issues/117)) ([bdf7ab3](https://github.com/AIGNE-io/aigne-framework/commit/bdf7ab31789379ba5b0fd920541a469cb86150ff))
* **core:** support lifecycle hooks for agent ([#124](https://github.com/AIGNE-io/aigne-framework/issues/124)) ([0af6afa](https://github.com/AIGNE-io/aigne-framework/commit/0af6afa923dcb917d545fd4535cabe7804fa84c9))
* **models:** publish model adapters as standalone packages ([#126](https://github.com/AIGNE-io/aigne-framework/issues/126)) ([588b8ae](https://github.com/AIGNE-io/aigne-framework/commit/588b8aea6abcee5fa87def1358bf51f84021c6ef))

### Bug Fixes

* automatically convert tool names to a valid format ([#128](https://github.com/AIGNE-io/aigne-framework/issues/128)) ([e9ee91d](https://github.com/AIGNE-io/aigne-framework/commit/e9ee91d9d782fa19000adb4cf95b9d65196ab651))
* **cli:** listr ctx maybe undefined ([#130](https://github.com/AIGNE-io/aigne-framework/issues/130)) ([dfc7b13](https://github.com/AIGNE-io/aigne-framework/commit/dfc7b139e05cf9b6e0314f42f308d25e9b70ea5c))

## [1.16.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.15.0...aigne-framework-v1.16.0) (2025-05-15)

### Features

* add `--chat` option for `run` command ([#120](https://github.com/AIGNE-io/aigne-framework/issues/120)) ([7699550](https://github.com/AIGNE-io/aigne-framework/commit/76995507001ca33b09b29f72ff588dae513cb340))
* **core:** support check output with guide rail agents ([#117](https://github.com/AIGNE-io/aigne-framework/issues/117)) ([bdf7ab3](https://github.com/AIGNE-io/aigne-framework/commit/bdf7ab31789379ba5b0fd920541a469cb86150ff))
* **core:** support lifecycle hooks for agent ([#124](https://github.com/AIGNE-io/aigne-framework/issues/124)) ([0af6afa](https://github.com/AIGNE-io/aigne-framework/commit/0af6afa923dcb917d545fd4535cabe7804fa84c9))
* **models:** publish model adapters as standalone packages ([#126](https://github.com/AIGNE-io/aigne-framework/issues/126)) ([588b8ae](https://github.com/AIGNE-io/aigne-framework/commit/588b8aea6abcee5fa87def1358bf51f84021c6ef))

### Bug Fixes

* automatically convert tool names to a valid format ([#128](https://github.com/AIGNE-io/aigne-framework/issues/128)) ([e9ee91d](https://github.com/AIGNE-io/aigne-framework/commit/e9ee91d9d782fa19000adb4cf95b9d65196ab651))
* **cli:** listr ctx maybe undefined ([#130](https://github.com/AIGNE-io/aigne-framework/issues/130)) ([dfc7b13](https://github.com/AIGNE-io/aigne-framework/commit/dfc7b139e05cf9b6e0314f42f308d25e9b70ea5c))

## [1.16.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.15.0...aigne-framework-v1.16.0) (2025-05-15)

### Features

* optimize the stability of the model and ci ([#119](https://github.com/AIGNE-io/aigne-framework/issues/119)) ([de93887](https://github.com/AIGNE-io/aigne-framework/commit/de938879452a8be82a198dda0eda1eb9fcbb0474))

### Bug Fixes

* **core:** response.headers.toJSON is not a function ([#121](https://github.com/AIGNE-io/aigne-framework/issues/121)) ([4609ba6](https://github.com/AIGNE-io/aigne-framework/commit/4609ba645e6b8fe8d76ecd475cd2d7817483a4bd))

## [1.15.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.14.0...aigne-framework-v1.15.0) (2025-05-12)

### Features

* **docs:** use typedoc build and publish docs to gh-pages ([#100](https://github.com/AIGNE-io/aigne-framework/issues/100)) ([b9074c0](https://github.com/AIGNE-io/aigne-framework/commit/b9074c0148ea343ada92b5919a52b47537a1ad48))
* **memory:** allow agents to act as retrievers and recorders in memory ([#65](https://github.com/AIGNE-io/aigne-framework/issues/65)) ([2bafcbb](https://github.com/AIGNE-io/aigne-framework/commit/2bafcbb66a94fcf55dad8c21ede483eaf075c11d))
* optimize the stability of ci and example ([#113](https://github.com/AIGNE-io/aigne-framework/issues/113)) ([d16ed6c](https://github.com/AIGNE-io/aigne-framework/commit/d16ed6cb60faea19fb4f1c12e1f83d69563b153f))

### Bug Fixes

* **core:** default catch tool's error and continue processing ([#115](https://github.com/AIGNE-io/aigne-framework/issues/115)) ([983b0de](https://github.com/AIGNE-io/aigne-framework/commit/983b0de491afb3f0904e145cb491d432b62f9312))
* **core:** handle response for UserAgent automatically in pub/sub mode ([#116](https://github.com/AIGNE-io/aigne-framework/issues/116)) ([b659714](https://github.com/AIGNE-io/aigne-framework/commit/b659714f2398ea042f21cb22eccc1014f181cd46))

## [1.14.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.13.0...aigne-framework-v1.14.0) (2025-04-30)

### Features

* **core:** add BedrockChatModel support ([#101](https://github.com/AIGNE-io/aigne-framework/issues/101)) ([a0b98f0](https://github.com/AIGNE-io/aigne-framework/commit/a0b98f01bd78a135232226548848fa35a64982d1))

### Bug Fixes

* **core:** deduplicate tools for chat model ([#103](https://github.com/AIGNE-io/aigne-framework/issues/103)) ([570be6d](https://github.com/AIGNE-io/aigne-framework/commit/570be6d8620ab5b9a0149f835ecd4641009a8654))
* export server/client api types ([93e5341](https://github.com/AIGNE-io/aigne-framework/commit/93e5341dde7a6851f08a3d4e2f6c1a1db91765e9))

## [1.13.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.12.0...aigne-framework-v1.13.0) (2025-04-27)

### Features

* add AIGNEServer/AIGNEClient api to serve agents via network ([#96](https://github.com/AIGNE-io/aigne-framework/issues/96)) ([1f2dfa3](https://github.com/AIGNE-io/aigne-framework/commit/1f2dfa3a6a2568373063cea3c874b573d0a248d3))
* **core:** support streamable http transport for mcp agents ([#92](https://github.com/AIGNE-io/aigne-framework/issues/92)) ([37da490](https://github.com/AIGNE-io/aigne-framework/commit/37da490538298d882ec328e4b3304395a6cd8cf7))
* support TeamAgent and finalize API naming ([#91](https://github.com/AIGNE-io/aigne-framework/issues/91)) ([033d1b6](https://github.com/AIGNE-io/aigne-framework/commit/033d1b6a7dc5460807476abb35a413ba89a2a664))
* **tests:** add @aigne/test-utils and update example test cases ([#95](https://github.com/AIGNE-io/aigne-framework/issues/95)) ([6be48d1](https://github.com/AIGNE-io/aigne-framework/commit/6be48d1895e990f68c4978018da1a53bb58c1c6d))

### Bug Fixes

* **core:** prioritize self model before falling back to context ([#97](https://github.com/AIGNE-io/aigne-framework/issues/97)) ([2a3d067](https://github.com/AIGNE-io/aigne-framework/commit/2a3d067442200657d8ef3b5314930cc14302f6bf))
* upgrade to streamable api for serve mcp command ([#98](https://github.com/AIGNE-io/aigne-framework/issues/98)) ([ae32bda](https://github.com/AIGNE-io/aigne-framework/commit/ae32bda20e57c2a2eb8b49fad034b0b2a5ebb15e))

## [1.12.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.11.0...aigne-framework-v1.12.0) (2025-04-23)

### Features

* **core:** enhance ClaudeChatModel to support streaming responses ([#85](https://github.com/AIGNE-io/aigne-framework/issues/85)) ([5433240](https://github.com/AIGNE-io/aigne-framework/commit/5433240e7b663ec9e9f4a79dffa05038088d54fc))
* support set memory in agent yaml ([#90](https://github.com/AIGNE-io/aigne-framework/issues/90)) ([215118f](https://github.com/AIGNE-io/aigne-framework/commit/215118f1dc55f02322d59a3f18395a459198e031))
* **tests:** add example tests and update the ci configuration ([#81](https://github.com/AIGNE-io/aigne-framework/issues/81)) ([777bb8d](https://github.com/AIGNE-io/aigne-framework/commit/777bb8d184c21e74b3eb9bbb4a1003708409a338))

### Bug Fixes

* **core:** router model should support streaming response ([#88](https://github.com/AIGNE-io/aigne-framework/issues/88)) ([4fb4d92](https://github.com/AIGNE-io/aigne-framework/commit/4fb4d92f8b36011437efba3265591b2477f2d680))

## [1.11.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.10.1...aigne-framework-v1.11.0) (2025-04-22)

### Features

* **cli:** add --verbose option for run command ([#82](https://github.com/AIGNE-io/aigne-framework/issues/82)) ([7adf8be](https://github.com/AIGNE-io/aigne-framework/commit/7adf8be34963e714268457ab8b2ffeb945da5721))

## [1.10.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.10.0...aigne-framework-v1.10.1) (2025-04-22)

### Bug Fixes

* use bunwrapper launch examples ([#79](https://github.com/AIGNE-io/aigne-framework/issues/79)) ([55022e2](https://github.com/AIGNE-io/aigne-framework/commit/55022e20bb253bac608dad3024600da91e093a69))

## [1.10.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.9.0...aigne-framework-v1.10.0) (2025-04-22)

### Features

* **cli:** render output message with markdown highlight ([#76](https://github.com/AIGNE-io/aigne-framework/issues/76)) ([b2a793a](https://github.com/AIGNE-io/aigne-framework/commit/b2a793a638e5f95d3f68be80f907da40bd7e624a))
* **stream:** add streaming output support for agent ([#73](https://github.com/AIGNE-io/aigne-framework/issues/73)) ([5f3ea4b](https://github.com/AIGNE-io/aigne-framework/commit/5f3ea4bccda7c8c457d6e9518b3d6a8b254ec041))

### Bug Fixes

* **core:** support dynamic model capability detection ([#72](https://github.com/AIGNE-io/aigne-framework/issues/72)) ([9d56d98](https://github.com/AIGNE-io/aigne-framework/commit/9d56d9885778962e5bef806445ad8c4d199f2c65))

## [1.9.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.8.0...aigne-framework-v1.9.0) (2025-04-20)

### Features

* **core:** add model adapters for DeepSeek, Gemini, OpenRouter, and Ollama ([#53](https://github.com/AIGNE-io/aigne-framework/issues/53)) ([5d40546](https://github.com/AIGNE-io/aigne-framework/commit/5d40546bd5ddb70233d27ea3b20e5711b2af320a))

### Bug Fixes

* **cli:** display progressing for `run` command ([#68](https://github.com/AIGNE-io/aigne-framework/issues/68)) ([e3d2193](https://github.com/AIGNE-io/aigne-framework/commit/e3d21930bc2cf20edeb0ad7123e9e87e3e0ea653))
* **cli:** ensure dir exists before extract package ([#70](https://github.com/AIGNE-io/aigne-framework/issues/70)) ([5ebe56d](https://github.com/AIGNE-io/aigne-framework/commit/5ebe56d3483d4309d9e39ab0566d353b3787edce))
* **dx:** custom error message for agent input/output validation ([#71](https://github.com/AIGNE-io/aigne-framework/issues/71)) ([5145673](https://github.com/AIGNE-io/aigne-framework/commit/5145673aaae2cd6665912e80b1c644e974c42b2f))

## [1.8.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.7.0...aigne-framework-v1.8.0) (2025-04-17)

### Features

* **ci:** support coverage examples with model matrix ([#59](https://github.com/AIGNE-io/aigne-framework/issues/59)) ([1edd704](https://github.com/AIGNE-io/aigne-framework/commit/1edd70426b80a69e3751b2d5fe818297711d0777))
* **cli:** support convert agents from studio ([#64](https://github.com/AIGNE-io/aigne-framework/issues/64)) ([f544bc7](https://github.com/AIGNE-io/aigne-framework/commit/f544bc77a2fb07e034b317ceb6a46aadd35830c9))
* **cli:** support model and download customization for aigne run ([#61](https://github.com/AIGNE-io/aigne-framework/issues/61)) ([51f6619](https://github.com/AIGNE-io/aigne-framework/commit/51f6619e6c591a84f1f2339b26ef66d89fa9486e))

### Bug Fixes

* **mcp:** set default timeout to 60s ([#67](https://github.com/AIGNE-io/aigne-framework/issues/67)) ([40dc029](https://github.com/AIGNE-io/aigne-framework/commit/40dc029b7795650283a505fd71b9566e5f0a4471))

## [1.7.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.6.0...aigne-framework-v1.7.0) (2025-04-15)

### Features

* add TerminalTracer for better UX in terminal ([#56](https://github.com/AIGNE-io/aigne-framework/issues/56)) ([9875a5d](https://github.com/AIGNE-io/aigne-framework/commit/9875a5d46abb55073340ffae841fed6bd6b83ff4))
* **cli:** support run agents from remote URL ([#60](https://github.com/AIGNE-io/aigne-framework/issues/60)) ([5f49920](https://github.com/AIGNE-io/aigne-framework/commit/5f4992089d36f9e780ba55a912a1d35508cad28e))
* **core:** support oauth for McpAgent with example ([#55](https://github.com/AIGNE-io/aigne-framework/issues/55)) ([9420f3a](https://github.com/AIGNE-io/aigne-framework/commit/9420f3a56cf18986cd45f173044e660be76daab4))

### Bug Fixes

* remove usage of new Node.js exists API for compatibility ([#57](https://github.com/AIGNE-io/aigne-framework/issues/57)) ([c10cc08](https://github.com/AIGNE-io/aigne-framework/commit/c10cc086d8ecd0744f38cdb1367d4c8816b723b3))

## [1.6.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.5.0...aigne-framework-v1.6.0) (2025-04-08)

### Features

* add `serve` command for @aigne/cli ([#54](https://github.com/AIGNE-io/aigne-framework/issues/54)) ([1cca843](https://github.com/AIGNE-io/aigne-framework/commit/1cca843f1760abe832b6651108fa858130f47355))
* add agent library support ([#51](https://github.com/AIGNE-io/aigne-framework/issues/51)) ([1f0d34d](https://github.com/AIGNE-io/aigne-framework/commit/1f0d34ddda3154283a4bc958ddb9b68b4ac106b0))
* support token/call/time limits for ExecutionEngine ([#44](https://github.com/AIGNE-io/aigne-framework/issues/44)) ([5a2ca0a](https://github.com/AIGNE-io/aigne-framework/commit/5a2ca0a033267dd4765f574b53dca71e932e53d4))

### Bug Fixes

* support reconnect to the MCP server automatically ([#50](https://github.com/AIGNE-io/aigne-framework/issues/50)) ([898d83f](https://github.com/AIGNE-io/aigne-framework/commit/898d83f75fc655142b93c70a1afeda376a2e92b4))

## [1.5.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.4.0...aigne-framework-v1.5.0) (2025-03-27)

### Features

* **dx:** show mcp server url on connecting ([#39](https://github.com/AIGNE-io/aigne-framework/issues/39)) ([5819a76](https://github.com/AIGNE-io/aigne-framework/commit/5819a76435fae7333720f9e0c58a25aebc1089e3))

### Bug Fixes

* **dx:** export models/utils in submodules ([#43](https://github.com/AIGNE-io/aigne-framework/issues/43)) ([bd561b3](https://github.com/AIGNE-io/aigne-framework/commit/bd561b397de816f04c2d63d58538e81fba82fc7f))

## [1.4.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.3.1...aigne-framework-v1.4.0) (2025-03-26)

### Features

* **core:** add xAI chat model adapter ([#34](https://github.com/AIGNE-io/aigne-framework/issues/34)) ([b228d22](https://github.com/AIGNE-io/aigne-framework/commit/b228d22b550535ab8e511f13de9e4a65dd73e3c0))

### Bug Fixes

* **orchestrator:** refactor and enhance orchestrator with step synthesis ([#31](https://github.com/AIGNE-io/aigne-framework/issues/31)) ([ba9fca0](https://github.com/AIGNE-io/aigne-framework/commit/ba9fca04fad71d49c8f4f52172b56668a94ea714))

## [1.3.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.3.0...aigne-framework-v1.3.1) (2025-03-25)

### Bug Fixes

* **core:** use system message as user message for claude model if needed ([#32](https://github.com/AIGNE-io/aigne-framework/issues/32)) ([316a6d5](https://github.com/AIGNE-io/aigne-framework/commit/316a6d51f885cceee4020c24695f6588f6b7425f))
* simplify mcp examples ([2b0b50e](https://github.com/AIGNE-io/aigne-framework/commit/2b0b50ef278edb938d26e5b31f0be73eb51e9204))

## [1.3.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.2.0...aigne-framework-v1.3.0) (2025-03-24)

### Features

* **core:** add ChatModelClaude to use models of anthropic ([#30](https://github.com/AIGNE-io/aigne-framework/issues/30)) ([0a62a64](https://github.com/AIGNE-io/aigne-framework/commit/0a62a6499e3da723a4646e67952051708ce7de6a))
* **core:** add support for subscribing topics for agent memory ([#28](https://github.com/AIGNE-io/aigne-framework/issues/28)) ([eeecc67](https://github.com/AIGNE-io/aigne-framework/commit/eeecc67049a60ebcc4cdba0fbcd987b3d81f4af6))

### Bug Fixes

* **core:** enforce stricter input/output type checks ([#26](https://github.com/AIGNE-io/aigne-framework/issues/26)) ([ef8cf53](https://github.com/AIGNE-io/aigne-framework/commit/ef8cf53586aff08a809909c56ab2a20f215fa129))
* rename @aigne/core-next to @aigne/core ([3a81009](https://github.com/AIGNE-io/aigne-framework/commit/3a8100962c81813217b687ae28e8de604419c622))
