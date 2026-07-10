# Changing Your Password

Two ways to change a password. Pick the one that matches who you are.

## I'm a regular user — change MY password

1. Sign in.
2. Click your name in the top-right → **Change password** (or open `/system/change-password`).
3. Type your **current password** once, your **new password** twice.
4. Click **Update password**.

The new password must be:

- at least **12 characters** long;
- include at least one uppercase letter (A–Z);
- include at least one lowercase letter (a–z);
- include at least one digit (0–9);
- include at least one symbol (e.g. `!`, `@`, `#`, `$`, `*`).

A good rule of thumb: stick three uncommon words and a digit together — `pelican-magnet-frosted-9!` is far stronger than `Password123!` and easier to remember.

### What happens after I change it

- The device you just used **stays signed in**. You won't get bounced out mid-session.
- Every other device where you left yourself signed in gets **logged out next time** they make any API call. (We rotate your `SecurityVersion` GUID on the server.)
- All your refresh tokens are revoked, so a stolen browser tab on another machine becomes useless within seconds.
- The change is recorded in the audit log (`Password.ChangedSelf`). The owner can see when each user last changed their password.

You do **not** need to type the new password again on this device — the SPA seamlessly accepts the new tokens the API hands back.

## I'm a SuperAdmin — reset SOMEONE ELSE'S password

Use this when a user has forgotten their password (most common case).

1. Sign in as SuperAdmin (or Developer).
2. Go to **Manage Users** (`/admin/users`).
3. Click on the person → **Reset password**.
4. Type a new password (must satisfy the same complexity rules).
5. Save. Tell the user the new password by phone or in person.
6. Strongly suggest they sign in and immediately change it themselves to something only they know.

The reset:

- Rotates the target user's `SecurityVersion` so any laptop where they were still signed in gets booted out;
- Sets `MustChangePassword = true` on the user (the SPA will nudge them to pick a new one — UI not yet built; for now, just ask them);
- Logs `Password.Changed` in the audit log with `by=<your-email>`.

Do **not** reuse one password across multiple staff. Do **not** SMS or email the new password. Just tell them face-to-face.

## I forgot my password and there's no SuperAdmin around

There is no email-based self-service reset by design. Reach out to:

1. Another SuperAdmin if you have one;
2. The **Developer** (IT) account, which can also reset passwords;
3. Last resort: an admin with database access can rotate `SecurityVersion` on your row, then write a new `PasswordHash` via a quick script. This is a manual recovery path for emergencies — talk to your developer.

## Why we don't email password reset links

This app runs on a private network with internal users only. We don't operate an SMTP server, and shipping password resets over email would either:

- require us to sign up for a transactional email service (cost, dependency, deliverability);
- or expose a fragile self-service flow that's bigger than the problem it solves.

The PRD intentionally puts password resets in the SuperAdmin's hands. If the company grows beyond ~20 staff, this is the first feature to revisit.

## My device says "Session expired" right after I changed the password

Expected on every device **except** the one you used to change it. Sign in again with the new password.

## How often should we change passwords?

Modern guidance (NIST SP 800-63B): **don't force routine rotation**. We don't expire passwords on a schedule. The exception is when there's a known or suspected compromise — at that point, rotate immediately.

If you'd like a friendlier policy, send a quarterly reminder to staff to "change your password if you've used it elsewhere." We don't enforce it in code.
