# PRD: Authentication, Users & Roles

---

## 1. Summary

The system has **4 base roles** plus **per-user custom permission overrides**. All sidebar menus are always visible — no access means the item is **grayed out and not clickable**. Buttons on pages are **disabled** when the user lacks permission.

Emails are **internal-only identifiers** (e.g. `didi@jaza.local`) — they are not real email addresses. No email sending, no email verification, no password reset via email. Password changes are performed exclusively by **Developer** or **SuperAdmin** through the user management page. Users log in with their internal email + password, with a 24-hour forced re-login. Personal preferences (language, text size, theme) are saved per user and restored automatically on next login.

---

## 2. Roles

### 2.1 Four Base Roles

| Role | Who | What They Can Do |
|------|-----|-----------------|
| **Developer** | 1–2 people (you / IT) | Full access to everything. Only role that can see error log pages. |
| **SuperAdmin** | ~4 people (client family) | All business pages + user management + settings + permission management. Cannot see developer-only pages (error logs). |
| **Admin** | Role placeholder | Not used by the 8 named users. Falls back to per-module rules. Can be assigned custom permissions like anyone else. |
| **Sales** | Generic staff | Most restrictive base role. Can be assigned custom permissions. |

### 2.2 Custom Permissions Override

A user can have `has_custom_permissions = true`. When set:
- The base role is **ignored** for module and report access.
- Access is defined entirely by `user_module_permissions` and `user_report_permissions` tables.
- Any module **not listed** in the user's permissions → no access → sidebar grayed out.
- Any report type **not listed** → no access → sidebar grayed out.

---

## 3. Data Model

```ts
// ── User ──

interface AppUser {
  id: string;                    // UUID
  email: string;                 // internal-only identifier for login (e.g. "didi@jaza.local"), not a real email
  fullName: string;              // display name
  roleId: number;                // FK → roles table (1=Sales, 2=Admin, 3=SuperAdmin, 4=Developer)
  hasCustomPermissions: boolean; // TRUE → use per-user permission tables instead of base role
  hashedPassword: string;        // bcrypt / PBKDF2
  securityStamp: string;         // rotated on password change, invalidates all sessions
  mfaEnabled: boolean;           // TOTP mandatory for SuperAdmin
  mfaSecret: string | null;      // TOTP shared secret (encrypted at rest)
  isActive: boolean;             // FALSE = soft-deleted / deactivated
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

// ── Role ──

interface Role {
  id: number;                    // 1=Sales, 2=Admin, 3=SuperAdmin, 4=Developer
  name: string;                  // "Sales" | "Admin" | "SuperAdmin" | "Developer"
}

// ── User Module Permission (one row per user per module they have access to) ──
// ABSENCE of a row for a module = NO ACCESS (sidebar grayed out)

interface UserModulePermission {
  id: string;                    // UUID
  userId: string;                // FK → app_users
  module: string;                // "master" | "purchase" | "sales" | "ar" | "inventory"
  canEdit: boolean;              // FALSE → form inputs readOnly, Save button disabled
  canDelete: boolean;            // FALSE → Delete button hidden/disabled
}

// ── User Report Permission (one row per user per report type) ──
// ABSENCE of a row for a report type = NO ACCESS

interface UserReportPermission {
  id: string;                    // UUID
  userId: string;                // FK → app_users
  reportType: string;            // "sales" | "inventory" | "purchase" | "ar"
}

// ── Resolved Permissions (computed at login, returned by /api/auth/me) ──

interface ResolvedPermissions {
  modules: {
    [module: string]: {          // e.g. "master", "purchase", etc.
      canEdit: boolean;
      canDelete: boolean;
    }
  };
  reports: string[];             // e.g. ["ar", "sales"]
  isDeveloper: boolean;          // TRUE → show error log pages
}

// ── User Preference ──

interface UserPreference {
  userId: string;
  language: "id" | "en";
  textSize: "small" | "normal" | "large";
  theme: "light" | "dark";
  updatedAt: string;
}

// ── Refresh Token ──

interface RefreshToken {
  id: string;
  userId: string;
  tokenHash: string;             // SHA-256 of raw token
  expiresAt: string;             // 24 hours from creation
  createdAt: string;
  revokedAt: string | null;
}
```

