# BRD: Jaza Venus — Warehouse Management System

## 1. Executive Summary

Jaza currently runs a warehouse and distribution management application built on **Windows XP**, written in **VB** with **SQL Server**. The system cannot be updated, cannot run on modern operating systems, and has no path forward for maintenance.

We are replacing it with **Jaza Venus** — a modern web-based application with one overriding principle: **the new system must work exactly like the old one, just better**. Same workflows, same menu names, same reports. Staff should not need retraining. On top of that foundation, we add improvements: 1-step invoicing, audit trail, role-based access, Bahasa Indonesia support, and SFA integration.

## 2. Current Problems (Pain Points)

| # | Problem | Who is affected? | Severity |
|---|---------|-----------------|----------|
| 1 | Application runs on Windows XP — no longer supported, no security updates | All staff | **Critical** |
| 2 | Tech stack (VB + old SQL Server) cannot be updated or maintained | IT / Developer | **Critical** |
| 3 | Invoice creation takes 3 separate steps; revisions require repeating all 3 | Sales / Finance staff | **High** |
| 4 | No audit trail — impossible to know who created, edited, or deleted a record | SuperAdmin / Management | **High** |
| 5 | No role-based access — everyone with access sees everything | Management | **Medium** |
| 6 | No localization — application is locked to one language | All non-English staff | **Medium** |
| 7 | Large historical data with no archiving strategy — performance degrades over time | All users | **Medium** |
| 8 | No error monitoring — bugs go undetected until users report them | Developer | **Low** |

## 3. Business Goals

### 🎯 Goal #1 — Business Continuity: Zero Disruption (Must Have)

> **The most important goal: the new system must run exactly like the old one. No broken flows. No missing features. No downtime.**

- [ ] **Every feature migrated** — 100% of what the old VB application does, the new app does too
- [ ] **All workflows unchanged** — purchase, sales, inventory, invoicing, A/R, and reporting flows work exactly the same
- [ ] **Same labels and menu names** — staff do not need to relearn anything; the menu structure mirrors the old app
- [ ] **All legacy data migrated intact** — every record from the old SQL Server moves to the new system with zero data loss
- [ ] **Business keeps running during cutover** — no disruption to daily warehouse operations when switching

### 🎯 Goal #2 — Modernize the Foundation (Must Have)

> **Replace the aging technology so the application can be maintained and secure for the next 10+ years.**

- [ ] **Maintainable forever** — PostgreSQL 17 + .NET 10 LTS + React 19, all chosen for long-term stability
- [ ] **Fast and secure** — pages load faster than the old desktop app, data encrypted, security meets web standards
- [ ] **Accessible from anywhere** — works on any device with a browser (laptop, tablet, phone)

### 🎯 Goal #3 — Improvements (Must Have)

> **Fix the biggest pain points the current system has.**

- [ ] **Invoice flow simplified** — reduce from 3 steps to 1 step for both creation and revision
- [ ] **Role-based access** — Developer (error logs), SuperAdmin (all access except logs), Admin (selected pages), Sales (limited pages)
- [ ] **Full audit trail** — every create, edit, and delete records who did it and when (prevent internal fraud)
- [ ] **5-year active data** — only the last 5 years of data is active; older data archived but still accessible
- [ ] **Bahasa Indonesia + English** — user can switch language at any time
- [ ] **SFA integration** — invoices created by vendor SFA systems automatically sync into Jaza Venus

## 4. Who Will Use This?

| Role | Estimated Users | Access Level |
|------|----------------|-------------|
| **Developer** | 1–2 | Full technical access + error log monitoring page (no business data changes) |
| **SuperAdmin** | 1–2 | All business pages, user management, system settings (NO access to error logs) |
| **Admin** | 3–5 | Selected pages (to be defined per module) |
| **Operator / Sales** | 15–20 | Day-to-day operational pages only (to be defined per module) |
| **Finance** | 3–5 | A/R, invoices, payment-related pages |
| **Warehouse** | 10–15 | Inventory, receiving, stock movements |

