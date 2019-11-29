#!/usr/bin/env node
const cli = require('cli');
const homedir = require('homedir');
const {join} = require('path');
const {readFileSync, writeFileSync, stat, mkdir} = require('fs');

// fetch args
const [, , ...args] = process.argv;

/**
 * Main CLI Class
 * */
new class CLI {

    constructor() {
        console.log('[PARAMS]', args);
        this.parseClIArgs();
        this.spinner('Initializing...');
        this.dispatch().then(() => cli.ok('Skynet Agent Management Utility Is Now Exiting!'))
    }

    async dispatch() {
        await this.delay(1000);
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
        const configBaseDir = join(homedir(), '.skynet');
        cli.info('Processing secure config. Loaded dir is: ' + configBaseDir);
        cli.progress(0.2);
        // ensure folder exist or create
        await this.ensureFolder(configBaseDir);
        cli.progress(0.4);
        // ensure sub folder exist or create
        await this.ensureFolder(join(configBaseDir, 'auth'));
        cli.progress(0.6);
        // ensure config file exist
        try {
            this.configRaw = readFileSync(join(configBaseDir, 'auth', 'auth.crypt'));
        } catch (c) {
            this.configRaw = null;
        }
        cli.progress(0.8);
        // parse existing file
        await this.parseConfig();
        cli.progress(1);
        if (!this.config) cli.error('Not logged in yet.');
    }

    spinner(message, finished) {
        cli.spinner(message, finished);
    }

    async parseConfig() {
        if (this.configRaw) {
            // todo
        }
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
            // login: ['l', 'Login the agent', 'login', false],
            // logout: [false, 'Logout the agent', 'logout', false]
        }, ['login', 'logout', 'check']);

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

    }

    async checkScopes() {
        cli.info('Running Command checkScopes.');

    }

    async login() {
        cli.info('Running Command login.');

    }

    async logout() {
        cli.info('Running Command logout.');

    }


};
