# PRD: Backup and Restore

## Summary

Operations screen wrapping `pg_dump` / `pg_restore` for Neon PostgreSQL. Admin-facing utility with job status â€” not end-user feature.

**Route:** `/system/backup-restore`  
**Permission:** SuperAdmin only.

---

## Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| Backup & Restore | `/system/backup-restore` | Trigger DB backup or restore |

---

## Data Model

```ts
interface BackupJob {
  id: string;
  type: "backup" | "restore";
  status: "queued" | "running" | "completed" | "failed";
  startedAt: string;
  completedAt?: string;
  fileName?: string;
  sizeBytes?: number;
  error?: string;
}
```

---

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/system/backup` | Start backup job |
| GET | `/api/system/backup/history` | List backups |
| GET | `/api/system/backup/{id}/download` | Download dump file |
| POST | `/api/system/restore` | Restore from uploaded dump |

See also [runbook.md](../../runbook.md).

---

## UI Behavior

### Toolbar â€” mode `process`

- [ ] **Backup** button â†’ confirm â†’ F5 execute
- [ ] No standard transaction fields

### Backup tab

- [ ] **Create Backup** â€” triggers async job
- [ ] History table: Date, Size, Status, Download link

### Restore tab

- [ ] File upload (.sql / .dump)
- [ ] Strong warning banner
- [ ] Type confirmation phrase: "RESTORE"
- [ ] Maintenance mode notice

### Dialogs

- [ ] Restore: triple confirm ([dialog-patterns.md](../../shared/ui-foundation/dialog-patterns.md))
- [ ] Progress modal during job

---

## Permissions

SuperAdmin only; all actions audited.

---

## Localization keys

Namespace: `system.backup.*`

| Key | id | en |
|-----|-----|-----|
| `system.backup.title` | Backup & Restore | Backup & Restore |
| `system.backup.create` | Buat Backup | Create Backup |
| `system.backup.restoreWarning` | PERINGATAN: Restore akan menimpa database. | WARNING: Restore will overwrite the database. |
| `system.backup.confirmPhrase` | Ketik RESTORE untuk melanjutkan | Type RESTORE to continue |

---

## How This Matches Existing Patterns

Process screen; server runs `pg_dump` via background job (see runbook).

---

## Acceptance Criteria

1. Backup produces downloadable dump
2. Restore requires explicit confirmation
3. Jobs logged and auditable
