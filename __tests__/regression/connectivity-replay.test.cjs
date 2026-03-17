const test = require('node:test');
const assert = require('node:assert/strict');
const {
    resolveConnectivityPolicy,
    determineConnectivityMode,
    createConnectivitySyncQueue,
} = require('../../src/connectivity/mode-manager.cjs');

test('connectivity mode resolves to degraded after threshold failures', () => {
    const policy = resolveConnectivityPolicy({
        BLACKSTAR_CONNECTIVITY_MODE: 'auto',
        BLACKSTAR_DEGRADED_FAILURE_THRESHOLD: '2',
    });

    const mode = determineConnectivityMode({
        policy,
        online: true,
        consecutiveFailures: 2,
    });

    assert.equal(mode, 'degraded');
});

test('offline mode queues updates and flushes when online', () => {
    const flushed = [];
    let online = false;

    const queue = createConnectivitySyncQueue({
        policy: resolveConnectivityPolicy({
            BLACKSTAR_CONNECTIVITY_MODE: 'auto',
            BLACKSTAR_BURST_SYNC_SIZE: '2',
            BLACKSTAR_SYNC_RETRY_DELAY_MS: '100',
        }),
        getMode: () => (online ? 'online' : 'offline'),
        onProcess: (item) => flushed.push(item.idempotencyKey),
    });

    queue.enqueue({ idempotencyKey: 'ev-1', action: 'reload.current' });
    queue.enqueue({ idempotencyKey: 'ev-2', action: 'reload.current' });

    const offlineResult = queue.flush();
    assert.equal(offlineResult.mode, 'offline');
    assert.equal(flushed.length, 0);

    online = true;
    const onlineResult = queue.flush();
    assert.equal(onlineResult.mode, 'online');
    assert.deepEqual(flushed, ['ev-1', 'ev-2']);

    queue.stop();
});

test('degraded mode processes burst-size limited updates', () => {
    const flushed = [];

    const queue = createConnectivitySyncQueue({
        policy: resolveConnectivityPolicy({
            BLACKSTAR_CONNECTIVITY_MODE: 'degraded',
            BLACKSTAR_BURST_SYNC_SIZE: '2',
            BLACKSTAR_SYNC_RETRY_DELAY_MS: '100',
        }),
        getMode: () => 'degraded',
        onProcess: (item) => flushed.push(item.idempotencyKey),
    });

    queue.enqueue({ idempotencyKey: 'ev-1', action: 'reload.current' });
    queue.enqueue({ idempotencyKey: 'ev-2', action: 'reload.current' });
    queue.enqueue({ idempotencyKey: 'ev-3', action: 'reload.current' });

    const first = queue.flush();
    assert.equal(first.processed, 2);
    assert.equal(first.remaining, 1);

    const second = queue.flush();
    assert.equal(second.processed, 1);
    assert.equal(second.remaining, 0);

    queue.stop();
});

test('idempotency prevents duplicate side effects during replay', () => {
    const flushed = [];

    const queue = createConnectivitySyncQueue({
        policy: resolveConnectivityPolicy({ BLACKSTAR_CONNECTIVITY_MODE: 'online' }),
        getMode: () => 'online',
        onProcess: (item) => flushed.push(item.idempotencyKey),
    });

    queue.enqueue({ idempotencyKey: 'dup-1', action: 'reload.current' });
    queue.enqueue({ idempotencyKey: 'dup-1', action: 'reload.current' });
    queue.flush();

    queue.enqueue({ idempotencyKey: 'dup-1', action: 'reload.current' });
    queue.flush();

    assert.deepEqual(flushed, ['dup-1']);

    queue.resetProcessed();
    queue.enqueue({ idempotencyKey: 'dup-1', action: 'reload.current' });
    queue.flush();

    assert.deepEqual(flushed, ['dup-1', 'dup-1']);

    queue.stop();
});
