#!/usr/bin/env node
const cli = require('cli');
const Auth = require('./auth');
const Config = require('./config');
const {readFileSync, writeFileSync, stat, mkdir} = require('fs');
const CliTable = require('cli-table3');
const CFonts = require('cfonts');
require('colors');

// fetch args
const [, , ...args] = process.argv;

/**
 * Main CLI Class
 * */
new class CLI {

    constructor() {
        if (process.env.DEBUG === 'true') console.log('[PARAMS]', args);
        this.parseClIArgs();
        this.emblem();
        this.spinner('Initializing...');
        this.dispatch().then(() => cli.ok('Skynet Agent Management Utility Is Now Exiting!'))
    }

    emblem() {
        CFonts.say('Config Agent', {
            font: 'block',              // define the font face
            align: 'left',              // define text alignment
            colors: ['green'],         // define all colors
            background: 'transparent',  // define the background color, you can also use `backgroundColor` here as key
            letterSpacing: 1,           // define letter spacing
            lineHeight: 1,              // define the line height
            space: true,                // define if the output text should have empty lines on top and on the bottom
            maxLength: '0',             // define how many character can be on one line
        });
    }

    async dispatch() {
        await this.delay(750);
        this.spinner('Initialized!', true);
        const commandsToRun = [];
        if (this.command === 'check' && this.options.status) {
            commandsToRun.push('checkStatus');
        }
        if (this.command === 'check' && this.options.scopes) {
            commandsToRun.push('checkScopes');
        }
        if (this.command === 'check' && commandsToRun.length === 0) {
            commandsToRun.push('checkStatus');
            commandsToRun.push('checkScopes');
        } else if (this.command !== 'check') {
            commandsToRun.push(this.command);
        }
        cli.info('Running Commands: ' + commandsToRun.join(', '));
        await this.loadConfig();
        for (let i = 0; i < commandsToRun.length; i++) {
            await this[commandsToRun[i]]();
        }
    }

    async loadConfig() {
        const configBaseDir = Auth.getBaseDir();
        cli.info('Processing secure config. Loaded dir is: ' + configBaseDir);
        cli.progress(0.2);
        // ensure folder exist or create
        await this.ensureFolder(configBaseDir);
        cli.progress(0.4);
        // ensure sub folder exist or create
        await this.ensureFolder(Auth.getAuthDir());
        cli.progress(0.6);
        // ensure config file exist
        this.configRaw = await Auth.getRawConfig();
        cli.progress(0.8);
        // parse existing file
        this.config = await Auth.fetchAuthConfig();
        cli.progress(1);
        if (!this.config) cli.error('Not logged in yet.');
    }

    spinner(message, finished) {
        cli.spinner(message, finished);
    }

    async ensureFolder(path) {
        return new Promise(res => {
            stat(path, err => {
                if (err) {
                    mkdir(path, res);
                } else {
                    res();
                }
            });
        });
    }

    parseClIArgs() {
        const options = cli.parse({
            status: ['s', 'Fetch the status of the agent.'],
            scopes: ['p', 'List allowed scopes'],
            name: ['n', 'Show config of specified name', 'string', false],
            key: [false, 'Specify API Key', 'string', false],
            secret: [false, 'Specify API Secret', 'string', false],
            skynetUrl: [false, 'Skynet Base Url.', 'string', "https://skynet.classplusapp.com"],
            // logout: [false, 'Logout the agent', 'logout', false]
        }, ['login', 'logout', 'check', 'show']);

        this.options = options;
        this.command = cli.command;
    }

    async delay(time) {
        return new Promise(res => {
            setTimeout(() => res(), time);
        });
    }

    async checkStatus() {
        cli.info('Running Command checkStatus.');
        this.spinner('Authenticating Credentials...');
        try {
            const userInfo = await Auth.fetchAuthTokenAndAuthUserInfo();
            this.spinner("Auth Check Completed", true);
            console.log('Logged In With Client:'.bold.yellow, userInfo.name);
            cli.ok("Connection is active and working fine.");
        } catch (c) {
            this.spinner(c.message, true);
            cli.error('Unable to connect with provided credentials.');
            process.exit(1);
        }
    }

    async checkScopes() {
        cli.info('Running Command checkScopes.');
        this.spinner('Fetching User Details...');
        const userInfo = await Auth.fetchAuthTokenAndAuthUserInfo();
        this.spinner('User fetched!', true);
        console.log('Logged In With Client:'.bold.yellow, userInfo.name);
        const table = new CliTable({
            head: ['S.No', 'Authorized Environment']
        });
        userInfo.scopes.forEach((scope, idx) => table.push([idx + 1, scope]));
        console.log(table.toString());
    }

    async show() {
        cli.info('Running Command show config.');
        if (!this.options.name) {
            cli.error('Please provice config key to pull up.');
            process.exit(1);
        }
        cli.info(`Looking up '${this.options.name}'`);
        this.spinner('Fetching Config...');
        let configs;
        try {
            const userInfo = await Auth.fetchAuthTokenAndAuthUserInfo();
            configs = await Config.fetchConfigs(userInfo.token, [this.options.name], userInfo.scopes, userInfo.baseUrl);
        } catch (c) {
            cli.error(c.message);
            process.exit(1);
        }
        this.spinner('Config Fetched!', true);
        const table = new CliTable({
            head: ['S.No', 'Key', 'Environment', 'Type', 'Value']
        });
        configs.forEach((config, i) => table.push([i + 1, config.name, config.environment, config.type, config.value]));
        console.log(table.toString());
        if (configs.length === 0) {
            cli.error('No config with provided name found. OR you do not have access to this config in allowed environments.');
        }
    }

    async login() {
        cli.info('Running Command login.');
        if (!this.options.key) {
            cli.error('Please provide API key');
            process.exit(1);
        }
        if (!this.options.secret) {
            cli.error('Please provide API Secret');
            process.exit(1);
        }
        this.spinner('Authenticating Credentials...');
        const [success, baseUrl] = await Auth.testConnection(this.options.key, this.options.secret, this.options.skynetUrl);
        this.spinner("Auth Check Completed", true);
        if (success) await Auth.saveAuthFile(this.options.key, this.options.secret, baseUrl);
        else {
            cli.error('Unable to connect with provided credentials.');
            process.exit(1);
        }
    }

    async logout() {
        cli.info('Running Command logout.');
        try {
            await Auth.logout();
            cli.ok("Logged Out!");
        } catch (c) {
            cli.error('Not Logged in yet.');
        }
    }


};
