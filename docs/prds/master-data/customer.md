# PRD: Customer & Outlet Classifications

## 1. Summary

Customer management with 10 sub-pages for outlet classifications. Customers are the core master data — linked to salesmen, collectors, areas, warehouses, payment terms, and price tiers.

## 2. Routes

| Screen | Route | Tab |
|--------|-------|-----|
| Master Customer | `/master/customer/master-customer` | Customer list |
| Class Outlet | `/master/customer/class-outlet` | Pricing class |
| Group Outlet | `/master/customer/group-outlet` | Outlet groups |
| Location Outlet | `/master/customer/location-outlet` | Distribution types |
| Market Type | `/master/customer/market-type` | Trade types |
| Channel Outlet | `/master/customer/channel-outlet` | Sub-trade types |
| Outlet Type | `/master/customer/outlet-type` | Outlet type categories |
| Salesman | `/master/customer/salesman` | Sales staff |
| Collector | `/master/customer/collector` | Debt collectors |
| Sales Area | `/master/customer/sales-area` | Geographic areas |

These are tabs under `/master/customer`. All share the same permission (Master access).

## 3. Data Models

### 3.1 Master Customer

```ts
interface Customer {
  id: string;
  code: string;              // CustmrCode (varchar 15)
  name: string;               // CustmrName
  address: string;
  city: string;
  state: string;
  zip_code: string;
  area_code: string;          // FK → areas
  phone1: string;
  phone2: string;
  fax: string;
  email: string;
  contact_person: string;
  npwp_number: string;        // Tax ID
  npwp_date: string;
  pkp_number: string;
  pkp_date: string;
  notes: string;
  balance: number;            // AR balance (read-only, computed)
  credit_limit: number;
  salesman_code: string;      // FK → salesmen
  collector_code: string;     // FK → collectors
  distribution_type: string;  // FK → distribution_types
  trade_type: string;         // FK → trade_types
  outlet_type: string;        // FK → outlet_types
  outlet_group_code: string;  // FK → outlet_groups
  outlet_group_type: string;  // FK → outlet_group_types
  payment_term: string;       // FK → payment_terms
  discount_code: string;      // FK → discount_codes
  warehouse_code: string;     // FK → warehouses (default)
  price_tier: string;         // FK → price_tiers
  is_locked: boolean;
  is_active: boolean;
  registered_at: string;
}
```

### 3.2 Customer Address

```ts
interface CustomerAddress {
  id: string;
  customer_id: string;
  address_code: string;       // AddrCode (char 8)
  address_name: string;       // AddrName
  address: string;
  city: string;
  state: string;
  zip_code: string;
  area_code: string;
  phone1: string;
  phone2: string;
  fax: string;
  email: string;
  contact_person: string;
}
```

### 3.3 Salesman

```ts
interface Salesman {
  id: string;
  code: string;               // SlPrsnCode (char 2)
  name: string;               // SlPrsnName
  target: number;             // SlTarget
  amount: number;             // SlAmount (achieved)
}
```

### 3.4 Collector

```ts
interface Collector {
  id: string;
  code: string;               // ClctrCode (char 2)
  name: string;               // ClctrName
  target_01 through target_12: number;  // Monthly collection targets
}
```

### 3.5 Area

```ts
interface Area {
  id: string;
  code: string;               // AreaCode (char 2)
  name: string;               // Dscription
}
```

### 3.6 Lookup Tables (Class Outlet, Group Outlet, etc.)

```ts
// All lookup tables share this pattern:

interface LookupTable {
  id: string;
  code: string;               // 2-3 char code
  name: string;                // Display name
}

// Specific tables:
// Class Outlet → class_parameters (ClassCode, Parameter0-9 for pricing)
// Group Outlet → outlet_groups (GrpOltCode)
// Location Outlet → distribution_types (DstrbnType)
// Market Type → trade_types (TradeType)
// Channel Outlet → sub_trade_types (SubTradeType)
// Outlet Type → outlet_types (OutletType)
// Outlet Group Type → outlet_group_types (GrpOltTypeCode)
```

### 3.7 Class Parameter (Pricing Class)

```ts
interface ClassParameter {
  id: string;
  code: string;               // ClassCode (char 2)
  parameter_0: number;         // Price multiplier 0
  parameter_1: number;         // Price multiplier 1
  parameter_2: number;
  parameter_3: number;
  parameter_4: number;
  parameter_5: number;
  parameter_6: number;
  parameter_7: number;
  parameter_8: number;
  parameter_9: number;
}
```

## 4. Database Tables (PostgreSQL)

