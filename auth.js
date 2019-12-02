const homedir = require('homedir');
const {join} = require('path');
const Crypt = require('./crypt');
const {writeFileSync, readFileSync, unlinkSync} = require('fs');

//constants
const AUTH_FILE = 'auth.crypt';
const URL_FILE = 'base.conf';
const SKYNET_BASE_URL = 'https://skynet.classplusapp.com';
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
        // todo API call and fetch, verify
        return [true, baseUrl]
    }

    static async fetchAuthTokenAndAuthUserInfo(){
        const authConfig = await this.fetchAuthConfig();
        // todo API call and make info
        return {
            token: '',
            scopes: ['dev', 'prod']
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

    static async logout(){
        unlinkSync(this.getBaseUrlConfFilePath());
        unlinkSync(this.getAuthFilePath());
    }

};
