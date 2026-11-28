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
| Login and registration screens | Implemented, awaiting live verification | Bangladesh mobile format; registration includes Cloudflare Turnstile |
| Auth Edge Function | Active | Supabase function `auth`, deployed version 8; OTP-free mobile-to-internal-email mapping |
| Session persistence and restoration | Implemented, awaiting end-to-end verification | AuthProvider stores and restores session, refreshes tokens, verifies `me`, and handles logout |
| Profile table permissions | Fixed; verified | `service_role` has INSERT and SELECT on `public.profiles`; RLS remains enabled |
| Mobile identity mapping | Implemented; verified | `profiles.mobile` is NOT NULL, Bangladesh E.164 format-constrained, and UNIQUE |
| Login end-to-end test | Pending | Requires a valid test account and user-provided credentials |
| Registration end-to-end test | Pending retest | Previous attempt failed at profile insert before the permission fix |
| GitHub Pages deployment | Blocked | Latest recorded workflow failed during TypeScript checking because the Deno-only import in `supabase/functions/auth/index.ts` was included in the Next.js typecheck |
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
