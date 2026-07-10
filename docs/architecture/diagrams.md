# Architecture Diagrams — Jaza Venus

Extends [architecture.md](../architecture.md) with C4, domain, sequence, and deployment views.

---

## 1. C4 Context

```mermaid
flowchart TB
  subgraph users [Users]
    SalesOp[Sales Operator]
    WHOp[Warehouse Operator]
    Admin[SuperAdmin]
  end

  subgraph jaza [Jaza Venus System]
    JazaApp[Jaza Venus Web App]
  end

  subgraph external [External Systems]
    LegacyDB[(Legacy SQL Server)]
    Neon[(Neon PostgreSQL)]
    Cloudflare[Cloudflare CDN/WAF]
  end

  SalesOp --> JazaApp
  WHOp --> JazaApp
  Admin --> JazaApp
  JazaApp --> Neon
  JazaApp -.->|ETL one-time| LegacyDB
  Cloudflare --> JazaApp
```

---

## 2. C4 Container

```mermaid
flowchart TB
  subgraph browser [Browser]
    SPA[React SPA Vite]
  end

  subgraph api_host [Jaza.Api ASP.NET Core]
    Controllers[Controllers]
    Middleware[Security Middleware]
    Static[wwwroot SPA fallback]
  end

  subgraph app_layer [Application Layer]
    Validators[FluentValidation]
    Services[StockService PermissionService]
    DTOs[DTOs Interfaces]
  end

  subgraph infra [Infrastructure]
    EF[EF Core AppDbContext]
    Identity[ASP.NET Identity]
    Audit[AuditSaveChangesInterceptor]
  end

  subgraph data [Data]
    PG[(PostgreSQL Neon)]
  end

  subgraph jobs [Offline]
    ETL[Jaza.Migration ETL Console]
  end

  SPA --> Controllers
  Controllers --> Validators
  Controllers --> Services
  Services --> EF
  EF --> PG
  Identity --> PG
  Audit --> PG
  ETL --> PG
  ETL -.-> Legacy[(Legacy SQL Server)]
  Middleware --> Controllers
  Static --> SPA
```

---

## 3. Domain module map

```mermaid
flowchart TB
  subgraph master [Master Data]
    Customer
    Item
    Supplier
    Warehouse
    RefData[Reference Tables]
  end

  subgraph inbound [Inbound]
    PO[PurchaseOrder]
    GRN[GoodsReceiptNote]
  end

  subgraph outbound [Outbound]
    SO[SalesOrder]
    DO[DeliveryOrder]
  end

  subgraph invoicing [Invoicing]
    INV[Invoice]
    PAY[Payment]
  end

  subgraph stock [Stock]
    SM[StockMovement]
    SOH[StockOnHand]
  end

  subgraph auth [Auth]
    User[AppUser]
    Perm[UserModulePermission]
  end

  PO --> GRN
  GRN --> SM
  SO --> DO
  DO --> SM
  DO --> INV
  INV --> PAY
  SM --> SOH
  Customer --> SO
  Customer --> INV
  Item --> SO
  Item --> PO
  Warehouse --> SM
```

---

## 4. Request / auth sequence

```mermaid
sequenceDiagram
  participant Browser
  participant API as Jaza.Api
  participant Identity
  participant DB

  Browser->>API: GET /api/auth/antiforgery
  API-->>Browser: XSRF cookie + token

  Browser->>API: POST /api/auth/login + XSRF
  API->>Identity: Validate credentials
  Identity->>DB: Check lockout MFA
  API-->>Browser: Auth cookie HttpOnly

  Browser->>API: GET /api/auth/me
  API->>DB: Resolve permissions
  API-->>Browser: User + modules + reports

  Browser->>API: POST /api/outbound/sales-orders + XSRF
  API->>API: Authorize RequireOperator
  API->>DB: Create document
  API-->>Browser: 201 Created
```

---

## 5. Deployment topology

```mermaid
flowchart TB
  User[User Browser] --> CF[Cloudflare]
  CF --> Caddy[Caddy Reverse Proxy TLS]
  Caddy --> API[Jaza.Api Container]
  API --> Neon[(Neon PostgreSQL pooler)]
  API --> Logs[Serilog File or Seq]

  subgraph ci [CI CD]
    GH[GitHub Actions] --> Build[dotnet publish npm build]
    Build --> Fly[Fly.io or Azure]
    Fly --> API
  end
```

| Environment | Frontend | Backend | Database |
|-------------|----------|---------|----------|
| Local dev | Vite :5173 | Kestrel :5000 | Docker PostgreSQL or Neon |
| Production | Served from wwwroot | Fly.io / Azure App Service | Neon serverless PG |

See [deployment-hosting.md](../deployment-hosting.md), [runbook.md](../runbook.md).

---

## 6. Layer dependency rules

```mermaid
flowchart LR
  Domain[Jaza.Domain] 
  Application[Jaza.Application]
  Infrastructure[Jaza.Infrastructure]
  Api[Jaza.Api]

  Application --> Domain
  Infrastructure --> Application
  Infrastructure --> Domain
  Api --> Application
  Api --> Infrastructure
```

- **Domain:** entities, enums, no infrastructure references.
- **Application:** DTOs, validators, interfaces.
- **Infrastructure:** EF, Identity, external services.
- **Api:** HTTP, middleware, DI composition root.

---

## Related

- [architecture.md](../architecture.md)
- [security.md](../security.md)
- [http-api.md](../http-api.md)
