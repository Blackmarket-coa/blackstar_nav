#!/usr/bin/env node

const assert = require('node:assert/strict');
const { buildRuntimeConfig, validateRuntimeConfig, assertValidRuntimeConfig } = require('../src/config/runtime');

const baseline = buildRuntimeConfig({
    APP_LINK_PREFIX: 'blackstar://',
    BLACKSTAR_GATEWAY_HOST: 'https://api.blackmarket.coa',
    BLACKSTAR_GATEWAY_KEY: 'baseline-key',
    BLACKSTAR_SOCKET_HOST: 'socket.blackmarket.coa',
    BLACKSTAR_SOCKET_PORT: '8000',
    BLACKSTAR_SOCKET_SECURE: 'true',
});

assert.equal(baseline.BLACKSTAR_SOCKET_PORT, 8000);
assert.equal(baseline.BLACKSTAR_SOCKET_SECURE, true);
assert.equal(validateRuntimeConfig(baseline).length, 0);

const invalid = {
    APP_LINK_PREFIX: 'blackstar',
    BLACKSTAR_GATEWAY_HOST: 'http://api.blackmarket.coa',
    BLACKSTAR_GATEWAY_KEY: '',
    BLACKSTAR_SOCKET_HOST: '',
    BLACKSTAR_SOCKET_PORT: 70000,
    BLACKSTAR_SOCKET_SECURE: 'true',
};

const errors = validateRuntimeConfig(invalid);
assert(errors.length >= 4, 'expected multiple validation errors for invalid config');
assert.throws(() => assertValidRuntimeConfig(invalid), /Invalid Blackstar runtime configuration/);

console.log('Runtime config regression checks passed.');
