# Auth Edge Function

Endpoint: POST /functions/v1/auth

Actions:
- register: JSON fields action, fullName, mobile, password, confirmPassword
- login: JSON fields action, mobile, password
- me: send the user's access token in the Authorization: Bearer header
- logout: send the user's access token in the Authorization: Bearer header

Registration and login use Bangladesh mobile numbers only. Accepted forms are local 01XXXXXXXXX, 8801XXXXXXXXX, and +8801XXXXXXXXX. They are normalized to E.164.

Validation:
- Full name: ASCII English letters, spaces, apostrophes, periods, and hyphens only.
- Password: 8–72 printable ASCII characters, at least two English letters, common/repeated/sequential passwords rejected.
- Registration requires matching confirmation.
- No OTP is sent. A trusted server operation confirms the phone field in Supabase Auth.

Security:
- Service-role credentials are read only from Supabase Edge Function environment variables and never returned.
- RLS remains enabled on profiles; the privileged client is used only for trusted profile operations.
- Database-backed rate limits: registration 5/IP/hour; login 20/IP/15 minutes and 8/phone/15 minutes.
- Login errors do not reveal whether a phone number exists.
- verify_jwt is false because register/login are public; protected actions validate bearer tokens explicitly.

Important:
- Phone ownership is not verified because OTP is intentionally disabled.
- Configure the Supabase Auth phone provider before production use.
- Add a secure account recovery process before launch; phone-based recovery cannot prove ownership without verification.


## Cloudflare Turnstile (required for registration)

Registration now requires a fresh Turnstile token in the JSON field `turnstileToken`.
The widget must be configured with action `register`. The Edge Function validates
the token server-side using Cloudflare Siteverify and fails closed if the secret is
missing, the token is invalid/replayed/expired, the action is wrong, or Siteverify
cannot be reached.

Required Supabase Edge Function secret:
- `CLOUDFLARE_TURNSTILE_SECRET_KEY`: private Turnstile secret; configure in Supabase Dashboard > Edge Functions > Secrets.
Optional:
- `TURNSTILE_EXPECTED_HOSTNAME`: exact production hostname allowed by your widget.

Frontend needs the public Turnstile sitekey (not secret) and must send the generated
token as `turnstileToken` with the register request. Tokens are single-use and expire
after five minutes; obtain a fresh token for each registration attempt.

Current registration IP rate limit remains 5 attempts per hour. Login rate limits
remain 20 per IP and 8 per phone per 15 minutes. Do not trust client-supplied IP
headers as an identity proof; Turnstile is the primary bot gate.
