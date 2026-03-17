const { buildRuntimeConfig, validateRuntimeConfig, assertValidRuntimeConfig } = require('../src/config/runtime');

describe('runtime config', () => {
    it('builds Path A config with defaults and legacy fallback keys', () => {
        const runtimeConfig = buildRuntimeConfig({
            APP_LINK_PREFIX: 'blackstar://',
            FLEETBASE_HOST: 'https://api.blackmarket.coa',
            FLEETBASE_KEY: 'legacy-key',
            SOCKETCLUSTER_HOST: 'socket.blackmarket.coa',
            SOCKETCLUSTER_PORT: '9000',
            SOCKETCLUSTER_SECURE: 'true',
        });

        expect(runtimeConfig.BLACKSTAR_GATEWAY_HOST).toBe('https://api.blackmarket.coa');
        expect(runtimeConfig.BLACKSTAR_GATEWAY_KEY).toBe('legacy-key');
        expect(runtimeConfig.BLACKSTAR_SOCKET_HOST).toBe('socket.blackmarket.coa');
        expect(runtimeConfig.BLACKSTAR_SOCKET_PORT).toBe(9000);
        expect(runtimeConfig.BLACKSTAR_SOCKET_SECURE).toBe(true);
        expect(runtimeConfig.BLACKSTAR_SOCKET_PATH).toBe('/socketcluster/');
    });

    it('applies instance-link overrides on top of environment values', () => {
        const runtimeConfig = buildRuntimeConfig(
            {
                APP_LINK_PREFIX: 'blackstar://',
                BLACKSTAR_GATEWAY_HOST: 'https://api.blackmarket.coa',
                BLACKSTAR_GATEWAY_KEY: 'env-key',
            },
            {
                BLACKSTAR_GATEWAY_HOST: 'https://tenant.gateway.coa',
                BLACKSTAR_GATEWAY_KEY: 'instance-link-key',
            }
        );

        expect(runtimeConfig.BLACKSTAR_GATEWAY_HOST).toBe('https://tenant.gateway.coa');
        expect(runtimeConfig.BLACKSTAR_GATEWAY_KEY).toBe('instance-link-key');
    });

    it('returns actionable validation errors for invalid values', () => {
        const runtimeConfig = {
            APP_LINK_PREFIX: 'blackstar',
            BLACKSTAR_GATEWAY_HOST: 'http://gateway.local',
            BLACKSTAR_GATEWAY_KEY: '',
            BLACKSTAR_SOCKET_HOST: '',
            BLACKSTAR_SOCKET_PORT: 70000,
            BLACKSTAR_SOCKET_SECURE: 'yes',
        };

        const errors = validateRuntimeConfig(runtimeConfig);

        expect(errors).toEqual(
            expect.arrayContaining([
                expect.stringContaining('BLACKSTAR_GATEWAY_HOST must start with https://'),
                expect.stringContaining('Missing BLACKSTAR_GATEWAY_KEY'),
                expect.stringContaining('Missing BLACKSTAR_SOCKET_HOST'),
                expect.stringContaining('BLACKSTAR_SOCKET_PORT must be an integer between 1 and 65535'),
                expect.stringContaining('BLACKSTAR_SOCKET_SECURE must be true or false'),
                expect.stringContaining('APP_LINK_PREFIX must end with ://'),
            ])
        );
    });

    it('fails fast with clear startup error when config is invalid', () => {
        expect(() =>
            assertValidRuntimeConfig({
                APP_LINK_PREFIX: 'blackstar://',
                BLACKSTAR_GATEWAY_HOST: '',
                BLACKSTAR_GATEWAY_KEY: '',
                BLACKSTAR_SOCKET_HOST: '',
                BLACKSTAR_SOCKET_PORT: 0,
                BLACKSTAR_SOCKET_SECURE: false,
            })
        ).toThrow('Invalid Blackstar runtime configuration');
    });
});
