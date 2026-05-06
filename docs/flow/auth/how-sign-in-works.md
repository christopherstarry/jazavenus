# What Happens When I Click "Sign In"?

A no-jargon walkthrough of the sign-in flow.

## The user's view

1. Open the app. The login page shows two boxes: **Username or email** and **Password**.
2. Type your email (e.g. `didi@jaza.local`). Type your password. Press **Sign in**.
3. The button shows a spinner for a second. Then either:
   - You land on the **dashboard** — you're in.
   - A red message appears: *"That sign-in and password don't match."* — try again.
   - A blue box asks for a **6-digit code** from your authenticator app. Open the app on your phone, type the number, press **Verify and sign in**.
4. From here on, every screen you click loads instantly. You won't see the login page again until the next morning.

## What goes on behind the scenes

When the button is pressed:

1. The browser sends `POST /api/auth/login` with `{ email, password, mfaCode }`.
2. The API:
   - Looks up the user by email. If no match (or the account is deactivated) → 401 *"invalid_credentials"*. We deliberately don't say *which* part is wrong.
   - Checks the password against the stored hash (PBKDF2, 100k iterations, per-user salt — Microsoft Identity defaults).
   - Wrong password? Increments a counter on the user. After **5 wrong tries** the account is locked for 30 minutes (HTTP 423 *"account_locked"*).
   - Right password but MFA is enabled? The first call returns 403 *"mfa_required"*. The browser shows the 6-digit input. The user retries with the code.
   - SuperAdmin in production without MFA enrolled yet? 403 *"mfa_setup_required"*.
3. On a clean pass:
   - The user gets a fresh **JWT access token** (15-minute clock).
   - A fresh **refresh token** is created and stored in the database (only its SHA-256 hash, never the raw value).
   - A 24-hour **HttpOnly session cookie** is set on the browser.
   - An XSRF-TOKEN cookie is set so the SPA can prove future POSTs come from a real user.
   - We log "Login.Success" in the audit log with the IP and user agent.

The response body is the user, their resolved permissions, their preferences (language, theme, text size), and the two tokens.

## What "I'm signed in" means in the SPA

The frontend's `AuthProvider` keeps:

- the current user (id, full name, role, MFA flag);
- their resolved permissions (which modules + report types they can open);
- their preferences (language, text size, theme);
- the access token in memory.

The sidebar and route guards consult that context. A Sales user will not even see the "Master Maintenance" item in the sidebar; if they bookmark the URL and try to deep-link, the router redirects them back to the dashboard.

## What "I'm signed out" means

You're signed out when **any** of these happens:

- you click the **Sign out** button (we revoke every refresh token for you);
- you change your password (the system rotates a `SecurityVersion` GUID on your user; every existing access token starts failing the next time it's checked);
- another admin resets your password (same thing);
- the 24-hour cookie expires;
- the refresh token expires (also 24 hours);
- the SuperAdmin deactivates your account (`isActive = false`).

After that you must type your email and password again to do anything.

## Common errors and what they mean

| Error message in the UI                                            | Most likely cause                                              | What to do                                                                  |
| ------------------------------------------------------------------ | -------------------------------------------------------------- | --------------------------------------------------------------------------- |
| "That sign-in and password don't match."                           | Wrong email/password.                                          | Try again. After 5 tries the account locks.                                  |
| "Your account is locked because of too many wrong tries."          | 5 failed logins in a short window.                             | Wait 30 minutes or ask SuperAdmin to unlock.                                 |
| "Open your authenticator app and type the 6-digit code."          | MFA is on for this user.                                       | Open Google Authenticator / Microsoft Authenticator / Authy and type the code. |
| "That authenticator code wasn't right."                            | Phone clock is off, or you typed the previous code.            | Wait for a new code (every 30 s) and retype.                                 |
| "Your account requires multi-factor authentication."               | SuperAdmin without MFA enrolled (production).                  | Ask another SuperAdmin or Developer to enrol MFA on this account.            |
| "Something went wrong. Please check your connection and try again." | API unreachable, Neon DB warming up.                           | Wait 10 seconds, retry. If it persists, check `flyctl status`.               |
