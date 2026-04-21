-- Keeps Supabase's Data API from exposing public-schema tables without RLS.
-- Intentionally enables RLS without adding policies. That means anon/authenticated
-- API roles get no access until explicit policies are added, while direct server
-- connections using administrative roles continue to work.

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;

CREATE OR REPLACE FUNCTION private.enable_row_level_security_on_public_tables()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  target record;
BEGIN
  FOR target IN
    SELECT n.nspname AS schema_name, c.relname AS table_name
    FROM pg_class AS c
    INNER JOIN pg_namespace AS n
      ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind IN ('r', 'p')
  LOOP
    EXECUTE format(
      'ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',
      target.schema_name,
      target.table_name
    );
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION private.auto_enable_row_level_security_on_public_tables()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table', 'partitioned table')
  LOOP
    IF cmd.schema_name IS NOT NULL
      AND cmd.schema_name = 'public'
      AND cmd.schema_name NOT IN ('pg_catalog', 'information_schema')
      AND cmd.schema_name NOT LIKE 'pg_toast%'
      AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      EXECUTE format(
        'ALTER TABLE %s ENABLE ROW LEVEL SECURITY',
        cmd.object_identity
      );
    END IF;
  END LOOP;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_event_trigger
    WHERE evtname = 'trg_auto_enable_row_level_security_on_public_tables'
  ) THEN
    CREATE EVENT TRIGGER trg_auto_enable_row_level_security_on_public_tables
    ON ddl_command_end
    EXECUTE FUNCTION private.auto_enable_row_level_security_on_public_tables();
  END IF;
END;
$$;

SELECT private.enable_row_level_security_on_public_tables();
