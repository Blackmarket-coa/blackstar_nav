import Environment from 'react-native-config';
import AppConfig from '../config/app';
import InterfaceConfig from '../config/interface';

const parseJsonObject = (value) => {
    if (typeof value !== 'string' || value.trim().length === 0) {
        return {};
    }

    try {
        const parsed = JSON.parse(value);

        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return parsed;
        }
    } catch {
        return {};
    }

    return {};
};

const normalizePluginConfig = (plugins) => {
    return Object.entries(plugins).reduce((normalized, [pluginKey, pluginConfig]) => {
        if (typeof pluginConfig === 'boolean') {
            normalized[pluginKey] = { enabled: pluginConfig };
            return normalized;
        }

        if (pluginConfig && typeof pluginConfig === 'object' && !Array.isArray(pluginConfig)) {
            normalized[pluginKey] = {
                enabled: pluginConfig.enabled !== false,
                ...pluginConfig,
            };
        }

        return normalized;
    }, {});
};

/**
 * ----------------------------------------------------------
 * Storefront App Configuration
 * ----------------------------------------------------------
 *
 * Third-party plugin configuration can be supplied with
 * BLACKSTAR_PLUGIN_CONFIG_JSON as a JSON object, for example:
 * {"chat":{"enabled":true,"provider":"default"}}
 *
 * @type {object}
 */
const Config = {
    app: AppConfig,
    ui: InterfaceConfig,
    plugins: normalizePluginConfig(parseJsonObject(Environment.BLACKSTAR_PLUGIN_CONFIG_JSON)),
    ...Environment,
};

export default Config;
