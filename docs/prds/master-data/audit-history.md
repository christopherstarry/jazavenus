# PRD: Master Data Audit History

## 1. Summary
Every create, update, or delete action on master data is logged with who did it, what changed, and when. Developer and SuperAdmin can view the audit log for each master data record.

## 2. Routes
| Screen | Route | Visible To |
|--------|-------|-----------|
| Audit History | `/system/audit-history` | Developer, SuperAdmin |

---

## 3. Data Model

```ts
interface AuditLog {
  id: string;                    // UUID
  userId: string;                // FK → app_users (who did it)
  userName: string;              // Denormalized for display (never changes even if user is deleted)
  action: string;                // 'created' | 'updated' | 'deleted'
  entity: string;                // Table name: 'customers', 'products', 'brands', 'suppliers', etc.
  entityId: string;              // UUID of the affected record
  entityCode: string;            // Human-readable code (e.g. customer code, product code) for display
  changes: ChangeLog[];          // Array of changed fields (only for 'updated')
  ipAddress: string;             // Request IP
  userAgent: string;             // Browser user agent
  timestamp: string;             // ISO 8601
}

interface ChangeLog {
  field: string;                 // Column name: 'name', 'address', 'price', etc.
  oldValue: string | null;       // Previous value (null for creates)
  newValue: string | null;       // New value (null for deletes)
}
```

---

## 4. Database Table

```sql
CREATE TABLE audit_logs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID REFERENCES app_users(id) ON DELETE SET NULL,
    user_name    VARCHAR(200),
    action       VARCHAR(20) NOT NULL,      -- 'created' | 'updated' | 'deleted'
    entity       VARCHAR(50) NOT NULL,       -- 'customers', 'products', 'brands', etc.
    entity_id    UUID NOT NULL,
    entity_code  VARCHAR(100),               -- Display code / identifier
    changes      JSONB,                      -- Array of { field, oldValue, newValue }
    ip_address   VARCHAR(45),
    user_agent   TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
```

> **Important**: This table uses `ON DELETE SET NULL` so audit records persist even if a user is deleted.

---

## 5. What Gets Logged

| Action | Logged |
|--------|--------|
| **Create** a customer | ✅ user, action='created', entity='customers', changes=[] |
| **Update** customer name + address | ✅ user, action='updated', entity='customers', changes=[{name}, {address}] |
| **Delete** a product | ✅ user, action='deleted', entity='products', changes=[] |
| **Create** a brand | ✅ user, action='created', entity='brands', changes=[] |
| **Update** salesman target | ✅ user, action='updated', entity='salesmen', changes=[{target}] |
| **View** a record | ❌ NOT logged (viewing is not tracked) |

### What entities are tracked

All master data tables:
- `customers`, `customer_addresses`
- `products`, `product_prices`, `product_discounts`
- `brands`, `product_categories`, `product_sub_categories`, `manufacturers`
- `suppliers`
- `salesmen`, `collectors`, `areas`
- `warehouses`, `warehouse_types`
- `banks`, `payment_terms`
- `trade_types`, `sub_trade_types`, `distribution_types`
- `outlet_types`, `outlet_groups`, `outlet_group_types`
- `price_tiers`, `discount_codes`, `units_of_measure`
- `tax_registrations`, `cost_types`

---

## 6. API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/audit-logs?entity=&entityId=&action=&userId=&from=&to=&page=1&pageSize=20` | Search audit logs |
| `GET` | `/api/audit-logs/:id` | Single log detail |

Both endpoints are restricted to Developer and SuperAdmin only.

### GET /api/audit-logs?entity=customers&entityId=xxx

Response:
```json
{
  "items": [
    {
      "id": "uuid",
      "userName": "Super Admin",
      "userEmail": "superadmin@jaza.local",
      "action": "updated",
      "entity": "customers",
      "entityCode": "CUST001",
      "changes": [
        { "field": "address", "oldValue": "Jl. Lama No 1", "newValue": "Jl. Baru No 10" },
        { "field": "phone1", "oldValue": "08123456789", "newValue": "08987654321" }
      ],
      "createdAt": "2026-05-18T10:30:00Z"
    }
  ],
  "totalCount": 1,
  "page": 1,
  "pageSize": 20
}
```

