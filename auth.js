const homedir = require('homedir');
const {join} = require('path');
const Crypt = require('./crypt');
const crypto = require('crypto');
const requestP = require('request-promise');
const {writeFileSync, readFileSync, unlinkSync} = require('fs');

//constants
const AUTH_FILE = 'auth.crypt';
const URL_FILE = 'base.conf';
const AGENT_GRANT_TYPE = 'config:agent';
const SKYNET_BASE_URL = 'https://skynet.classplusapp.com';
const HANDSHAKE_URL = '/oauth2/v1/token';
const GENERATOR_ALGO = 'aes-192-cbc';
const GENERATOR_SECRET = '9834hdbfwhebf3y84gr32yi4fgkh3frwfbldn2h3o2r81y487rt434yogfwhbaf982347o21efbwhvfwevfuwevfy3fg8g';
/**
 * Auh class
 * */
exports = module.exports = class Auth {

    static getBaseDir() {
        return join(homedir(), '.skynet');
    }

    static getAuthDir() {
        return join(this.getBaseDir(), 'auth');
    }

    static getBaseUrlConfFilePath() {
        return join(this.getBaseDir(), URL_FILE);
    }

    static getAuthFilePath() {
        return join(this.getAuthDir(), AUTH_FILE);
    }

    static async getRawConfig() {
        let configRaw;
        try {
            configRaw = readFileSync(this.getAuthFilePath()).toString();
        } catch (c) {
            // console.log(c.message);
            configRaw = null;
        }
        return configRaw;
    }

    static async testConnection(key, secret, baseUrl = SKYNET_BASE_URL) {
        let agent;
        try {
            agent = await this.handshake(key, secret, baseUrl);
            // console.log('Logged In With Client:', agent.name);
            return [true, baseUrl, agent.token, (agent.scopes || [])
                .filter(grant => grant !== AGENT_GRANT_TYPE)
                .filter(grant => grant.search(/config:/i) === 0),
                agent.name];
        } catch (c) {
            console.log(c.message);
            return [false, baseUrl, null, null, null];
        }
    }

    static async handshake(key, secret, baseUrl) {
        const url = baseUrl + HANDSHAKE_URL;
        const date = new Date();
        const grantType = AGENT_GRANT_TYPE;
        const seconds = 3600;
        const checkStr = `${grantType}:${key}:${seconds}:${+date}:${secret}`;
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(checkStr);
        const assertion = hmac.digest('hex');
        console.log('Assertion:', assertion);
        return await requestP({
            url: url,
            method: 'post',
            json: {
                grant_type: grantType,
                api_key: key,
                grant_seconds: seconds,
                ts: +date,
                assertion: assertion
            }
        });
    }

    static async fetchAuthTokenAndAuthUserInfo() {
        const authConfig = await this.fetchAuthConfig();
        if (!authConfig) throw new Error('Not logged in! Hence can not fetch.');
        const [success, , token, scopes, name] = await this.testConnection(authConfig.key, authConfig.secret, authConfig.baseUrl);
        if (!success) {
            throw new Error('Unable to connect.');
        }
        return {
            token: token,
            scopes: scopes,
            name
        }
    }

    static async fetchAuthConfig() {
        let raw = await this.getRawConfig();
        if (raw) {
            return new Crypt(GENERATOR_ALGO, GENERATOR_SECRET).decrypt(raw);
        } else return null;
    }

    static async saveAuthFile(key, secret, baseUrl) {
        writeFileSync(this.getAuthFilePath(), new Crypt(GENERATOR_ALGO, GENERATOR_SECRET).encrypt({
            key,
            secret,
            baseUrl
        }));
        writeFileSync(this.getBaseUrlConfFilePath(), baseUrl);
    }

    static async logout() {
        unlinkSync(this.getBaseUrlConfFilePath());
        unlinkSync(this.getAuthFilePath());
    }

};
