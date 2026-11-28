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
| Auth Edge Function | Active | Supabase function `auth`, deployed version 7 |
| Session persistence and restoration | Implemented, awaiting end-to-end verification | AuthProvider stores and restores session, refreshes tokens, verifies `me`, and handles logout |
| Profile table permissions | Fixed; verified | `service_role` now has INSERT and SELECT on `public.profiles`; RLS remains enabled |
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

## 4. Next actions

1. Retest registration after the profile permission repair using a fresh, valid test mobile number, a strong password, and a fresh Turnstile challenge.
2. Verify the created profile row and successful session establishment.
3. Test Login with that account.
4. Verify page reload, session restoration, token refresh, and logout.
5. Obtain approval to fix the GitHub Pages TypeScript build issue, then rerun deployment.
6. After deployment succeeds, repeat the authentication tests against the published site.

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
