# Project Roadmap & Work History

> Living project record for the Lotto website. Update this file whenever a task is started, completed, revised, reopened, or blocked.
>
> **Last updated:** 2026-11-28  
> **Repository:** `rasedulinfinix100-afk/platform`  
> **Deployment model:** Next.js static export on GitHub Pages; Supabase Edge Functions for trusted backend operations.

## 1. Project direction

- Lottery-only website for Bangladesh users.
- Premium dark navy/blue interface, teal accents, restrained gold lottery details.
- Comfortable mobile-first sizing; minimal neon.
- English as the default language.
- Frontend UX is built with dummy data first; backend integrations are introduced only when explicitly planned.
- Never commit files or change production services outside the user's approved scope.
- Never execute SQL before saving a reviewed backup.

## 2. Current project status

| Area | Status | Notes |
|---|---|---|
| Frontend foundation and visual direction | In progress | Existing Next.js App Router structure and premium dark UI |
| Login and registration screens | Backend/API verified | Registration HTTP 201; Login HTTP 200; invalid credentials correctly rejected with HTTP 401; production UI test still pending |
| Auth Edge Function | Active | Supabase function `auth`, deployed version 8; OTP-free mobile-to-internal-email mapping |
| Session persistence and restoration | Implemented; browser verification pending | AuthProvider stores/restores session, refreshes tokens, verifies `me`, and handles logout; reload/refresh/logout browser tests remain open |
| Profile table permissions | Fixed; verified | `service_role` has INSERT and SELECT on `public.profiles`; RLS remains enabled |
| Mobile identity mapping | Implemented; verified | `profiles.mobile` is NOT NULL, Bangladesh E.164 format-constrained, and UNIQUE |
| Login end-to-end test | Backend/API verified | Successful login confirmed in Supabase logs; GitHub Pages browser flow remains to be tested |
| Registration end-to-end test | Backend/API verified | Successful registration confirmed after profile permission repair; GitHub Pages browser flow remains to be tested |
| GitHub Pages deployment | Deployed successfully | Latest run `46130419587` on commit `a7ec1dd868f017462cce8eb996914410d966a696`; build and deploy jobs both succeeded. Production auth session tests remain pending. |
| Supabase integration beyond authentication | Not started | Do not connect additional features until planned and approved |

## 3. Work history

Record each meaningful change here. The reason is as important as the change itself: it explains why a file was revisited and prevents repeating old investigations.

### 2026-11-28 — Authentication test and database permission repair

- **Area:** Registration / Supabase database permissions
- **Finding:** Registration requests reached the active `auth` Edge Function, but the function log reported `permission denied for table profiles`.
- **Why this was investigated:** The user requested live Login and Registration testing after the session-management implementation.
- **Root cause verified:** `service_role` had schema USAGE on `public`, but did not have INSERT or SELECT privileges on `public.profiles`.
- **Change:** Granted only INSERT and SELECT on `public.profiles` to `service_role`.
- **Security check:** RLS remains enabled. No privileges were granted to `anon` or `authenticated`.
- **Backup:** Saved before execution in the Supabase SQL notebook named **SQL Backup - profiles service_role permissions**.
- **Verification:** Confirmed `service_role` INSERT=true, SELECT=true, and RLS=true after the change.
- **Result:** Database permission fix verified. Registration still needs a fresh end-to-end retest; Login also needs a valid-account test.
- **Files changed:** No GitHub files changed for this database repair.

### 2026-11-28 — Login, registration, and session-management implementation

- **Area:** Frontend authentication and session lifecycle
- **Change:** Added `components/AuthProvider.tsx` and connected it in `app/layout.tsx`.
- **Change:** Login and registration pages call the Supabase `auth` Edge Function and establish the returned session.
- **Change:** Registration includes Cloudflare Turnstile; phone input uses Bangladesh mobile format.
- **Change:** Menu logout calls the backend logout action before clearing the local session.
- **Why files may be revisited:** The complete flow must be tested on a deployed build, including reload/session restoration, token refresh, logout, invalid credentials, and registration validation.
- **Result:** Code implemented; live end-to-end verification remains pending.

