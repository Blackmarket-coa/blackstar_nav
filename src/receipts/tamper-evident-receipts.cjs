const RECEIPT_SCHEMA_VERSION = '1.0.0';
const RECEIPT_HASH_ALGO = 'fnv1a64';

function canonicalize(value) {
    if (value === null || value === undefined) {
        return null;
    }

    if (Array.isArray(value)) {
        return value.map((item) => canonicalize(item));
    }

    if (typeof value === 'object') {
        const sorted = {};
        const keys = Object.keys(value).sort();
        for (const key of keys) {
            sorted[key] = canonicalize(value[key]);
        }
        return sorted;
    }

    return value;
}

function canonicalJSONStringify(payload = {}) {
    return JSON.stringify(canonicalize(payload));
}

function fnv1a64(input = '') {
    let hash = 0xcbf29ce484222325n;
    const prime = 0x100000001b3n;

    for (let i = 0; i < input.length; i++) {
        hash ^= BigInt(input.charCodeAt(i));
        hash = (hash * prime) & 0xffffffffffffffffn;
    }

    return hash.toString(16).padStart(16, '0');
}

function hashCanonicalPayload(payload = {}) {
    return fnv1a64(canonicalJSONStringify(payload));
}

function signReceiptPayload(payload = {}, secret = '') {
    const payloadHash = hashCanonicalPayload(payload);
    return fnv1a64(`${payloadHash}:${secret}`);
}

function verifyReceiptPayload(receipt = {}, secret = '') {
    const expectedHash = hashCanonicalPayload(receipt.payload || {});
    const expectedSignature = signReceiptPayload(receipt.payload || {}, secret);

    return {
        valid: expectedHash === receipt.hash && expectedSignature === receipt.signature,
        expectedHash,
        expectedSignature,
    };
}

function createCanonicalReceiptPayload({
    eventType,
    recordType,
    orderId,
    proofId,
    issueId,
    actorId,
    occurredAt,
    details = {},
}) {
    return {
        schema_version: RECEIPT_SCHEMA_VERSION,
        event_type: eventType,
        record_type: recordType,
        order_id: orderId || null,
        proof_id: proofId || null,
        issue_id: issueId || null,
        actor_id: actorId || null,
        occurred_at: occurredAt || new Date().toISOString(),
        details: canonicalize(details),
    };
}

function createTamperEvidentReceipt({ payload, secret }) {
    const canonicalPayload = canonicalize(payload);
    const hash = hashCanonicalPayload(canonicalPayload);
    const signature = signReceiptPayload(canonicalPayload, secret);

    return {
        schema_version: RECEIPT_SCHEMA_VERSION,
        hash_algorithm: RECEIPT_HASH_ALGO,
        payload: canonicalPayload,
        hash,
        signature,
        signed_at: new Date().toISOString(),
    };
}

module.exports = {
    RECEIPT_SCHEMA_VERSION,
    RECEIPT_HASH_ALGO,
    canonicalize,
    canonicalJSONStringify,
    hashCanonicalPayload,
    signReceiptPayload,
    verifyReceiptPayload,
    createCanonicalReceiptPayload,
    createTamperEvidentReceipt,
};
