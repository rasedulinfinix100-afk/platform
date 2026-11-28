-- Auth Edge Function abuse protection: fixed-window per-IP rate limits.
CREATE TABLE public.auth_rate_limits (
    rate_key TEXT PRIMARY KEY,
    window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    request_count INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.auth_rate_limits FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.consume_auth_rate_limit(
    p_rate_key TEXT,
    p_max_requests INTEGER,
    p_window_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
    v_count INTEGER;
    v_expired BOOLEAN;
BEGIN
    IF p_rate_key IS NULL OR length(p_rate_key) < 16
       OR p_max_requests < 1 OR p_window_seconds < 1 THEN
        RETURN FALSE;
    END IF;

    INSERT INTO public.auth_rate_limits AS current_limit
        (rate_key, window_started_at, request_count, updated_at)
    VALUES
        (p_rate_key, pg_catalog.now(), 1, pg_catalog.now())
    ON CONFLICT (rate_key) DO UPDATE
    SET
        window_started_at = CASE
            WHEN current_limit.window_started_at <= pg_catalog.now()
                 - pg_catalog.make_interval(secs => p_window_seconds)
            THEN pg_catalog.now()
            ELSE current_limit.window_started_at
        END,
        request_count = CASE
            WHEN current_limit.window_started_at <= pg_catalog.now()
                 - pg_catalog.make_interval(secs => p_window_seconds)
            THEN 1
            ELSE current_limit.request_count + 1
        END,
        updated_at = pg_catalog.now()
    RETURNING request_count INTO v_count;

    RETURN v_count <= p_max_requests;
END;
$function$;

REVOKE ALL ON FUNCTION public.consume_auth_rate_limit(TEXT, INTEGER, INTEGER)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_auth_rate_limit(TEXT, INTEGER, INTEGER)
TO service_role;
