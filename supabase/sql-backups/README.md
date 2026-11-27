# Executed SQL backups

Only SQL scripts actually used to create or change this project's database are backed up here. This is not a collection of generic/read-only SQL examples.

For each approved SQL execution, create a sequentially numbered feature folder and save the exact SQL text that was run, for example:

- `001-user-profiles/001-user-profiles.sql`
- `002-wallet-ledger/002-wallet-ledger.sql`

Keep the corresponding migration in `supabase/migrations/` when applicable, and retain this exact backup copy unchanged. Never invent columns: use only the schema the project owner approves. No SQL has been executed in the frontend phase.
