import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const publicAuth = createClient(supabaseUrl, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

function normalizeMobile(value: unknown): string | null {
  if (typeof value !== "string" || !/^(?:\\+?880)?0?1[3-9][0-9]{8}$|^\\+8801[3-9][0-9]{8}$/.test(value)) {
    return null;
  }
  const digits = value.replace(/^\\+/, "");
  if (digits.startsWith("01")) return "+88" + digits;
  if (digits.startsWith("8801")) return "+" + digits;
  if (digits.startsWith("88001")) return "+88" + digits.slice(3);
  return null;
}

function validateName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.trim().replace(/\\s+/g, " ");
  if (name.length < 2 || name.length > 80) return null;
  if (!/^[A-Za-z][A-Za-z .'-]*$/.test(name)) return null;
  return name;
}

const commonPasswords = new Set([
  "12345678", "00000000", "11111111", "22222222", "33333333",
  "44444444", "55555555", "66666666", "77777777", "88888888",
  "99999999", "password", "password1", "qwerty123", "admin123",
  "letmein123", "abc12345", "welcome1", "iloveyou", "87654321",
]);

function validatePassword(value: unknown): string | null {
  if (typeof value !== "string") return "Password is required.";
  if (value.length < 8 || value.length > 72) return "Password must be 8–72 characters.";
  if (!/^[\\x20-\\x7E]+$/.test(value)) return "Use English letters, numbers, and symbols only.";
  if ((value.match(/[A-Za-z]/g) ?? []).length < 2) return "Password must contain at least 2 English letters.";
  const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (commonPasswords.has(normalized)) return "Choose a less common password.";
  if (/^(.)\\1{7,}$/.test(normalized)) return "Choose a less predictable password.";
  if (/^(?:0123456789|1234567890|9876543210|87654321)$/.test(normalized)) {
    return "Choose a less predictable password.";
  }
  return null;
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-real-ip") ??
    forwarded ??
    "unknown";
}

async function allowRateLimit(key: string, maxRequests: number, windowSeconds: number): Promise<boolean> {
  const { data, error } = await admin.rpc("consume_auth_rate_limit", {
    p_rate_key: await sha256(key),
    p_max_requests: maxRequests,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error("Auth rate limit check failed:", error.message);
    return false;
  }
  return data === true;
}

async function handleRegister(body: Record<string, unknown>, req: Request) {
  const fullName = validateName(body.fullName);
  const phone = normalizeMobile(body.mobile);
  const passwordError = validatePassword(body.password);
  if (!fullName) return json({ error: "Full name must use English letters only." }, 400);
  if (!phone) return json({ error: "Enter a valid Bangladesh mobile number using English digits." }, 400);
  if (passwordError) return json({ error: passwordError }, 400);
  if (typeof body.confirmPassword !== "string" || body.password !== body.confirmPassword) {
    return json({ error: "Password and confirm password do not match." }, 400);
  }

  const ip = clientIp(req);
  if (!await allowRateLimit("register:ip:" + ip, 5, 3600)) {
    return json({ error: "Too many registration attempts. Please try again later." }, 429);
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    phone,
    password: body.password as string,
    phone_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError || !created.user) {
    console.warn("Registration failed:", createError?.message ?? "No user returned");
    return json({ error: "Registration could not be completed. Check the mobile number or try again." }, 400);
  }

  const userId = created.user.id;
  const { error: profileError } = await admin.from("profiles").insert({
    id: userId,
    full_name: fullName,
  });

  if (profileError) {
    console.error("Profile creation failed:", profileError.message);
    await admin.auth.admin.deleteUser(userId);
    return json({ error: "Account setup failed. Please try again." }, 500);
  }

  const { data: sessionData, error: signInError } = await publicAuth.auth.signInWithPassword({
    phone,
    password: body.password as string,
  });

  if (signInError || !sessionData.session) {
    console.error("Post-registration sign-in failed:", signInError?.message ?? "No session returned");
    await admin.auth.admin.deleteUser(userId);
    return json({ error: "Account could not start a session. Please contact support." }, 503);
  }

  return json({
    message: "Account created successfully.",
    user: { id: userId, fullName, mobile: phone },
    session: sessionData.session,
  }, 201);
}

async function handleLogin(body: Record<string, unknown>, req: Request) {
  const phone = normalizeMobile(body.mobile);
  const passwordError = validatePassword(body.password);
  if (!phone) return json({ error: "Enter a valid Bangladesh mobile number using English digits." }, 400);
  if (passwordError) return json({ error: "Invalid mobile number or password." }, 400);

  const ip = clientIp(req);
  const [ipAllowed, phoneAllowed] = await Promise.all([
    allowRateLimit("login:ip:" + ip, 20, 900),
    allowRateLimit("login:phone:" + phone, 8, 900),
  ]);
  if (!ipAllowed || !phoneAllowed) {
    return json({ error: "Too many login attempts. Please try again later." }, 429);
  }

  const { data, error } = await publicAuth.auth.signInWithPassword({
    phone,
    password: body.password as string,
  });
  if (error || !data.session || !data.user) {
    return json({ error: "Invalid mobile number or password." }, 401);
  }

  const { data: profile } = await admin.from("profiles")
    .select("full_name")
    .eq("id", data.user.id)
    .maybeSingle();

  return json({
    message: "Login successful.",
    user: { id: data.user.id, fullName: profile?.full_name ?? "", mobile: phone },
    session: data.session,
  });
}

async function handleMe(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\\s+/i, "");
  if (!token) return json({ error: "Authentication required." }, 401);
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return json({ error: "Invalid or expired session." }, 401);

  const { data: profile, error: profileError } = await admin.from("profiles")
    .select("full_name")
    .eq("id", data.user.id)
    .maybeSingle();
  if (profileError) return json({ error: "Unable to load profile." }, 500);

  return json({
    user: { id: data.user.id, fullName: profile?.full_name ?? "", mobile: data.user.phone ?? "" },
  });
}

async function handleLogout(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\\s+/i, "");
  if (!token) return json({ error: "Authentication required." }, 401);
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return json({ error: "Invalid or expired session." }, 401);

  const { error: revokeError } = await admin.auth.admin.signOut(token, "global");
  if (revokeError) {
    console.error("Logout token revocation failed:", revokeError.message);
    return json({ error: "Could not end the session. Please try again." }, 500);
  }
  return json({ message: "Logged out successfully." });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  try {
    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return json({ error: "Invalid request body." }, 400);
    }
    const action = (body as Record<string, unknown>).action;
    switch (action) {
      case "register": return await handleRegister(body, req);
      case "login": return await handleLogin(body, req);
      case "me": return await handleMe(req);
      case "logout": return await handleLogout(req);
      default: return json({ error: "Unsupported authentication action." }, 400);
    }
  } catch (error) {
    console.error("Unhandled auth function error:", error);
    return json({ error: "Unexpected server error." }, 500);
  }
});
