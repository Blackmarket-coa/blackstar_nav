const DEFAULT_POLICY = {
    enabled: false,
    batchWindowMs: 15000,
    jitterMs: 3000,
};

function toBoolean(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return Boolean(value);
}

function toInt(value, fallback) {
    const parsed = parseInt(`${value ?? ''}`, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
}

function getSignalingPolicy(config = {}) {
    return {
        enabled: toBoolean(config.BLACKSTAR_SIGNALING_BATCH_ENABLED ?? DEFAULT_POLICY.enabled),
        batchWindowMs: Math.max(1, toInt(config.BLACKSTAR_SIGNALING_BATCH_WINDOW_MS, DEFAULT_POLICY.batchWindowMs)),
        jitterMs: Math.max(0, toInt(config.BLACKSTAR_SIGNALING_JITTER_MS, DEFAULT_POLICY.jitterMs)),
    };
}

function buildAnonymousOpportunitySignal(order = {}) {
    const payload = order.payload || {};
    const waypoints = Array.isArray(payload.waypoints) ? payload.waypoints.length : 0;
    const entities = Array.isArray(payload.entities) ? payload.entities.length : 0;

    return {
        opportunity_ref: order.public_id || order.id || payload.task_ref || null,
        status: order.status || null,
        pickup_eta: payload.pickup_eta || null,
        dropoff_eta: payload.dropoff_eta || null,
        waypoint_count: waypoints,
        entity_count: entities,
        has_pickup: Boolean(payload.pickup),
        has_dropoff: Boolean(payload.dropoff),
    };
}

function createSignalingBatcher({
    policy,
    onFlush,
    onTelemetry,
    random = Math.random,
    setTimer = setTimeout,
    clearTimer = clearTimeout,
}) {
    const resolvedPolicy = policy || DEFAULT_POLICY;

    let timer = null;
    let queue = [];

    const emitTelemetry = (event, metadata = {}) => {
        if (typeof onTelemetry === 'function') {
            onTelemetry(event, metadata);
        }
    };

    const flush = () => {
        if (queue.length === 0) {
            return;
        }

        const batch = queue;
        queue = [];

        emitTelemetry('batch.flush', {
            count: batch.length,
            reasons: [...new Set(batch.map((item) => item.reason).filter(Boolean))],
        });

        if (typeof onFlush === 'function') {
            onFlush(batch);
        }
    };

    const scheduleFlush = () => {
        if (timer) {
            return;
        }

        const jitter = Math.floor(random() * (resolvedPolicy.jitterMs + 1));
        const delay = resolvedPolicy.batchWindowMs + jitter;

        emitTelemetry('batch.schedule', { delay, jitter });

        timer = setTimer(() => {
            timer = null;
            flush();
        }, delay);
    };

    const enqueue = (event = {}) => {
        const item = {
            ...event,
            urgency: event.urgency || 'non_urgent',
            timestamp: Date.now(),
        };

        if (!resolvedPolicy.enabled || item.urgency === 'urgent') {
            emitTelemetry('batch.bypass', { reason: item.reason, urgency: item.urgency });
            if (typeof onFlush === 'function') {
                onFlush([item]);
            }
            return;
        }

        queue.push(item);
        emitTelemetry('batch.enqueue', { reason: item.reason, size: queue.length });
        scheduleFlush();
    };

    const stop = () => {
        if (timer) {
            clearTimer(timer);
            timer = null;
        }
        queue = [];
    };

    return {
        enqueue,
        flush,
        stop,
    };
}

module.exports = {
    DEFAULT_POLICY,
    getSignalingPolicy,
    buildAnonymousOpportunitySignal,
    createSignalingBatcher,
};