---

## 4. Database Schema

```sql
-- ── Roles (immutable enum table) ──

CREATE TABLE roles (
    id   SMALLINT PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE
);

INSERT INTO roles (id, name) VALUES
    (1, 'Sales'),
    (2, 'Admin'),
    (3, 'SuperAdmin'),
    (4, 'Developer');

-- ── Users ──

CREATE TABLE app_users (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email                  VARCHAR(255) NOT NULL UNIQUE,
    full_name              VARCHAR(200) NOT NULL,
    role_id                SMALLINT NOT NULL REFERENCES roles(id),
    has_custom_permissions BOOLEAN NOT NULL DEFAULT FALSE,
    hashed_password        TEXT NOT NULL,
    security_stamp         UUID NOT NULL DEFAULT gen_random_uuid(),
    mfa_enabled            BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_secret             TEXT,
    is_active              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at          TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON app_users(email);
CREATE INDEX idx_users_role ON app_users(role_id);

-- ── User Module Permissions ──
-- One row per user per module they have ANY access to.
-- No row = no access (sidebar grayed out, direct URL blocked).

CREATE TABLE user_module_permissions (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    module     VARCHAR(20) NOT NULL,       -- 'master' | 'purchase' | 'sales' | 'ar' | 'inventory'
    can_edit   BOOLEAN NOT NULL DEFAULT FALSE,
    can_delete BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(user_id, module)
);

CREATE INDEX idx_ump_user ON user_module_permissions(user_id);

-- ── User Report Permissions ──
-- One row per user per report type they can view.
-- No row = report category grayed out in sidebar.

CREATE TABLE user_report_permissions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    report_type VARCHAR(20) NOT NULL,      -- 'sales' | 'inventory' | 'purchase' | 'ar'
    UNIQUE(user_id, report_type)
);

CREATE INDEX idx_urp_user ON user_report_permissions(user_id);

-- ── User Preferences ──

CREATE TABLE user_preferences (
    user_id   UUID PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
    language  VARCHAR(5) NOT NULL DEFAULT 'id',
    text_size VARCHAR(10) NOT NULL DEFAULT 'normal',
    theme     VARCHAR(10) NOT NULL DEFAULT 'light',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Refresh Tokens ──

CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(64) NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at  TIMESTAMPTZ
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at)
    WHERE revoked_at IS NULL;

-- ── Audit Log ──

CREATE TABLE audit_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES app_users(id),
    action      VARCHAR(50) NOT NULL,
    ip_address  VARCHAR(45),
    metadata    JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);
```

---

## 5. API Contracts

### 5.1 Authentication Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/auth/login` | None | Login |
| `POST` | `/api/auth/logout` | Cookie | End session |
| `POST` | `/api/auth/refresh` | Refresh token | Rotate tokens |
| `GET` | `/api/auth/me` | Cookie | Current user + resolved permissions + preferences |
| `POST` | `/api/auth/change-password` | Cookie | Change own password (Developer/SuperAdmin only) |
| `GET` | `/api/auth/antiforgery` | None | Get CSRF token |
| `GET` | `/api/auth/preferences` | Cookie | Get preferences |
| `PUT` | `/api/auth/preferences` | Cookie | Update preferences |

### 5.2 Login

```
POST /api/auth/login
Content-Type: application/json

Request:
{
  "email": "didi@jaza.local",
  "password": "string",
  "mfaCode": "123456"             // required if MFA enabled
}

Response 200:
{
  "user": {
    "id": "uuid",
    "email": "didi@jaza.local",
    "fullName": "Didi",
    "role": "Admin",
    "isDeveloper": false,
    "mfaEnabled": false
  },
  "permissions": {
    "modules": {
      "master":   { "canEdit": true,  "canDelete": false },
      "purchase": { "canEdit": true,  "canDelete": true  },
      "sales":    { "canEdit": true,  "canDelete": true  }
      // "ar" and "inventory" absent = no access
    },
    "reports": ["ar"]
    // only "ar" present = only AR Report visible in sidebar
  },
  "preferences": {
    "language": "id",
    "textSize": "normal",
    "theme": "light"
  },
  "accessToken": "jwt...",
  "refreshToken": "raw-token...",
  "expiresAt": "ISO 8601"
}

Errors: 401 (invalid credentials), 423 (locked out), 403 (MFA required)
```

