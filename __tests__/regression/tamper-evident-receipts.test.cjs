const test = require('node:test');
const assert = require('node:assert/strict');
const {
    canonicalJSONStringify,
    createCanonicalReceiptPayload,
    createTamperEvidentReceipt,
    verifyReceiptPayload,
} = require('../../src/receipts/tamper-evident-receipts.cjs');

test('canonical payload serialization is deterministic across key order', () => {
    const a = canonicalJSONStringify({ b: 2, a: 1, nested: { z: 1, y: 2 } });
    const b = canonicalJSONStringify({ nested: { y: 2, z: 1 }, a: 1, b: 2 });
    assert.equal(a, b);
});

test('tamper-evident receipt verifies with original payload', () => {
    const payload = createCanonicalReceiptPayload({
        eventType: 'pod.captured',
        recordType: 'pod',
        orderId: 'order_100',
        proofId: 'proof_100',
        actorId: 'driver_1',
        occurredAt: '2026-03-17T10:00:00.000Z',
        details: { method: 'signature', waypoint_id: 'wp_1' },
    });

    const receipt = createTamperEvidentReceipt({ payload, secret: 'secret-key' });
    const verification = verifyReceiptPayload(receipt, 'secret-key');

    assert.equal(verification.valid, true);
});

test('verification fails when canonical payload is mutated after signing', () => {
    const payload = createCanonicalReceiptPayload({
        eventType: 'dispute.created',
        recordType: 'dispute',
        issueId: 'issue_999',
        actorId: 'driver_9',
        details: { issue_status: 'open' },
    });

    const receipt = createTamperEvidentReceipt({ payload, secret: 'secret-key' });
    receipt.payload.details.issue_status = 'resolved'; // tamper

    const verification = verifyReceiptPayload(receipt, 'secret-key');
    assert.equal(verification.valid, false);
});

test('verification fails when wrong secret is used', () => {
    const payload = createCanonicalReceiptPayload({
        eventType: 'pod.captured',
        recordType: 'pod',
        orderId: 'order_321',
        proofId: 'proof_321',
        actorId: 'driver_4',
    });

    const receipt = createTamperEvidentReceipt({ payload, secret: 'right-secret' });
    const verification = verifyReceiptPayload(receipt, 'wrong-secret');
    assert.equal(verification.valid, false);
});
