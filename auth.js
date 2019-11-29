const homedir = require('homedir');
const {join} = require('path');

//constants
const AUTH_FILE = 'auth.crypt';
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

    static async getRawConfig() {
        let configRaw;
        try {
            configRaw = readFileSync(join(this.getAuthDir(), AUTH_FILE));
        } catch (c) {
            configRaw = null;
        }
        return configRaw;
    }

    static async fetchAuthConfig() {
        return null;
    }

};