### 5.3 Refresh Token

```
POST /api/auth/refresh
Request:  { "refreshToken": "raw-token-from-login" }
Response: { "accessToken": "new-jwt...", "refreshToken": "new-raw-token...", "expiresAt": "..." }
Error 401: { "title": "Session expired", "detail": "Please log in again." }
```

### 5.4 Get Current User (with resolved permissions)

```
GET /api/auth/me

Response 200:
{
  "user": {
    "id": "uuid",
    "email": "didi@jaza.local",
    "fullName": "Didi",
    "role": "Admin",
    "isDeveloper": false,
    "mfaEnabled": false
  },
  "permissions": {
    "modules": {
      "master":   { "canEdit": true,  "canDelete": false },
      "purchase": { "canEdit": true,  "canDelete": true  },
      "sales":    { "canEdit": true,  "canDelete": true  }
    },
    "reports": ["ar"]
  },
  "preferences": {
    "language": "id",
    "textSize": "normal",
    "theme": "light"
  }
}
```

> **Rule**: A module PRESENT in `permissions.modules` = sidebar item clickable. A module ABSENT = grayed out.  
> `canEdit=FALSE` → form inputs are readOnly, Save button disabled.  
> `canDelete=FALSE` → Delete button hidden.

### 5.5 Change Password (Developer + SuperAdmin only)

Regular users cannot change their own password. Only **Developer** and **SuperAdmin** can change any user's password through the user management page.

```
POST /api/auth/change-password
Cookie: (authenticated as Developer or SuperAdmin)
Content-Type: application/json

Request:
{
  "userId": "uuid",                              // user whose password is being changed (required)
  "newPassword": "new-strong-password-123!",
  "confirmNewPassword": "new-strong-password-123!"
}

Response 200:
{
  "message": "Password changed. All existing sessions for this user have been signed out."
}

Response 400:
{
  "title": "Validation failed",
  "errors": {
    "newPassword": ["Must be at least 12 characters with uppercase, lowercase, digit, and special character."]
  }
}

Response 403:
{
  "title": "Forbidden",
  "detail": "Only Developer or SuperAdmin can change passwords."
}
```

Alternatively, use the user management endpoint:
```
POST /api/users/:id/reset-password
```

Password rules: min 12 chars, uppercase + lowercase + digit + special.
On success: rotate the user's `security_stamp` → invalidates ALL refresh tokens for that user globally. They must log in again on every device.

### 5.6 User Preferences

```
GET  /api/auth/preferences  →  { "language": "id", "textSize": "normal", "theme": "light" }
PUT  /api/auth/preferences  →  same shape, returns updated values
```

### 5.7 User Management (Developer + SuperAdmin only)

```
GET    /api/users?search=&role=&page=1&pageSize=20    → list users
GET    /api/users/:id                                   → user detail + module & report permissions
POST   /api/users                                       → create user (with optional permissions)
PUT    /api/users/:id                                   → update user + permissions
DELETE /api/users/:id                                   → deactivate (is_active = false)
POST   /api/users/:id/reset-password                    → force password reset
```

### 5.8 Permission Management (Developer + SuperAdmin only)

```
GET    /api/users/:id/permissions                       → return module + report permissions for user
PUT    /api/users/:id/permissions                       → replace all module + report permissions

PUT /api/users/:id/permissions
Request:
{
  "hasCustomPermissions": true,
  "modules": [
    { "module": "master",   "canEdit": true,  "canDelete": false },
    { "module": "purchase", "canEdit": true,  "canDelete": true  },
    { "module": "sales",    "canEdit": true,  "canDelete": true  }
  ],
  "reports": ["ar"]
}

// If module not in array → row deleted from DB → no access
// If report not in array → row deleted → grayed out
```

---

## 6. Permission Resolution Logic

### 6.1 Backend Resolution (happens on login + /api/auth/me)

