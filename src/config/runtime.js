const DEFAULTS = {
    BLACKSTAR_SOCKET_HOST: 'socket.blackmarket.coa',
    BLACKSTAR_SOCKET_PORT: 8000,
    BLACKSTAR_SOCKET_SECURE: true,
    BLACKSTAR_SOCKET_PATH: '/socketcluster/',
    BLACKSTAR_SIGNALING_BATCH_ENABLED: false,
    BLACKSTAR_SIGNALING_BATCH_WINDOW_MS: 15000,
    BLACKSTAR_SIGNALING_JITTER_MS: 3000,
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