| Table | Legacy Source | Rows |
|-------|-------------|------|
| `customers` | `Customer` | 17,539 |
| `customer_addresses` | `CustomerAddress` | 17,576 |
| `salesmen` | `Salesman` | 256 |
| `collectors` | `Collector` | 1 |
| `areas` | `Area` | 16 |
| `outlet_types` | `OutletType` | 22 |
| `outlet_groups` | `GroupOutlet` | 4 |
| `outlet_group_types` | `GroupOutletType` | 10 |
| `distribution_types` | `DistributionType` | 3 |
| `trade_types` | `TradeType` | 4 |
| `sub_trade_types` | `SubTradeType` | 4 |
| `class_parameters` | `ClassParameter` | 2 |

## 5. What Users Can Do

| Action | Developer | SuperAdmin | Admin (Master access) | No Master access |
|--------|-----------|------------|----------------------|-----------------|
| View list | ✅ | ✅ | ✅ | ❌ (grayed out) |
| Search/Filter | ✅ | ✅ | ✅ | ❌ |
| Create | ✅ | ✅ | ✅ | ❌ |
| Edit | ✅ | ✅ | ✅ | ❌ |
| Delete | ✅ | ✅ | ❌ (hidden) | ❌ |
| View address sub-tab | ✅ | ✅ | ✅ | ❌ |
| Add/Edit addresses | ✅ | ✅ | ✅ | ❌ |

**Master access users:** Didi, Pai, Nenden, Atep, Alvin — can create + edit but NOT delete.
**No Master access:** Yane, Ilham, Robby, Nisa — sidebar grayed out.

## 6. UI Behavior

### Master Customer Tab (Default)
- Table: Code, Name, City, Area, Phone, Credit Limit, Balance, Status (Active/Locked)
- Search by code or name
- Click row → detail view with editable fields + address sub-list
- "New Customer" button (top-right)
- Address sub-tab within the customer dialog

### Lookup Tabs (Salesman, Area, etc.)
- Simple table: Code, Name
- Create/Edit dialog: just Code + Name fields
- For Collector: also monthly target fields (12)
- For Class Outlet: parameter multipliers (10)

### Role-Based:
- Delete buttons HIDDEN for Admin-role users (even with Master access)
- Create/Edit buttons visible for all with Master access
- Sidebar completely grayed out for users without Master access

## 7. API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/customers?search=&page=&pageSize=` | List with pagination |
| `GET` | `/api/customers/:id` | Detail + addresses |
| `POST` | `/api/customers` | Create |
| `PUT` | `/api/customers/:id` | Update |
| `DELETE` | `/api/customers/:id` | Delete (Dev/SuperAdmin only) |
| `GET` | `/api/customers/:id/addresses` | List addresses |
| `POST` | `/api/customers/:id/addresses` | Add address |
| `PUT` | `/api/customers/:id/addresses/:addrId` | Update address |
| `DELETE` | `/api/customers/:id/addresses/:addrId` | Delete address |

### Lookup Endpoints (shared pattern)

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/salesmen?search=&page=` | List |
| `POST` | `/api/salesmen` | Create |
| `PUT` | `/api/salesmen/:id` | Update |
| `DELETE` | `/api/salesmen/:id` | Delete (Dev/SuperAdmin only) |

Same pattern for: `/api/collectors`, `/api/areas`, `/api/outlet-types`, `/api/outlet-groups`, `/api/outlet-group-types`, `/api/distribution-types`, `/api/trade-types`, `/api/sub-trade-types`, `/api/class-parameters`

## 8. History / Audit
Every create, update, and delete on customer records, addresses, salesmen, collectors, areas, and all customer-related lookup tables is logged to `audit_logs`. Developer and SuperAdmin can view the full change history at `/system/audit-history` or click the "Audit History" button on any detail page. See `docs/prds/master-data/audit-history.md` for full spec.

## 9. Acceptance Criteria
- [ ] Customer list loads with search, pagination, and all fields shown
- [ ] Customer addresses open as sub-list within customer detail
- [ ] All 10 tabs under Customer render correctly
- [ ] Lookup tabs (Salesman, Area, etc.) — simple CRUD with Code + Name
- [ ] Delete button hidden for Admin-role users; visible for Dev/SuperAdmin
- [ ] Create/Edit visible for all Master-access users
- [ ] Sidebar grayed out for users without Master access
- [ ] Collector tab shows 12 monthly target fields
- [ ] Class Outlet tab shows 10 parameter multiplier fields
- [ ] Customer balance is read-only (computed from AR)
