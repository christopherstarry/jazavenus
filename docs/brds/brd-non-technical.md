# BRD: Jaza Venus — Warehouse Management System

## 1. Executive Summary

Jaza currently runs a warehouse and distribution management application built on **Windows XP**, written in **VB** with **SQL Server**. The system cannot be updated, cannot run on modern operating systems, and has no path forward for maintenance. We are replacing it with **Jaza Venus** — a modern web-based application that replicates every existing feature, improves critical workflows, and is built on technology that can be maintained indefinitely.

The new system will be accessible from any device with a browser, provide an audit trail for all actions, support Bahasa Indonesia and English, and reduce invoice processing from 3 steps to 1.

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

### Primary Goals (Must Have)

- [ ] **Full migration** — every feature in the old application works in the new application
- [ ] **Zero workflow breakage** — all business flows work exactly as before, no retraining for existing behaviors
- [ ] **Fast and secure** — pages load faster than the old desktop app, and security matches web standards
- [ ] **All legacy data migrated** — every record from the old SQL Server moves to the new system intact

### Improvement Goals (Must Have)

- [ ] **Maintainable forever** — tech stack chosen for long-term stability (10+ years)
- [ ] **Invoice flow simplified** — reduce from 3 steps to 1 step for both creation and revision
- [ ] **Role-based access** — at minimum: Developer (error logs), SuperAdmin (all access except logs), Admin (selected pages), Sales (limited pages)
- [ ] **5-year active data** — only the last 5 years of data is active in the system; older data is archived
- [ ] **Full audit trail** — every create, edit, and delete records who did it and when
- [ ] **Bahasa Indonesia + English** — user can switch language; all labels support both

## 4. Who Will Use This?

| Role | Estimated Users | Access Level |
|------|----------------|-------------|
| **Developer** | 1–2 | Full technical access + error log monitoring page (no business data changes) |
| **SuperAdmin** | 3–4 | All business pages, user management, system settings (NO access to error logs) |
| **Admin** | 7-10 | Selected pages (to be defined per module) |
| **Operator / Sales** | 20++ | Day-to-day operational pages only (to be defined per module) |

**Total users**: 50++ concurrent during business hours.

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
- [ ] Dashboard with daily summary

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

## 8. Technical Requirements (Summary)

| Requirement | Decision |
|------------|---------|
| **Backend** | .NET 10 LTS (ASP.NET Core + EF Core) |
| **Frontend** | React 19 + TypeScript + Vite + TailwindCSS |
| **Database** | SQL Server (kept from legacy) |
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

## 10. Timeline

| Milestone | Duration | Deliverable |
|-----------|----------|------------|
| **POC** | Week 1–2 | Working frontend with dummy data, all screens navigable |
| **Core modules** | Week 3–8 | Master data + Purchase + Sales + Inventory working with real API |
| **Invoicing + Reports + A/R** | Week 9–12 | All transactions, reports, A/R, simplified invoice flow |
| **Audit trail + Roles + i18n** | Week 13–14 | Full audit logging, role-based access, Bahasa + English |
| **Data migration** | Week 15–16 | ETL from legacy SQL Server, archive data > 5 years |
| **User testing** | Week 17–18 | Real users test with real data, bug fixes |
| **Go-live** | Week 19–20 | Cutover from old system, staff training |

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
