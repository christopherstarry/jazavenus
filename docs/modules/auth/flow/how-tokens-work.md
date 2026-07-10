# Tokens, Cookies, and Sessions — How They Keep You Logged In

The app uses three things at the same time to keep you logged in. Knowing what each does makes it much easier to debug "I keep getting kicked out" reports.

## TL;DR

| Thing                          | How long it lasts | Where it lives                                | Why it exists                                                              |
| ------------------------------ | :---------------: | --------------------------------------------- | -------------------------------------------------------------------------- |
| **Access token (JWT)**         | 15 minutes        | RAM (browser) / secure keychain (mobile)      | Proves who you are on every API call.                                      |
| **Refresh token**              | 24 hours          | sessionStorage (browser) / secure storage     | Quietly buys you a new access token without making you re-type the password. |
| **Session cookie**             | 24 hours fixed    | Browser (HttpOnly, SameSite=Strict)           | Lets browser tabs stay signed in across reloads without exposing JS to the token. |
| **XSRF-TOKEN cookie**          | Per session       | Browser (NOT HttpOnly — by design)            | Defeats CSRF: every POST/PUT/DELETE must echo the token in `X-XSRF-TOKEN`. |
| **SecurityVersion**            | Forever (until rotated) | A GUID on the user row in the database  | One-shot kill switch for ALL of a user's tokens.                           |

## How they fit together

Imagine a normal day in the app:

```
08:00  ── User signs in. Server issues access token A1 (expires 08:15) +
         refresh token R1 (expires 32:00, i.e. tomorrow morning) + a 24h cookie.

08:14  ── A1 still valid. Every API call includes A1 (or rides the cookie).

08:16  ── A1 has expired. The browser receives a 401 from /api/auth/me.
         The api client automatically calls /api/auth/refresh with R1.
         Server returns access token A2 + a NEW refresh token R2 (R1 revoked).

08:17 ── User keeps working with A2.

…

08:00  ── 24 hours later. R2 has now expired.
         The next /refresh attempt returns 401. Frontend bounces them to /login.
```

So a normal user signs in once a day and the SPA does all the token juggling silently.

## Why two tokens? (access + refresh)

Because they have very different jobs:

- The **access token** is presented on every API call. If we made it long-lived, a stolen token would be a big deal. So it's short — 15 minutes.
- The **refresh token** is presented only once every 15 minutes (or when the SPA reloads). It can be longer-lived because:
  - Each one is single-use; using it generates a new one and revokes the old one (rotation).
  - The server stores only its SHA-256 hash. Even a database leak doesn't give an attacker a working refresh token.
  - Any password change rotates `SecurityVersion`, instantly invalidating every refresh token for that user.

## What's actually inside the access token?

A JWT (JSON Web Token), signed with HMAC-SHA256. Decoded payload looks like:

```json
{
  "sub":   "019dfb7d-1925-72ad-81ba-b7c5b34d6b7e",
  "email": "didi@jaza.local",
  "name":  "didi@jaza.local",
  "role":  "Admin",
  "ver":   "e00e72c8-a847-4c89-8c93-7da0976bcf29",
  "dev":   "false",
  "iss":   "jaza-venus",
  "aud":   "jaza-venus-app",
  "exp":   1778041896
}
```

- `sub` — the user's id.
- `role` — what role the API will treat them as. The frontend never trusts this on its own; it always re-fetches `/api/auth/me` for the canonical answer.
- `ver` — the user's `SecurityVersion`. The API rejects any token whose `ver` no longer matches the database. That's our kill switch.
- `dev` — `true` for Developer accounts. The API also rechecks this; the claim is a hint.
- `exp` — Unix timestamp when the token stops being valid (15 minutes after issue).

Anyone with a copy of this token can read its body — JWTs are signed, not encrypted. So we never put anything sensitive inside, only the user's id, role, and version.

## What's the cookie for?

The HttpOnly session cookie is for the SPA's convenience. When the user reloads the page, the JS bundle hasn't yet had a chance to fish out the access token — but the cookie is auto-sent by the browser, so the very first network call (`GET /api/auth/me`) succeeds anyway. Without the cookie, every reload would briefly look like "you're signed out" and the SPA would have to call `/refresh` first.

The cookie is `HttpOnly` (no JS can read it), `SameSite=Strict` (no third-party site can include it in a request), and `Secure` (only travels over HTTPS in production). Combined with the XSRF-TOKEN double-submit, this is the standard defence-in-depth for browser apps.

## Why isn't the refresh token in localStorage?

`localStorage` survives a closed browser. We deliberately do **not** want a stolen refresh token to keep working overnight, so we use **`sessionStorage`** which dies when the tab closes. If the user rotates back to the same tab, the token is still there. If they close everything, they sign in again next time.

## "Sign me out everywhere"

Use cases:

- *I think someone has my password.* → SuperAdmin resets the password. SecurityVersion rotates. All tokens dead. They sign in again from one device.
- *I'm changing my password as a precaution.* → Same flow, but you initiate it yourself from `/system/change-password`. Other devices get bounced; the device you used to change it stays signed in (we re-issue tokens on that one device immediately).
- *I'm leaving the company.* → SuperAdmin sets `isActive = false`. The next request from any of your devices fails with 401 because the API checks `IsActive` on every `/me` call.

## What about clock skew?

We allow **30 seconds** of clock skew when validating JWTs. If a user's laptop is wildly out of sync (say their clock says 09:00 but reality is 09:30), they'll see "Sign in failed" with no useful detail. The fix is to enable automatic time on the laptop and sign in again. This is rare in practice.
