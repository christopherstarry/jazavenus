# Offline Architecture — Jaza Venus

## Problem

Warehouse operations in Indonesia face unreliable internet connections. Outages lasting **hours** are common. Workers on **desktop computers** need full application functionality (master data + transactions) during internet downtime.

---

## Option 1: Electron Desktop App + Local SQLite + Background Sync

### Architecture

```
┌─────────────────────────────────────────────────┐
│           DESKTOP (Windows) — Electron            │
│                                                   │
│  ┌─────────────────────────────────────────────┐  │
│  │         Electron Shell                      │  │
│  │  ┌────────────────────────────────────┐     │  │
│  │  │  React Frontend (same code)         │     │  │
│  │  │  - Same UI, pages, components       │     │  │
│  │  │  - api client points to localhost    │     │  │
│  │  └────────────────────────────────────┘     │  │
│  │  ┌────────────────────────────────────┐     │  │
│  │  │  Local Express API (Node.js)        │     │  │
│  │  │  - Same REST endpoints + DTOs       │     │  │
│  │  │  - Runs as child process            │     │  │
│  │  │  - Port 3001 (internal)             │     │  │
│  │  └────────────────────────────────────┘     │  │
│  │  ┌────────────────────────────────────┐     │  │
│  │  │  SQLite Database (better-sqlite3)   │     │  │
│  │  │  - Same schema as PostgreSQL         │     │  │
│  │  │  - File: %APPDATA%/jaza-venus/db    │     │  │
│  │  │  - Auto-created on first launch     │     │  │
│  │  └────────────────────────────────────┘     │  │
│  │  ┌────────────────────────────────────┐     │  │
│  │  │  Sync Engine (background worker)    │     │  │
│  │  │  - Polls cloud every 60s when online │     │  │
│  │  │  - Tracks changes via sync_changes  │     │  │
│  │  │  - Push local changes to cloud      │     │  │
│  │  │  - Pull cloud changes to local      │     │  │
│  │  │  - Conflict resolution: last-write  │     │  │
│  │  └────────────────────────────────────┘     │  │
│  └─────────────────────────────────────────────┘  │
│                                                   │
│  ⇅ HTTPS (when internet available)               │
│                                                   │
└─────────────────────────────────────────────────┘
         │
         │
         ▼
┌─────────────────────────────────────────────────┐
│              CLOUD SERVER (Neon)                  │
│                                                   │
│  ┌─────────────────────────────────────────────┐  │
│  │  ASP.NET Backend (existing)                  │  │
│  │  - Same business logic                      │  │
│  │  - New: Sync API endpoints                  │  │
│  │  - New: sync_changes table                  │  │
│  └─────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────┐  │
│  │  PostgreSQL (Neon)                           │  │
│  │  - All data (master + transactions)          │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Components

#### 1. Electron Shell
- Wraps the existing Vite React build
- `main.js` spawns Express API as child process
- `preload.js` exposes IPC for status/sync
- Windows installer via electron-builder (NSIS)
- Tray icon showing sync status

#### 2. Local Express API
- Node.js + Express, same route structure
- Prisma ORM with SQLite provider
- Mirrors all ASP.NET endpoints and DTOs
- Authentication via bcrypt + JWT (local)
- Audit logging to local SQLite

#### 3. SQLite Database
- `better-sqlite3` (synchronous, fast)
- Same schema as PostgreSQL (adapted types)
  - `UUID` → `TEXT`
  - `timestamp with time zone` → `TEXT (ISO 8601)`
  - `numeric(18,4)` → `REAL`
- Created on first launch via Prisma migrations

#### 4. Sync Engine
- `sync_changes` table tracks every mutation:
  ```sql
  CREATE TABLE sync_changes (
    id TEXT PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL, -- 'CREATE' | 'UPDATE' | 'DELETE'
    data JSON NOT NULL,
    changed_at TEXT NOT NULL,
    synced_at TEXT
  );
  ```
- **Push**: SELECT changes WHERE synced_at IS NULL → POST to cloud → mark synced
- **Pull**: GET cloud changes since last_sync_at → INSERT/UPDATE/DELETE locally
- **Conflict**: Last-write-wins (compare changed_at timestamps)
- Runs every 60 seconds when internet is detected
- Retries with exponential backoff on failure

#### 5. Cloud Sync API (new endpoints on ASP.NET)
```
POST /api/sync/push      — Receive local changes
GET  /api/sync/pull      — Send cloud changes since timestamp
GET  /api/sync/status    — Server-side sync status (pending changes)
```

### Data Flow

```
CREATE Customer (offline):
  Frontend → POST /api/customers → Local Express → SQLite INSERT
    → sync_changes INSERT { table: "customers", action: "CREATE" }
    → Sync Engine picks up → POST /api/sync/push
    → Cloud applies → marks synced