### 2026-11-28 — GitHub Pages build investigation

- **Area:** CI/CD deployment
- **Finding:** The recorded workflow completed with failure; the deploy job was skipped.
- **Build error:** Next.js TypeScript checking attempted to resolve `npm:@supabase/supabase-js@2` from the Deno Edge Function source file.
- **Why this was investigated:** User asked to check deployment status after authentication changes.
- **Next action:** Exclude Deno Edge Function sources from the Next.js TypeScript project check (without changing Edge Function runtime code), then rerun the workflow. This requires explicit approval before editing GitHub files.
- **Result:** Latest recorded changes were not confirmed deployed by that workflow.

### 2026-11-28 — Replace Supabase Phone auth with OTP-free mobile/password identity

- **Area:** Supabase authentication architecture
- **Why this task was done:** Supabase Auth logs showed `Phone logins are disabled`, while enabling Phone provider in Dashboard required Twilio credentials. The user explicitly does not want Twilio, SMS, or OTP costs and approved an alternative.
- **Design:** Keep the user-facing Bangladesh mobile + password experience. The Edge Function derives a stable, non-deliverable internal email (`mobile-<SHA-256>@accounts.lotto.invalid`) from the normalized mobile and uses Supabase Email/Password auth. The user never enters or sees an email. No email is sent; admin-created users are email-confirmed server-side.
- **Database change:** Added `public.profiles.mobile` as NOT NULL, with Bangladesh E.164 format check and UNIQUE constraint. Existing precheck found 0 auth users and 0 profiles, so no existing accounts needed migration.
- **Security:** RLS remains enabled; service_role INSERT/SELECT privileges remain as previously granted. No anon/authenticated table grants added. Turnstile, DB-backed rate limits, password validation, generic login errors, and bearer-token checks remain.
- **Files/services changed:** `supabase/functions/auth/index.ts`, `supabase/functions/auth/README.md`, `public.profiles`, and this roadmap.
- **Why existing files were reopened:** The prior implementation stored the number as a Supabase Auth phone identity, which cannot password-sign-in while Phone provider is disabled. Reusing the existing function keeps session/me/logout contracts and frontend forms unchanged while switching the underlying Auth identifier.
- **SQL backup:** [SQL Backup - mobile identity mapping for password auth](https://supabase.com/dashboard/project/vdmvgafybznsdyfartfo/explorer/notebook/8b1a7bdf-7315-461c-829b-889fe4326276), saved before execution.
- **SQL verification:** Confirmed `profiles.mobile` exists and is NOT NULL; format CHECK and UNIQUE constraints exist; RLS=true; service_role INSERT=true and SELECT=true.
- **Deployment:** Supabase Edge Function `auth` deployed ACTIVE as version 8. GitHub commit: `3b7f4c0a0efe4e24cf1df32c02c8f8486fb9efa2`.
- **Frontend:** No Login/Register/AuthProvider changes were needed because their request/response shape is unchanged.
- **Result:** Backend architecture updated; full registration/login/session test still pending. Supabase Auth Email provider must be enabled. Phone provider and Twilio remain unnecessary.
- **Remaining risks:** Phone ownership is still unverified without OTP; account recovery needs a separate secure design. GitHub Pages workflow issue remains a separate blocker.

### 2026-11-28 — Registration and Login end-to-end verification

- **Area:** Authentication live test
- **Why this test was performed:** User reported that Registration and Login were successful and asked for independent verification.
- **Evidence checked:** Supabase unified logs for Auth Function version 8 and database records.
- **Registration:** Edge Function returned HTTP 201 at 2026-11-28 09:23:41 UTC. Auth audit log recorded `user_signedup` via the internal email provider; subsequent password grant returned HTTP 200.
- **Login:** A later Edge Function request returned HTTP 200 at 09:24:20 UTC; Supabase Auth recorded `login` with password grant and HTTP 200. The function also successfully read the matching profile (HTTP 200).
- **Database verification:** Exactly 1 Auth user, 1 profile, and 1 linked Auth/profile row. The profile mobile field passes the Bangladesh E.164 format check.
- **Additional observed events:** Logout was recorded at 09:23:48 UTC. An invalid-credentials attempt returned HTTP 401 at 09:24:14 UTC, followed by successful login at 09:24:20 UTC; this is expected behavior and confirms invalid credentials are rejected.
- **Result:** Registration and Login are independently verified successful against Supabase Auth Function version 8. This confirms backend/API success, not yet the GitHub Pages production deployment.
- **Files changed:** Only this roadmap entry.
- **Remaining checks:** Session restoration after browser reload, refresh-token renewal, and logout UX from the frontend; published-site tests remain dependent on resolving the separate GitHub Pages build failure.

## 4. Next actions

1. In Supabase Auth Providers, keep Phone provider OFF and verify Email provider is ON; do not configure Twilio or SMS.
2. Retest Registration with a fresh valid Bangladesh mobile number, strong password, and fresh Turnstile challenge.
3. Verify the new Auth user has an internal `.invalid` email identity and the matching `profiles.mobile` record.
4. Test Login, page reload/session restoration, token refresh, and logout.
5. Obtain separate approval to fix the GitHub Pages TypeScript build issue, then rerun deployment.
6. After the frontend deploy succeeds, repeat tests on the published site.

## 5. Required format for every future update

Append a dated entry under **Work history** whenever a meaningful task changes.

Use this structure:

- **Date:**
- **Area / feature:**
- **Files or services changed:**
- **What changed:**
- **Why this task was done:**
- **Why an existing file was reopened or updated (if applicable):**
- **Tests performed and results:**
- **Backup / commit / deployment reference:**
- **Remaining risks or next action:**

## 6. Status definitions

- **Not started:** Work has not begun.
- **In progress:** Work is actively being implemented.
- **Implemented:** Code or configuration exists, but required verification may remain.
- **Verified:** The relevant test passed and evidence is recorded.
- **Blocked:** Work cannot proceed until a dependency or approval is resolved.
- **Reopened:** A previously completed area needed another change; document the reason in Work history.


### 2026-11-28 — GitHub Pages deployment verified; session tests still open

- **Area:** CI/CD deployment and authentication verification status
- **Why this task was done:** User requested completion of the remaining browser-session checks and clarification of the roadmap's completeness.
- **GitHub Actions evidence:** Latest workflow run `46130419587` for commit `a7ec1dd868f017462cce8eb996914410d966a696` completed successfully. Both `build` and `deploy` jobs, including `Build static site` and `Deploy to GitHub Pages`, passed.
- **Deployment result:** GitHub Pages deployment is now verified successful for that commit. This supersedes the earlier recorded build-blocked status.
- **Session code review:** Reviewed `components/AuthProvider.tsx` and active Supabase `auth` Edge Function version 8. Code implements local session persistence/restoration, refresh-token exchange, `me` verification, backend token revocation, and local clearing on logout.
- **Session test results:** Browser reload persistence, real token refresh, and complete logout have NOT yet been demonstrated in an interactive browser session. The previous Supabase logout log alone does not prove browser storage was cleared. Production-site equivalents also remain pending.
- **Why not marked verified:** The assistant cannot inspect the user's actual browser localStorage or operate the user's authenticated browser session in this context. Code review and server logs are not substitutes for these runtime checks.
- **Roadmap audit:** The roadmap records the two confirmed SQL backups and the auth Edge Function architecture/deployment, but it is not yet a complete item-by-item inventory of every SQL object, secret/configuration change, and service operation. The known backups are:
  1. `SQL Backup - profiles service_role permissions` — notebook ID `b92a81c9-600e-40b0-9b02-0c3bfb6875b6`.
  2. `SQL Backup - mobile identity mapping for password auth` — notebook ID `8b1a7bdf-7315-461c-829b-889fe4326276`.
- **Supabase function state:** `auth` is ACTIVE, version 8, `verify_jwt=false`; function source and README are in `supabase/functions/auth/`.
- **Remaining risks / next action:** Run interactive reload, refresh-token, logout and production-site tests; then add exact evidence and timestamps. Perform a separate Supabase SQL/notebook inventory to enumerate every migration, RPC/function, table, policy, grant, secret name (never secret values), and Edge Function deployment in the roadmap.