---

## 7. UI Behavior

### System Audit Page (`/system/audit-history`)

```
┌──────────────────────────────────────────────────────────────┐
│ Audit History                                                 │
│                                                               │
│ Entity: [All ▼]   Action: [All ▼]   From: [📅] To: [📅]     │
│ 🔍 [Search by entity code or user name]                      │
│                                                               │
│ ┌──────────┬──────────┬────────┬────────┬──────────┬────────┐ │
│ │ Date     │ User     │ Action │ Entity │ Code     │        │ │
│ ├──────────┼──────────┼────────┼────────┼──────────┼────────┤ │
│ │ 18/5 10:│ SuperAdm │ ✏️ Edit│ Cust   │ CUST001  │ 📋     │ │
│ │ 30      │          │        │        │          │        │ │
│ │ 18/5 09:│ developer│ 🗑️ Del │ Prod   │ PRD-0123 │ 📋     │ │
│ │ 15      │          │        │        │          │        │ │
│ │ 17/5 16:│ SuperAdm │ ➕ New │ Brand  │ BRAND-AB │ 📋     │ │
│ │ 00      │          │        │        │          │        │ │
│ └──────────┴──────────┴────────┴────────┴──────────┴────────┘ │
│                                                               │
│                     ← 1  2  3 →                               │
└──────────────────────────────────────────────────────────────┘
```

### Detail Modal (click 📋)

```
┌─────────────────────────────────────────────┐
│ Audit Detail                                 │
│                                              │
│ Action:  Updated                             │
│ Entity:  Customer                            │
│ Code:    CUST001                             │
│ By:      Super Admin (superadmin@jaza.local) │
│ When:    18 May 2026, 10:30 AM               │
│ IP:      192.168.1.100                       │
│                                              │
│ Changed Fields:                               │
│ ┌──────────┬──────────────┬────────────────┐ │
│ │ Field    │ Old Value    │ New Value      │ │
│ ├──────────┼──────────────┼────────────────┤ │
│ │ Address  │ Jl. Lama 1   │ Jl. Baru 10    │ │
│ │ Phone1   │ 08123456789  │ 08987654321    │ │
│ └──────────┴──────────────┴────────────────┘ │
│                                              │
│ [Close]                                      │
└─────────────────────────────────────────────┘
```

### Per-Record Audit Button

On every master data detail page, add an **"Audit History"** button in the header area:

```
[Customer: CUST001 - Toko ABC]    [Edit] [Delete] [📋 Audit History]
```

Clicking it filters the audit log to only show changes for that specific record.

---

## 8. Who Can View

| Role | View audit logs | View per-record audit |
|------|----------------|----------------------|
| Developer | ✅ | ✅ |
| SuperAdmin | ✅ | ✅ |
| Admin (any) | ❌ (grayed out in sidebar) | ❌ (button hidden) |
| Sales | ❌ | ❌ |

The audit log page is under `/system/` and visible only to Developer and SuperAdmin.

---

## 9. Implementation Notes

### Backend
- Add an `AuditSaveChangesInterceptor` in EF Core that hooks into `SaveChangesAsync` 
- Before each save, capture the `EntityEntry` changes (old values, new values)
- After save, write to `audit_logs` table
- The current user context (`ICurrentUser`) provides UserId, IP, UserAgent

### Frontend
- The audit history page is a separate component under System
- Per-record audit button can be a reusable component added to any detail form
- When the audit is viewed for a deleted record, show "Record has been deleted" as the entity name

---

## 10. Acceptance Criteria
- [ ] Every create/update/delete on master data logs to `audit_logs`
- [ ] Audit log shows: user, action, entity, entity code, timestamp, IP
- [ ] Updates capture which specific fields changed (old → new)
- [ ] Audit page accessible to Developer + SuperAdmin at `/system/audit-history`
- [ ] Per-record "Audit History" button on every detail page
- [ ] Filters: entity, action, date range, search
- [ ] Audit records persist even if the user is deleted (`ON DELETE SET NULL`)
- [ ] View actions are NOT logged (only creates, updates, deletes)
