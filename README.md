# Lottery Info BD

Bangla-first, Bangladesh-only informational lottery portal demo built with Next.js, TypeScript and Supabase.

## Features
- Bangla-first responsive homepage and result archive
- Demo login/register/profile screens
- Admin dashboard shell for user/content/results/settings management
- Supabase client integration and SQL RLS migration
- GitHub Pages static export and deployment workflow

## Run locally
```bash
npm install
cp .env.example .env.local
npm run dev
```
Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to enable Supabase. Without them, public pages use demo data.

Push to `main`; GitHub Actions builds and deploys the static export to GitHub Pages. Enable Pages > Build and deployment > GitHub Actions in repository settings.

This is an informational/demo portal; it does not implement paid ticket sales, deposits, withdrawals, wallets, paid entries, prize payments or gambling transactions.
