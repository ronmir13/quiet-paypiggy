# Quiet PayPiggy™ V16 — Final Build Fix

The previous build reached TypeScript successfully but failed because the TypeScript checker did not have an explicit declaration for the global CSS import in `app/layout.tsx`.

This build adds `global.d.ts` with a `*.css` declaration and explicitly includes it in `tsconfig.json`.

## Run

```bash
cd "C:/Users/ronmi/Downloads/quiet-paypiggy-site-v16-launch-polish-final-fix"
npm install
npm run build
```

If the build succeeds:

```bash
npm run dev
```

## Smoke-test
- `/`
- `/characters`
- `/characters/1`
- `/characters/50`
- `/cards`
- `/lore`
- `/shop`

Do not run `npm audit fix --force` during the build validation.
