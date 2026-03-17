function isHttpsUrl(value) {
    return typeof value === 'string' && value.startsWith('https://');
}

function toBoolean(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return Boolean(value);
}

function validateAuthBootstrapConfig(config = {}) {
    const errors = [];

    if (!isHttpsUrl(config.BLACKSTAR_GATEWAY_HOST)) {
        errors.push('BLACKSTAR_GATEWAY_HOST must be set and start with https://');
    }

    if (typeof config.BLACKSTAR_GATEWAY_KEY !== 'string' || config.BLACKSTAR_GATEWAY_KEY.length < 8) {
        errors.push('BLACKSTAR_GATEWAY_KEY must be a non-empty API key.');
    }

    if (typeof config.APP_LINK_PREFIX !== 'string' || !config.APP_LINK_PREFIX.endsWith('://')) {
        errors.push('APP_LINK_PREFIX must end with ://');
    }

    return {
        ok: errors.length === 0,
        errors,
    };
}

function validateInstanceLinkConfig(config = {}) {
    const errors = [];

    if (!isHttpsUrl(config.host)) {
        errors.push('Instance link host must use https://');
    }

    if (typeof config.key !== 'string' || config.key.trim().length < 8) {
        errors.push('Instance link key is required.');
    }

    const port = parseInt(`${config.socketcluster_port ?? '8000'}`, 10);
    if (Number.isNaN(port) || port < 1 || port > 65535) {
        errors.push('Instance link socketcluster_port must be between 1 and 65535.');
    }

    const secure = config.socketcluster_secure ?? 'true';
    if (!['true', 'false', true, false].includes(secure)) {
        errors.push('Instance link socketcluster_secure must be true or false.');
    }

    return {
        ok: errors.length === 0,
        errors,
        normalized: {
            BLACKSTAR_GATEWAY_HOST: config.host,
            BLACKSTAR_GATEWAY_KEY: config.key,
            BLACKSTAR_SOCKET_HOST: config.socketcluster_host,
            BLACKSTAR_SOCKET_PORT: Number.isNaN(port) ? 8000 : port,
            BLACKSTAR_SOCKET_SECURE: toBoolean(secure),
        },
    };
}

const ORDER_TRANSITIONS = {
    created: { accept: 'assigned', cancel: 'canceled' },
    assigned: { start: 'enroute', cancel: 'canceled' },
    enroute: { arrive: 'arrived', cancel: 'canceled' },
    arrived: { complete_pod: 'completed', fail_pod: 'failed' },
    failed: { retry: 'enroute', cancel: 'canceled' },
};

function applyOrderLifecycleEvent(currentStatus, event) {
    const allowed = ORDER_TRANSITIONS[currentStatus] || {};
    const nextStatus = allowed[event] || null;

    return {
        valid: typeof nextStatus === 'string',
        nextStatus,
    };
}

function validatePodCompletion(proof = {}) {
    const errors = [];
    const method = proof.method;

    if (proof.podRequired && !method) {
        errors.push('POD method is required when podRequired=true.');
    }

    if (method === 'signature' && !proof.signatureBase64) {
        errors.push('Signature POD requires signatureBase64.');
    }

    if (method === 'photo' && (!Array.isArray(proof.photoUrls) || proof.photoUrls.length === 0)) {
        errors.push('Photo POD requires at least one photo URL.');
    }

    if (method === 'scan' && !proof.scanCode) {
        errors.push('Scan POD requires scanCode.');
    }

    if (proof.requireRecipientName && (!proof.recipientName || proof.recipientName.trim().length < 2)) {
        errors.push('Recipient name is required for this POD flow.');
    }

    return {
        ok: errors.length === 0,
        errors,
    };
}

const ISSUE_TRANSITIONS = {
    open: { triage: 'in_progress', close: 'closed' },
    in_progress: { resolve: 'resolved', close: 'closed' },
    resolved: { reopen: 'in_progress', close: 'closed' },
};

function applyIssueLifecycleEvent(currentStatus, event) {
    const allowed = ISSUE_TRANSITIONS[currentStatus] || {};
    const nextStatus = allowed[event] || null;
    return { valid: typeof nextStatus === 'string', nextStatus };
}

function mapNotificationToScreen(notification = {}) {
    const payload = notification.payload || {};
    const type = payload.type || '';
    const id = payload.id || '';

    if (id.startsWith('order_') || type.startsWith('order.')) {
        return { screen: 'Order', params: { orderId: payload.order_id || id } };
    }

    if (id.startsWith('issue_') || type.startsWith('issue.')) {
        return { screen: 'Issue', params: { issueId: payload.issue_id || id } };
    }

    if (type.startsWith('chat.')) {
        return { screen: 'ChatChannel', params: { channelId: payload.channel_id } };
    }

    return null;
}

function sanitizeDriverPayload(payload = {}, options = {}) {
    const accepted = options.accepted === true;

    const sanitized = {
        order_id: payload.order_id,
        task_ref: payload.task_ref,
        pickup_eta: payload.pickup_eta,
        dropoff_eta: payload.dropoff_eta,
        pickup: payload.pickup,
        dropoff: payload.dropoff,
    };

    if (accepted) {
        sanitized.route = payload.route;
    }

    return sanitized;
}

function hasTopologyLeak(payload = {}) {
    const serialized = JSON.stringify(payload);
    return ['polyline', 'topology', 'full_route', 'graph_nodes', 'graph_edges'].some((token) => serialized.includes(token));
}

module.exports = {
    validateAuthBootstrapConfig,
    validateInstanceLinkConfig,
    applyOrderLifecycleEvent,
    validatePodCompletion,
    applyIssueLifecycleEvent,
    mapNotificationToScreen,
    sanitizeDriverPayload,
    hasTopologyLeak,
};