```
function resolvePermissions(user: AppUser): ResolvedPermissions {

  // 1. Developer = full access to EVERYTHING
  if (user.roleId === 4) {
    return {
      modules: {
        master:    { canEdit: true, canDelete: true },
        purchase:  { canEdit: true, canDelete: true },
        sales:     { canEdit: true, canDelete: true },
        ar:        { canEdit: true, canDelete: true },
        inventory: { canEdit: true, canDelete: true }
      },
      reports: ["sales", "inventory", "purchase", "ar"],
      isDeveloper: true
    };
  }

  // 2. SuperAdmin = full business access, no dev pages
  if (user.roleId === 3 && !user.hasCustomPermissions) {
    return {
      modules: {
        master:    { canEdit: true, canDelete: true },
        purchase:  { canEdit: true, canDelete: true },
        sales:     { canEdit: true, canDelete: true },
        ar:        { canEdit: true, canDelete: true },
        inventory: { canEdit: true, canDelete: true }
      },
      reports: ["sales", "inventory", "purchase", "ar"],
      isDeveloper: false
    };
  }

  // 3. Custom permissions
  if (user.hasCustomPermissions) {
    const moduleRows = await db.user_module_permissions.where({ userId: user.id });
    const reportRows = await db.user_report_permissions.where({ userId: user.id });

    const modules: Record<string, {canEdit: boolean, canDelete: boolean}> = {};
    for (const row of moduleRows) {
      modules[row.module] = { canEdit: row.canEdit, canDelete: row.canDelete };
    }

    return {
      modules,
      reports: reportRows.map(r => r.reportType),
      isDeveloper: false
    };
  }

  // 4. Fallback: base role (Admin / Sales — no custom perms set)
  //    Admin: TBD per module. For now, same as base role with restrictions defined later.
  //    Sales: most restrictive.
  return {
    modules: {
      sales: { canEdit: true, canDelete: false }  // minimal fallback
    },
    reports: [],
    isDeveloper: false
  };
}
```

### 6.2 API Endpoint Authorization

Every protected API endpoint checks `permissions` before executing:

```
[HttpGet("/api/master/customers")]
async Task GetCustomers() {
    var perms = resolvePermissions(currentUser);
    if (!perms.modules.ContainsKey("master")) return Forbid();
    // ... fetch and return data
}

[HttpDelete("/api/master/customers/{id}")]
async Task DeleteCustomer(id) {
    var perms = resolvePermissions(currentUser);
    if (perms.modules["master"]?.canDelete != true) return Forbid();
    // ... delete
}
```

---

## 7. Security Architecture

Same as before — unchanged from original PRD:

| Rule | Enforcement |
|------|------------|
| Password | Min 12 chars, uppercase + lowercase + digit + special. HIBP breach check. |
| Account lockout | 5 failed attempts → locked 15 min |
| MFA (TOTP) | Mandatory for SuperAdmin |
| Session max age | Access token: 15 min. Refresh token: 24 hours (not sliding). |
| Token rotation | Every refresh issues a new refresh token. Old revoked. |
| Security stamp | Password change invalidates ALL tokens globally. |
| CSRF | `X-XSRF-TOKEN` header. Cookie `HttpOnly + Secure + SameSite=Strict`. |
| Rate limiting | Login: 10 req/min/IP. Refresh: 30 req/min/user. |
| Audit log | All login, logout, password change, permission change, user CRUD logged. |

### 24-Hour Expiry Logic

```
Token created at 08:00 → expires tomorrow 08:00
Refresh at 23:00 → new token expires tomorrow 23:00
After 24h → refresh fails → login page with toast "Session berakhir. Silakan login kembali."
```

---

## 8. Sidebar & UI Behavior

### 8.1 Core Rule: Everything Visible, Access Controls What's Clickable

| User has... | Sidebar | Page Buttons |
|------------|---------|-------------|
| Full module access (e.g., Developer/SuperAdmin → Purchase) | Normal, clickable | All buttons active |
| Partial access (e.g., Didi → Master: edit but no delete) | Normal, clickable | Delete button disabled/hidden |
| Zero module access (e.g., Yane → Inventory) | **Grayed out, not clickable** | N/A |
| Report access (e.g., Didi → AR only) | AR normal, other 3 **grayed out** | N/A |

### 8.2 Sidebar Rendering Logic

```
For each top-level module in TREE:
  if permissions.modules[moduleId] EXISTS:
    → render as <NavLink>, fully clickable
  else:
    → render as <span className="text-muted-foreground/40 cursor-not-allowed">
    → pointer-events: none
    → no <a> tag, no click handler

For each report child under Reports:
  if permissions.reports INCLUDES reportType:
    → render as <NavLink>
  else:
    → render as grayed-out <span>
```

