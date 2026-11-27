# Lotto BD

Lottery information and ticket-interface frontend built with Next.js App Router.

## Development

```bash
npm install
npm run dev
```

## Static deployment

The project uses Next.js static export for GitHub Pages. Client-side screens currently use demonstration content only. Supabase integration, payment processing, Edge Functions, and SQL execution are intentionally not enabled in this frontend foundation.

## Secrets

Never commit private keys, Supabase service-role keys, payment credentials, or other secrets. Configure deployment secrets in GitHub repository settings and backend secrets in Supabase when backend work is explicitly authorized.

## SQL backups

Executed project SQL scripts will be stored as exact numbered copies under `supabase/sql-backups/<sequence>-<feature>/<sequence>-<feature>.sql`. No SQL is executed as part of this frontend setup.
