# Updated docs files

## File 1

Copy:

```txt
INSTALL.md
```

To:

```txt
docs/INSTALL.md
```

## Fixes included

1. Fixed broken Markdown link:

```md
[.env.example](.env.example)
```

to:

```md
[.env.example](../.env.example)
```

2. Replaced unsafe placeholder command:

```bash
npx vercel alias set <deployment> www.resurgence-dx.biz
```

with:

```bash
npx vercel alias set resurgence-designxpress-qo92fzor4.vercel.app www.resurgence-dx.biz --scope resurgence-designxpress-projects
```

## Verify

```bash
npm run docs:check
```