### 8.3 Page Button Logic

```
On a module page (e.g. /master/customer):

  const perm = permissions.modules["master"];

  // Create / New button
  if (perm.canEdit) → <Button>New Customer</Button>
  else             → <Button disabled>New Customer</Button>

  // Edit button per row
  if (perm.canEdit) → <PencilIcon onClick={edit}>
  else             → hidden or disabled

  // Delete button per row
  if (perm.canDelete) → <TrashIcon onClick={delete}>
  else               → hidden
```

### 8.4 Direct URL Protection

```
If user navigates directly to /inventory but has NO inventory permission:
  → Page loads
  → Shows <AccessDeniedPage>:
      Title: "Akses Dibatasi"
      Message: "Anda tidak memiliki izin untuk mengakses halaman ini."
      Button: "Kembali ke Dashboard"
  → Backend: all API calls for this module return 403
  → Frontend: UI shows error state, not crash
```

### 8.5 Report Sub-Page Protection

```
Report parent: "AR Report" = path /report/ar/*
Report parent: "Sales Report" = path /report/sales/*

User has report permission "ar":
  → ALL sub-pages under /report/ar/* are accessible
  → /report/sales/* → sidebar grayed out → clicks go to AccessDeniedPage

User has report permission "ar" + "sales" (Robby):
  → /report/ar/* and /report/sales/* accessible
  → /report/inventory/* and /report/purchase/* → grayed out
```

---

## 9. The 8 Named People — Configuration

All 8 users have `has_custom_permissions = true`. Their base role is effectively overridden.

### 9.1 Module Permissions

| User | Master | Purchase | Sales | AR | Inventory |
|------|--------|----------|-------|----|-----------|
| **Didi** | edit | edit+delete | edit+delete | — | — |
| **Pai** | edit | edit+delete | — | — | edit+delete |
| **Nenden** | edit | edit+delete | — | — | — |
| **Atep** | edit | — | edit+delete | — | — |
| **Yane** | — | — | edit+delete | — | — |
| **Ilham** | — | — | — | — | — |
| **Robby** | — | — | — | — | — |
| **Alvin** | edit | — | — | edit+delete | — |

> `edit` = can_view=true, can_edit=true, can_delete=false  
> `edit+delete` = can_view=true, can_edit=true, can_delete=true  
> `—` = no row in `user_module_permissions` → sidebar grayed out

### 9.2 Report Permissions

| User | AR | Sales | Inventory | Purchase |
|------|----|-------|-------|----------|
| **Didi** | ✅ | — | — | — |
| **Pai** | ✅ | — | — | — |
| **Nenden** | ✅ | ✅ | ✅ | ✅ |
| **Atep** | ✅ | — | — | — |
| **Yane** | — | — | — | — |
| **Ilham** | ✅ | — | — | — |
| **Robby** | ✅ | ✅ | — | — |
| **Alvin** | ✅ | ✅ | ✅ | ✅ |

> `✅` = row in `user_report_permissions` → sidebar normal, clickable  
> `—` = no row → sidebar grayed out

### 9.3 Seed SQL

```sql
-- Users (passwords are bcrypt hashes of temporary passwords set by SuperAdmin)

INSERT INTO app_users (email, full_name, role_id, has_custom_permissions, hashed_password)
VALUES
  ('didi@jaza.local',   'Didi',   2, TRUE, 'TEMP_HASH'),
  ('pai@jaza.local',    'Pai',    2, TRUE, 'TEMP_HASH'),
  ('nenden@jaza.local', 'Nenden', 2, TRUE, 'TEMP_HASH'),
  ('atep@jaza.local',   'Atep',   2, TRUE, 'TEMP_HASH'),
  ('yane@jaza.local',   'Yane',   1, TRUE, 'TEMP_HASH'),
  ('ilham@jaza.local',  'Ilham',  1, TRUE, 'TEMP_HASH'),
  ('robby@jaza.local',  'Robby',  1, TRUE, 'TEMP_HASH'),
  ('alvin@jaza.local',  'Alvin',  2, TRUE, 'TEMP_HASH');

-- Module permissions for Didi
INSERT INTO user_module_permissions (user_id, module, can_edit, can_delete) VALUES
  ((SELECT id FROM app_users WHERE email='didi@jaza.local'), 'master',   TRUE, FALSE),
  ((SELECT id FROM app_users WHERE email='didi@jaza.local'), 'purchase', TRUE, TRUE),
  ((SELECT id FROM app_users WHERE email='didi@jaza.local'), 'sales',    TRUE, TRUE);

-- Repeat for each user per the table above...

-- Report permissions for Didi
INSERT INTO user_report_permissions (user_id, report_type) VALUES
  ((SELECT id FROM app_users WHERE email='didi@jaza.local'), 'ar');

-- Repeat for each user per the table above...
```

