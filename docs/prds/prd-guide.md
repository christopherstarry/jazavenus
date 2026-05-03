# PRD Guide for AI — How to Write Specs AI Can Execute

This guide explains how to write a Product Requirements Document (PRD) that an AI coding assistant can read and turn into working code with minimal back-and-forth.

---

## Why Most PRDs Fail with AI

| Problem | Fix |
|---------|-----|
| Vague language ("nice to have", "modern look") | **Concrete descriptions** with exact labels, fields, behavior |
| Missing data shapes | **Define every field** — name, type, required, validation |
| No error/edge cases | **List empty, loading, error, and permission states** |
| No context on existing patterns | **Reference existing files/components** the AI should mimic |
| Too big (10+ features in one doc) | **One PRD per feature/module** — small and scoped |

---

## The PRD Template

Copy this structure for every feature. Fill in ALL sections — blank sections make AI guess, and guessing produces bad code.

```markdown
# PRD: [Feature Name]

## Summary
[2-3 sentences: what this feature does, who uses it, why it matters]

## Screens & URLs
| Screen | Route | Purpose |
|--------|-------|---------|
| List page | /master/customer/class-outlet | View all records, search, paginate |
| Create/Edit | /master/customer/class-outlet/new | Add or edit a record |

## Data Model
[Define the entity. Use TypeScript-like syntax for precision.]

```ts
interface ClassOutlet {
  id: string;              // GUID, generated server-side
  code: string;            // e.g. "A", "B", max 10 chars, unique
  description: string;     // e.g. "Class A - Modern Trade", max 100 chars
  createdAt: string;       // ISO 8601
  updatedAt: string;       // ISO 8601
}
```

## API Endpoints
[Define exact HTTP method, path, request/response shapes.]

| Method | Path | Purpose | Request Body | Response |
|--------|------|---------|-------------|----------|
| GET | /api/master/class-outlets?search=&page=1&pageSize=20 | List with search & pagination | — | `{ items: ClassOutlet[], total: number }` |
| POST | /api/master/class-outlets | Create | `{ code, description }` | `ClassOutlet` |
| PUT | /api/master/class-outlets/:id | Update | `{ code, description }` | `ClassOutlet` |
| DELETE | /api/master/class-outlets/:id | Delete | — | `204 No Content` |

## UI Behavior

### List Page
- [ ] **Header**: Title "Table of Class Outlet" + "New Class Outlet" button (top-right)
- [ ] **Search**: Input field above table, filters by `code` and `description` (debounced 300ms)
- [ ] **Table columns**: Code, Description (in that order)
- [ ] **Pagination**: 20 rows per page, page controls at bottom
- [ ] **Row actions**: Edit (pencil icon) and Delete (trash icon) on each row
- [ ] **Empty state**: "No class outlets found" illustration with "Create one" CTA
- [ ] **Loading state**: Skeleton table rows while fetching
- [ ] **Error state**: Inline error banner with retry button

### Create/Edit Dialog or Page
- [ ] **Title**: "New Class Outlet" / "Edit Class Outlet"
- [ ] **Fields**:
  - Code: text input, required, max 10 chars, auto-uppercased
  - Description: text input, required, max 100 chars
- [ ] **Validation errors**: Inline under each field, red border
- [ ] **Submit button**: "Save", disabled while submitting
- [ ] **Success**: Close dialog, refresh list, toast notification
- [ ] **Server error**: Error message shown in form

### Delete
- [ ] Confirmation dialog: "Delete [code] — [description]?"
- [ ] After delete: remove row from list, show success toast

## Permissions
- SuperAdmin: full CRUD
- Other roles: view only (no Create/Edit/Delete buttons shown)

## How This Matches Existing Patterns
- **List page pattern**: Follow `ClassOutletPage.tsx` in `src/features/customers/`
- **CRUD page pattern**: Follow `CrudPage.tsx` in `src/features/common/`
- **Table component**: Use `@/components/ui/table.tsx`
- **API client**: Use `import { api } from "@/lib/api"`, prefixUrl is `/api`
- **Module registration**: Add to `TREE` in `src/app/modules.tsx`

## Acceptance Criteria
1. User can view paginated list of class outlets
2. User can search by code or description
3. SuperAdmin can create, edit, delete
4. Non-admin users see list but no action buttons
5. All states handled: loading, empty, error, success
```

---

## Key Rules

