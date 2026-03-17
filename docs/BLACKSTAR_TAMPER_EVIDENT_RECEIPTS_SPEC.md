# Blackstar tamper-evident receipts spec (thin slice)

_Last updated: 2026-03-17_

## Canonical event schema

Every receipt is generated from a canonical payload with sorted keys:

```json
{
  "schema_version": "1.0.0",
  "event_type": "pod.captured | dispute.created | dispute.updated",
  "record_type": "pod | dispute",
  "order_id": "string|null",
  "proof_id": "string|null",
  "issue_id": "string|null",
  "actor_id": "string|null",
  "occurred_at": "ISO-8601 timestamp",
  "details": { "...": "event-specific fields" }
}
```

## Hashing/signature policy

- Canonicalization: deterministic JSON with recursive key sorting.
- Hash algorithm (thin slice): `fnv1a64` over canonical payload string.
- Signature: `fnv1a64("<payload_hash>:<shared_secret>")`.
- Verification recomputes both hash and signature; mismatch indicates tampering.

## Current implementation

- Utility: `src/receipts/tamper-evident-receipts.cjs`
- POD integration: `src/screens/ProofOfDeliveryScreen.tsx`
- Dispute integration: `src/screens/CreateIssueScreen.tsx`, `src/screens/EditIssueScreen.tsx`

## Persistence path (thin slice)

Receipt metadata is persisted in two places:

1. Attached to created/updated event records as `receipt_metadata` payload.
2. Stored locally in `tamper_evident_receipts` using app storage for replay/audit troubleshooting.

## Settlement/audit integration plan

1. Mirror `receipt_metadata` to backend event ledger tables for POD/dispute records.
2. Anchor periodic receipt-hash Merkle roots into immutable settlement/audit system.
3. Add server-side signature verification and rejection for mismatched payload/signature pairs.
4. Export verification reports per settlement window for dispute adjudication.

## Verification

Run:

```bash
yarn test:launch-regression
```

Receipt regression tests prove deterministic canonicalization and tamper detection on payload mutation.
