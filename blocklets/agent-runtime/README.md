# Agent Runtime

A simple blocklet engine that serves agent directory.

## Example Usage

Following fields are required in `blocklet.yml` to use this blocklet engine:

```yaml
main: app # required for server to find which folder to serve
engine:
  interpreter: 'blocklet'
  source:
    store: https://store.blocklet.dev
    name: z2qa6yt75HHQL3cS4ao7j2aqVodExoBAN7xeS
    version: latest
```