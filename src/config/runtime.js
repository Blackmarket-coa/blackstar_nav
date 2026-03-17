const DEFAULTS = {
    BLACKSTAR_SOCKET_HOST: 'socket.blackmarket.coa',
    BLACKSTAR_SOCKET_PORT: 8000,
    BLACKSTAR_SOCKET_SECURE: true,
    BLACKSTAR_SOCKET_PATH: '/socketcluster/',
    BLACKSTAR_SIGNALING_BATCH_ENABLED: false,
    BLACKSTAR_SIGNALING_BATCH_WINDOW_MS: 15000,
    BLACKSTAR_SIGNALING_JITTER_MS: 3000,
    BLACKSTAR_CONNECTIVITY_MODE: 'auto',
    BLACKSTAR_DEGRADED_FAILURE_THRESHOLD: 2,
    BLACKSTAR_BURST_SYNC_SIZE: 10,
    BLACKSTAR_SYNC_RETRY_DELAY_MS: 3000,
};

function toBoolean(value) {
    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
    }

    return Boolean(value);
}

function firstDefined(...values) {
    for (const value of values) {
        if (value !== undefined && value !== null && value !== '') {
            return value;
        }
    }
    return undefined;
}

function toPort(value, fallback = DEFAULTS.BLACKSTAR_SOCKET_PORT) {
    const parsed = parseInt(`${value ?? ''}`, 10);
    if (Number.isNaN(parsed)) {
        return fallback;
    }
    return parsed;
}

function buildRuntimeConfig(source = {}, overrides = {}) {
    const gatewayHost = firstDefined(overrides.BLACKSTAR_GATEWAY_HOST, source.BLACKSTAR_GATEWAY_HOST, source.FLEETBASE_HOST);
    const gatewayKey = firstDefined(overrides.BLACKSTAR_GATEWAY_KEY, source.BLACKSTAR_GATEWAY_KEY, source.FLEETBASE_KEY);
    const socketHost = firstDefined(overrides.BLACKSTAR_SOCKET_HOST, source.BLACKSTAR_SOCKET_HOST, source.SOCKETCLUSTER_HOST, DEFAULTS.BLACKSTAR_SOCKET_HOST);
    const socketPort = toPort(firstDefined(overrides.BLACKSTAR_SOCKET_PORT, source.BLACKSTAR_SOCKET_PORT, source.SOCKETCLUSTER_PORT), DEFAULTS.BLACKSTAR_SOCKET_PORT);
    const socketSecure = toBoolean(firstDefined(overrides.BLACKSTAR_SOCKET_SECURE, source.BLACKSTAR_SOCKET_SECURE, source.SOCKETCLUSTER_SECURE, DEFAULTS.BLACKSTAR_SOCKET_SECURE));
    const socketPath = firstDefined(source.BLACKSTAR_SOCKET_PATH, source.SOCKETCLUSTER_PATH, DEFAULTS.BLACKSTAR_SOCKET_PATH);
    const appLinkPrefix = firstDefined(source.APP_LINK_PREFIX);

    return {
        APP_LINK_PREFIX: appLinkPrefix,
        BLACKSTAR_GATEWAY_HOST: gatewayHost,
        BLACKSTAR_GATEWAY_KEY: gatewayKey,
        BLACKSTAR_SOCKET_HOST: socketHost,
        BLACKSTAR_SOCKET_PORT: socketPort,
        BLACKSTAR_SOCKET_SECURE: socketSecure,
        BLACKSTAR_SOCKET_PATH: socketPath,
        BLACKSTAR_SIGNALING_BATCH_ENABLED: toBoolean(firstDefined(source.BLACKSTAR_SIGNALING_BATCH_ENABLED, DEFAULTS.BLACKSTAR_SIGNALING_BATCH_ENABLED)),
        BLACKSTAR_SIGNALING_BATCH_WINDOW_MS: toPort(firstDefined(source.BLACKSTAR_SIGNALING_BATCH_WINDOW_MS, DEFAULTS.BLACKSTAR_SIGNALING_BATCH_WINDOW_MS), DEFAULTS.BLACKSTAR_SIGNALING_BATCH_WINDOW_MS),
        BLACKSTAR_SIGNALING_JITTER_MS: toPort(firstDefined(source.BLACKSTAR_SIGNALING_JITTER_MS, DEFAULTS.BLACKSTAR_SIGNALING_JITTER_MS), DEFAULTS.BLACKSTAR_SIGNALING_JITTER_MS),
        BLACKSTAR_CONNECTIVITY_MODE: firstDefined(source.BLACKSTAR_CONNECTIVITY_MODE, DEFAULTS.BLACKSTAR_CONNECTIVITY_MODE),
        BLACKSTAR_DEGRADED_FAILURE_THRESHOLD: toPort(firstDefined(source.BLACKSTAR_DEGRADED_FAILURE_THRESHOLD, DEFAULTS.BLACKSTAR_DEGRADED_FAILURE_THRESHOLD), DEFAULTS.BLACKSTAR_DEGRADED_FAILURE_THRESHOLD),
        BLACKSTAR_BURST_SYNC_SIZE: toPort(firstDefined(source.BLACKSTAR_BURST_SYNC_SIZE, DEFAULTS.BLACKSTAR_BURST_SYNC_SIZE), DEFAULTS.BLACKSTAR_BURST_SYNC_SIZE),
        BLACKSTAR_SYNC_RETRY_DELAY_MS: toPort(firstDefined(source.BLACKSTAR_SYNC_RETRY_DELAY_MS, DEFAULTS.BLACKSTAR_SYNC_RETRY_DELAY_MS), DEFAULTS.BLACKSTAR_SYNC_RETRY_DELAY_MS),
    };
}

