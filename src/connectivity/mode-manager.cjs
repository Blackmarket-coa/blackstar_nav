const DEFAULT_CONNECTIVITY_POLICY = {
    forcedMode: 'auto',
    degradedFailureThreshold: 2,
    burstSize: 10,
    retryDelayMs: 3000,
};

function toInt(value, fallback) {
    const parsed = parseInt(`${value ?? ''}`, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
}

function resolveConnectivityPolicy(config = {}) {
    const forcedMode = `${config.BLACKSTAR_CONNECTIVITY_MODE || 'auto'}`.toLowerCase();

    return {
        forcedMode: ['auto', 'online', 'degraded', 'offline'].includes(forcedMode) ? forcedMode : 'auto',
        degradedFailureThreshold: Math.max(1, toInt(config.BLACKSTAR_DEGRADED_FAILURE_THRESHOLD, DEFAULT_CONNECTIVITY_POLICY.degradedFailureThreshold)),
        burstSize: Math.max(1, toInt(config.BLACKSTAR_BURST_SYNC_SIZE, DEFAULT_CONNECTIVITY_POLICY.burstSize)),
        retryDelayMs: Math.max(100, toInt(config.BLACKSTAR_SYNC_RETRY_DELAY_MS, DEFAULT_CONNECTIVITY_POLICY.retryDelayMs)),
    };
}

function determineConnectivityMode({ policy, online = true, consecutiveFailures = 0 }) {
    if (policy.forcedMode && policy.forcedMode !== 'auto') {
        return policy.forcedMode;
    }

    if (!online) {
        return 'offline';
    }

    if (consecutiveFailures >= policy.degradedFailureThreshold) {
        return 'degraded';
    }

    return 'online';
}

function createConnectivitySyncQueue({
    getMode,
    policy,
    onProcess,
    onTelemetry,
    setTimer = setTimeout,
    clearTimer = clearTimeout,
}) {
    const queuedByKey = new Map();
    const processedKeys = new Set();
    let timer = null;

    const emit = (event, metadata = {}) => {
        if (typeof onTelemetry === 'function') {
            onTelemetry(event, metadata);
        }
    };

    const scheduleRetry = () => {
        if (timer) {
            return;
        }

        timer = setTimer(() => {
            timer = null;
            flush();
        }, policy.retryDelayMs);

        emit('connectivity.retry_scheduled', { retryDelayMs: policy.retryDelayMs });
    };

    const enqueue = (event = {}) => {
        const idempotencyKey = event.idempotencyKey;
        if (!idempotencyKey) {
            throw new Error('Connectivity queue event must include idempotencyKey.');
        }

        if (processedKeys.has(idempotencyKey)) {
            emit('connectivity.dedup_processed', { idempotencyKey });
            return false;
        }

        if (queuedByKey.has(idempotencyKey)) {
            emit('connectivity.dedup_queued', { idempotencyKey });
            return false;
        }

        queuedByKey.set(idempotencyKey, {
            ...event,
            queuedAt: Date.now(),
        });

        emit('connectivity.enqueued', { idempotencyKey, size: queuedByKey.size });
        return true;
    };

    const flush = () => {
        const mode = getMode();
        const values = [...queuedByKey.values()];

        if (values.length === 0) {
            return { mode, processed: 0, remaining: 0 };
        }

        if (mode === 'offline') {
            emit('connectivity.flush_skipped_offline', { queued: values.length });
            scheduleRetry();
            return { mode, processed: 0, remaining: values.length };
        }

        const limit = mode === 'degraded' ? policy.burstSize : values.length;
        const slice = values.slice(0, limit);

        for (const item of slice) {
            onProcess(item, { mode });
            processedKeys.add(item.idempotencyKey);
            queuedByKey.delete(item.idempotencyKey);
        }

        emit('connectivity.flushed', { mode, processed: slice.length, remaining: queuedByKey.size });

        if (queuedByKey.size > 0) {
            scheduleRetry();
        }

        return { mode, processed: slice.length, remaining: queuedByKey.size };
    };

    const resetProcessed = () => {
        processedKeys.clear();
        emit('connectivity.processed_reset');
    };

    const stop = () => {
        if (timer) {
            clearTimer(timer);
            timer = null;
        }
    };

    return {
        enqueue,
        flush,
        resetProcessed,
        stop,
    };
}

module.exports = {
    DEFAULT_CONNECTIVITY_POLICY,
    resolveConnectivityPolicy,
    determineConnectivityMode,
    createConnectivitySyncQueue,
};
