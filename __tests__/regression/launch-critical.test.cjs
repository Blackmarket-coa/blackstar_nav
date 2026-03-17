const test = require('node:test');
const assert = require('node:assert/strict');
const fixtures = require('../fixtures/launch-critical-fixtures.cjs');
const {
    validateAuthBootstrapConfig,
    validateInstanceLinkConfig,
    applyOrderLifecycleEvent,
    validatePodCompletion,
    applyIssueLifecycleEvent,
    mapNotificationToScreen,
    sanitizeDriverPayload,
    hasTopologyLeak,
} = require('../../src/regression/launch-critical.cjs');

test('auth bootstrap succeeds with valid Path A config', () => {
    const result = validateAuthBootstrapConfig(fixtures.authConfigValid);
    assert.equal(result.ok, true);
    assert.equal(result.errors.length, 0);
});

test('instance-link safety rejects insecure host and malformed secure flag', () => {
    const result = validateInstanceLinkConfig({
        ...fixtures.instanceLinkValid,
        host: 'http://unsafe-gateway.local',
        socketcluster_secure: 'maybe',
    });

    assert.equal(result.ok, false);
    assert.ok(result.errors.some((e) => e.includes('https://')));
    assert.ok(result.errors.some((e) => e.includes('socketcluster_secure')));
});

test('order lifecycle allows created -> assigned via accept', () => {
    const transition = applyOrderLifecycleEvent('created', 'accept');
    assert.equal(transition.valid, true);
    assert.equal(transition.nextStatus, 'assigned');
});

test('order lifecycle rejects invalid transition assigned -> complete_pod', () => {
    const transition = applyOrderLifecycleEvent('assigned', 'complete_pod');
    assert.equal(transition.valid, false);
    assert.equal(transition.nextStatus, null);
});

test('POD validation requires signature for signature mode', () => {
    const result = validatePodCompletion({
        podRequired: true,
        method: 'signature',
        requireRecipientName: true,
        recipientName: 'Amira',
    });

    assert.equal(result.ok, false);
    assert.ok(result.errors.some((e) => e.includes('signatureBase64')));
});

test('POD validation accepts scan mode with scan code and recipient', () => {
    const result = validatePodCompletion({
        podRequired: true,
        method: 'scan',
        scanCode: 'POD-QRCODE-4455',
        requireRecipientName: true,
        recipientName: 'Jordan Lee',
    });

    assert.equal(result.ok, true);
});

test('issue lifecycle allows open -> in_progress -> resolved', () => {
    const first = applyIssueLifecycleEvent('open', 'triage');
    const second = applyIssueLifecycleEvent(first.nextStatus, 'resolve');

    assert.equal(first.nextStatus, 'in_progress');
    assert.equal(second.nextStatus, 'resolved');
});

test('notification routing maps order notifications to Order screen', () => {
    const route = mapNotificationToScreen(fixtures.orderNotification);
    assert.deepEqual(route, { screen: 'Order', params: { orderId: 'order_123' } });
});

test('notification routing maps issue notifications to Issue screen', () => {
    const route = mapNotificationToScreen(fixtures.issueNotification);
    assert.deepEqual(route, { screen: 'Issue', params: { issueId: 'issue_74' } });
});

test('payload guardrail strips route topology for pre-acceptance payloads', () => {
    const sanitized = sanitizeDriverPayload(fixtures.preAcceptancePayload, { accepted: false });

    assert.equal(sanitized.route, undefined);
    assert.equal(hasTopologyLeak(sanitized), false);
    assert.equal(hasTopologyLeak(fixtures.preAcceptancePayload), true);
});