---

## 10. User & Permission Management UI

### 10.1 Who Can Access

| Action | Developer | SuperAdmin | Others |
|--------|-----------|------------|--------|
| Create user | ✅ | ✅ | ❌ |
| Edit user (name, email, role) | ✅ | ✅ | ❌ |
| Change user password | ✅ | ✅ | ❌ |
| Set custom permissions | ✅ | ✅ | ❌ |
| Deactivate user | ✅ | ✅ | ❌ |

### 10.2 Users Page (Developer + SuperAdmin only)

```
/users page:

┌──────────────────────────────────────────────────────┐
│ Users                                    [+ New User] │
│                                                        │
│ 🔍 [Search...]    Role: [All ▼]                       │
│                                                        │
│ ┌────────┬──────────┬────────┬────────────┬────────┐ │
│ │ Name   │ Email    │ Role   │ Custom?    │ Actions│ │
│ ├────────┼──────────┼────────┼────────────┼────────┤ │
│ │ Didi   │ didi@... │ Admin  │ ✅ Custom  │ ✏️ 🔑  │ │
│ │ Pai    │ pai@...  │ Admin  │ ✅ Custom  │ ✏️ 🔑  │ │
│ │ Yane   │ yane@... │ Sales  │ ✅ Custom  │ ✏️ 🔑  │ │
│ │ Ilham  │ ilham@.. │ Sales  │ ✅ Custom  │ ✏️ 🔑  │ │
│ └────────┴──────────┴────────┴────────────┴────────┘ │
│                                                        │
│               ← 1  2  3  4 →                          │
└──────────────────────────────────────────────────────┘
```

### 10.3 Edit User Dialog with Permission Grid

```
Click ✏️ on Didi → Dialog:

┌─────────────────────────────────────────────────────────┐
│ Edit User: Didi                                          │
│                                                          │
│ Name:  [Didi                                ]           │
│ Email: [didi@jaza.local                     ]           │
│ Role:  [Admin ▼]                                          │
│                                                          │
│ ☑ Custom Permissions                                     │
│                                                          │
│ Module Access:                                           │
│  ┌──────────┬────────┬──────────┬──────────┐            │
│  │ Module   │ Access │ Can Edit │ Can Delete│            │
│  ├──────────┼────────┼──────────┼──────────┤            │
│  │ Master   │   ☑    │    ☑     │    ☐     │            │
│  │ Purchase │   ☑    │    ☑     │    ☑     │            │
│  │ Sales    │   ☑    │    ☑     │    ☑     │            │
│  │ AR       │   ☐    │    —     │    —     │            │
│  │ Inventory│   ☐    │    —     │    —     │            │
│  └──────────┴────────┴──────────┴──────────┘            │
│                                                          │
│ Report Access:                                           │
│  ☑ AR Report    ☐ Sales Report                          │
│  ☐ Inventory    ☐ Purchase Report                       │
│                                                          │
│  [Save]  [Cancel]                                        │
└─────────────────────────────────────────────────────────┘
```

> When **Access** is unchecked → Edit and Delete columns grayed out (disabled). Row will be **removed** from `user_module_permissions` on save.  
> When **Access** is checked but **Can Delete** is unchecked → Delete button hidden on pages.  
> When **Can Edit** is unchecked → Edit is unchecked, form fields become readOnly on pages.

### 10.4 Behavior When "Custom Permissions" Is Unchecked

