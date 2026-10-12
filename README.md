# Future in Practice

A Next.js landing page for a virtual soft skills training program taking place on 25–26 November 2026.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` from the same machine running the development server.

## Verification

```bash
npm run lint
npm run typecheck
npm run build
```

The production build is exported to `out/`. Run `npm start` after building to serve that export locally.

## Deployment

Pushes to `main` deploy automatically to GitHub Pages through `.github/workflows/deploy-pages.yml`.
