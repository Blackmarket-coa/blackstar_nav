const PRE_ACCEPTANCE_STATUS = new Set(['created', 'dispatched', 'unassigned']);

const FORBIDDEN_PRE_ACCEPTANCE_TOP_LEVEL = ['tracker_data', 'route', 'full_route', 'topology', 'graph_nodes', 'graph_edges'];
const FORBIDDEN_PRE_ACCEPTANCE_PAYLOAD = ['route', 'route_geometry', 'route_polyline', 'topology', 'graph_nodes', 'graph_edges', 'full_route'];

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj || {}));
}

function hasStatus(order, statuses) {
    const status = (order?.status || '').toString().toLowerCase();
    return statuses.has(status);
}

function isPreAcceptanceOrder(order = {}) {
    return hasStatus(order, PRE_ACCEPTANCE_STATUS);
}

function sanitizeDriverOrderPayload(order = {}, { accepted } = {}) {
    const sanitized = deepClone(order);
    const isAccepted = typeof accepted === 'boolean' ? accepted : !isPreAcceptanceOrder(order);

    if (isAccepted) {
        return sanitized;
    }

    FORBIDDEN_PRE_ACCEPTANCE_TOP_LEVEL.forEach((key) => {
        delete sanitized[key];
    });

    if (sanitized.payload && typeof sanitized.payload === 'object') {
        FORBIDDEN_PRE_ACCEPTANCE_PAYLOAD.forEach((key) => {
            delete sanitized.payload[key];
        });
    }

    return sanitized;
}

function findForbiddenPaths(target = {}, forbiddenKeys = [], prefix = '') {
    if (!target || typeof target !== 'object') {
        return [];
    }

    const hits = [];
    for (const key of Object.keys(target)) {
        const path = prefix ? `${prefix}.${key}` : key;

        if (forbiddenKeys.includes(key)) {
            hits.push(path);
        }

        const value = target[key];
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            hits.push(...findForbiddenPaths(value, forbiddenKeys, path));
        }
    }

    return hits;
}

function assertNoPreAcceptanceLeak(order = {}) {
    if (!isPreAcceptanceOrder(order)) {
        return;
    }

    const topHits = findForbiddenPaths(order, FORBIDDEN_PRE_ACCEPTANCE_TOP_LEVEL);
    const payloadHits = findForbiddenPaths(order.payload || {}, FORBIDDEN_PRE_ACCEPTANCE_PAYLOAD, 'payload');
    const leaks = [...new Set([...topHits, ...payloadHits])];

    if (leaks.length > 0) {
        throw new Error(`Cell visibility contract violation: unauthorized pre-acceptance fields exposed: ${leaks.join(', ')}`);
    }
}

module.exports = {
    PRE_ACCEPTANCE_STATUS,
    FORBIDDEN_PRE_ACCEPTANCE_TOP_LEVEL,
    FORBIDDEN_PRE_ACCEPTANCE_PAYLOAD,
    isPreAcceptanceOrder,
    sanitizeDriverOrderPayload,
    assertNoPreAcceptanceLeak,
};
