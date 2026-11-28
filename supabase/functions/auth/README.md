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