1. **Always include Data Model** — AI needs to know exact field names and types.
2. **Always define API contracts** — even if backend isn't built yet, define the shape.
3. **List all UI states** — loading, empty, error, success. Don't make AI guess.
4. **Reference existing files** — tell AI what patterns/components to copy.
5. **One PRD per module** — don't combine Customer CRUD, Reports, and Auth in one doc.
6. **Use checkboxes** — `- [ ]` makes it easy to track what's done.
7. **Be explicit about routes** — AI needs exact paths to wire up navigation.
8. **Example data is gold** — show one real record so AI understands context.

---

## Jaza Venus Project Conventions (Reference)

When writing PRDs for this project, these are the conventions AI will follow:

| Convention | Details |
|-----------|--------|
| **Tech stack** | React 19 + TypeScript + Vite + TailwindCSS 4 + shadcn/ui |
| **Routing** | Defined via `TREE` in `src/app/modules.tsx` |
| **API client** | `ky`-based client at `src/lib/api.ts`, prefix `/api` |
| **Auth** | Cookie-based, `useAuth()` from `src/lib/auth.tsx` |
| **UI components** | All in `src/components/ui/` — table, dialog, button, input, etc. |
| **Feature pages** | Live in `src/features/[module]/` |
| **State management** | TanStack Query for server state, React hooks for local state |
| **Form handling** | react-hook-form + zod validation |
| **Icons** | lucide-react only |
| **Styling** | Tailwind utility classes, no CSS modules |
| **Tests** | Vitest for unit, Playwright for e2e |
```

---

## Real Example for This Project

Below is a real PRD for the **Purchase Order** screen — one of the modules already in the `TREE` but not yet implemented. An AI could build the entire thing from just this doc.

---

```markdown
# PRD: Purchase Order

## Summary
Allow users to create and manage purchase orders sent to suppliers. Each PO has a header (supplier, date, terms) and line items (products, quantities, prices). This is part of the Purchase Transaction module.

## Screen & URL
| Screen | Route |
|--------|-------|
| PO List | /purchase/purchase-order |
| Create PO | /purchase/purchase-order/new |
| Edit PO | /purchase/purchase-order/:id |

## Data Model

```ts
interface PurchaseOrder {
  id: string;
  poNumber: string;          // auto-generated, e.g. "PO-2026-0001"
  supplierId: string;
  supplierName: string;       // denormalized for display
  orderDate: string;          // ISO 8601 date
  expectedDate: string;
  termOfPayment: string;      // e.g. "Net 30", "Net 60"
  notes: string;
  status: "draft" | "submitted" | "received" | "cancelled";
  totalAmount: number;
  lineItems: PurchaseOrderLine[];
  createdAt: string;
  updatedAt: string;
}

interface PurchaseOrderLine {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;              // e.g. "PCS", "BOX"
  unitPrice: number;
  discountPercent: number;
  totalPrice: number;
}
```

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | /api/purchase-orders?search=&status=&page=1&pageSize=20 | List |
| GET | /api/purchase-orders/:id | Detail |
| POST | /api/purchase-orders | Create |
| PUT | /api/purchase-orders/:id | Update |
| PATCH | /api/purchase-orders/:id/status | Change status |

## UI Behavior

### List Page
- [ ] Header: "Purchase Order" + "New Purchase Order" button
- [ ] Search by PO number or supplier name
- [ ] Filter by status (dropdown: All, Draft, Submitted, Received, Cancelled)
- [ ] Table: PO #, Supplier, Date, Expected, Status (badge), Total
- [ ] Click row → navigate to `/purchase/purchase-order/:id`
- [ ] Pagination, loading skeleton, empty state

### Create/Edit Page
- [ ] Header section: Supplier dropdown (searchable), Order Date (date picker), Expected Date (date picker), Terms (dropdown), Notes (textarea)
- [ ] Line items table: Product (searchable dropdown), Qty, Unit (auto-filled), Price, Discount %, Total (auto-calculated)
- [ ] "Add Line" button appends a new row
- [ ] Delete button (trash icon) per line
- [ ] Running total at bottom
- [ ] Save as Draft / Submit buttons

## How This Matches Existing Patterns
- Import `{ api }` from `@/lib/api`
- Use `CrudPage` pattern from `src/features/common/CrudPage.tsx`
- Use `@/components/ui/table.tsx`, `@/components/ui/dialog.tsx`, `@/components/ui/button.tsx`
- React Hook Form + Zod for validation
- Register route in `src/app/modules.tsx` TREE

## Acceptance Criteria
1. List all POs with search, filter, pagination
2. Create PO with supplier, dates, line items
3. Edit existing PO
4. Line item totals auto-calculate
5. Status badges color-coded
6. All error/empty/loading states handled
```
