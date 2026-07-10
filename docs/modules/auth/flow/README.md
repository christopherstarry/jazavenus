# Sign-in & Permissions — How It Works

This is the human-friendly version of the auth flow. It explains what users see and feel, not the cryptography. If you came looking for code, that lives in `backend/src/Jaza.Api/Controllers/AuthController.cs` and `backend/src/Jaza.Application/Auth/`.

## In one paragraph

Every staff member has one account. They sign in with their email and password. The system recognises four kinds of people: **Sales** (day-to-day work), **Admin** (currently a placeholder for future per-module profiles), **SuperAdmin** (the owners — full business access), and **Developer** (you, the IT/maintenance team — full access plus error logs and developer tools). On top of those four roles, a SuperAdmin can hand-pick which screens any single user can see. After sign-in we keep them logged in for 24 hours; if they don't touch the app for that long, they get sent back to the login screen.

## What's in this folder

| Document                                 | Read it when…                                                       |
| ---------------------------------------- | ------------------------------------------------------------------- |
| [`overview.md`](./overview.md)           | You want a 5-minute mental model of the whole auth system.          |
| [`how-sign-in-works.md`](./how-sign-in-works.md) | A user asks "what happens when I click Sign in?".            |
| [`how-tokens-work.md`](./how-tokens-work.md)     | You're curious about access tokens, refresh tokens, sessions.|
| [`how-to-change-password.md`](./how-to-change-password.md) | A user can't sign in OR wants a new password.       |
| [`mfa-and-security.md`](./mfa-and-security.md) | The owner asks "is this safe enough?".                         |
| [`permissions.md`](./permissions.md)     | You're deciding which screens a new user should see.               |

## Quick links inside the app

- **Sign in page** → `/login`
- **Change my password** → `/system/change-password` (User menu → "Change password")
- **Settings (text size, theme, language)** → user menu → Settings (`/settings`)
- **Admin: manage users** → `/admin/users` (SuperAdmin / Developer only — UI not built yet, API ready at `/api/users`)

## Who can do what — at a glance

| Action                                       | Sales | Admin | SuperAdmin | Developer |
| -------------------------------------------- | :---: | :---: | :--------: | :-------: |
| Sign in to the app                           |  ✅   |  ✅   |     ✅     |    ✅     |
| Open Sales screens                           |  ✅   |  ✅   |     ✅     |    ✅     |
| Open Master / Purchase / Inventory / A/R     |   ⚠️   |   ⚠️   |     ✅     |    ✅     |
| View business reports                        |   ⚠️   |   ⚠️   |     ✅     |    ✅     |
| Add or remove other users                    |  ❌   |  ❌   |     ✅     |    ✅     |
| Change someone else's password               |  ❌   |  ❌   |     ✅     |    ✅     |
| See the error log / developer tools          |  ❌   |  ❌   |     ❌     |    ✅     |

`⚠️` = depends on per-user permissions. By default Sales/Admin only see their own module; SuperAdmin can grant extra modules and reports per person.

## What a normal day looks like for a user

1. They open the app on their work laptop and click **Sign in**.
2. Type email, type password, click the button. They're in.
3. They use the app for the rest of the day. They never see the login screen again.
4. The next morning they open the app and the system asks them to sign in again. (24-hour fixed limit — see [`how-tokens-work.md`](./how-tokens-work.md) for why.)
5. If they ever forget the password, they ask the owner. The owner resets it from the user-management screen and tells them the new one. The user signs in and changes it themselves immediately.

That's it. No password resets by email, no security questions, no "Sign in with Google". This is a closed staff app.