**Total users**: ~35–50 concurrent during business hours.

## 5. Scope

### Phase 1 — Core Replacement (Now)

**Master Data**
- [ ] Employee master
- [ ] Customer master + outlet classifications (class, group, location, market type, channel, type, salesman, collector, sales area)
- [ ] Product master + classifications (brand, category, sub-category, price, discount, warehouse location, warehouse type, UOM)
- [ ] Supplier / Principle master
- [ ] Bank master
- [ ] Tax registration master
- [ ] Payment terms master
- [ ] Cost types master

**Purchase Transaction**
- [ ] Purchase Order
- [ ] Receiving Entry (GRN)
- [ ] Purchase Return

**Sales Transaction**
- [ ] Sales Order
- [ ] Sales Confirmation
- [ ] Sales Return
- [ ] **Invoicing Process** (simplified from 3 steps to 1 step)
- [ ] **SFA Invoice Receiving** — third-party vendor sales staff create invoices in their SFA system; those invoices are automatically sent to and recorded in Jaza Venus

**Inventory Transaction**
- [ ] Incoming Transaction (BPB)
- [ ] Outgoing Transaction (BBK)
- [ ] Inter-Warehouse Transfer
- [ ] Stock Taking (preparation + recording)

**A/R Transaction**
- [ ] Bank Transfer Transaction
- [ ] PDC Clearance Transaction
- [ ] PDC Clearance Cancellation

**Reports**
- [ ] Sales reports (all legacy report types)
- [ ] Inventory reports
- [ ] Purchase reports
- [ ] A/R reports
- [ ] Tax form reports

**System**
- [ ] Login / Logout
- [ ] Change password
- [ ] Role management
- [ ] User management
- [ ] Audit log viewer (SuperAdmin only)
- [ ] Error log viewer (Developer only)
- [ ] Preferences / settings
- [ ] Closing A/R entry
- [ ] Recalculate A/R balance
- [ ] Delete cancelled documents

**Cross-Cutting**
- [ ] Full audit trail (who did what, when)
- [ ] Localization (Bahasa Indonesia + English)
- [ ] 5-year active data policy with archiving
- [ ] Legacy data migration from old SQL Server
- [ ] SFA integration layer — standard API endpoint to receive invoices from any third-party SFA vendor
- [ ] Dashboard with daily summary

### Phase 2 — Future (Out of Scope Now)

- [ ] Mobile barcode scanning
- [ ] Customer self-service portal
- [ ] Supplier portal
- [ ] Integration with accounting software
- [ ] AI demand forecasting
- [ ] Mobile app (Android / iOS)

## 6. Key Improvements Over Legacy System

| Legacy Behavior | New Behavior |
|----------------|-------------|
| Invoice creation: 3 separate steps | Invoice creation: **1 step** |
| Invoice revision: repeat all 3 steps | Invoice revision: **1 step** |
| No audit trail | **Every action logged** with user, timestamp, IP |
| Everyone sees everything | **Role-based access** — each role sees only their pages |
| One language only | **Bahasa Indonesia + English**, switchable |
| All data active forever | **5-year active data**, older data archived |
| No error monitoring | **Developer dashboard** for API error logs |
| No SFA integration — invoices only created inside the system | **SFA invoice receiving** — third-party vendor invoices sync automatically into Jaza Venus |
| Windows XP desktop only | **Web browser** — any device, any modern OS |

## 7. Constraints & Risks

