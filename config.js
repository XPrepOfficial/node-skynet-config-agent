const requestP = require('request-promise');

const CONFIG_URL = '/api/v1/config/fetch';

/**
 * Responsible to fetch config
 * */
class Config {

    static async fetchConfigs(token, configs, envs, baseUrl) {
        let props = await requestP({
            method: 'post',
            url: baseUrl + CONFIG_URL,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            json: {
                env: envs.map(env => env.replace(/config:/i, '')),
                keys: configs
            }
        });
        if (props && props.success) {
            return props.config;
        } else throw new Error('Unable to fetch from config api!');
    }

}

exports = module.exports = Config;