UPDATE Product (online):
  Frontend → PUT /api/items/123 → Local Express → SQLite UPDATE
    → sync_changes INSERT { table: "items", action: "UPDATE" }
    → Sync Engine immediately pushes → Cloud applies

DELETE Brand (offline):
  Frontend → DELETE /api/brands/456 → Local Express → soft delete
    → sync_changes INSERT { table: "brands", action: "DELETE" }
    → Sync Engine pushes when online
```

### Key Backend Changes Required

| Change | Description |
|--------|-------------|
| `sync_changes` table | Track mutations with timestamps |
| `SyncController.cs` | Push/pull/status endpoints |
| `LastSyncedAt` per machine | Track what each desktop has synced |
| `X-Machine-Id` header | Identify which desktop instance |

### Deployment

```bash
# Build desktop app (Windows)
npm run build          # Vite build
npx electron-builder   # Create .exe installer

# Installer creates:
#   C:/Program Files/Jaza Venus/
#   %APPDATA%/jaza-venus/db/jaza.db
#   %APPDATA%/jaza-venus/config.json
```

### Estimated Effort: 4-5 weeks

| Phase | Tasks | Time |
|-------|-------|------|
| 1 | Electron shell + Local Express API + SQLite schema | 2-3 weeks |
| 2 | Sync engine + cloud sync API + conflict resolution | 1-2 weeks |
| 3 | Testing + installer + deployment | 1 week |

---

## Option 2: Hybrid PWA + Local Caching (Lighter Offline)

For scenarios where **full offline transactions are not critical** but the app should remain usable during brief outages.

### Architecture

```
┌─────────────────────────────────┐
│         WEB BROWSER              │
│                                  │
│  ┌─────────────────────────────┐│
│  │  Service Worker              ││
│  │  - Caches app shell (UI)     ││
│  │  - Caches API responses      ││
│  │  - Returns cached data when  ││
│  │    offline                   ││
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │  IndexedDB                   ││
│  │  - Reference data cache      ││
│  │  - Transaction queue         ││
│  │  - Read-only when offline    ││
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │  Network Status Indicator    ││
│  │  - Top banner: "You are     ││
│  │    offline"                  ││
│  │  - Writes disabled           ││
│  │  - Read-only mode            ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

### Behavior

| Status | Reads | Writes |
|--------|-------|--------|
| Online | Live API (as now) | Normal |
| Offline | Cached reference data | Blocked — show banner |

### What Gets Cached

- **App shell**: All JS, CSS, HTML via Service Worker
- **Reference data**: Brands, Banks, Categories, Products, Customers, Suppliers, etc. (cached on first load, refreshed periodically)
- **Not cached**: Transactional data (orders, invoices, payments) — these require internet

### Key Changes

| Change | Effort |
|--------|--------|
| Register Service Worker | 1 day |
| Add `manifest.json` for PWA install prompt | 0.5 day |
| Cache reference API responses via Service Worker | 1 day |
| Add offline banner component | 0.5 day |
| Disable write buttons when offline | 0.5 day |
| Add `navigator.onLine` detection everywhere | 1 day |
| **Total** | **~4-5 days** |

### UX Changes

- Green dot / Red dot in header showing connection status
- Offline banner: "You are offline. Reference data is available. Saving is disabled."
- All Save/Create/Edit/Delete buttons disabled when offline
- Read-only mode for all data

---

## Comparison

| Criteria | Option 1: Electron Desktop | Option 2: Hybrid PWA |
|----------|---------------------------|---------------------|
| **Full offline operation** | ✅ Yes | ❌ Read-only |
| **Transactions offline** | ✅ Create, update, delete all data | ❌ Blocked |
| **Installation** | One-time `.exe` installer | Browser (pin to taskbar) |
| **Updates** | Auto-updater (electron-updater) | Auto via browser refresh |
| **Platforms** | Windows only | Any browser (phone too) |
| **Development time** | 4-5 weeks | 4-5 days |
| **Two backends** | Yes (Node.js + ASP.NET) | No (same backend) |
| **Sync engine** | Required | Not needed |
| **Conflict resolution** | Required | Not needed |

## Recommendation

- **Start with Option 2 (Hybrid PWA)** — it's fast to implement and solves "slow internet" problems. Workers can still view all data when offline.
- **Plan Option 1 for Phase 2** — build the Electron desktop app when full offline transactions become critical. The PWA serves as a bridge solution.

## Next Steps

1. [ ] Enable Service Worker and PWA manifest
2. [ ] Implement offline banner and read-only mode
3. [ ] Cache reference API responses
4. [ ] Test with simulated network conditions
5. [ ] Plan Electron desktop app based on usage feedback