| Constraint / Risk | Impact | Mitigation |
|------------------|--------|------------|
| Legacy SQL Server database has large historical data | Migration may be slow; data may have inconsistencies | Use ETL tool (Jaza.Migration); run test migration first; archive data > 5 years during migration |
| Staff accustomed to old VB workflow for 10+ years | Resistance to change if UI differs | Match legacy labels, menu structure, and workflow exactly; only improve where specified |
| Some branch offices have slow internet | Pages must load on low bandwidth | Lightweight frontend; pagination; minimize data per request |
| Financial data — fraud risk from inside | Insiders could manipulate records | Audit trail captures every action; role-based access limits who can do what |
| .NET + React stack must be maintainable forever | Technology choices must age well | .NET LTS versions only; React with stable ecosystem; avoid trendy/short-lived libraries |
| Data > 5 years must remain accessible for audit | Archived data cannot slow down daily operations | Archive to separate read-only database or compressed files; accessible via separate query |
| Third-party SFA vendors may send invoices in different formats | Incompatible data causes sync failures | Define a standard JSON schema for inbound invoices; validate on receipt; log all sync attempts |

## 8. Technical Requirements (Summary)

| Requirement | Decision |
|------------|---------|
| **Backend** | .NET 10 LTS (ASP.NET Core + EF Core) |
| **Frontend** | React 19 + TypeScript + Vite + TailwindCSS |
| **Database** | PostgreSQL 17 |
| **Auth** | ASP.NET Core Identity + cookie sessions + MFA for SuperAdmin |
| **Hosting** | Docker on Linux VPS (Caddy reverse proxy + Cloudflare CDN) |
| **Localization** | i18n framework (Bahasa Indonesia + English) |
| **Audit Trail** | Append-only audit log table |
| **Archiving** | Data > 5 years moved to archive storage; accessible read-only |

*See `docs/architecture.md` and `docs/security-performance-guide.md` for full details.*

## 9. Success Metrics

- [ ] 100% of legacy features available in new system
- [ ] All legacy data migrated with zero loss
- [ ] Invoice processing time reduced by 60%+ (3 steps → 1 step)
- [ ] All 35–50 staff can log in and complete daily tasks
- [ ] Training time under 1 hour per person
- [ ] Page load under 2 seconds on 10 Mbps connection
- [ ] Audit trail captures 100% of write actions
- [ ] System available in Bahasa Indonesia and English
- [ ] Zero data loss during migration from old system
- [ ] No security breaches in first 12 months
- [ ] SFA invoice sync works within 60 seconds of vendor submission
- [ ] Penetration test passed with zero critical or high findings before go-live

## 10. Timeline

Target go-live: **Q1 2027 (January–February)**

| Milestone | Timeline | Deliverable |
|-----------|----------|------------|
| **POC** | May–Jun 2026 | Working frontend with all screens navigable; client reviews UI/UX |
| **Core modules** | Jul–Aug 2026 | Master data + Purchase + Sales + Inventory modules operational with real API |
| **Invoicing + SFA + Reports** | Sep–Oct 2026 | Simplified 1-step invoice flow; SFA invoice receiving endpoint; all reports |
| **Audit trail + Roles + i18n** | Jan 2027 | Full audit logging on every write action; role-based access enforced; Bahasa + English |
| **Data migration + Archiving** | Jan 2027 | ETL from legacy SQL Server completed and verified; data > 5 years archived |
| **Security hardening + Penetration testing** | Jan 2027 | Rate limiting, IP whitelisting, CSP, encryption, WAF, OWASP ZAP full scan; fix all findings |
| **User acceptance testing (UAT) + Training** | Jan 2027 | Real users test with real data; bug fixes; training sessions by role |
| **Go-live + cutover** | Feb 2027 | Cutover from legacy system; 2-week hyper-care support; daily backup verification |

## 11. Budget (Estimate)

| Item | Estimated Cost |
|------|---------------|
| Development (in-house or contractor) | TBD |
| Hosting — Year 1 | ~$432 ($36/month × 12) |
| Domain name | ~$15/year |
| Cloudflare (CDN + WAF) | Free |
| SSL Certificate | Free (Let's Encrypt via Caddy) |
| **Infrastructure Total Year 1** | **~$450** |

*See `docs/deployment-hosting.md` for detailed hosting comparison.*

## 12. Sign-Off

| Name | Role | Date | Signature |
|------|------|------|-----------|
| | Project Sponsor | | |
| | Warehouse Manager | | |
| | Finance Manager | | |
| | IT Manager / Developer | | |
