# Cutover Day Checklist

Print this. Tick boxes with a pen.

## T-7 days

- [ ] Final dry-run of the migration completes with **zero unresolved errors**.
- [ ] Backup-and-restore drill on the new DB completes successfully.
- [ ] Wife and team trained — they can complete: login + MFA, create item, post GRN, post DO, generate invoice, take payment, print PDF. Each ticked off in `docs/training-signoff.md`.
- [ ] Off-site backup target tested (latest .bak restored on a second machine).
- [ ] Cloudflare DNS pre-provisioned with low TTL (60s).

## T-1 day

- [ ] Communicate freeze window to all users (recommend Sat 18:00 → Sun 06:00 local).
- [ ] Confirm SuperAdmin password & MFA backup codes stored in a sealed envelope in the safe.
- [ ] Tag the release: `git tag v1.0.0 && git push --tags`.

## Cutover (T-0)

- [ ] 18:00 — Announce freeze. Set legacy app to read-only at the application or DB level.
- [ ] 18:15 — Take a final `.bak` of the legacy DB. Store on encrypted USB.
- [ ] 18:30 — Run final full migration (no `--since`). Capture summary.json.
- [ ] 19:00 — Run reconciliation queries. Compare totals. Sign off.
- [ ] 19:30 — Switch DNS to point at the new server.
- [ ] 20:00 — Smoke test as SuperAdmin and Operator. Create + post + invoice a real document. Print PDF.
- [ ] 20:30 — Verify nightly backup job is scheduled in Hangfire.
- [ ] 21:00 — Send "we're live" message.

## T+1 day

- [ ] Watch the Seq dashboard for unexpected errors.
- [ ] Confirm the morning backup ran (`/backups/jaza-YYYYMMDD.bak` exists, size > 0).
- [ ] Check failed-login count. Anything above usual baseline? Block IPs at Cloudflare.

## T+7 days

- [ ] Quarterly drills go on the calendar:
  - Restore drill (every 3 months)
  - Rotate JWT key + SuperAdmin password (every 6 months)
  - Run OWASP ZAP baseline scan (every 3 months)
  - Review audit log for anomalies (every 1 month)

## T+30 days

- [ ] Decommission the legacy server **after** confirming the last 30 days of new-system data are intact and a fresh `.bak` of the new DB has been restored to a clean machine successfully.
- [ ] Archive the legacy `.bak` for a minimum of 7 years (legal retention).
