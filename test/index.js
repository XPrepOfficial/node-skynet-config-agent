const crypto = require('crypto');
const requestP = require('request-promise');
const Agent = require('../agent');

/**
 * The test runner class.
 * */
class Test {

    constructor(name, ...args) {
        console.log(`Running test with name "${name}" and arguments ${args}`);
        // sample test credentials
        this[name] && this[name].apply(this, args) || console.log('No test with specified name');
    }

    async all(args) {
        console.log('No Combined test yet. TODO code!');
        return true;
    }

    // command to run
    // node test auth <key> <secret>
    async auth([key, secret]) {

        const url = 'https://skynet.classplusapp.com/oauth2/v1/token';

        const date = new Date();
        const grantType = 'config:agent';
        const seconds = 3600;

        const checkStr = `${grantType}:${key}:${seconds}:${+date}:${secret}`;
        console.log(checkStr);

        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(checkStr);
        const assertion = hmac.digest('hex');
        console.log(assertion);

        let result = await requestP({
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
        console.log(result)
    }

    async agent() {
        await Agent.load({
            localOnly: false, // if true will only load default values, not go to skynet. To work offline, or dev.
            env: process.env.NODE_ENV || 'development', // or some other value as env. REMEMBER you will be ONLY able to fetch config of granted envs. ex: if your token is only granted development,staging access you can never load production configs.
            map: { // can load from JSON file aswell
                env: {
                    MONGO_URL_TMP: {
                        prop: 'mongo_url', // the config name to map to in skynet
                        fallback: 'mongodb://localhost:27017/dd'
                    },
                    NO_PROP: {
                        prop: 'murlaa', // the config name to map to in skynet
                        fallback: 'this is default'
                    },
                    HAVE: {
                        prop: 'host', // the config name to map to in skynet
                        fallback: 'not found'
                    }
                }

            }
        });
        console.log(process.env);
    }

}

// Trigger
new Test(process.argv[2], process.argv.slice(3));
