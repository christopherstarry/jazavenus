# Auth System — 5-Minute Overview

## The four kinds of users

| Role            | Stable id | Who it's for                                                                                       |
| --------------- | :-------: | -------------------------------------------------------------------------------------------------- |
| **Sales**       |    1      | Day-to-day staff. Default profile is "see Sales screens, edit your own work."                       |
| **Admin**       |    2      | Reserved for future per-module managers (e.g. a warehouse lead). Today behaves the same as Sales.   |
| **SuperAdmin**  |    3      | The owners. Sees everything except the error log. Can manage users and permissions.                 |
| **Developer**   |    4      | You / the IT team. Sees everything including error logs and developer tools.                        |

A user has **exactly one** role. We never give one person two roles.

## What can a person see?

We don't decide that purely from the role. The rule is:

1. **Developer** → sees everything. Always.
2. **SuperAdmin without custom permissions** → sees every business screen and every report. Owners get the full ERP.
3. **Anyone with custom permissions turned on** → only sees the modules and reports that were ticked for them. Per-module they can have *edit* access (default) or *edit + delete*.
4. **Anyone else (Admin or Sales without customisation)** → fallback. Sees only the **Sales** module. No reports.

The owner controls all of this from one screen ("Manage Users"). They click on a person → tick which modules and reports that person should see → save. No code changes needed.

## What does "module" mean here?

Five buckets, matching the sidebar:

- **Master** — customers, products, suppliers, warehouses, banks…
- **Purchase** — purchase orders, receiving, returns to suppliers
- **Sales** — sales orders, invoicing, sales returns
- **Inventory** — stock movements, stock takes, planning
- **A/R** — collecting customer payments, PDC, ageing

And four kinds of reports:

- **Sales** — sales analysis, daily sales, gross margin, …
- **Inventory** — stock position, movements, opname
- **Purchase** — purchase reports, daily purchase, service level
- **A/R** — outstanding invoices, collection, DOAR

## How does the user "stay logged in"?

Two things travel with each request:

- A short-lived **access token** that's good for **15 minutes**. It carries the user's identity and role in a signed envelope. The browser keeps it in memory; mobile clients store it in their secure keychain.
- A longer **refresh token** that's good for **24 hours**. Every time the access token expires the app silently asks the API for a new one using the refresh token. The user doesn't notice this.

When the 24-hour mark is hit (or when the user clicks "Sign out") the refresh token is revoked. From that point on no new access tokens can be issued without typing the password again.

Browser users also get an **HttpOnly cookie session** with the same 24-hour lifetime. The two systems work together so everything is consistent across tabs.

## What's actively defended against?

| Attack                                              | Defence                                                                                |
| --------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Stolen password / credential stuffing               | Account locks for 30 minutes after **5 wrong tries**.                                  |
| Phishing the owner                                  | SuperAdmin accounts **must enrol MFA** in production.                                  |
| Stolen access token leaving the building            | Token expires in **15 minutes**. SecurityVersion check kills it instantly on password change. |
| CSRF (cross-site form) attacks on the SPA           | Antiforgery cookie + header double-submit pattern; all POST/PUT/DELETE require both.   |
| XSS dropping a script that reads the cookie         | Cookie is `HttpOnly`; script-src CSP keeps third-party JS out.                         |
| Brute-force the login endpoint                      | Rate limited to **10 logins / IP / minute** + the 5-tries-and-locked rule per account. |

## What is NOT defended against

We do **not** support:

- Self-service password reset by email (no SMTP).
- "Magic link" sign-in.
- Federated login (Google / Microsoft).
- Multi-tenant access (one server = one company).
- "Remember me" cookies that survive a browser close — sessions are deliberately tied to the browser session for 24 hours and then end.

If any of those become important, we add them. They are not required by the current PRD.
