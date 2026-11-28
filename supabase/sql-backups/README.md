# SQL backups and database snapshots

This directory stores approved SQL execution backups and baseline snapshots of existing project-owned database objects.

- For each approved schema change, create a sequentially numbered feature folder and save the exact SQL text that was executed.
- Baseline snapshots must be clearly labeled as snapshots and must not be described as migrations or as SQL that has already been executed by this repository.
- Keep the corresponding migration in `supabase/migrations/` when applicable, and retain the exact backup copy unchanged.
- Never invent columns: use only the schema the project owner approves.
- Do not run SQL until its exact backup has been saved and verified.

## Existing database baseline

- `000-existing-database/000-existing-database.sql` is a snapshot of the existing `public.rls_auto_enable()` function and `ensure_rls` event trigger captured from Supabase project `vdmvgafybznsdyfartfo`.
- It is an object-level SQL snapshot only. It is not a full physical backup, does not include table data, and does not dump Supabase-managed schemas.
- The snapshot preserves the current SECURITY DEFINER function and PUBLIC EXECUTE grant; review security-advisor findings before any production use or restore.
