# Bundling Blocklet with AIGNE Framework

## How to bundle a blocklet that uses AIGNE Framework?

When bundling a blocklet that includes the AIGNE Framework, you need to exclude the @aigne/sqlite dependency to avoid bundling conflicts and ensure proper functionality.

Use the following command to bundle your blocklet:

```bash
blocklet bundle --compact --external @aigne/sqlite
```

With this command, the `@aigne/sqlite` package will be excluded from the bundle, it will dynamically load the SQLite dependency at runtime, which is necessary because the blocklet bundle does not support bundling native modules like SQLite.
