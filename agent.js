const Config = require('./config');
const Auth = require('./auth');
require('colors');

/**
 * Agent interface
 * */
class ConfigAgent {

    static async load({localOnly, env, map}) {
        env = env || 'development';
        localOnly = localOnly || false;
        this.log(`Loading config for env '${env.bold}'. Local only: ${localOnly.toString().bold}`);
        let keys = Object.keys(map.env).map(key => map.env[key].prop);
        this.log(keys);
        let configs;
        if (!localOnly) {
            try {
                const userInfo = await Auth.fetchAuthTokenAndAuthUserInfo();
                configs = await Config.fetchConfigs(userInfo.token, keys, [env], userInfo.baseUrl);
            } catch (c) {
                this.log('Error fetching configs. Loading defaults.');
            }
        }
        this.buildEnvMap(map, configs || []);
    }

    static async buildEnvMap(map, configs) {
        Object.keys(map.env).map(key => {
            let conf = configs.find(conf => conf.name === map.env[key].prop);
            process.env[key] = conf && conf.value || map.env[key].fallback;
        });
    }

    static log(...args) {
        console.log('[Skynet Config Agent]'.yellow.bold, ...args);
    }

}

exports = module.exports = ConfigAgent;