function validateRuntimeConfig(config) {
    const errors = [];

    if (!config.BLACKSTAR_GATEWAY_HOST) {
        errors.push('Missing BLACKSTAR_GATEWAY_HOST. Set it in .env (example: https://api.blackmarket.coa).');
    } else if (!`${config.BLACKSTAR_GATEWAY_HOST}`.startsWith('https://')) {
        errors.push('BLACKSTAR_GATEWAY_HOST must start with https://.');
    }

    if (!config.BLACKSTAR_GATEWAY_KEY) {
        errors.push('Missing BLACKSTAR_GATEWAY_KEY. Add a valid gateway API key in .env or instance link config.');
    }

    if (!config.BLACKSTAR_SOCKET_HOST) {
        errors.push('Missing BLACKSTAR_SOCKET_HOST. Set realtime host in .env (example: socket.blackmarket.coa).');
    }

    if (!Number.isInteger(config.BLACKSTAR_SOCKET_PORT) || config.BLACKSTAR_SOCKET_PORT <= 0 || config.BLACKSTAR_SOCKET_PORT > 65535) {
        errors.push('BLACKSTAR_SOCKET_PORT must be an integer between 1 and 65535.');
    }

    if (typeof config.BLACKSTAR_SOCKET_SECURE !== 'boolean') {
        errors.push('BLACKSTAR_SOCKET_SECURE must be true or false.');
    }

    if (!Number.isInteger(config.BLACKSTAR_SIGNALING_BATCH_WINDOW_MS) || config.BLACKSTAR_SIGNALING_BATCH_WINDOW_MS < 1) {
        errors.push('BLACKSTAR_SIGNALING_BATCH_WINDOW_MS must be an integer >= 1.');
    }

    if (!Number.isInteger(config.BLACKSTAR_SIGNALING_JITTER_MS) || config.BLACKSTAR_SIGNALING_JITTER_MS < 0) {
        errors.push('BLACKSTAR_SIGNALING_JITTER_MS must be an integer >= 0.');
    }

    if (!['auto', 'online', 'degraded', 'offline'].includes(`${config.BLACKSTAR_CONNECTIVITY_MODE || 'auto'}`)) {
        errors.push('BLACKSTAR_CONNECTIVITY_MODE must be one of auto, online, degraded, offline.');
    }

    if (!Number.isInteger(config.BLACKSTAR_DEGRADED_FAILURE_THRESHOLD) || config.BLACKSTAR_DEGRADED_FAILURE_THRESHOLD < 1) {
        errors.push('BLACKSTAR_DEGRADED_FAILURE_THRESHOLD must be an integer >= 1.');
    }

    if (!Number.isInteger(config.BLACKSTAR_BURST_SYNC_SIZE) || config.BLACKSTAR_BURST_SYNC_SIZE < 1) {
        errors.push('BLACKSTAR_BURST_SYNC_SIZE must be an integer >= 1.');
    }

    if (!Number.isInteger(config.BLACKSTAR_SYNC_RETRY_DELAY_MS) || config.BLACKSTAR_SYNC_RETRY_DELAY_MS < 100) {
        errors.push('BLACKSTAR_SYNC_RETRY_DELAY_MS must be an integer >= 100.');
    }

    if (!config.APP_LINK_PREFIX) {
        errors.push('Missing APP_LINK_PREFIX. Set app deep-link scheme in .env (example: blackstar://).');
    } else if (!`${config.APP_LINK_PREFIX}`.endsWith('://')) {
        errors.push('APP_LINK_PREFIX must end with ://.');
    }

    return errors;
}

function assertValidRuntimeConfig(config) {
    const errors = validateRuntimeConfig(config);
    if (errors.length === 0) {
        return;
    }

    throw new Error(`Invalid Blackstar runtime configuration:\n- ${errors.join('\n- ')}\nResolve the values in .env or instance-link config before starting the app.`);
}

module.exports = {
    buildRuntimeConfig,
    validateRuntimeConfig,
    assertValidRuntimeConfig,
};
