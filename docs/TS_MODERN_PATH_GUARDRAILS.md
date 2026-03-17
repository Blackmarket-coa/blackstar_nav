# TypeScript modern-path JS guardrails

To prevent new JavaScript drift in modern runtime code paths, we enforce a guardrail:

- Scan `src/**/*.js`
- Ignore `src/legacy/**`
- Fail CI if any file is not listed in `config/js-modern-path-allowlist.txt`

## Commands

```bash
yarn check:modern-js-guardrail
```

## How to use

1. When migrating a modern JS module to TypeScript, remove its old `.js` file and corresponding allowlist entry.
2. If a short-term exception is necessary, add the file path to `config/js-modern-path-allowlist.txt` with a rationale comment.
3. Keep the allowlist shrinking over time.
