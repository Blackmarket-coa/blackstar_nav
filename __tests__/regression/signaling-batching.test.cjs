const test = require('node:test');
const assert = require('node:assert/strict');
const {
    getSignalingPolicy,
    buildAnonymousOpportunitySignal,
    createSignalingBatcher,
} = require('../../src/signaling/opportunity-signaling.cjs');

test('feature-flag policy defaults to disabled batching', () => {
    const policy = getSignalingPolicy({});
    assert.equal(policy.enabled, false);
    assert.equal(policy.batchWindowMs, 15000);
    assert.equal(policy.jitterMs, 3000);
});

test('feature-flag policy parses enabled + custom timing', () => {
    const policy = getSignalingPolicy({
        BLACKSTAR_SIGNALING_BATCH_ENABLED: 'true',
        BLACKSTAR_SIGNALING_BATCH_WINDOW_MS: '2500',
        BLACKSTAR_SIGNALING_JITTER_MS: '500',
    });

    assert.equal(policy.enabled, true);
    assert.equal(policy.batchWindowMs, 2500);
    assert.equal(policy.jitterMs, 500);
});

test('anonymous opportunity signal excludes route/topology payload internals', () => {
    const signal = buildAnonymousOpportunitySignal({
        id: 'order_900',
        status: 'dispatched',
        payload: {
            pickup_eta: '2026-03-17T12:00:00Z',
            dropoff_eta: '2026-03-17T12:45:00Z',
            pickup: { lat: 1.35, lng: 103.81 },
            dropoff: { lat: 1.3, lng: 103.77 },
            waypoints: [{}, {}],
            entities: [{}, {}],
            topology: { graph_nodes: [1, 2] },
            route: { polyline: 'sensitive' },
        },
    });

    assert.deepEqual(Object.keys(signal).sort(), ['dropoff_eta', 'entity_count', 'has_dropoff', 'has_pickup', 'opportunity_ref', 'pickup_eta', 'status', 'waypoint_count']);
    assert.equal(signal.waypoint_count, 2);
    assert.equal(signal.entity_count, 2);
});

test('non-urgent events are batched and flushed once after window+jitter', async () => {
    const telemetry = [];
    const flushed = [];

    const batcher = createSignalingBatcher({
        policy: { enabled: true, batchWindowMs: 5, jitterMs: 0 },
        random: () => 0,
        onTelemetry: (event, metadata) => telemetry.push({ event, metadata }),
        onFlush: (batch) => flushed.push(batch),
    });

    batcher.enqueue({ reason: 'socket.order.ping', urgency: 'non_urgent' });
    batcher.enqueue({ reason: 'notification.order.available', urgency: 'non_urgent' });

    await new Promise((resolve) => setTimeout(resolve, 20));

    assert.equal(flushed.length, 1);
    assert.equal(flushed[0].length, 2);
    assert.ok(telemetry.some((entry) => entry.event === 'batch.schedule'));
    assert.ok(telemetry.some((entry) => entry.event === 'batch.flush'));
});

test('urgent events bypass batching even when feature flag is enabled', () => {
    const flushed = [];

    const batcher = createSignalingBatcher({
        policy: { enabled: true, batchWindowMs: 1000, jitterMs: 1000 },
        onFlush: (batch) => flushed.push(batch),
    });

    batcher.enqueue({ reason: 'driver.accept', urgency: 'urgent' });

    assert.equal(flushed.length, 1);
    assert.equal(flushed[0].length, 1);
    assert.equal(flushed[0][0].reason, 'driver.accept');
});