- Module grid and report checkboxes disappear
- User falls back to base role (`role_id`)
- All rows in `user_module_permissions` and `user_report_permissions` for this user are **deleted** on save
- Sidebar and buttons governed by base role logic

---

## 11. Login / Logout Flow

### 11.1 Login Page States

| State | Behavior |
|-------|----------|
| Idle | Form ready, email + password inputs |
| Submitting | Button shows spinner, inputs disabled |
| Invalid credentials | Inline error: "Email atau password salah." |
| Account locked | "Akun terkunci. Silakan coba lagi dalam X menit." |
| MFA required | Show 6-digit code input (TOTP) |
| Success | Redirect to `/` (Dashboard). Permissions loaded. |

### 11.2 Logout

```
Click "Sign Out" → POST /api/auth/logout
→ Server revokes refresh token, clears cookie
→ Redirect to /login
→ Client clears user state, permissions, preferences cache
```

### 11.3 Session Expiry (24h)

```
API returns 401 → refresh attempt fails → 401
→ Clear state → redirect /login
→ Toast: "Session berakhir. Silakan login kembali."
```

---

## 12. User Preferences — Cache & Restore

| Preference | Key | Default | Options |
|-----------|-----|---------|---------|
| Language | `language` | `id` | `id` (Bahasa), `en` (English) |
| Text size | `textSize` | `normal` | `small`, `normal`, `large` |
| Theme | `theme` | `light` | `light`, `dark` |

**Flow**: On login → preferences returned with `/me` response → applied immediately via `SettingsProvider`.  
**On change**: Settings panel → optimistically updates UI → `PUT /api/auth/preferences` → saved to DB.  
**On next login**: Preferences auto-loaded from DB. No reconfiguration needed.  
**On logout/expiry**: Preferences persist in DB; cleared from client memory only.

---

## 13. How This Matches Existing Patterns

| Pattern | Location |
|---------|----------|
| Auth context | `frontend/src/lib/auth.tsx` (`AuthProvider`, `useAuth`, `hasRole`) |
| Settings context | `frontend/src/lib/settings.tsx` (`SettingsProvider`) |
| Login page | `frontend/src/features/auth/LoginPage.tsx` |
| Change password (Dev/SuperAdmin) | `frontend/src/features/auth/ChangePasswordPage.tsx` (accessible only to Developer + SuperAdmin) |
| API client | `frontend/src/lib/api.ts` (ky, `/api` prefix) |
| Antiforgery | `ensureAntiforgery()` in `main.tsx` |
| Router auth guard | `RequireAuth` in `frontend/src/app/router.tsx` |
| User menu | `AppLayout.tsx` — initials, roles, sign out |
| Sidebar nav | `AppLayout.tsx` — `SidebarNavigation` — needs update for grayed-out items |

---

## 14. Acceptance Criteria

- [ ] User logs in with email + password; receives JWT + refresh token + resolved permissions
- [ ] Failed login shows error; 5 failures locks account for 15 minutes
- [ ] SuperAdmin must enter TOTP code after password
- [ ] Developer sees ALL pages including error logs
- [ ] SuperAdmin sees ALL business pages but NOT error logs
- [ ] All sidebar modules always visible — inaccessible items are grayed out, not clickable
- [ ] Delete button visible only when `can_delete = true`
- [ ] Save/Create button disabled when `can_edit = false`; form inputs readOnly
- [ ] Report categories the user cannot access are grayed out in sidebar
- [ ] Direct URL to blocked module shows "Akses Dibatasi" page
- [ ] Session expires after 24 hours — user redirected to login
- [ ] Logout clears session, redirects to login
- [ ] Developer + SuperAdmin can reset any user's password via user management UI
- [ ] Regular users CANNOT change their own password (no self-service password page)
- [ ] Password change (by Dev/SuperAdmin) invalidates all sessions for that user
- [ ] No email verification — internal emails (e.g. `didi@jaza.local`) are identifiers only
- [ ] User preferences saved to DB and auto-restored on next login
- [ ] Developer + SuperAdmin can create, edit, deactivate users through UI
- [ ] Developer + SuperAdmin can configure per-user custom permissions through UI
- [ ] Unchecking "Custom Permissions" removes all per-user rows and falls back to base role
- [ ] All login attempts, permission changes, and user CRUD actions logged to `audit_log`
