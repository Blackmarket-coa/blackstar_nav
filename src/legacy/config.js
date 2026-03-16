import Environment from 'react-native-config';
import AppConfig from '../config/app';
import InterfaceConfig from '../config/interface';

/**
 * ----------------------------------------------------------
 * Storefront App Configuration
 * ----------------------------------------------------------
 *
 * Define your own custom configuration properties below.
 * Plugin extension point reserved for controlled third-party configuration hooks.
 *
 * @type {object}
 */
const Config = {
    app: AppConfig,
    ui: InterfaceConfig,
    ...Environment,
};

export default Config;
