const test = require('node:test');
const assert = require('node:assert/strict');
const { sanitizeDriverOrderPayload, assertNoPreAcceptanceLeak } = require('../../src/contracts/cell-visibility.cjs');

test('pre-acceptance driver payload strips forbidden route/topology fields', () => {
    const source = {
        id: 'order_100',
        status: 'created',
        payload: {
            pickup: { lat: 1.35, lng: 103.81 },
            dropoff: { lat: 1.30, lng: 103.77 },
            task_ref: 'task_100',
            route: { polyline: 'abc' },
            topology: { graph_nodes: [1], graph_edges: [[1, 2]] },
        },
        tracker_data: { breadcrumb: [] },
        route: { full_route: true },
    };

    const sanitized = sanitizeDriverOrderPayload(source, { accepted: false });

    assert.equal(sanitized.tracker_data, undefined);
    assert.equal(sanitized.route, undefined);
    assert.equal(sanitized.payload.route, undefined);
    assert.equal(sanitized.payload.topology, undefined);
    assert.deepEqual(sanitized.payload.pickup, source.payload.pickup);
});

test('post-acceptance driver payload keeps navigation fields', () => {
    const source = {
        id: 'order_200',
        status: 'assigned',
        payload: {
            pickup: { lat: 1.35, lng: 103.81 },
            route: { polyline: 'abc' },
        },
        route: { full_route: true },
    };

    const sanitized = sanitizeDriverOrderPayload(source, { accepted: true });
    assert.deepEqual(sanitized.route, { full_route: true });
    assert.deepEqual(sanitized.payload.route, { polyline: 'abc' });
});

test('contract assertion fails when pre-acceptance payload leaks forbidden keys', () => {
    const leaked = {
        id: 'order_333',
        status: 'dispatched',
        payload: {
            pickup: { lat: 1.35, lng: 103.81 },
            topology: { graph_nodes: [1, 2] },
        },
    };

    assert.throws(() => assertNoPreAcceptanceLeak(leaked), /Cell visibility contract violation/);
});

test('contract assertion passes for compliant pre-acceptance payload', () => {
    const safe = {
        id: 'order_444',
        status: 'unassigned',
        payload: {
            pickup: { lat: 1.35, lng: 103.81 },
            dropoff: { lat: 1.30, lng: 103.77 },
            task_ref: 'task_444',
        },
    };

    assert.doesNotThrow(() => assertNoPreAcceptanceLeak(safe));
});
