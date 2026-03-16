# Unfinished code checklist

_Last refreshed: 2026-03-16_

## Scope and method

This checklist is a re-baseline of unfinished markers in this repository before the next burn-down batch.

Commands used:

```bash
rg -n --hidden --glob '!.git' --glob '!node_modules/**' -e 'TODO|FIXME' .
rg -n --hidden --glob '!.git' --glob '!node_modules/**' -e 'TBD|WIP|work in progress|incomplete' docs README.md src android ios legacy
```

## Marker inventory (current)

### TODO / FIXME markers

- **Open markers:** `0`
- **Tracked files with TODO/FIXME:** none

### Other unfinished-language scan (triage)

The secondary scan returns a mix of roadmap/checklist wording and non-actionable literals. These should be tracked as documentation/program items rather than inline code markers.

## Burn-down sprint result (P2 marker target)

- **Sprint target:** 15 markers
- **Actual closed this sprint:** 2 (all remaining TODO markers in repo)
- **Net remaining TODO/FIXME markers:** 0

Closed marker files:

1. `android/app/src/main/res/xml/data_extraction_rules.xml`
2. `src/legacy/config.js`

## Open items still requiring execution (non-inline-marker)

These are still open based on planning docs, even though inline TODO/FIXME markers are now cleared:

- `docs/BLACKSTAR_FEATURE_PARITY_PLAN.md` release gate checklist remains unchecked.
- `docs/CODE_DEBT_REVIEW.md` Sprint 1/Sprint 2 items remain execution tracking work.

## Tracker sync notes

- Townhall tickets (`TOWNHALL-04` through `TOWNHALL-09`) and self-healing implementation checklists referenced in request are **not represented in this repository's current docs/code** and require a dedicated tracker artifact before execution can be validated here.
- Composer/widget-store/room-list TODO clusters referenced in request are not present as TODO/FIXME markers in this repository baseline.

