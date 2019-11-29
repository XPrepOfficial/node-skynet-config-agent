const {readFileSync, writeFileSync} = require('fs');
const {join} = require('path');
const DailyUserStatsService = require('../src/node/service-command-center/services/DailyUserStatService');
const creds = require('./creds');

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

    async dailyStatsService() {
        // creds to use for Testing:
        const {host, user, database, password, port, conLimit, mongoDBName, mongoUrl} = creds;
        const dailyUserStatsService = new DailyUserStatsService(18, 11, 2019, host, user, database, password, mongoUrl, mongoDBName, port, conLimit);
        await dailyUserStatsService.init();
        const result = await dailyUserStatsService.computeAll();
        console.log(result);
    }

}

// Trigger
new Test(process.argv[2], process.argv.slice(3));
