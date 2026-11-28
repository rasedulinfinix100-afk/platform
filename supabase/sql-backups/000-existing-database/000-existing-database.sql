-- Baseline snapshot of project-owned custom database objects.
-- Captured from Supabase project: vdmvgafybznsdyfartfo
-- Captured: 2026-11-28 (UTC date)
--
-- IMPORTANT:
-- - This is a schema/object snapshot, NOT a full Supabase physical backup.
-- - It contains no table data and does not dump Supabase-managed auth/storage/realtime schemas.
-- - Restore requires a privileged database role that can create event triggers.
-- - This reproduces the current SECURITY DEFINER function and its current PUBLIC EXECUTE grant.
--   Review the existing security-advisor warning before exposing this object in production.
-- - This file is a snapshot of existing state; it has NOT been executed by this backup operation.

BEGIN;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
  tbl name;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        SELECT c.relname INTO tbl FROM pg_catalog.pg_class c WHERE c.oid = cmd.objid;
        EXECUTE format('alter table if exists %I.%I enable row level security', cmd.schema_name, tbl);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$;

ALTER FUNCTION public.rls_auto_enable() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO postgres;

CREATE EVENT TRIGGER ensure_rls
  ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  EXECUTE FUNCTION public.rls_auto_enable();

ALTER EVENT TRIGGER ensure_rls OWNER TO postgres;

COMMIT;
