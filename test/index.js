const crypto = require('crypto');
const requestP = require('request-promise');

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

}

// Trigger
new Test(process.argv[2], process.argv.slice(3));
